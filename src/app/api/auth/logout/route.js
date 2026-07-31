import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return NextResponse.json({ error: "Gagal logout" }, { status: 500 });
    }

    const cookieStore = await cookies();
    cookieStore.set("tamuku_remember", "", { path: "/", maxAge: 0 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal logout" }, { status: 500 });
  }
}
