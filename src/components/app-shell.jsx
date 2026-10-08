import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Avatar } from "@/components/avatar";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { UserMenu } from "@/components/user-menu";
import { NavLinks } from "@/components/nav-links";
import { SiteFooter } from "@/components/site-footer";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ROLE_LABELS } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { FundingInterest } from "@/models/FundingInterest";
import { MentorRequest } from "@/models/MentorRequest";
import { Plan } from "@/models/Plan";

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

/** What waits for this user's answer: requests sent to a mentor, or funder interest in a founder's plans. */
async function waitingCount(user) {
  await connectDB();
  if (user.role === "mentor") return MentorRequest.countDocuments({ mentorId: user.id, status: "pending" });
  if (user.role === "entrepreneur") {
    const plans = await Plan.find({ ownerId: user.id }).distinct("_id");
    return FundingInterest.countDocuments({ planId: { $in: plans }, status: "pending" });
  }
  return 0;
}

/** Header, navigation and footer around every signed-in page. */
export async function AppShell({ user, children }) {
  // Administrators get their own console with a sidebar.
  if (user.role === "admin" && user.status === "active") return <AdminShell user={user}>{children}</AdminShell>;
  const waiting = user.status === "active" ? await waitingCount(user) : 0;
  // The number of things waiting for an answer sits next to "Requests".
  const links = (user.status === "active" ? NAV[user.role] : PENDING_NAV).map((link) =>
    link.href === "/requests" && waiting > 0 ? { ...link, count: waiting } : link,
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur-lg backdrop-saturate-150">
        <div className="page-width flex h-16 items-center gap-3 sm:gap-6">
          <Logo />
          <NavLinks links={links} className="hidden self-stretch lg:flex" />
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <UserMenu name={user.name} email={user.email} role={ROLE_LABELS[user.role]} className="hidden lg:flex" />
            {/* Phones and tablets: the links and the account in a side panel. */}
            <MobileNav links={[...links, { href: "/account", label: "Profile" }]}>
              <div className="flex items-center gap-3">
                <Avatar name={user.name} className="size-10 text-xs" />
                <p className="min-w-0 text-sm leading-tight">
                  <span className="block truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground">{ROLE_LABELS[user.role]}</span>
                </p>
              </div>
              <SignOutButton className="w-full" />
            </MobileNav>
          </div>
        </div>
      </header>
      <main id="main" className="page-width flex-1 py-8 sm:py-10 lg:py-12">
        {children}
      </main>
      <SiteFooter signedIn />
    </div>
  );
}
