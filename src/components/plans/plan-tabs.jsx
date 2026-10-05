"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** The sections of a plan, as tabs that are real links (each has its own address). */
export function PlanTabs({ planId, tabs }) {
  const pathname = usePathname();
  const base = `/plans/${planId}`;
  const navRef = useRef(null);

  // On a phone the tabs scroll sideways; bring the current one into view.
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector('[aria-current="page"]');
    if (active) nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
  }, [pathname]);

  return (
    <nav ref={navRef} aria-label="Plan sections" className="relative -mx-4 mt-4 mb-6 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0 lg:mt-6 lg:mb-8">
      <ul className="flex gap-1 sm:gap-2">
        {tabs.map(({ slug, label }) => {
          const href = slug ? `${base}/${slug}` : base;
          const active = pathname === href;
          return (
            <li key={label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block min-h-11 min-w-11 border-b-2 px-2 py-3 text-center text-sm font-medium whitespace-nowrap transition-[color,border-color] duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset sm:px-3",
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:border-slate-300 hover:text-foreground",
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
