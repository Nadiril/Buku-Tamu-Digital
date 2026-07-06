import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateToken } from "@/lib/token";

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
    const { guests: guestData } = await request.json();

    const guests = guestData.map((g) => ({
      nama: g.nama,
      instansi: g.instansi || "",
      no_hp: g.no_hp || null,
      tujuan: g.tujuan || null,
      kategori_tamu: (g.kategori_tamu || "reguler").toLowerCase(),
      status_kehadiran: "tidak_hadir",
      acara_id: g.acara_id,
      qr_token: generateToken(),
    }));

    const { data, error } = await supabase.from("guests").insert(guests).select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ count: data.length, guests: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
