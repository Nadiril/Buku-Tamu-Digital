import { createServiceClient } from "@/lib/supabase/server";
import { computeAttendanceStatus } from "@/lib/event-status";
import { NextResponse } from "next/server";
import { generateToken } from "@/lib/token";

function validate(field, label, maxLength = 200) {
  if (!field || typeof field !== "string" || !field.trim()) {
    return `${label} wajib diisi`;
  }
  if (field.trim().length > maxLength) {
    return `${label} maksimal ${maxLength} karakter`;
  }
  return null;
}

function sanitize(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/<[^>]*>/g, "").slice(0, 500);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { acara_id } = body;
    const nama = sanitize(body.nama);
    const instansi = sanitize(body.instansi);
    const tujuan = body.tujuan ? sanitize(body.tujuan) : null;
    const no_hp = body.no_hp ? sanitize(body.no_hp) : null;

    const err = validate(nama, "Nama") || validate(instansi, "Instansi");
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    if (!acara_id || isNaN(Number(acara_id))) {
      return NextResponse.json({ error: "Acara tidak valid" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, nama_acara, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, grace_period_minutes, status")
      .eq("id", Number(acara_id))
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Registrasi tidak dapat diproses" }, { status: 404 });
    }

    if (event.status !== "registrasi_dibuka") {
      return NextResponse.json({ error: "Registrasi untuk acara ini sudah ditutup" }, { status: 400 });
    }

    const now = new Date();
    const status_kehadiran = computeAttendanceStatus(event, now);
    if (!status_kehadiran) {
      return NextResponse.json({ error: "Acara sudah selesai" }, { status: 400 });
    }

    const guest = {
      nama,
      instansi,
      tujuan,
      no_hp,
      kategori_tamu: "reguler",
      status_kehadiran,
      waktu_kedatangan: now.toISOString(),
      acara_id: Number(acara_id),
      qr_token: generateToken(),
    };

    const { data, error } = await supabase.from("guests").insert([guest]).select("id, nama, instansi, status_kehadiran, waktu_kedatangan").single();

    if (error) return NextResponse.json({ error: "Gagal mendaftarkan tamu" }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
}
