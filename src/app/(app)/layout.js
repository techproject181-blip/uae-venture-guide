import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/session";

// Every signed-in page shares this header and navigation. Each page still
// checks access itself with requireUser(), because a layout is not re-run on
// every navigation.
export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/api/auth/sign-out");
  if (user.status === "suspended") redirect("/api/auth/sign-out?reason=suspended");

  return <AppShell user={user}>{children}</AppShell>;
}
