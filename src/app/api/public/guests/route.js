import { createServiceClient } from "@/lib/supabase/server";
import { computeAttendanceStatus } from "@/lib/event-status";
import { NextResponse } from "next/server";
import { generateToken } from "@/lib/token";

export async function POST(request) {
  try {
    const { nama, instansi, tujuan, no_hp, acara_id } = await request.json();
    const supabase = await createServiceClient();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", acara_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "registrasi_dibuka") {
      return NextResponse.json({ error: "Registrasi untuk acara ini sudah ditutup" }, { status: 400 });
    }

    const now = new Date();

    const status_kehadiran = computeAttendanceStatus(event, now);
    if (!status_kehadiran) {
      return NextResponse.json({ error: "Acara sudah selesai. Registrasi tidak diterima." }, { status: 400 });
    }

    const guest = {
      nama,
      instansi,
      tujuan: tujuan || null,
      no_hp: no_hp || null,
      kategori_tamu: "reguler",
      status_kehadiran,
      waktu_kedatangan: now.toISOString(),
      acara_id,
      qr_token: generateToken(),
    };

    const { data, error } = await supabase.from("guests").insert([guest]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
