"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { useNavCounts } from "@/components/use-nav-counts";
import { cn } from "@/lib/utils";

const isActive = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`);

/**
 * The navigation links. On wide screens the current section has an emerald
 * line under it that slides from link to link; `compact` is the phone and
 * tablet row, a single line that scrolls sideways, where the current section
 * sits on a pale emerald pill that slides the same way. The numbers next to
 * the links stay up to date (useNavCounts). A link with `items` is a group,
 * such as "Explore": a small menu on wide screens, plain links in the compact row.
 */
export function NavLinks({ links: drawnLinks, className, compact = false }) {
  const pathname = usePathname();
  const counted = useNavCounts(drawnLinks);
  const links = compact ? counted.flatMap((link) => link.items ?? [link]) : counted;
  const layoutId = compact ? "nav-pill" : "nav-line";

  return (
    <nav aria-label="Main" className={cn(compact ? "no-scrollbar gap-1 overflow-x-auto" : "gap-1", className)}>
      {links.map(({ href, label, count, items }) => {
        if (items) return <NavGroup key={label} label={label} items={items} active={items.some((item) => isActive(pathname, item.href))} />;
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex shrink-0 items-center whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
              compact ? "my-2 rounded-full px-3.5 py-2 text-sm" : "px-2 text-sm xl:px-3",
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
                    : "absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary xl:inset-x-3"
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

/**
 * A group of links in the top bar, such as "Explore": the button looks like
 * the other links and carries the same line while one of its pages is open.
 */
function NavGroup({ label, items, active }) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(
          "relative flex shrink-0 cursor-pointer items-center gap-1 px-2 text-sm whitespace-nowrap outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset xl:px-3",
          active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground data-popup-open:text-foreground",
        )}
      >
        {active && (
          <motion.span
            layoutId="nav-line"
            aria-hidden="true"
            className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary xl:inset-x-3"
            transition={{ type: "spring", stiffness: 500, damping: 38 }}
          />
        )}
        <span className="relative">{label}</span>
        <ChevronDown className="relative size-3.5 transition-transform in-data-popup-open:rotate-180" aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={4} collisionPadding={16} className="z-50">
          <Menu.Popup className="w-72 max-w-[calc(100vw-2rem)] origin-(--transform-origin) rounded-xl border bg-card p-1.5 shadow-window transition-[opacity,scale] duration-150 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            {items.map((item) => (
              <Menu.Item
                key={item.href}
                render={<Link href={item.href} />}
                className="block cursor-pointer rounded-md px-3 py-2.5 outline-none select-none data-highlighted:bg-ink-50"
              >
                <span className="block text-sm font-medium">{item.label}</span>
                {item.detail && <span className="mt-0.5 block text-[0.8125rem] text-muted-foreground">{item.detail}</span>}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
