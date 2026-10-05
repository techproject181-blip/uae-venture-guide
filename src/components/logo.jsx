import Link from "next/link";

/** The app name, with a small emerald square holding "VG" as the mark. */
export function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-lg py-1 text-base sm:gap-2.5 sm:text-[1.0625rem] font-bold whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold tracking-wide text-primary-foreground shadow-[inset_0_-2px_0_rgb(0_0_0/0.15)]"
      >
        VG
      </span>
      UAE Venture Guide
    </Link>
  );
}
