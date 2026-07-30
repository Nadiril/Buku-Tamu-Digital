import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateToken } from "@/lib/token";

function sanitize(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/<[^>]*>/g, "").slice(0, 500);
}

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "panitia"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const acara_id = searchParams.get("acara_id");

  let query = supabase.from("guests").select("*").order("created_at", { ascending: false });
  if (acara_id) query = query.eq("acara_id", parseInt(acara_id));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Gagal memuat data tamu" }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "panitia"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const nama = sanitize(body.nama);
    const instansi = sanitize(body.instansi);

    if (!nama || !instansi) {
      return NextResponse.json({ error: "Nama dan instansi wajib diisi" }, { status: 400 });
    }
    if (!body.acara_id || isNaN(Number(body.acara_id))) {
      return NextResponse.json({ error: "Acara tidak valid" }, { status: 400 });
    }

    const guest = {
      nama,
      instansi,
      no_hp: body.no_hp ? sanitize(body.no_hp).slice(0, 20) : null,
      tujuan: body.tujuan ? sanitize(body.tujuan) : null,
      kategori_tamu: body.kategori_tamu || "reguler",
      status_kehadiran: "tidak_hadir",
      acara_id: Number(body.acara_id),
      qr_token: generateToken(),
    };

    if (!["reguler", "vip", "vvip"].includes(guest.kategori_tamu)) {
      return NextResponse.json({ error: "Kategori tamu tidak valid" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("guests")
      .insert([guest])
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Gagal menambahkan tamu" }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
}
