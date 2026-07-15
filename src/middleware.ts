import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  let user = null;
  let supabaseResponse = NextResponse.next();

  try {
    const result = await updateSession(request);
    user = result.user;
    supabaseResponse = result.supabaseResponse;
  } catch {
    // Dev mode: Supabase unavailable — allow all routes
    console.warn("[Dev] Supabase unavailable, bypassing auth");
  }

  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedPaths = ["/dashboard"];
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Auth pages (redirect to dashboard if already logged in)
  const authPages = ["/login", "/register"];
  const isAuthPage = authPages.some((path) => pathname === path);

  // Dev mode: skip auth redirects entirely
  if (isProtected && !user) {
    // In production, redirect to login. In dev, let them through.
    if (process.env.NODE_ENV === "production") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // Dev: just proceed
    return supabaseResponse;
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public/*)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
