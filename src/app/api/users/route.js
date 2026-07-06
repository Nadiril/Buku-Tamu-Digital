import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    const { email, password, display_name, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    if (!["admin", "scanner", "staff"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be admin, scanner, or staff" },
        { status: 400 }
      );
    }

    const serviceSupabase = createServiceClient();

    const { data: authUser, error: authError } =
      await serviceSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role,
          display_name: display_name || email.split("@")[0],
        },
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          role,
          display_name: display_name || email.split("@")[0],
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
