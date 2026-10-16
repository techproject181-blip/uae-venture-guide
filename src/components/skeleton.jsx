import { cn } from "@/lib/utils";

// The skeleton kit: grey stand-ins for each page while its data loads. Every
// piece copies the classes of the real piece it stands in for (the same
// padding, gaps, grid and text sizes), so nothing moves when the page arrives.
//
// A text line is drawn as a grey bar inside a block with the real text's size
// and line height, so the bar takes exactly the height the words will.

/** One grey block. */
export function Bone({ className }) {
  return <span aria-hidden="true" className={cn("skeleton block", className)} />;
}

/** One line of text: `className` carries the real text's size, line height and margins; `width` the bar's width. */
export function Line({ className, width = "w-full" }) {
  return (
    <div aria-hidden="true" className={className}>
      <span className={cn("skeleton inline-block h-[0.8em] max-w-full align-middle", width)} />
    </div>
  );
}

/** Wraps a whole skeleton page. It waits a moment before showing (.appear-late), so fast pages never flash it. */
export function SkeletonPage({ children }) {
  return (
    <div role="status" aria-label="Loading" className="appear-late">
      {children}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** A stand-in for PageHeader: title, a description of `lines` lines, and `actions` large buttons. */
export function HeaderSkeleton({ titleWidth = "w-56", lines = 1, actions = 0 }) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between lg:mb-10">
      <div className="min-w-0 flex-1">
        <Line className="font-display text-[1.875rem] leading-[1.15] sm:text-[2.25rem]" width={titleWidth} />
        <div className="mt-2 max-w-2xl">
          {Array.from({ length: lines }, (_, n) => (
            <Line key={n} width={n === lines - 1 && lines > 1 ? "w-3/5" : "w-full"} />
          ))}
        </div>
      </div>
      {actions > 0 && (
        <div className="flex shrink-0 flex-wrap gap-2">
          {Array.from({ length: actions }, (_, n) => (
            <Bone key={n} className="h-11 w-36 rounded-lg" />
          ))}
        </div>
      )}
    </div>
  );
}

/** A stand-in for the filter form above a list: `fields` labelled boxes and a button, on the page's own grid. */
export function FilterSkeleton({ fields = 2, grid }) {
  return (
    <div className={cn("panel mb-6 grid gap-4 p-4 sm:p-5 md:items-end", grid)}>
      {Array.from({ length: fields }, (_, n) => (
        <div key={n} className="space-y-2">
          <Line className="text-sm font-medium" width="w-20" />
          <Bone className="h-11 rounded-lg" />
        </div>
      ))}
      <Bone className="h-11 rounded-lg" />
    </div>
  );
}

/** The "12 plans" line above a filtered list. */
export function CountSkeleton() {
  return <Line className="mb-4 text-sm" width="w-20" />;
}

/** The segmented filter bar above an admin table, with an optional box or button on the right. */
export function TabsSkeleton({ tabs = 3, right }) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="inline-flex w-fit gap-0.5 rounded-lg border bg-ink-100/70 p-0.5">
        {Array.from({ length: tabs }, (_, n) => (
          <Bone key={n} className="h-8 w-20 rounded-md" />
        ))}
      </div>
      {right}
    </div>
  );
}

/** Cards in the CardGrid layout. `cols` and `className` match the page's CardGrid. */
export function CardGridSkeleton({ count = 6, cols = 3, className, card: Card }) {
  return (
    <ul className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6", cols === 3 && "xl:grid-cols-3", className)}>
      {Array.from({ length: count }, (_, n) => (
        <li key={n}>
          <Card />
        </li>
      ))}
    </ul>
  );
}

const cardClass = "panel flex h-full flex-col p-5 sm:p-6";
const cardTitle = "text-[1.0625rem] leading-snug font-semibold";
const footRule = "mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-sm";

/** PlanCard: icon and title, the idea, then progress and the date pinned to the bottom. */
export function PlanCardSkeleton() {
  return (
    <div className={cardClass}>
      <div className="flex items-start gap-3">
        <Bone className="size-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <Line className={cardTitle} width="w-3/4" />
          <Line className="mt-0.5 text-sm" width="w-1/2" />
        </div>
      </div>
      <div className="mt-4 text-sm leading-relaxed">
        <Line />
        <Line />
        <Line width="w-2/3" />
      </div>
      <div className="mt-auto pt-5">
        <div className="border-t pt-4">
          <div className="flex justify-between text-sm">
            <Line width="w-28" />
            <Line width="w-8" />
          </div>
          <Bone className="mt-2 h-2 rounded-full" />
          <Line className="mt-3 text-sm" width="w-32" />
        </div>
      </div>
    </div>
  );
}

/** PostCard: author and date, title, three lines of text and the footer row. */
export function PostCardSkeleton({ author = true }) {
  return (
    <div className={cardClass}>
      <div className="flex-1">
        <div className="flex items-center gap-2.5 text-sm">
          {author && <Bone className="size-7 shrink-0 rounded-full" />}
          <Line width={author ? "w-40" : "w-24"} />
        </div>
        <Line className={cn("mt-3", cardTitle)} width="w-4/5" />
        <div className="mt-2 text-sm leading-relaxed">
          <Line />
          <Line />
          <Line width="w-1/2" />
        </div>
      </div>
      <div className={cn(footRule, "min-h-8")}>
        <Line width="w-24" />
      </div>
    </div>
  );
}

/** SourceCard: publisher, title, summary, topic chips and the footer with place and date. */
export function SourceCardSkeleton() {
  return (
    <div className={cardClass}>
      <div className="flex-1">
        <Line className="text-sm" width="w-40" />
        <Line className={cn("mt-3", cardTitle)} width="w-4/5" />
        <div className="mt-2 text-sm leading-relaxed">
          <Line />
          <Line />
          <Line width="w-2/3" />
        </div>
        <div className="mt-4 flex gap-1.5">
          <Bone className="h-5 w-16 rounded-md" />
          <Bone className="h-5 w-20 rounded-md" />
        </div>
      </div>
      <div className={cn(footRule, "justify-between")}>
        <Line width="w-32" />
        <Line width="w-36" />
      </div>
    </div>
  );
}

/** MentorCard: avatar, name and headline, expertise chips and the footer. */
export function MentorCardSkeleton() {
  return (
    <div className={cardClass}>
      <div className="flex-1">
        <div className="flex items-start gap-3.5">
          <Bone className="size-12 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <Line className={cardTitle} width="w-1/2" />
            <Line className="mt-0.5 text-sm" width="w-4/5" />
          </div>
        </div>
        <div className="mt-4 flex gap-1.5">
          <Bone className="h-5 w-20 rounded-md" />
          <Bone className="h-5 w-24 rounded-md" />
          <Bone className="h-5 w-16 rounded-md" />
        </div>
      </div>
      <div className={footRule}>
        <Line width="w-28" />
        <Line width="w-16" />
      </div>
    </div>
  );
}

/** PitchCard on Discover: title, place, the pitch, budget and progress, then the interest form. */
export function PitchCardSkeleton() {
  return (
    <div className={cardClass}>
      <Line className={cardTitle} width="w-3/4" />
      <Line className="mt-0.5 text-sm" width="w-1/2" />
      <div className="mt-4 text-sm leading-relaxed">
        <Line />
        <Line />
        <Line width="w-2/3" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-6 border-t pt-4">
        {[0, 1].map((n) => (
          <div key={n}>
            <Line className="text-xs" width="w-16" />
            <Line className="mt-1" width="w-24" />
          </div>
        ))}
      </div>
      <Bone className="mt-3 h-1.5 rounded-full" />
      <div className="mt-auto pt-5">
        <div className="border-t pt-5">
          <Bone className="h-11 w-full rounded-lg sm:w-40" />
        </div>
      </div>
    </div>
  );
}

/** A card on "My interests": plan title, date and badge, the message, then the answer row. */
export function InterestCardSkeleton() {
  return (
    <div className={cardClass}>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Line className={cardTitle} width="w-3/4" />
            <Line className="mt-1 text-sm" width="w-28" />
          </div>
          <Bone className="h-5 w-16 shrink-0 rounded-md" />
        </div>
        <div className="mt-4 text-sm leading-relaxed">
          <Line />
          <Line />
          <Line width="w-1/2" />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <Line className="text-sm" width="w-48" />
        <Bone className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

/** The header row of a Panel: title, an optional description and an optional link on the right. */
export function PanelHeadSkeleton({ titleWidth = "w-40", description = false, action = false }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b px-5 py-4 sm:px-6">
      <div className="min-w-0 flex-1">
        <Line className="text-[1.0625rem] leading-snug" width={titleWidth} />
        {description && <Line className="mt-0.5 text-sm" width="w-64" />}
      </div>
      {action && <Line className="text-sm" width="w-20" />}
    </div>
  );
}

/**
 * A table in a TablePanel. `columns` lists each column as { width, hide }, where
 * `hide` is the page's own class for hiding it on small screens. The first
 * column holds two lines (name and the line under it), like the real tables.
 */
export function TableSkeleton({ columns, rows = 8, avatar = false }) {
  return (
    <div className="panel overflow-hidden">
      <PanelHeadSkeleton titleWidth="w-32" description />
      <table className="doc-table [&_td]:align-middle">
        <thead>
          <tr>
            {columns.map((column, n) => (
              <th key={n} scope="col" className={column.hide}>
                <Line className={cn("text-xs", n === columns.length - 1 && "flex justify-end")} width={column.head ?? "w-14"} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              {columns.map((column, n) =>
                n === 0 ? (
                  <td key={n}>
                    <div className="flex items-start gap-3">
                      {avatar && <Bone className="mt-0.5 hidden size-8 shrink-0 rounded-full sm:block" />}
                      <div className="min-w-0 flex-1">
                        <Line width="w-40" />
                        <Line className="text-muted-foreground" width="w-52" />
                      </div>
                    </div>
                  </td>
                ) : (
                  <td key={n} className={column.hide}>
                    <Bone className={cn("h-5 rounded-md", column.width ?? "w-16", n === columns.length - 1 && "ml-auto")} />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Rows of a ListPanel or the request lists: a title, a line under it and a badge or bar on the right. */
export function RowsSkeleton({ rows = 3, right = "badge", padded = false }) {
  return (
    <ul className="divide-y">
      {Array.from({ length: rows }, (_, n) => (
        <li
          key={n}
          className={cn(
            "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
            padded && "sm:py-5",
            right === "bar" && "sm:gap-10",
          )}
        >
          <div className="min-w-0 flex-1">
            <Line width="w-48" />
            <Line className="mt-1 text-sm" width="w-64" />
          </div>
          {right === "bar" && (
            <div className="sm:w-56 sm:shrink-0">
              <div className="flex justify-between text-sm">
                <Line width="w-16" />
                <Line width="w-8" />
              </div>
              <Bone className="mt-2 h-2 rounded-full" />
            </div>
          )}
          {right === "badge" && <Bone className="h-5 w-16 shrink-0 rounded-md" />}
          {right === "button" && <Bone className="h-8 w-28 shrink-0 rounded-lg" />}
        </li>
      ))}
    </ul>
  );
}

/** StatGrid: four number cards, two side by side on phones. */
export function StatGridSkeleton() {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:mb-8 lg:grid-cols-4 lg:gap-6">
      {[0, 1, 2, 3].map((n) => (
        <div key={n} className="panel p-5 sm:p-6">
          <Line className="text-sm" width="w-24" />
          <Line className="mt-2 font-display text-[1.375rem] leading-none sm:text-[1.875rem]" width="w-12" />
        </div>
      ))}
    </div>
  );
}

/** The Shortcuts panel on the right of a dashboard: three rows with an icon each. */
export function ShortcutsSkeleton() {
  return (
    <div className="panel overflow-hidden">
      <PanelHeadSkeleton titleWidth="w-24" />
      <ul className="divide-y">
        {[0, 1, 2].map((n) => (
          <li key={n} className="flex items-center gap-3.5 px-5 py-4 sm:px-6">
            <Bone className="size-9 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <Line width="w-28" />
              <Line className="mt-0.5 text-sm" width="w-44" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The Split layout of the dashboards: main panels on the left, the narrower column on the right. */
export function SplitSkeleton({ children, aside }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_23rem]">
      <div className="min-w-0 space-y-6 lg:space-y-8">{children}</div>
      <div className="min-w-0 space-y-6">{aside}</div>
    </div>
  );
}

/** A ListPanel with its header and rows. */
export function ListPanelSkeleton({ rows = 3, right, action = true, description = false }) {
  return (
    <div className="panel overflow-hidden">
      <PanelHeadSkeleton action={action} description={description} />
      <RowsSkeleton rows={rows} right={right} />
    </div>
  );
}
