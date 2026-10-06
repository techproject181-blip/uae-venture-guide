import { Fields } from "@/components/document";
import { CostBasis } from "@/components/plans/plan-bits";
import { Stamp } from "@/components/stamp";
import { formatAedRange } from "@/lib/format";

// A few steps of an example plan, drawn like the plan page. The official fees
// match the demo fee references for mainland Dubai.
const STEPS = [
  { number: "1.1", title: "Reserve your trade name", min: 620, max: 620, basis: "reference", done: true },
  { number: "1.2", title: "Get initial approval", min: 120, max: 120, basis: "reference", done: true },
  { number: "2.1", title: "Rent a place and register the lease", min: 15000, max: 40000, basis: "estimate" },
  { number: "2.2", title: "Pay for your trade licence", min: 12000, max: 18000, basis: "reference" },
];

/** An extract of an example plan, so visitors see what they will get. */
export function RoadmapPreview() {
  return (
    <figure>
      <div className="panel overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-4 pt-4 pb-5 sm:px-5">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold">Specialty café</p>
            <Fields
              className="mt-3"
              items={[
                { label: "Emirate", value: "Dubai" },
                { label: "Licence", value: "Mainland" },
                { label: "Steps done", value: "2 of 15" },
              ]}
            />
          </div>
          <Stamp tone="quiet" className="mt-1">
            Example
          </Stamp>
        </div>
        <table className="doc-table">
          <thead>
            <tr>
              <th scope="col" className="w-12 px-3 sm:px-5">
                No.
              </th>
              <th scope="col" className="px-3 sm:px-4">
                Step
              </th>
              <th scope="col" className="px-3 text-right sm:px-5">
                Fee
              </th>
            </tr>
          </thead>
          <tbody>
            {STEPS.map(({ number, title, min, max, basis, done }) => (
              <tr key={number} className="last:[&>td]:border-b-0">
                <td className="px-3 text-muted-foreground sm:px-5">{number}</td>
                <td className="px-3 sm:px-4">
                  <span className="font-medium">{title}</span>
                  {done && (
                    <span className="mt-1.5 block">
                      <Stamp tone="done">Done</Stamp>
                    </span>
                  )}
                </td>
                <td className="px-3 text-right sm:px-5">
                  <span className="block font-medium whitespace-nowrap">{formatAedRange(min, max)}</span>
                  <span className="mt-1.5 block">
                    <CostBasis basis={basis} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        An example. In a real plan, the Official stamp means the fee was checked against a government or free zone page; the rest are
        estimates.
      </figcaption>
    </figure>
  );
}
