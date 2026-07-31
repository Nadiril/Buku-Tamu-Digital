import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_ACTIONS = [
  "create_guest",
  "update_guest",
  "delete_guest",
  "import_guest",
  "import_guests",
  "scan_guest",
  "send_qr_email",
  "create_event",
  "update_event",
  "delete_event",
  "update_status",
  "export_laporan",
];

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
    .from("activities")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: "Gagal memuat aktivitas" }, { status: 500 });
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
    const { action, detail } = await request.json();

    if (!action || typeof action !== "string" || !ALLOWED_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Aksi tidak diizinkan" }, { status: 400 });
    }
    if (!detail || typeof detail !== "string" || detail.length > 500) {
      return NextResponse.json({ error: "Detail tidak valid" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("activities")
      .insert([{ action, detail: detail.trim(), user_id: user.id }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Gagal mencatat aktivitas" }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
}
