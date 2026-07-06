import { createServiceClient } from "@/lib/supabase/server";
import { computeAttendanceStatus } from "@/lib/event-status";
import { NextResponse } from "next/server";

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 30;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

export async function GET(request, { params }) {
  const { token } = await params;
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }

  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("guests")
    .select("*, events!inner(id, nama_acara, lokasi, tanggal_mulai, jam_mulai, jam_selesai, grace_period_minutes, status)")
    .eq("qr_token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  return NextResponse.json({ guest: data });
}

export async function POST(request, { params }) {
  const { token } = await params;
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }

  const supabase = await createServiceClient();

  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("*, events!inner(*)")
    .eq("qr_token", token)
    .single();

  if (guestError || !guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  const event = guest.events;

  if (event.status !== "registrasi_dibuka") {
    return NextResponse.json({ error: "Registrasi untuk acara ini belum dibuka atau sudah ditutup" }, { status: 400 });
  }

  if (guest.status_kehadiran === "hadir" || guest.status_kehadiran === "terlambat") {
    return NextResponse.json({ error: "Guest already checked in", guest }, { status: 409 });
  }

  const now = new Date();

  const status = computeAttendanceStatus(event, now);
  if (!status) {
    return NextResponse.json({
      error: "Acara sudah selesai. Tidak dapat melakukan registrasi kehadiran.",
      code: "EVENT_FINISHED",
    }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("guests")
    .update({
      status_kehadiran: status,
      waktu_kedatangan: now.toISOString(),
    })
    .eq("id", guest.id)
    .eq("status_kehadiran", "tidak_hadir")
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Guest already checked in", guest }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ guest: data, status });
}
