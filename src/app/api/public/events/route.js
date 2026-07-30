import { createPublicClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, nama_acara, slug, lokasi, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, grace_period_minutes, status")
    .order("tanggal_mulai", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  return NextResponse.json(data);
}
