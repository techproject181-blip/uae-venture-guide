import { Logo } from "@/components/logo";
import { NavLinks } from "@/components/nav-links";
import { SiteFooter } from "@/components/site-footer";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ROLE_LABELS } from "@/lib/constants";

// The links each role sees. Pending mentors and funders only reach their profile.
const NAV = {
  entrepreneur: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/plans", label: "My plans" },
    { href: "/mentors", label: "Mentors" },
    { href: "/requests", label: "Requests" },
    { href: "/sources", label: "Sources" },
  ],
  mentor: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/requests", label: "Requests" },
    { href: "/my-posts", label: "My posts" },
    { href: "/profile", label: "Profile" },
  ],
  funder: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/discover", label: "Discover" },
    { href: "/interests", label: "My interests" },
    { href: "/profile", label: "Profile" },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/sources", label: "Sources" },
    { href: "/admin/content", label: "Content" },
    { href: "/admin/usage", label: "AI usage" },
  ],
};

const PENDING_NAV = [
  { href: "/pending", label: "Approval" },
  { href: "/profile", label: "Profile" },
];

/** Header, navigation and footer around every signed-in page. */
export function AppShell({ user, children }) {
  const links = user.status === "active" ? NAV[user.role] : PENDING_NAV;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-card lg:sticky lg:top-0 lg:z-40 lg:bg-card/90 lg:backdrop-blur-md">
        <div className="page-width flex items-center gap-4 sm:gap-6">
          <Logo />
          <NavLinks links={links} className="hidden self-stretch lg:flex" />
          <div className="ml-auto flex items-center gap-4 py-2.5">
            <p className="hidden text-right text-sm xl:block">
              <span className="block font-medium">{user.name}</span>
              <span className="text-muted-foreground">{ROLE_LABELS[user.role]}</span>
            </p>
            <SignOutButton />
          </div>
        </div>
        {/* On phones and tablets the links sit in their own row, closer together, and wrap if a large text size needs it. */}
        <NavLinks links={links} compact className="flex flex-wrap border-t px-2 sm:px-4 lg:hidden" />
      </header>
      <main id="main" className="page-width flex-1 py-8 sm:py-10 lg:py-12">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
