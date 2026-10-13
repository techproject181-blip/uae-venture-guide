"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The navigation links. On wide screens the current section has an emerald
 * line under it that slides from link to link; `compact` is the phone and
 * tablet row, a single line that scrolls sideways, where the current section
 * sits on a pale emerald pill that slides the same way.
 */
export function NavLinks({ links, className, compact = false }) {
  const pathname = usePathname();
  const layoutId = compact ? "nav-pill" : "nav-line";

  return (
    <nav aria-label="Main" className={cn(compact ? "no-scrollbar gap-1 overflow-x-auto" : "gap-1", className)}>
      {links.map(({ href, label, count }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex shrink-0 items-center whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
              compact ? "my-2 rounded-full px-3.5 py-2 text-sm" : "px-3 text-sm",
              "transition-colors duration-200",
              active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                aria-hidden="true"
                className={
                  compact
                    ? "absolute inset-0 z-0 rounded-full bg-accent ring-1 ring-primary/15"
                    : "absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary"
                }
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className={cn("relative", compact && active && "text-accent-foreground")}>{label}</span>
            {count > 0 && (
              <span className="relative ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[0.6875rem] leading-none font-semibold text-primary-foreground tabular-nums">
                {count}
                <span className="sr-only"> new</span>
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
