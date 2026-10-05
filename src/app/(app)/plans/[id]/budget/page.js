import { notFound } from "next/navigation";
import { Fields, Section } from "@/components/document";
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

  return (
    <div className="space-y-10">
      <Section title="First-year budget" >
        <Fields
          items={[
            { label: "Your budget", value: formatAed(plan.budgetAed) },
            { label: "Estimated first-year cost", value: formatAed(estimated) },
            { label: "Paid so far", value: formatAed(actual) },
            {
              label: "Against budget",
              value: remaining < 0 ? <span className="text-destructive">{formatAed(-remaining)} over</span> : `${formatAed(remaining)} left`,
            },
          ]}
        />
        {remaining < 0 && (
          <p role="alert" className="mt-6 max-w-2xl rounded-lg border border-destructive/30 bg-destructive-surface px-4 py-3 text-destructive">
            <strong className="font-bold">Over budget.</strong> The estimated first-year cost is {formatAed(-remaining)} more than
            your budget. Remove or lower some costs, or plan more funding.
          </p>
        )}
      </Section>

      {chartRows.length > 0 && <BudgetCharts rows={chartRows} />}

      <Section title="Costs" description="Monthly costs count 12 times in the first year.">
        <FeeLegend {...feeMarks(items)} />
        <div className="relative mt-4 overflow-x-auto panel">
          <table className="doc-table min-w-180">
            <thead>
              <tr>
                <th scope="col">Cost</th>
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
      </Section>

      {isOwner && (
        <Section title="Add a cost">
          <div className="max-w-4xl panel p-5 sm:p-6">
            <BudgetItemForm planId={plan._id} />
          </div>
        </Section>
      )}
    </div>
  );
}
