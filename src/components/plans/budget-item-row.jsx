"use client";

import { useState } from "react";
import { DeleteButton } from "@/components/delete-button";
import { BudgetItemForm } from "@/components/plans/budget-item-form";
import { CostBasis } from "@/components/plans/plan-bits";
import { Button } from "@/components/ui/button";
import { firstYearCost } from "@/lib/budget";
import { BUDGET_CATEGORIES, RECURRENCES, labelOf } from "@/lib/constants";
import { formatAed } from "@/lib/format";

/** One cost in the budget table. The owner can open an edit form under the row. */
export function BudgetItemRow({ planId, item, canEdit, columns }) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <tr>
        <td>
          <p className="font-medium">{item.label}</p>
          <p className="text-muted-foreground">{labelOf(BUDGET_CATEGORIES, item.category)}</p>
        </td>
        <td className="whitespace-nowrap">{labelOf(RECURRENCES, item.recurrence)}</td>
        <td className="text-right">
          {formatAed(item.estimatedAed)}
          <div className="mt-1">
            <CostBasis basis={item.costBasis} />
          </div>
        </td>
        <td className="text-right">{item.actualAed == null ? "—" : formatAed(item.actualAed)}</td>
        <td className="text-right font-medium">{formatAed(firstYearCost(item.estimatedAed, item.recurrence))}</td>
        {canEdit && (
          <td className="py-0.5 text-right">
            {/* A quiet text button: one per row, so a column of boxes does not crowd the table. */}
            <Button variant="link" size="lg" className="px-3" aria-expanded={editing} onClick={() => setEditing((open) => !open)}>
              Edit<span className="sr-only"> {item.label}</span>
            </Button>
          </td>
        )}
      </tr>
      {editing && (
        <tr>
          <td colSpan={columns} className="bg-secondary px-4 py-5">
            <BudgetItemForm planId={planId} item={item} onDone={() => setEditing(false)} />
            <div className="mt-5 flex justify-end border-t pt-4">
              <DeleteButton
                url={`/api/plans/${planId}/budget/${item._id}`}
                confirmText={`Delete "${item.label}" from the budget?`}
                doneText="Cost deleted."
                label="Delete cost"
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
