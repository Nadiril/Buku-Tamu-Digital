import { createClient, createServiceClient } from "@/lib/supabase/server";
import { computeAttendanceStatus } from "@/lib/event-status";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { token } = await params;
  const { searchParams } = new URL(request.url);
  const acaraId = searchParams.get("acara_id");

  const authed = await createClient();
  const { data: { user } } = await authed.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await authed
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "scanner"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createServiceClient();

  // 1. Lookup guest by qr_token (without INNER JOIN to avoid silent failure)
  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("*")
    .eq("qr_token", token)
    .single();

  if (guestError) {
    console.error("[scan] Supabase error looking up guest:", { token, error: guestError });
    return NextResponse.json({ error: "Gagal mencari data tamu" }, { status: 500 });
  }

  if (!guest) {
    console.warn("[scan] Guest not found for token:", { token });
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  if (acaraId && guest.acara_id !== parseInt(acaraId)) {
    return NextResponse.json({ error: "Tamu tidak terdaftar di acara ini" }, { status: 400 });
  }

  // 2. Fetch event separately
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", guest.acara_id)
    .single();

  if (eventError) {
    console.error("[scan] Supabase error looking up event:", { guest_id: guest.id, acara_id: guest.acara_id, error: eventError });
    return NextResponse.json({ error: "Gagal memuat data acara" }, { status: 500 });
  }

  if (!event) {
    console.error("[scan] Event not found for guest:", { guest_id: guest.id, acara_id: guest.acara_id });
    return NextResponse.json({ error: "Acara tidak ditemukan" }, { status: 404 });
  }

  // --- diagnostic logging ---
  const computedStatus = computeAttendanceStatus(event);
  console.log("[scan-diagnostic]", {
    event_id: event.id,
    event_status: event.status,
    tanggal_mulai: event.tanggal_mulai,
    jam_mulai: event.jam_mulai,
    tanggal_selesai: event.tanggal_selesai,
    jam_selesai: event.jam_selesai,
    grace_period_minutes: event.grace_period_minutes,
    computeAttendanceStatus_result: computedStatus,
    server_time: new Date().toISOString(),
  });
  // --- end diagnostic ---

  if (event.status !== "registrasi_dibuka") {
    return NextResponse.json({ error: "Registrasi untuk acara ini belum dibuka atau sudah ditutup" }, { status: 400 });
  }

  if (guest.status_kehadiran === "hadir" || guest.status_kehadiran === "terlambat") {
    return NextResponse.json({ error: "Guest already checked in" }, { status: 409 });
  }

  const status = computedStatus;
  if (!status) {
    return NextResponse.json({
      error: "Acara sudah selesai. Tidak dapat melakukan registrasi kehadiran.",
      code: "EVENT_FINISHED",
    }, { status: 400 });
  }

  const now = new Date();
  const { data, error } = await supabase
    .from("guests")
    .update({
      status_kehadiran: status,
      waktu_kedatangan: now.toISOString(),
    })
    .eq("id", guest.id)
    .eq("status_kehadiran", "tidak_hadir")
    .select("*")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Guest already checked in" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ guest: data, status });
}
