import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
      "nama_acara",
      "lokasi",
      "tanggal_mulai",
      "tanggal_selesai",
      "jam_mulai",
      "jam_selesai",
      "grace_period_minutes",
      "status",
    ];
    const updates = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    if (updates.nama_acara) {
      updates.slug = updates.nama_acara
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (updates.grace_period_minutes !== undefined) {
      updates.grace_period_minutes = Number(updates.grace_period_minutes) >= 0
        ? Number(updates.grace_period_minutes)
        : 30;
    }

    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        const detail = `${error.message} ${error.details || ""}`.toLowerCase();
        if (detail.includes("single_active")) {
          return NextResponse.json(
            { error: "Hanya satu acara yang bisa berstatus Registrasi Dibuka dalam satu waktu." },
            { status: 409 },
          );
        }
        return NextResponse.json(
          { error: "Nama acara sudah dipakai. Gunakan nama yang berbeda." },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: "Gagal memperbarui acara" }, { status: 500 });
    }
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

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Gagal menghapus acara" }, { status: 500 });
  return NextResponse.json({ success: true });
}
