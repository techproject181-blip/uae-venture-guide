"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ExternalLink, FileText, Gauge, LayoutDashboard, LogOut, UserRound, Users } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { useSignOut } from "@/components/auth/sign-out-button";
import { DASHBOARD_ONLY, DISABLED_CLASS, DISABLED_TITLE, isAllowedPath } from "@/lib/limited-mode";
import { cn } from "@/lib/utils";

export const ADMIN_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users, countKey: "pending" },
  { href: "/admin/sources", label: "Sources and fees", icon: BookOpen },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/usage", label: "AI usage", icon: Gauge },
  { href: "/account", label: "Account", icon: UserRound },
];

/** The admin sidebar links, with an icon each and the number of accounts waiting for approval next to Users. */
export function AdminNav({ counts = {}, user, onNavigate }) {
  const pathname = usePathname();
  const { signOut, pending } = useSignOut();
  // The submission build stops at the dashboard (lib/limited-mode.js): the rest
  // of the console stays in the sidebar, greyed out and dead.
  const offClick = DASHBOARD_ONLY ? (event) => event.preventDefault() : onNavigate;

  return (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-1">
      <p className="px-3 pb-1 text-xs font-medium tracking-[0.08em] text-ink-400 uppercase">Manage</p>
      {ADMIN_LINKS.map(({ href, label, icon: Icon, countKey }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const count = countKey ? counts[countKey] : 0;
        const off = DASHBOARD_ONLY && !isAllowedPath(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={off ? (event) => event.preventDefault() : onNavigate}
            aria-current={active ? "page" : undefined}
            aria-disabled={off ? "true" : undefined}
            tabIndex={off ? -1 : undefined}
            title={off ? DISABLED_TITLE : undefined}
            className={cn(
              "group flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-brand-400/50",
              active ? "bg-on-brand/10 text-on-brand" : "text-ink-300 hover:bg-on-brand/5 hover:text-on-brand",
              off && DISABLED_CLASS,
            )}
          >
            <Icon
              className={cn("size-4.5 shrink-0", active ? "text-brand-300" : "text-ink-400 group-hover:text-ink-300")}
              aria-hidden="true"
            />
            <span className="flex-1">{label}</span>
            {count > 0 && (
              <span className="rounded-full bg-gold-400 px-1.5 py-0.5 text-xs leading-none font-semibold text-ink-900 tabular-nums">
                {count}
                <span className="sr-only"> waiting</span>
              </span>
            )}
          </Link>
        );
      })}

      <div className="mt-auto border-t border-on-brand/10 pt-3">
        {user && (
          <Link
            href="/account"
            onClick={offClick}
            aria-disabled={DASHBOARD_ONLY ? "true" : undefined}
            tabIndex={DASHBOARD_ONLY ? -1 : undefined}
            title={DASHBOARD_ONLY ? DISABLED_TITLE : undefined}
            className={cn(
              "mb-2 flex items-center gap-3 rounded-xl bg-on-brand/5 p-2.5 outline-none hover:bg-on-brand/10 focus-visible:ring-3 focus-visible:ring-brand-400/50",
              DASHBOARD_ONLY && DISABLED_CLASS,
            )}
          >
            <Avatar name={user.name} className="size-9 bg-brand-300/15 text-xs text-brand-300 ring-0" />
            <div className="min-w-0 flex-1 text-sm leading-tight">
              <p className="truncate font-medium text-on-brand">{user.name}</p>
              <p className="truncate text-ink-400">{user.email}</p>
            </div>
          </Link>
        )}
        <Link
          href="/mentors"
          onClick={offClick}
          aria-disabled={DASHBOARD_ONLY ? "true" : undefined}
          tabIndex={DASHBOARD_ONLY ? -1 : undefined}
          title={DASHBOARD_ONLY ? DISABLED_TITLE : undefined}
          className={cn(
            "flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-ink-300 outline-none hover:bg-on-brand/5 hover:text-on-brand focus-visible:ring-3 focus-visible:ring-brand-400/50",
            DASHBOARD_ONLY && DISABLED_CLASS,
          )}
        >
          <ExternalLink className="size-4.5 text-ink-400" aria-hidden="true" />
          View public pages
        </Link>
        <button
          type="button"
          onClick={signOut}
          disabled={pending}
          className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-ink-300 outline-none hover:bg-destructive/15 hover:text-on-brand focus-visible:ring-3 focus-visible:ring-brand-400/50 disabled:opacity-60"
        >
          <LogOut className="size-4.5 text-ink-400" aria-hidden="true" />
          {pending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
