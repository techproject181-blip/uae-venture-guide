import { cn } from "@/lib/utils";

import { Panel } from "@/components/layout";

// Building blocks for plan and record pages.

/**
 * One part of a page: a panel with a heading and optional buttons. It is the
 * layout kit's Panel under its older name.
 */
export function Section({ title, description, actions, children, className, flush }) {
  return (
    <Panel title={title} description={description} actions={actions} className={className} flush={flush}>
      {children}
    </Panel>
  );
}

// When a row of fields has room to sit on one line, measured by its own width
// (a container query): a short row sooner than a long one. Full class names,
// so Tailwind can find them.
const ROW_FROM = {
  short: { list: "@sm:flex @sm:flex-wrap @sm:gap-x-0", item: "@sm:border-l @sm:px-5 @sm:first:border-l-0 @sm:first:pl-0" },
  medium: { list: "@lg:flex @lg:flex-wrap @lg:gap-x-0", item: "@lg:border-l @lg:px-5 @lg:first:border-l-0 @lg:first:pl-0" },
  long: { list: "@2xl:flex @2xl:flex-wrap @2xl:gap-x-0", item: "@2xl:border-l @2xl:px-5 @2xl:first:border-l-0 @2xl:first:pl-0" },
};

/**
 * Labelled values side by side, like the fields at the top of a licence.
 * items: [{ label, value }]; empty items are skipped. In a narrow space they
 * stack in two columns. Inside a flex row, give the wrapper room (flex-1),
 * because it measures its own width.
 */
export function Fields({ items, className }) {
  const shown = items.filter(Boolean);
  const row = ROW_FROM[shown.length <= 3 ? "short" : shown.length <= 4 ? "medium" : "long"];
  return (
    <div className={cn("@container", className)}>
      <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-4", row.list)}>
        {shown.map(({ label, value }) => (
          <div key={label} className={cn("min-w-0", row.item)}>
            <dt className="field-label">{label}</dt>
            <dd className="mt-1 font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
