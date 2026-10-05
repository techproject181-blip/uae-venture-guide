import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/** "Previous" and "Next" links for a long list. `href(n)` builds the link to page n. */
export function Pagination({ page, total, pageSize, href }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;

  return (
    <nav aria-label="Pages" className="mt-6 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={href(page - 1)} className={buttonVariants({ variant: "outline", size: "lg" })}>
          <ChevronLeft aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted-foreground">
        Page {page} of {pages}
      </p>
      {page < pages ? (
        <Link href={href(page + 1)} className={buttonVariants({ variant: "outline", size: "lg" })}>
          Next
          <ChevronRight aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
