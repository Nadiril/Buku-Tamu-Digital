-- Hapus SEMUA overload register_guest_scan yang ada (lama maupun baru)
do $$
declare
  r record;
begin
  for r in
    select p.oid, pg_catalog.pg_get_function_identity_arguments(p.oid) as args
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'register_guest_scan'
  loop
    execute format('drop function if exists public.register_guest_scan(%s)', r.args);
  end loop;
end;
$$;

-- Buat ulang dengan parameter p_qr_token, p_caller_id
create function public.register_guest_scan(p_qr_token text, p_caller_id uuid)
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
  select role into v_caller_role
  from public.profiles
  where id = p_caller_id;

  if v_caller_role is null or v_caller_role not in ('admin', 'panitia') then
    return jsonb_build_object(
      'success', false,
      'error_code', 'forbidden',
      'message', 'Only admin or panitia accounts can register a scan.'
    );
  end if;

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

  if v_event.status <> 'registrasi_dibuka' then
    return jsonb_build_object(
      'success', false,
      'error_code', 'registration_not_open',
      'message', 'Registration for this event is not currently open.'
    );
  end if;

  v_event_start  := (v_event.tanggal_mulai + v_event.jam_mulai) AT TIME ZONE 'Asia/Jakarta';
  v_grace_cutoff := v_event_start + make_interval(mins => v_event.grace_period_minutes);
  v_event_end    := (v_event.tanggal_selesai + v_event.jam_selesai) AT TIME ZONE 'Asia/Jakarta';

  if v_now > v_event_end then
    insert into public.activities (action, detail, user_id)
    values (
      'scan_rejected_event_ended',
      format('Guest %s (id=%s) scan attempted after event end at %s', v_guest.nama, v_guest.id, v_now),
      p_caller_id
    );
    return jsonb_build_object(
      'success', false,
      'error_code', 'event_ended',
      'message', 'This event has ended. Registration is closed.'
    );
  end if;

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

  if v_now <= v_grace_cutoff then
    v_new_status := 'hadir';
  else
    v_new_status := 'terlambat';
  end if;

  update public.guests
  set
    status_kehadiran = v_new_status,
    waktu_kedatangan = v_now,
    scanned_by = p_caller_id
  where id = v_guest.id;

  insert into public.activities (action, detail, user_id)
  values (
    'guest_scanned',
    format('Guest %s (id=%s) marked %s at %s', v_guest.nama, v_guest.id, v_new_status, v_now),
    p_caller_id
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

grant execute on function public.register_guest_scan(text, uuid) to authenticated;

notify pgrst, 'reload schema';
