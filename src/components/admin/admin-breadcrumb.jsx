"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { ADMIN_LINKS } from "@/components/admin/admin-nav";

/** The section of the console the address is in, and whether this is that section's own page. */
function useSection() {
  const pathname = usePathname();
  const section = ADMIN_LINKS.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
  return { section, root: section?.href === pathname };
}

/**
 * The Admin tag in the top bar on desktop. On phones and tablets the
 * section name sits in the middle of the bar instead.
 */
export function AdminBreadcrumb() {
  const { section } = useSection();

  return (
    <>
      {section && <p className="pointer-events-none absolute inset-x-20 truncate text-center font-semibold md:text-xl lg:hidden">{section.label}</p>}
      <nav aria-label="Breadcrumb" className="hidden min-w-0 lg:block">
        <ol className="flex items-center gap-1.5 text-sm">
          <li className="shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-md bg-ink-900 px-2 py-1 text-xs font-semibold tracking-[0.06em] text-on-brand uppercase outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ShieldCheck className="size-3.5 text-brand-300" aria-hidden="true" />
              Admin
            </Link>
          </li>
        </ol>
      </nav>
    </>
  );
}

/**
 * Wraps the page. On phones and tablets a section's own page drops its big
 * title and intro line, because the top bar already names the section. Screen readers still hear both.
 */
export function AdminMain({ children }) {
  const { root } = useSection();
  return (
    <div data-root={root || undefined} className="w-full max-lg:data-root:[&>div:first-child]:mb-4 max-lg:data-root:[&>div:first-child>div:first-child]:sr-only">
      {children}
    </div>
  );
}
