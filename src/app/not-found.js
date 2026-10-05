import Link from "next/link";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-card">
        <div className="page-width flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <main id="main" className="page-width flex flex-1 flex-col items-center justify-center py-16 text-center sm:py-24">
        {/* A road that runs out before its last stop. */}
        <svg viewBox="0 0 160 48" aria-hidden="true" className="h-12 w-40">
          <path d="M12 34 C 34 34, 34 14, 56 14 S 82 34, 104 34" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
          <path d="M104 34 S 126 14, 148 14" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 7" />
          <circle cx="12" cy="34" r="5.5" fill="var(--primary)" />
          <circle cx="56" cy="14" r="5.5" fill="var(--primary)" />
          <circle cx="104" cy="34" r="5.5" fill="var(--primary)" />
          <circle cx="148" cy="14" r="5.5" fill="var(--card)" stroke="#cbd5e1" strokeWidth="2.5" />
        </svg>
        <p className="mt-6 font-display text-6xl font-bold tracking-[-0.04em] text-primary sm:text-7xl">404</p>
        <h1 className="mt-3 text-[1.875rem] leading-[1.15] sm:text-[2.25rem]">Page not found</h1>
        <p className="mt-2 max-w-md text-muted-foreground">This page does not exist, or you do not have access to it.</p>
        <Link href="/" className={buttonVariants({ size: "lg", className: "mt-8" })}>
          Back to the home page
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
