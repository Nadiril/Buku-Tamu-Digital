import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const rateLimitMap = new Map();
const RATE_WINDOW = 60000;
const RATE_MAX = 10;

function getClientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

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

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now - val.start > RATE_WINDOW * 2) rateLimitMap.delete(key);
  }
}, RATE_WINDOW * 2);

export async function POST(request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan login. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }
    if (email.length > 254 || password.length > 128) {
      return NextResponse.json({ error: "Email atau password tidak valid" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, display_name, role")
      .eq("id", data.user.id)
      .single();

    return NextResponse.json({
      id: data.user.id,
      email: data.user.email,
      role: profile?.role,
      display_name: profile?.display_name,
    });
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
