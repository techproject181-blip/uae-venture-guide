import NextLink from "next/link";
import { DASHBOARD_ONLY, DISABLED_INNER, DISABLED_TITLE, DISABLED_WRAP } from "@/lib/limited-mode";
import { cn } from "@/lib/utils";

/**
 * A link that switches off while the submission build stops at the dashboard
 * (lib/limited-mode.js): it keeps its place and its styling, but is greyed
 * out, cannot be clicked or tabbed to, and says so on hover. Turn the flag off
 * and it is an ordinary link again.
 */
export function OffLink({ href, className, children, ...props }) {
  if (!DASHBOARD_ONLY) {
    return (
      <NextLink href={href} className={className} {...props}>
        {children}
      </NextLink>
    );
  }

  return (
    <span className={cn("inline-flex", DISABLED_WRAP)} title={DISABLED_TITLE}>
      <span aria-disabled="true" className={cn(className, DISABLED_INNER)} {...props}>
        {children}
      </span>
    </span>
  );
}
