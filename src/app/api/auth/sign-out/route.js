import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

// POST /api/auth/sign-out: the Sign out button.
export async function POST() {
  await deleteSession();
  return Response.json({ ok: true });
}

// GET /api/auth/sign-out: pages redirect here when the account behind a session
// is gone or suspended, because pages themselves cannot delete cookies.
export async function GET(request) {
  await deleteSession();
  const url = new URL("/sign-in", request.url);
  if (request.nextUrl.searchParams.get("reason") === "suspended") {
    url.searchParams.set("error", "suspended");
  }
  return NextResponse.redirect(url);
}
