import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { ListPanel, PageHeader, Panel } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Small building blocks shared by the role dashboards. Every dashboard has the
// same skeleton: Greeting → StatGrid → Split (the role's main list on the
// left; NextStep, Shortcuts and notices on the right).

/** The greeting at the top of every dashboard, with an optional short line under it. */
export function Greeting({ user, description, actions }) {
  return <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} description={description} actions={actions} />;
}

/** The title link of a list row. Its ::after covers the row (the <li> is `relative`), so the whole row is a large target. */
export const rowLink =
  "rounded-xs font-medium text-foreground decoration-primary underline-offset-4 outline-none after:absolute after:inset-0 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50";

/** A row of a dashboard list, with the kit's row padding. `link` adds the hover tint for rows that are one big link. */
export function Row({ link = false, className, children }) {
  return <li className={cn("relative px-5 py-4 sm:px-6", link && "transition-colors hover:bg-ink-50/80", className)}>{children}</li>;
}

/** The one thing to do next, in its own panel at the top of the right-hand column. A dashboard shows at most one. */
export function NextStep({ title, href, linkText, children }) {
  return (
    <Panel title="Next step" className="border-primary/25">
      <h3 className="font-semibold text-pretty">{title}</h3>
      {children && <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">{children}</div>}
      {href && (
        <Link href={href} className={buttonVariants({ variant: "outline", size: "lg", className: "mt-5 w-full" })}>
          {linkText}
          <ArrowRight aria-hidden="true" />
        </Link>
      )}
    </Panel>
  );
}

/** Links to the pages a role uses most, each with one short line about it. items: [{ href, label, detail, icon }] */
export function Shortcuts({ title = "Shortcuts", items }) {
  return (
    <ListPanel title={title}>
      {items.map(({ href, label, detail, icon: Icon }) => (
        <Row key={href} link className="flex items-center gap-3.5">
          {Icon && (
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"
            >
              <Icon className="size-4" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <Link href={href} className={rowLink}>
              {label}
            </Link>
            {detail && <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">{detail}</p>}
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Row>
      ))}
    </ListPanel>
  );
}

/**
 * A link in a panel's header row, such as "All plans". It keeps a touch area
 * 44 px tall without making the header row taller than its neighbours.
 */
export function TextLink({ href, className, children }) {
  return (
    <Link
      href={href}
      className={cn(
        "-my-2.5 inline-flex min-h-11 items-center rounded-xs text-sm font-medium text-foreground decoration-primary underline underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-3 focus-visible:ring-ring/50",
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
