import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateToken } from "@/lib/token";

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const acara_id = searchParams.get("acara_id");

  let query = supabase.from("guests").select("*").order("created_at", { ascending: false });
  if (acara_id) query = query.eq("acara_id", parseInt(acara_id));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const guest = {
      nama: body.nama,
      instansi: body.instansi,
      no_hp: body.no_hp ?? null,
      tujuan: body.tujuan ?? null,
      kategori_tamu: (body.kategori_tamu || "reguler").toLowerCase(),
      status_kehadiran: body.status_kehadiran || "tidak_hadir",
      waktu_kedatangan: body.waktu_kedatangan ?? null,
      acara_id: body.acara_id,
      qr_token: body.qr_token || generateToken(),
    };

    const { data, error } = await supabase
      .from("guests")
      .insert([guest])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
