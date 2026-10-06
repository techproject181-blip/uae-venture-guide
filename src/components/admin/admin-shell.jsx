import Link from "next/link";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminNav } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Avatar } from "@/components/avatar";
import { LogoMark, Wordmark } from "@/components/logo";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

/**
 * The administrator's console: a dark sidebar on the left (a slide-in menu on
 * phones and tablets), a slim top bar with the account, and a wide work area.
 */
export async function AdminShell({ user, children }) {
  await connectDB();
  const pending = await User.countDocuments({ status: "pending" });
  const counts = { pending };

  const account = (
    <div className="flex items-center gap-3">
      <Avatar name={user.name} className="size-9 text-xs" />
      <p className="min-w-0 text-sm leading-tight">
        <span className="block truncate font-medium">{user.name}</span>
        <span className="text-muted-foreground">Administrator</span>
      </p>
    </div>
  );

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-ink-900 lg:flex">
        <Link href="/dashboard" className="flex h-16 items-center gap-2.5 px-5 outline-none focus-visible:ring-3 focus-visible:ring-brand-400/50 focus-visible:ring-inset">
          <LogoMark />
          <Wordmark className="text-on-brand [&>span]:text-brand-300" />
        </Link>
        <div className="flex flex-1 flex-col overflow-y-auto px-3 pt-2 pb-3">
          <AdminNav counts={counts} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur-lg">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <AdminMobileNav counts={counts}>
              <SignOutButton className="w-full" />
            </AdminMobileNav>
            <span className="rounded-md bg-ink-900 px-2 py-1 text-xs font-semibold tracking-[0.06em] text-on-brand uppercase">Admin</span>
            <div className="ml-auto flex items-center gap-4">
              <div className="hidden sm:block">{account}</div>
              <SignOutButton className="hidden lg:inline-flex" />
            </div>
          </div>
        </header>
        <main id="main" className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
