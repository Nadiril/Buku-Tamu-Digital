import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
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

  if (!profile || !["admin", "panitia"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [{ count: totalEvents }, { count: totalGuests }, { count: activeEvents }] =
    await Promise.all([
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("guests").select("*", { count: "exact", head: true }),
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("status", "registrasi_dibuka"),
    ]);

  const today = new Date().toISOString().slice(0, 10);
  const { count: todayGuests } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true })
    .gte("waktu_kedatangan", today)
    .lt("waktu_kedatangan", new Date(Date.now() + 86400000).toISOString().slice(0, 10));

  return NextResponse.json({
    totalEvents,
    totalGuests,
    todayGuests,
    activeEvents,
  });
}
