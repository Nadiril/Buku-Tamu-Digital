import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const publicRoutes = ["/", "/event/", "/scan/", "/api/public/", "/api/auth/"];

export async function proxy(request) {
  const { supabaseResponse, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  const isPublic = publicRoutes.some((r) => pathname === r || pathname.startsWith(r));
  const isStaticAsset = pathname.startsWith("/_next") || pathname.startsWith("/favicon");

  if (!user && !isPublic && !isStaticAsset) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|Logo.webp|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
