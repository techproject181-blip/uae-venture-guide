import { cache } from "react";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSessionToken, verifySessionToken } from "@/lib/jwt";
import { User } from "@/models/User";

/** Signs the user in by setting the session cookie. Only works in a Route Handler. */
export async function createSession(user) {
  const token = await signSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true, // browser JavaScript cannot read it
    secure: process.env.NODE_ENV === "production", // sent over HTTPS only in production
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Signs the user out. Only works in a Route Handler. */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * The signed-in user, or null. Read from the database on each request, so an
 * approval or suspension takes effect at once. cache() runs it once per request.
 */
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session?.sub) return null;

  await connectDB();
  const user = await User.findById(session.sub).lean();
  if (!user) return null;

  return { id: String(user._id), name: user.name, email: user.email, role: user.role, status: user.status };
});
