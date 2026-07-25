import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

//
// scan/[token] — authenticated panitia/admin scan endpoint
//
// This endpoint delegates to register_guest_scan() — a SECURITY DEFINER
// PostgreSQL function — which validates timing using the database clock
// (now()), checks the caller's role, and uses row-level locking (FOR UPDATE)
// to prevent double-registration from near-simultaneous scans.
//
// The client never supplies a timestamp or does any timing logic — that
// all happens server-side inside the function, making it impossible for
// a compromised client or a server with a wrong clock to bypass the rules.
//

export async function POST(request, { params }) {
  const { token } = await params;

  // 1. Verify authentication (register_guest_scan checks role internally)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Call the SECURITY DEFINER function that handles all validation
  //    p_caller_id is passed explicitly (not relying on auth.uid() inside the function)
  const { data, error } = await supabase.rpc("register_guest_scan", {
    p_qr_token: token,
    p_caller_id: user.id,
  });

  if (error) {
    console.error("[scan] RPC error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 3. The function returns a jsonb response with { success, error_code, message, ... }
  if (!data.success) {
    console.log("[scan] RPC returned:", JSON.stringify(data));
    const statusMap = {
      invalid_qr: 404,
      event_not_found: 404,
      registration_not_open: 400,
      event_ended: 400,
      already_registered: 409,
      forbidden: 403,
    };
    const status = statusMap[data.error_code] || 400;
    return NextResponse.json(
      { error: data.message, code: data.error_code, guest: data.guest || null },
      { status },
    );
  }

  // 4. Success — return the result
  return NextResponse.json({
    success: true,
    status: data.status_kehadiran,
    guest: data.guest,
  });
}
