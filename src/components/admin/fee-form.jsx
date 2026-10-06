"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckboxField, SelectField, TextAreaField, TextField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { EMIRATES, FEE_KINDS, JURISDICTIONS, RECURRENCES } from "@/lib/constants";
import { sendJson } from "@/lib/form-helpers";
import { toDateInput } from "@/lib/format";
import { feeSchema } from "@/lib/schemas/sources";

const EMIRATE_OPTIONS = [{ value: "", label: "Federal (all emirates)" }, ...EMIRATES];
const JURISDICTION_OPTIONS = [{ value: "any", label: "Mainland and free zones" }, ...JURISDICTIONS];

/** Adds a fee reference to a source, or edits `fee` when one is given. */
export function FeeForm({ sourceId, fee = null, defaultEmirate = null }) {
  const router = useRouter();
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: feeSchema,
    send: (data) => (fee ? sendJson("PATCH", `/api/admin/fees/${fee._id}`, data) : sendJson("POST", "/api/admin/fees", data)),
    onSuccess: (result, form) => {
      toast.success(fee ? "Fee reference saved." : "Fee reference added.");
      if (fee) {
        router.push(`/admin/sources/${sourceId}`);
      } else {
        form.reset();
        router.refresh();
      }
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit} onChange={clearError} className="space-y-5">
      <FormAlert>{formError}</FormAlert>
      <input type="hidden" name="sourceId" value={sourceId} />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          id="kind"
          label="What the fee is for"
          options={FEE_KINDS}
          defaultValue={fee?.kind}
          placeholder="Choose…"
          error={errors.kind}
        />
        <TextField
          id="item"
          label="Description"
          hint="For example: Trade licence, professional activity"
          defaultValue={fee?.item}
          error={errors.item}
        />
        <SelectField
          id="emirate"
          label="Emirate"
          options={EMIRATE_OPTIONS}
          defaultValue={fee?.emirate ?? defaultEmirate ?? ""}
          error={errors.emirate}
        />
        <SelectField
          id="jurisdiction"
          label="Applies to"
          options={JURISDICTION_OPTIONS}
          defaultValue={fee?.jurisdiction ?? "any"}
          error={errors.jurisdiction}
        />
        <TextField
          id="amountMinAed"
          label="Lowest amount (AED)"
          type="number"
          min="0"
          inputMode="numeric"
          defaultValue={fee?.amountMinAed}
          error={errors.amountMinAed}
        />
        <TextField
          id="amountMaxAed"
          label="Highest amount (AED)"
          type="number"
          min="0"
          inputMode="numeric"
          defaultValue={fee?.amountMaxAed}
          error={errors.amountMaxAed}
        />
        <SelectField
          id="recurrence"
          label="How often"
          options={RECURRENCES}
          defaultValue={fee?.recurrence ?? "one_time"}
          error={errors.recurrence}
        />
        <TextField
          id="verifiedAt"
          label="Last checked on"
          type="date"
          defaultValue={toDateInput(fee?.verifiedAt ?? new Date())}
          error={errors.verifiedAt}
        />
      </div>
      <TextAreaField id="notes" label="Notes (optional)" rows={2} defaultValue={fee?.notes} error={errors.notes} />
      <CheckboxField id="active" label="Use this fee in roadmaps" defaultChecked={fee?.active ?? true} />
      <CheckboxField id="demo" label="This is demo data that has not been checked" defaultChecked={fee?.demo ?? false} />
      <SubmitButton pending={pending} pendingText="Saving…">
        {fee ? "Save fee reference" : "Add fee reference"}
      </SubmitButton>
    </form>
  );
}
