import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

/**
 * Call at the top of every signed-in page. Returns the user, or redirects:
 * no session or a suspended account goes to sign-in, and a pending account
 * goes to the waiting page unless the page allows it. A wrong role shows 404.
 */
export async function requireUser({ roles, allowPending = false } = {}) {
  const user = await getCurrentUser();
  if (!user) redirect("/api/auth/sign-out");
  if (user.status === "suspended") redirect("/api/auth/sign-out?reason=suspended");
  if (user.status === "pending" && !allowPending) redirect("/pending");
  if (roles && !roles.includes(user.role)) notFound();
  return user;
}
