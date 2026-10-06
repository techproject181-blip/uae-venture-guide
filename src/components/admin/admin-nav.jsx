"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ExternalLink, FileText, Gauge, LayoutDashboard, UserCog, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const ADMIN_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users, countKey: "pending" },
  { href: "/admin/sources", label: "Sources and fees", icon: BookOpen },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/usage", label: "AI usage", icon: Gauge },
  { href: "/account", label: "Account", icon: UserCog },
];

/** The admin sidebar links, with an icon each and the number of accounts waiting for approval next to Users. */
export function AdminNav({ counts = {}, onNavigate }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-1">
      <p className="px-3 pb-1 text-xs font-medium tracking-[0.08em] text-ink-400 uppercase">Manage</p>
      {ADMIN_LINKS.map(({ href, label, icon: Icon, countKey }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const count = countKey ? counts[countKey] : 0;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-brand-400/50",
              active ? "bg-on-brand/10 text-on-brand" : "text-ink-300 hover:bg-on-brand/5 hover:text-on-brand",
            )}
          >
            <Icon className={cn("size-4.5 shrink-0", active ? "text-brand-300" : "text-ink-400 group-hover:text-ink-300")} aria-hidden="true" />
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
        <Link
          href="/mentors"
          onClick={onNavigate}
          className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-ink-300 outline-none hover:bg-on-brand/5 hover:text-on-brand focus-visible:ring-3 focus-visible:ring-brand-400/50"
        >
          <ExternalLink className="size-4.5 text-ink-400" aria-hidden="true" />
          View public pages
        </Link>
      </div>
    </nav>
  );
}
