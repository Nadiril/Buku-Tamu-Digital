import { createPublicClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const rateLimitMap = new Map();
const RATE_WINDOW = 60000;
const RATE_MAX = 30;

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

// Periodically clean stale entries to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now - val.start > RATE_WINDOW * 2) rateLimitMap.delete(key);
  }
}, RATE_WINDOW * 2);

export async function GET(request, { params }) {
  const { token } = await params;
  if (!checkRateLimit(getClientIp(request))) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }

  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("guests")
    .select("id, nama, instansi, status_kehadiran, waktu_kedatangan, events!inner(id, nama_acara, lokasi, tanggal_mulai, jam_mulai, jam_selesai, grace_period_minutes, status)")
    .eq("qr_token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "QR Code tidak dikenali" }, { status: 404 });
  }

  return NextResponse.json({ guest: data });
}

export async function POST(request, { params }) {
  const { token } = await params;
  if (!checkRateLimit(getClientIp(request))) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }

  const supabase = await createPublicClient();
  const { data, error } = await supabase.rpc("public_register_guest_scan", {
    p_qr_token: token,
  });

  if (error) {
    console.error("[public-scan] RPC error:", error);
    return NextResponse.json({ error: "Gagal memproses scan" }, { status: 500 });
  }

  if (!data.success) {
    const statusMap = {
      invalid_qr: 404,
      event_not_found: 404,
      registration_not_open: 400,
      event_ended: 400,
      already_registered: 409,
    };
    return NextResponse.json(
      { error: data.message, code: data.error_code },
      { status: statusMap[data.error_code] || 400 },
    );
  }

  return NextResponse.json({
    success: true,
    status: data.status_kehadiran,
    guest: data.guest,
  });
}
