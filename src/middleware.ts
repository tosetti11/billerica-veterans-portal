import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Use a lightweight JWT check without importing the full auth/prisma chain
// which pulls in node:crypto (not available in middleware/edge runtime)
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for session token cookie (set by NextAuth)
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  // Admin routes - we can't decode the JWT here without pulling in crypto,
  // so the admin layout server component handles role-checking.
  // Middleware only checks if the user is logged in.
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protected veteran routes (forms listing is public, but filling requires login)
  const protectedPrefixes = ["/apply", "/appointments", "/documents", "/status"];
  if (protectedPrefixes.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Form fill pages require login, but /forms listing is public
  if (pathname.startsWith("/forms/") && pathname !== "/forms") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/apply/:path*", "/appointments/:path*", "/documents/:path*", "/status/:path*", "/forms/:path*"],
};
