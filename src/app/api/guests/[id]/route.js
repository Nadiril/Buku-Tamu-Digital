import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function sanitize(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/<[^>]*>/g, "").slice(0, 500);
}

export async function PUT(request, { params }) {
  const { id } = await params;
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
    const allowed = [
      "nama",
      "instansi",
      "no_hp",
      "tujuan",
      "kategori_tamu",
      "status_kehadiran",
      "waktu_kedatangan",
      "acara_id",
    ];
    const updates = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        updates[key] = key === "acara_id" ? Number(body[key]) : sanitize(body[key]);
      }
    }

    const { data, error } = await supabase
      .from("guests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Gagal memperbarui data tamu" }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
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

  const { error } = await supabase.from("guests").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
