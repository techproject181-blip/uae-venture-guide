import { Avatar } from "@/components/avatar";
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
      <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur-lg backdrop-saturate-150">
        <div className="page-width flex h-16 items-center gap-3 sm:gap-6">
          <Logo />
          <NavLinks links={links} className="hidden self-stretch lg:flex" />
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2.5 xl:flex">
              <Avatar name={user.name} className="size-9 text-xs" />
              <p className="text-sm leading-tight">
                <span className="block font-medium">{user.name}</span>
                <span className="text-muted-foreground">{ROLE_LABELS[user.role]}</span>
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
        {/* Phones and tablets: the links in their own row, which scrolls sideways if it does not fit. */}
        <div className="border-t lg:hidden">
          <NavLinks links={links} compact className="page-width flex" />
        </div>
      </header>
      <main id="main" className="page-width flex-1 py-8 sm:py-10 lg:py-12">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
