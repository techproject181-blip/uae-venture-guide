import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** A small "back" link above a page title. */
export function BackLink({ href, children }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 rounded-md py-1 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {children}
    </Link>
  );
}
