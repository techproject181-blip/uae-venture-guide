import { Fields } from "@/components/document";
import { EMIRATES, SECTORS, labelOf } from "@/lib/constants";
import { formatAed } from "@/lib/format";

/**
 * What funders see of a shared plan before the owner accepts their interest. `children` holds the funder's action.
 * On Discover it is one ruled row of a list (`framed={false}`); on the sharing page it is a framed preview.
 * Fields fits its row to the space either way.
 */
export function PitchCard({ card, children, framed = true }) {
  return (
    <article className={framed ? "panel p-5 sm:p-6" : "py-6"}>
      <h2 className="text-xl">{card.title}</h2>
      <Fields
        className="mt-4"
        items={[
          { label: "Sector", value: labelOf(SECTORS, card.sector) },
          { label: "Emirate", value: labelOf(EMIRATES, card.emirate) },
          { label: "Budget", value: formatAed(card.budgetAed) },
          { label: "Progress", value: `${card.progress}% of steps done` },
        ]}
      />
      <p className="mt-5 max-w-prose leading-relaxed whitespace-pre-line">{card.pitchSummary}</p>
      {children && <div className="mt-5 border-t pt-5">{children}</div>}
    </article>
  );
}
