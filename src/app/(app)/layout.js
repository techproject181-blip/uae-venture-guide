import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/session";

// The page reads the session cookie before drawing anything, so a signed-out or
// suspended user gets a real redirect and a missing page a real 404. With
// cacheComponents on, that is allowed to block instead of streaming.
export const instant = false;

// Every signed-in page shares this header and navigation. Each page still
// checks access itself with requireUser(), because a layout is not re-run on
// every navigation.
export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/api/auth/sign-out");
  if (user.status === "suspended") redirect("/api/auth/sign-out?reason=suspended");

  return <AppShell user={user}>{children}</AppShell>;
}
