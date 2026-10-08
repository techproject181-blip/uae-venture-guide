"use client";

import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useSignOut } from "@/components/auth/sign-out-button";
import { Avatar } from "@/components/avatar";
import { DASHBOARD_ONLY, DISABLED_CLASS, DISABLED_TITLE } from "@/lib/limited-mode";
import { cn } from "@/lib/utils";

const ITEM =
  "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-sm outline-none select-none data-highlighted:bg-ink-50 [&_svg]:size-4 [&_svg]:text-ink-500";

/** The avatar and name in the top bar. Opens a small menu with the profile page and sign out. */
export function UserMenu({ name, email, role, className }) {
  const { signOut, pending } = useSignOut();

  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(
          "flex h-10 items-center gap-2 rounded-lg border border-transparent pr-2 pl-1 outline-none transition-colors hover:border-border hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:border-border data-popup-open:bg-card",
          className,
        )}
      >
        <Avatar name={name} className="size-8 text-xs" />
        <span className="hidden max-w-40 truncate text-sm font-medium lg:block">{name}</span>
        <ChevronDown className="size-4 text-ink-400 transition-transform in-data-popup-open:rotate-180" aria-hidden="true" />
        <span className="sr-only">Open your account menu</span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
          <Menu.Popup className="w-64 origin-(--transform-origin) rounded-xl border bg-card p-1.5 shadow-window transition-[opacity,scale] duration-150 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <div className="flex items-center gap-3 px-2.5 py-2.5">
              <Avatar name={name} className="size-10 text-xs" />
              <div className="min-w-0 text-sm leading-tight">
                <p className="truncate font-medium">{name}</p>
                <p className="truncate text-muted-foreground">{email}</p>
                <p className="mt-1 text-xs font-medium text-primary">{role}</p>
              </div>
            </div>
            <Menu.Separator className="my-1 h-px bg-border" />
            {/* Switched off while the submission build stops at the dashboard (lib/limited-mode.js). */}
            <Menu.Item
              render={DASHBOARD_ONLY ? <span /> : <Link href="/account" />}
              disabled={DASHBOARD_ONLY}
              title={DASHBOARD_ONLY ? DISABLED_TITLE : undefined}
              className={cn(ITEM, DASHBOARD_ONLY && DISABLED_CLASS)}
            >
              <UserRound aria-hidden="true" />
              Account
            </Menu.Item>
            <Menu.Separator className="my-1 h-px bg-border" />
            <Menu.Item onClick={signOut} disabled={pending} className={cn(ITEM, "text-destructive [&_svg]:text-destructive")}>
              <LogOut aria-hidden="true" />
              {pending ? "Signing out…" : "Sign out"}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
