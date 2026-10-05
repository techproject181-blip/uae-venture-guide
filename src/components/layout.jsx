import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// The layout kit. Every page is built from these few pieces, so pages of the
// same kind line up the same way:
//
//   List pages     PageHeader → FilterBar (optional) → CardGrid, ListPanel or TablePanel
//   Detail & form  PageHeader → Split (main panels on the left, help or facts on the right)
//   Dashboards     PageHeader → StatGrid → Split or a two-column grid of panels
//
// Spacing is fixed here, not on the pages: 24px between panels (32px on large
// screens), 20px inside a panel on phones and 24px from 640px.

/** A small "back" link above a page title. */
export function BackLink({ href, children, className }) {
  return (
    <Link
      href={href}
      className={cn(
        "group/back mb-3 inline-flex items-center gap-1.5 rounded-md py-1 text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <ArrowLeft className="size-4 transition-transform duration-200 group-hover/back:-translate-x-0.5" aria-hidden="true" />
      {children}
    </Link>
  );
}

/**
 * The top of every page: an optional back link, the title, a short line under
 * it, and the page's buttons on the right (under the title on phones).
 * `children` go under the description, for things like a status stamp.
 */
export function PageHeader({ title, description, actions, back, children, className }) {
  return (
    <div className={cn("mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between lg:mb-10", className)}>
      <div className="min-w-0">
        {back && <BackLink href={back.href}>{back.label}</BackLink>}
        <h1 className="font-display text-[1.875rem] leading-[1.15] font-bold tracking-[-0.03em] sm:text-[2.25rem]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
        {children && <div className="mt-3">{children}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Panels stacked with the standard gap. */
export function Stack({ children, className }) {
  return <div className={cn("space-y-6 lg:space-y-8", className)}>{children}</div>;
}

/**
 * A white panel: the one container of the app. With a `title` it gets a
 * header row (title, description, buttons) above a thin rule. `flush` drops
 * the inner padding, for tables and lists that run edge to edge.
 */
export function Panel({ title, description, actions, footer, children, flush = false, className, bodyClassName, as: Tag = "section", id }) {
  const headingId = id ?? (title ? `panel-${String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : undefined);
  return (
    <Tag aria-labelledby={title ? headingId : undefined} className={cn("panel overflow-hidden", className)}>
      {title && (
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={headingId} className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em]">
              {title}
            </h2>
            {description && <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children !== undefined && children !== null && children !== false && (
        <div className={cn(flush ? "" : "p-5 sm:p-6", bodyClassName)}>{children}</div>
      )}
      {footer && <div className="flex flex-wrap items-center gap-3 border-t bg-slate-50/70 px-5 py-4 sm:px-6">{footer}</div>}
    </Tag>
  );
}

/**
 * Two columns from 1024px: the main content, and a narrower column on the
 * right that stays in view while the page scrolls. On phones the right column
 * comes after the main one.
 */
export function Split({ children, aside, className }) {
  return (
    <div className={cn("grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_23rem]", className)}>
      <div className="min-w-0 space-y-6 lg:space-y-8">{children}</div>
      {aside && <aside className="min-w-0 space-y-6 lg:sticky lg:top-24">{aside}</aside>}
    </div>
  );
}

/** Cards in a grid: one column on phones, two from 640px, three from 1280px (or two at most with `cols={2}`). */
export function CardGrid({ children, cols = 3, className }) {
  return (
    <ul className={cn("stagger grid gap-4 sm:grid-cols-2 lg:gap-6", cols === 3 && "xl:grid-cols-3", className)}>
      {children}
    </ul>
  );
}

/** Rows inside one panel, split by thin rules. Each child should be a <li>. */
export function ListPanel({ title, description, actions, children, className }) {
  return (
    <Panel title={title} description={description} actions={actions} flush className={className}>
      <ul className="divide-y">{children}</ul>
    </Panel>
  );
}

/** A table inside a panel; it scrolls sideways on its own when it is wider than the screen. */
export function TablePanel({ title, description, actions, children, className }) {
  return (
    <Panel title={title} description={description} actions={actions} flush className={className}>
      <div className="relative overflow-x-auto">{children}</div>
    </Panel>
  );
}

/** Numbers at the top of a dashboard: two side by side on phones, up to four in a row. */
export function StatGrid({ children, className }) {
  return <dl className={cn("stagger grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6", className)}>{children}</dl>;
}

/** One number with its label. `tone="danger"` colours it red, for amounts over budget. `href` makes the whole card a link. */
export function Stat({ label, value, hint, tone, href }) {
  const body = (
    <>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className={cn("mt-2 font-display text-[1.625rem] leading-none font-bold tracking-[-0.02em] tabular-nums sm:text-[1.875rem]", tone === "danger" && "text-destructive")}>
        {value}
      </dd>
      {hint && <dd className="mt-2 text-sm text-muted-foreground">{hint}</dd>}
    </>
  );
  if (href) {
    return (
      <div className="panel panel-link relative p-5 sm:p-6">
        {body}
        <Link href={href} className="absolute inset-0 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <span className="sr-only">{label}</span>
        </Link>
      </div>
    );
  }
  return <div className="panel p-5 sm:p-6">{body}</div>;
}

/** The buttons at the end of a form, in one row. */
export function FormActions({ children, className }) {
  return <div className={cn("flex flex-wrap items-center gap-3 pt-2", className)}>{children}</div>;
}
