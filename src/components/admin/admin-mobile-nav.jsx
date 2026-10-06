"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoMark, Wordmark } from "@/components/logo";

/** Phones and tablets: the admin sidebar slides in from the left behind a menu button. */
export function AdminMobileNav({ counts, user, children }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Open menu"
        className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card text-foreground outline-none hover:bg-ink-50 focus-visible:ring-3 focus-visible:ring-ring/50 lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink-900/50 backdrop-blur-[2px] transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 lg:hidden" />
        <Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-ink-900 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] shadow-window transition-transform duration-300 ease-out outline-none data-ending-style:-translate-x-full data-starting-style:-translate-x-full lg:hidden">
          <div className="flex h-16 items-center justify-between gap-3 px-4">
            <Dialog.Title render={<div />} className="flex items-center gap-2.5">
              <LogoMark />
              <span className="flex flex-col leading-tight">
                <Wordmark className="text-on-brand [&>span]:text-brand-300" />
                <span className="text-xs font-medium tracking-[0.06em] text-ink-400 uppercase">Admin console</span>
              </span>
            </Dialog.Title>
            <Dialog.Close aria-label="Close menu" className="flex size-10 items-center justify-center rounded-lg text-ink-300 outline-none hover:bg-on-brand/10 hover:text-on-brand focus-visible:ring-3 focus-visible:ring-brand-400/50">
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto px-3 pb-3">
            <AdminNav counts={counts} user={user} onNavigate={() => setOpen(false)} />
          </div>
          {children && <div className="border-t border-on-brand/10 p-4">{children}</div>}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
