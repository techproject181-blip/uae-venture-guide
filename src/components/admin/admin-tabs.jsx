import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The filter bar above an admin table: one white panel holding a row of tabs
 * (two by two on phones). Each tab is a link, so the filter lives in the
 * address and survives a reload. tabs: [{ href, label, count, current }]
 */
export function AdminTabs({ label, tabs }) {
  return (
    <nav aria-label={label} className="panel mb-6 p-1.5">
      <ul className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              aria-current={tab.current ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                tab.current ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs leading-none tabular-nums",
                    tab.current ? "bg-primary/10 text-accent-foreground" : "bg-secondary text-muted-foreground",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
