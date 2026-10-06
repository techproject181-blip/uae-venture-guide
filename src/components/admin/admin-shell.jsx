import Link from "next/link";
import { AdminBreadcrumb, AdminMain } from "@/components/admin/admin-breadcrumb";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoMark, Wordmark } from "@/components/logo";
import { UserMenu } from "@/components/user-menu";
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

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-ink-900 lg:flex">
        <Link
          href="/dashboard"
          className="flex h-16 items-center gap-2.5 px-5 outline-none focus-visible:ring-3 focus-visible:ring-brand-400/50 focus-visible:ring-inset"
        >
          <LogoMark />
          <span className="flex flex-col leading-tight">
            <Wordmark className="text-on-brand [&>span]:text-brand-300" />
            <span className="text-xs font-medium tracking-[0.06em] text-ink-400 uppercase">Admin console</span>
          </span>
        </Link>
        <div className="flex flex-1 flex-col overflow-y-auto px-3 pt-2 pb-3">
          <AdminNav counts={counts} user={{ name: user.name, email: user.email }} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur-lg">
          <div className="relative flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <AdminMobileNav counts={counts} user={{ name: user.name, email: user.email }} />
            <AdminBreadcrumb />
            <div className="ml-auto shrink-0">
              <UserMenu name={user.name} email={user.email} role="Administrator" />
            </div>
          </div>
        </header>
        <main id="main" className="w-full flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
          <AdminMain>{children}</AdminMain>
        </main>
      </div>
    </div>
  );
}
