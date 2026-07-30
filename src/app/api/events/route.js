import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function sanitize(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/<[^>]*>/g, "").slice(0, 500);
}

export async function GET() {
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

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Gagal memuat data acara" }, { status: 500 });
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

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.nama_acara || !body.lokasi || !body.tanggal_mulai || !body.jam_mulai) {
      return NextResponse.json({ error: "Nama acara, lokasi, tanggal mulai, dan jam mulai wajib diisi" }, { status: 400 });
    }

    const slug = (body.nama_acara || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const record = {
      nama_acara: sanitize(body.nama_acara),
      lokasi: sanitize(body.lokasi),
      tanggal_mulai: body.tanggal_mulai,
      tanggal_selesai: body.tanggal_selesai || body.tanggal_mulai,
      jam_mulai: body.jam_mulai,
      jam_selesai: body.jam_selesai || "17:00",
      grace_period_minutes: body.grace_period_minutes !== undefined ? Number(body.grace_period_minutes) : 30,
      status: body.status || "akan_datang",
      slug,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from("events")
      .insert([record])
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Gagal membuat acara" }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
}
