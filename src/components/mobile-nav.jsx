"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { DASHBOARD_ONLY, DISABLED_CLASS, DISABLED_TITLE, isAllowedPath } from "@/lib/limited-mode";
import { cn } from "@/lib/utils";

/**
 * Phones and tablets (below 1024px): a menu button that opens the links in a
 * panel sliding in from the right. `children` go at the bottom of the panel,
 * for the account buttons. Choosing a link closes the panel.
 */
export function MobileNav({ links, children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Open menu"
        className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card text-foreground outline-none hover:bg-ink-50 focus-visible:ring-3 focus-visible:ring-ring/50 lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-[2px] transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 lg:hidden" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex w-[min(20rem,85vw)] flex-col border-l bg-card pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] shadow-window transition-transform duration-300 ease-out outline-none data-ending-style:translate-x-full data-starting-style:translate-x-full lg:hidden">
          <div className="flex h-16 items-center justify-between gap-3 border-b px-4">
            <Dialog.Title render={<div />}>
              <Logo />
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close menu"
              className="flex size-10 items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-ink-50 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <nav aria-label="Main" className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {links.map(({ href, label, count }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                // Switched off while the build stops at the dashboard (lib/limited-mode.js).
                const off = DASHBOARD_ONLY && !isAllowedPath(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={off ? (event) => event.preventDefault() : () => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      aria-disabled={off ? "true" : undefined}
                      tabIndex={off ? -1 : undefined}
                      title={off ? DISABLED_TITLE : undefined}
                      className={cn(
                        off && DISABLED_CLASS,
                        "flex min-h-11 items-center rounded-lg px-3 text-base font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                        active ? "bg-accent text-primary" : "text-foreground hover:bg-ink-50",
                      )}
                    >
                      <span className="flex-1">{label}</span>
                      {count > 0 && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground tabular-nums">
                          {count}
                          <span className="sr-only"> new</span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {children && (
            <div className="space-y-3 border-t p-4" onClick={(event) => event.target.closest("a") && setOpen(false)}>
              {children}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
