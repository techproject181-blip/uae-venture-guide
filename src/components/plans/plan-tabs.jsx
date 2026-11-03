"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * The sections of a plan, as tabs that are real links (each has its own address).
 * Phones get a grid of three per row, so every section is in view without
 * scrolling; from 640px they sit in one row with a line under the current one.
 */
export function PlanTabs({ planId, tabs }) {
  const pathname = usePathname();
  const base = `/plans/${planId}`;

  return (
    <nav aria-label="Plan sections" className="mt-4 mb-6 sm:border-b lg:mt-6 lg:mb-8">
      <ul className="grid grid-cols-3 gap-1 rounded-xl border bg-ink-100/70 p-1 sm:flex sm:gap-2 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0">
        {tabs.map(({ slug, label }) => {
          const href = slug ? `${base}/${slug}` : base;
          const active = pathname === href;
          return (
            <li key={label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center justify-center rounded-lg px-2 text-center text-sm font-medium whitespace-nowrap transition-[color,border-color,background-color] duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  "sm:block sm:min-h-11 sm:min-w-11 sm:rounded-none sm:border-b-2 sm:px-3 sm:py-3",
                  active
                    ? "bg-card text-primary shadow-xs ring-1 ring-border sm:border-primary sm:bg-transparent sm:shadow-none sm:ring-0"
                    : "text-muted-foreground hover:text-foreground sm:border-transparent sm:hover:border-ink-300",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
