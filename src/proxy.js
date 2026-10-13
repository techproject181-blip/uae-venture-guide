import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/jwt";
import { DASHBOARD_ONLY, isAllowedPath } from "@/lib/limited-mode";

// Runs before the matched pages. It only checks that the session cookie is
// valid; each page then loads the user to check their role and status.
// Signed-in people skip the home, sign-in and sign-up pages and go to their dashboard.
const PRIVATE_PAGES = [
  "/dashboard",
  "/pending",
  "/plans",
  "/requests",
  "/profile",
  "/my-posts",
  "/discover",
  "/interests",
  "/admin",
  "/account",
];
const GUEST_PAGES = ["/", "/sign-in", "/sign-up"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session && PRIVATE_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`))) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  if (session && GUEST_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  // The submission build stops at the dashboard (lib/limited-mode.js), so a
  // typed address cannot reach a screen the navigation no longer shows.
  if (DASHBOARD_ONLY && session && !isAllowedPath(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

// The matcher must list literal paths, so it repeats the lists above.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pending",
    "/plans/:path*",
    "/requests/:path*",
    "/profile/:path*",
    "/account/:path*",
    "/my-posts/:path*",
    "/discover/:path*",
    "/interests/:path*",
    "/admin/:path*",
    "/",
    "/sign-in",
    "/sign-up",
    // While the app stops at the dashboard, the public pages are matched too,
    // so a signed-in user cannot wander off into them.
    "/mentors/:path*",
    "/posts/:path*",
    "/sources/:path*",
  ],
};
