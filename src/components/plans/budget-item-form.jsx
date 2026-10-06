"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SelectField, TextField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { BUDGET_CATEGORIES, RECURRENCES } from "@/lib/constants";
import { sendJson } from "@/lib/form-helpers";
import { budgetItemSchema } from "@/lib/schemas/plans";

/** Adds a cost to the budget, or edits `item` when one is given. */
export function BudgetItemForm({ planId, item = null, onDone }) {
  const router = useRouter();
  const idPrefix = item ? `item-${item._id}-` : "new-item-";
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: budgetItemSchema,
    send: (data) =>
      item ? sendJson("PATCH", `/api/plans/${planId}/budget/${item._id}`, data) : sendJson("POST", `/api/plans/${planId}/budget`, data),
    onSuccess: (result, form) => {
      toast.success(item ? "Cost saved." : "Cost added.");
      if (!item) form.reset();
      onDone?.();
      router.refresh();
    },
  });
  const field = (name) => ({ id: `${idPrefix}${name}`, name, error: errors[name] });

  return (
    <form noValidate onSubmit={handleSubmit} onChange={clearError} className="@container space-y-4">
      <FormAlert>{formError}</FormAlert>
      <div className="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-4">
        <TextField
          label="Cost"
          className="@md:col-span-2"
          defaultValue={item?.label}
          placeholder="For example: Coffee machine"
          {...field("label")}
        />
        <SelectField label="Category" options={BUDGET_CATEGORIES} defaultValue={item?.category ?? "other"} {...field("category")} />
        <SelectField label="How often" options={RECURRENCES} defaultValue={item?.recurrence ?? "one_time"} {...field("recurrence")} />
        <TextField
          label="Estimate (AED)"
          type="number"
          min="0"
          inputMode="numeric"
          defaultValue={item?.estimatedAed}
          {...field("estimatedAed")}
        />
        <TextField
          label="Actually paid (AED)"
          type="number"
          min="0"
          inputMode="numeric"
          hint="Leave empty until you pay it."
          defaultValue={item?.actualAed}
          {...field("actualAed")}
        />
      </div>
      {/* "Add cost" is the page's one gold button; saving an edit uses the outline style. */}
      <SubmitButton pending={pending} pendingText="Saving…" variant={item ? "outline" : "default"}>
        {item ? "Save cost" : "Add cost"}
      </SubmitButton>
    </form>
  );
}
