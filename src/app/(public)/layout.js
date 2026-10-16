import { AppShell } from "@/components/app-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";

// The page reads the session cookie before drawing anything, so a signed-out or
// suspended user gets a real redirect and a missing page a real 404. With
// cacheComponents on, that is allowed to block instead of streaming.
export const instant = false;

// Pages anyone may open (sources, mentors, posts). Signed-in users keep their
// usual navigation; visitors see the public header.
export default async function PublicLayout({ children }) {
  const user = await getCurrentUser();
  if (user && user.status !== "suspended") return <AppShell user={user}>{children}</AppShell>;

  return (
    <>
      <SiteHeader />
      <main id="main" className="page-width flex-1 py-8 sm:py-10 lg:py-12">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
