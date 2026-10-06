import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The filter bar above an admin table: a compact segmented control, the way
 * admin consoles show views of one list. Each tab is a link, so the filter
 * lives in the address and survives a reload. tabs: [{ href, label, count, current }]
 * `children` sit on the right of the bar (a search box, for example).
 */
export function AdminTabs({ label, tabs, children }) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <nav aria-label={label} className="no-scrollbar -mx-1 overflow-x-auto px-1">
        <ul className="inline-flex gap-0.5 rounded-lg border bg-ink-100/70 p-0.5">
          {tabs.map((tab) => (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={tab.current ? "page" : undefined}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  tab.current ? "bg-card text-foreground shadow-xs ring-1 ring-border" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-xs leading-none tabular-nums",
                      tab.current ? "bg-accent text-accent-foreground" : "bg-ink-200/70 text-muted-foreground",
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
      {children}
    </div>
  );
}
