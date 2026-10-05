import { notFound } from "next/navigation";
import { Panel, Split, Stat, StatGrid, Stack } from "@/components/layout";
import { BudgetCharts } from "@/components/plans/budget-charts";
import { BudgetItemForm } from "@/components/plans/budget-item-form";
import { BudgetItemRow } from "@/components/plans/budget-item-row";
import { FeeLegend, feeMarks } from "@/components/plans/plan-bits";
import { firstYearTotal, remainingBudget, totalsByCategory } from "@/lib/budget";
import { BUDGET_CATEGORIES } from "@/lib/constants";
import { formatAed } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { getPlanForViewer } from "@/lib/plans";

export const metadata = { title: "Budget" };

export default async function PlanBudgetPage({ params }) {
  const user = await requireUser();
  const { id } = await params;
  const found = await getPlanForViewer(id, user);
  if (!found) notFound();
  const { plan, isOwner } = found;
  const items = plan.budgetItems;

  const estimated = firstYearTotal(items, "estimatedAed");
  const actual = firstYearTotal(items, "actualAed");
  const remaining = remainingBudget(plan.budgetAed, items);
  const estimatedByCategory = totalsByCategory(items, "estimatedAed");
  const actualByCategory = totalsByCategory(items, "actualAed");
  const chartRows = BUDGET_CATEGORIES.filter((c) => estimatedByCategory[c.value] > 0).map((c) => ({
    label: c.label,
    estimated: estimatedByCategory[c.value],
    actual: actualByCategory[c.value] ?? 0,
  }));
  const columns = isOwner ? 6 : 5;
  const marks = feeMarks(items);

  const addCost = isOwner && (
    <Panel title="Add a cost" description="Rent, equipment, salaries or anything else the roadmap does not list.">
      <BudgetItemForm planId={plan._id} />
    </Panel>
  );

  return (
    <Stack>
      <section aria-labelledby="budget-numbers">
        <h2 id="budget-numbers" className="sr-only">
          First-year budget
        </h2>
        <StatGrid>
          <Stat label="Your budget" value={formatAed(plan.budgetAed)} />
          <Stat label="Estimated first-year cost" value={formatAed(estimated)} />
          <Stat label="Paid so far" value={formatAed(actual)} />
          <Stat
            label="Against budget"
            value={formatAed(Math.abs(remaining))}
            hint={remaining < 0 ? "over your budget" : "left of your budget"}
            tone={remaining < 0 ? "danger" : undefined}
          />
        </StatGrid>
        {remaining < 0 && (
          <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive-surface px-5 py-4 text-destructive lg:mt-6">
            <strong className="font-bold">Over budget.</strong> The estimated first-year cost is {formatAed(-remaining)} more than
            your budget. Remove or lower some costs, or plan more funding.
          </p>
        )}
      </section>

      {chartRows.length > 0 && <BudgetCharts rows={chartRows} />}

      <Split aside={addCost}>
        <Panel title="Costs" description="Monthly costs count 12 times in the first year." flush>
          {(marks.official || marks.demo || marks.estimate) && (
            <div className="border-b px-5 py-3 sm:px-6">
              <FeeLegend {...marks} />
            </div>
          )}
          <div className="relative overflow-x-auto">
            <table className="doc-table min-w-180">
              <thead>
                <tr>
                  <th scope="col" className="pl-5 sm:pl-6">Cost</th>
                  <th scope="col">How often</th>
                  <th scope="col" className="text-right">Estimate</th>
                  <th scope="col" className="text-right">Actually paid</th>
                  <th scope="col" className="text-right">First year</th>
                  {isOwner && (
                    <th scope="col">
                      <span className="sr-only">Edit</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <BudgetItemRow key={item._id} planId={plan._id} item={item} canEdit={isOwner} columns={columns} />
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colSpan={4} className="text-right">
                    Estimated first-year total
                  </th>
                  <td className="text-right">{formatAed(estimated)}</td>
                  {isOwner && <td />}
                </tr>
              </tfoot>
            </table>
          </div>
        </Panel>
      </Split>
    </Stack>
  );
}
