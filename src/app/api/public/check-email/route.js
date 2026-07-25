import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ exists: false });
  }

  try {
    const service = await createServiceClient();
    const { data, error } = await service
      .from("profiles")
      .select("id")
      .eq("username", email)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: !!data });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
