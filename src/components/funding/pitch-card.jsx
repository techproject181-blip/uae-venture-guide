import { Fields } from "@/components/document";
import { EMIRATES, SECTORS, labelOf } from "@/lib/constants";
import { formatAed } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * What funders see of a shared plan before the owner accepts their interest. `children` holds the funder's action,
 * pinned to the bottom of the card. Framed (the default) it is a white panel that fills its grid cell; with
 * `framed={false}` it is a plain block for a ruled list. Fields fits its row to the space either way.
 */
export function PitchCard({ card, children, framed = true }) {
  return (
    <article className={cn("flex h-full flex-col", framed ? "panel p-5 sm:p-6" : "py-6")}>
      <h2 className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em]">{card.title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {labelOf(SECTORS, card.sector)} · {labelOf(EMIRATES, card.emirate)}
      </p>
      <p className="mt-4 max-w-prose text-sm leading-relaxed whitespace-pre-line">{card.pitchSummary}</p>
      <Fields
        className="mt-5 border-t pt-4"
        items={[
          { label: "Budget", value: formatAed(card.budgetAed) },
          { label: "Progress", value: `${card.progress}% of steps done` },
        ]}
      />
      <div aria-hidden="true" className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-200">
        <div className="h-full rounded-full bg-done" style={{ width: `${card.progress}%` }} />
      </div>
      {children && (
        <div className="mt-auto pt-5">
          <div className="border-t pt-5">{children}</div>
        </div>
      )}
    </article>
  );
}
