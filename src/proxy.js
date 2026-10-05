import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/jwt";

// Runs before the matched pages. It only checks that the session cookie is
// valid; each page then loads the user to check their role and status.
// Signed-in people skip the home, sign-in and sign-up pages and go to their dashboard.
const PRIVATE_PAGES = ["/dashboard", "/pending", "/plans", "/requests", "/profile", "/my-posts", "/discover", "/interests", "/admin"];
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
    "/my-posts/:path*",
    "/discover/:path*",
    "/interests/:path*",
    "/admin/:path*",
    "/",
    "/sign-in",
    "/sign-up",
  ],
};
