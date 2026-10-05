"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** The navigation links. The current section is underlined in emerald. `compact` is the phone row: less padding, so all links fit on one line. */
export function NavLinks({ links, className, compact = false }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={cn(compact ? "gap-0" : "gap-1", className)}>
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center border-b-2 py-3 whitespace-nowrap",
              compact ? "px-2 text-[0.8125rem]" : "px-3 text-sm",
              "transition-[color,border-color] duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
              active ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:border-slate-300 hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
