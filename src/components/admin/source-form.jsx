"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckboxField, CheckboxGroup, SelectField, TextAreaField, TextField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { EMIRATES, SOURCE_CATEGORIES } from "@/lib/constants";
import { sendJson } from "@/lib/form-helpers";
import { toDateInput } from "@/lib/format";
import { sourceSchema } from "@/lib/schemas/sources";

const EMIRATE_OPTIONS = [{ value: "", label: "Federal (all emirates)" }, ...EMIRATES];

/** Adds a new source, or edits `source` when one is given. */
export function SourceForm({ source = null }) {
  const router = useRouter();
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: sourceSchema,
    send: (data) => (source ? sendJson("PATCH", `/api/admin/sources/${source._id}`, data) : sendJson("POST", "/api/admin/sources", data)),
    onSuccess: (result) => {
      toast.success(source ? "Source saved." : "Source added.");
      if (source) router.refresh();
      else router.push(`/admin/sources/${result.id}`);
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit} onChange={clearError} className="space-y-5">
      <FormAlert>{formError}</FormAlert>
      <TextField id="title" label="Title" defaultValue={source?.title} error={errors.title} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="publisher"
          label="Publisher"
          hint="For example: Dubai Department of Economy and Tourism"
          defaultValue={source?.publisher}
          error={errors.publisher}
        />
        <SelectField id="emirate" label="Emirate" options={EMIRATE_OPTIONS} defaultValue={source?.emirate ?? ""} error={errors.emirate} />
      </div>
      <TextField id="url" label="Web address" type="url" placeholder="https://" defaultValue={source?.url} error={errors.url} />
      <TextAreaField
        id="summary"
        label="Summary"
        hint="What a founder can find on this page, in one or two sentences."
        defaultValue={source?.summary}
        error={errors.summary}
      />
      <CheckboxGroup
        id="categories"
        label="Categories"
        options={SOURCE_CATEGORIES}
        defaultValues={source?.categories ?? []}
        error={errors.categories}
      />
      <TextField
        id="verifiedAt"
        label="Last checked on"
        type="date"
        defaultValue={toDateInput(source?.verifiedAt ?? new Date())}
        error={errors.verifiedAt}
        className="sm:max-w-xs"
      />
      <CheckboxField id="active" label="Show this source to users" defaultChecked={source?.active ?? true} />
      <CheckboxField
        id="demo"
        label="This is demo data that has not been checked"
        hint="Users see a Demo label next to it."
        defaultChecked={source?.demo ?? false}
      />
      {/* Editing happens on the source page, where "Add fee reference" is the gold main button, so saving is an outline there. */}
      <SubmitButton pending={pending} pendingText="Saving…" variant={source ? "outline" : "default"}>
        {source ? "Save source" : "Add source"}
      </SubmitButton>
    </form>
  );
}
