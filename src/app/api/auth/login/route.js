import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return NextResponse.json({
      user: data.user,
      profile,
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
