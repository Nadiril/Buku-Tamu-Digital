import { createClient, createServiceClient } from "@/lib/supabase/server";
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
    const service = await createServiceClient();

    if (body.password) {
      const { error: pwdError } = await service.auth.admin.updateUserById(id, {
        password: body.password,
      });
      if (pwdError) {
        return NextResponse.json({ error: pwdError.message }, { status: 500 });
      }
    }

    if (body.display_name !== undefined || body.role !== undefined) {
      const profileUpdates = {};
      if (body.display_name !== undefined) profileUpdates.display_name = body.display_name;
      if (body.role !== undefined) {
        if (!["admin", "panitia"].includes(body.role)) {
          return NextResponse.json({ error: "Invalid role. Must be admin or panitia" }, { status: 400 });
        }
        profileUpdates.role = body.role;
      }
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", id);
      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
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

  if (id === user.id) {
    return NextResponse.json(
      { error: "Tidak dapat menghapus akun sendiri" },
      { status: 400 },
    );
  }

  try {
    const service = await createServiceClient();
    const { error } = await service.auth.admin.deleteUser(id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 });
  }
}
