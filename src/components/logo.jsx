import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The mark: a winding road through two stops on an emerald tile, the same
 * road the loaders draw. The favicon (src/app/icon.svg) is the same drawing.
 */
export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
      {/* A solid tile with a lighter top-left corner. (No SVG gradient: its id would clash when the mark appears twice on a page.) */}
      <rect width="32" height="32" rx="9" fill="var(--primary)" />
      <path d="M9 0h14L0 23V9a9 9 0 0 1 9-9Z" fill="var(--on-brand)" opacity="0.08" />
      <path
        d="M8.5 23.5c5 0 4-8 7.5-8s2.5-7 7.5-7"
        fill="none"
        stroke="var(--on-brand)"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.95"
      />
      <circle cx="8.5" cy="23.5" r="2.6" fill="var(--brand-800)" stroke="var(--on-brand)" strokeWidth="2" />
      <circle cx="23.5" cy="8.5" r="3" fill="var(--highlight)" />
    </svg>
  );
}

/** The wordmark: "UAE" in emerald, "Venture Guide" in ink, set in the display face. */
export function Wordmark({ className }) {
  return (
    <span
      className={cn("font-display text-base leading-none font-bold tracking-[-0.03em] whitespace-nowrap sm:text-[1.125rem]", className)}
    >
      <span className="text-primary">UAE</span> Venture Guide
    </span>
  );
}

/** The app name with its mark, linking home. */
export function Logo({ className }) {
  return (
    <Link
      href="/"
      className={cn(
        "group/logo inline-flex shrink-0 items-center gap-2 rounded-lg sm:gap-2.5 py-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <LogoMark className="transition-transform duration-300 ease-out group-hover/logo:-rotate-6" />
      <Wordmark />
    </Link>
  );
}
