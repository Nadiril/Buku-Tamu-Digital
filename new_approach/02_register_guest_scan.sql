-- =====================================================================
-- register_guest_scan()
-- The single, sanctioned write path for QR scans.
--
-- Why this exists as a function instead of a client-side UPDATE:
-- your spec requires that a scan attempted after the event has ended
-- must NOT register, even if the client displays "success." A client
-- can always be tricked, offline-cached, or just wrong about the time.
-- The only way to guarantee the cutoff is enforced is to compute it
-- from database time (`now()`) inside a function the client cannot
-- talk its way around — RLS policies alone can't express "reject after
-- time X and tell me WHY," only "allow or deny the row."
--
-- Status transitions:
--   tidak_hadir -> hadir       (scanned at or before jam_mulai + grace_period_minutes)
--   tidak_hadir -> terlambat   (scanned after grace period, but before jam_selesai)
--   already hadir/terlambat   -> rejected, "already registered" (no double-scan)
--   scanned after jam_selesai -> rejected, "event has ended" — this is the
--                                 hard cutoff your spec calls out explicitly:
--                                 it must fail here even if some other layer
--                                 of the app is showing a success state.
-- =====================================================================

create or replace function public.register_guest_scan(p_qr_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_guest public.guests%rowtype;
  v_event public.events%rowtype;
  v_now timestamptz := now();
  v_event_start timestamptz;
  v_grace_cutoff timestamptz;
  v_event_end timestamptz;
  v_caller_role text;
  v_new_status text;
begin
  -- 1. Caller must be admin or scanner. Staff is explicitly excluded —
  --    staff is read-only per spec and should never reach this function.
  select role into v_caller_role
  from public.profiles
  where id = auth.uid();

  if v_caller_role is null or v_caller_role not in ('admin', 'scanner') then
    return jsonb_build_object(
      'success', false,
      'error_code', 'forbidden',
      'message', 'Only admin or scanner accounts can register a scan.'
    );
  end if;

  -- 2. Look up the guest by QR token. Lock the row so two near-simultaneous
  --    scans of the same QR (e.g. a flaky scanner double-firing) can't both
  --    read "tidak_hadir" and both attempt to transition it — the second
  --    scanner blocks on this row lock until the first transaction commits,
  --    then re-reads the now-updated status and correctly reports
  --    "already registered" instead of double-processing the same guest.
  select * into v_guest
  from public.guests
  where qr_token = p_qr_token
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error_code', 'invalid_qr',
      'message', 'This QR code does not match any registered guest.'
    );
  end if;

  -- 3. Load the associated event.
  select * into v_event
  from public.events
  where id = v_guest.acara_id;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error_code', 'event_not_found',
      'message', 'The event for this guest no longer exists.'
    );
  end if;

  -- 4. Registration must be open. This blocks scans against an event that
  --    hasn't opened yet ('akan_datang') or has been explicitly closed
  --    ('registrasi_ditutup') by an admin, independent of the time-based
  --    cutoff in step 6 below. Both checks are needed: an admin might close
  --    registration early, or an event might still be marked open past its
  --    scheduled end time if nobody closed it manually.
  if v_event.status <> 'registrasi_dibuka' then
    return jsonb_build_object(
      'success', false,
      'error_code', 'registration_not_open',
      'message', 'Registration for this event is not currently open.'
    );
  end if;

  -- 5. Compute the time boundaries from stored date/time columns.
  v_event_start  := (v_event.tanggal_mulai + v_event.jam_mulai)::timestamptz;
  v_grace_cutoff := v_event_start + make_interval(mins => v_event.grace_period_minutes);
  v_event_end    := (v_event.tanggal_selesai + v_event.jam_selesai)::timestamptz;

  -- 6. Hard cutoff — this is the case your spec calls out explicitly:
  --    "if try to register beyond that time it won't register because
  --    event has ended even it says success." The rejection happens here,
  --    server-side, using database time. No client-supplied timestamp is
  --    ever trusted for this comparison.
  if v_now > v_event_end then
    insert into public.activities (action, detail, user_id)
    values (
      'scan_rejected_event_ended',
      format('Guest %s (id=%s) scan attempted after event end at %s', v_guest.nama, v_guest.id, v_now),
      auth.uid()
    );
    return jsonb_build_object(
      'success', false,
      'error_code', 'event_ended',
      'message', 'This event has ended. Registration is closed.'
    );
  end if;

  -- 7. Reject a guest who has already been scanned. No double-registration,
  --    no overwriting an existing 'hadir' with 'terlambat' or vice versa.
  if v_guest.status_kehadiran <> 'tidak_hadir' then
    return jsonb_build_object(
      'success', false,
      'error_code', 'already_registered',
      'message', format('Guest already registered as %s.', v_guest.status_kehadiran),
      'guest', jsonb_build_object(
        'id', v_guest.id,
        'nama', v_guest.nama,
        'status_kehadiran', v_guest.status_kehadiran,
        'waktu_kedatangan', v_guest.waktu_kedatangan
      )
    );
  end if;

  -- 8. On-time vs late, per the grace-period rule you specified.
  if v_now <= v_grace_cutoff then
    v_new_status := 'hadir';
  else
    v_new_status := 'terlambat';
  end if;

  update public.guests
  set
    status_kehadiran = v_new_status,
    waktu_kedatangan = v_now,
    scanned_by = auth.uid()
  where id = v_guest.id;

  insert into public.activities (action, detail, user_id)
  values (
    'guest_scanned',
    format('Guest %s (id=%s) marked %s at %s', v_guest.nama, v_guest.id, v_new_status, v_now),
    auth.uid()
  );

  return jsonb_build_object(
    'success', true,
    'status_kehadiran', v_new_status,
    'guest', jsonb_build_object(
      'id', v_guest.id,
      'nama', v_guest.nama,
      'instansi', v_guest.instansi,
      'status_kehadiran', v_new_status,
      'waktu_kedatangan', v_now
    )
  );
end;
$$;

-- Grant execute to authenticated users. The function itself checks the
-- caller's role internally (step 1 above) and returns a JSON error rather
-- than relying on GRANT/REVOKE to gate access — this keeps the "forbidden"
-- case a normal, catchable response for the client instead of a raw
-- Postgres permission error.
grant execute on function public.register_guest_scan(text) to authenticated;
