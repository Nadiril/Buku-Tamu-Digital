import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

//
// public/scan/[token] — unauthenticated guest self-scanning endpoint
//
// Guests can scan their QR code from a phone or printed ticket to
// self-register their attendance. All timing validation is done
// server-side by public_register_guest_scan() using the database
// clock (now()) — no client-supplied timestamp is trusted.
//
// Rate limiting is applied aggressively at this layer since there
// is no authenticated user to throttle.
//

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 30;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

export async function GET(request, { params }) {
  const { token } = await params;
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }

  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("guests")
    .select("*, events!inner(id, nama_acara, lokasi, tanggal_mulai, jam_mulai, jam_selesai, grace_period_minutes, status)")
    .eq("qr_token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  return NextResponse.json({ guest: data });
}

export async function POST(request, { params }) {
  const { token } = await params;
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }

  const supabase = await createServiceClient();

  // Call the SECURITY DEFINER function that validates everything server-side
  const { data, error } = await supabase.rpc("public_register_guest_scan", {
    p_qr_token: token,
  });

  if (error) {
    console.error("[public-scan] RPC error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // The function returns jsonb with { success, error_code, message, ... }
  if (!data.success) {
    const statusMap = {
      invalid_qr: 404,
      event_not_found: 404,
      registration_not_open: 400,
      event_ended: 400,
      already_registered: 409,
    };
    const status = statusMap[data.error_code] || 400;
    return NextResponse.json(
      { error: data.message, code: data.error_code, guest: data.guest || null },
      { status },
    );
  }

  return NextResponse.json({
    success: true,
    status: data.status_kehadiran,
    guest: data.guest,
  });
}
