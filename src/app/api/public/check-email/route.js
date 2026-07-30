import { createPublicClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const rateLimitMap = new Map();
const RATE_WINDOW = 60000;
const RATE_MAX = 10;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_MAX;
}

export async function GET(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email || typeof email !== "string" || email.length > 254) {
    return NextResponse.json({ exists: false });
  }

  try {
    const supabase = await createPublicClient();
    const { data, error } = await supabase
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
