import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

// Small building blocks shared by the role dashboards.

/** The greeting at the top of every dashboard, with an optional short line under it. */
export function Greeting({ user, description, actions }) {
  return <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} description={description} actions={actions} />;
}

/** The one thing to do next, on a pale gold band. A dashboard shows at most one. */
export function NextStep({ title, href, linkText, children }) {
  return (
    <section
      aria-labelledby="next-step-title"
      className="mb-10 flex flex-col gap-2 rounded-xl border border-primary/15 bg-accent px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
    >
      <div className="min-w-0">
        <h2 id="next-step-title" className="text-lg">
          {title}
        </h2>
        {children && <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground/80">{children}</div>}
      </div>
      {href && (
        <TextLink href={href} className="shrink-0">
          {linkText}
        </TextLink>
      )}
    </section>
  );
}

/** A gold link that stands on its own line, with a touch area 44 px tall. */
export function TextLink({ href, className, children }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center rounded-xs font-medium text-foreground decoration-primary underline underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** "No open requests", "1 open request", "3 open requests". `zero` changes the words after "No", as in "No new funder interest". */
export function count(number, one, many = `${one}s`, zero = many) {
  if (number === 0) return `No ${zero}`;
  return `${number} ${number === 1 ? one : many}`;
}
