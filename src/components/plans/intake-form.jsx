"use client";

import { useRouter } from "next/navigation";
import { SelectField, TextAreaField, TextField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { RoadLoader } from "@/components/loaders/road-loader";
import { EMIRATES, JURISDICTION_PREFERENCES, SECTORS } from "@/lib/constants";
import { postJson } from "@/lib/form-helpers";
import { intakeSchema } from "@/lib/schemas/plans";

/** The questions that a new plan's roadmap is built from. */
export function IntakeForm() {
  const router = useRouter();
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: intakeSchema,
    send: (data) => postJson("/api/plans", data),
    onSuccess: (result) => router.push(`/plans/${result.id}`),
  });

  return (
    <form noValidate onSubmit={handleSubmit} onChange={clearError} className="space-y-8">
      <FormAlert>{formError}</FormAlert>

      <fieldset className="space-y-5">
        <legend className="text-xl font-bold">Your idea</legend>
        <TextField id="title" label="Plan name" placeholder="For example: Karak café near campus" error={errors.title} />
        <TextAreaField
          id="idea"
          label="What is the business?"
          rows={5}
          hint="What you will sell, and what makes it different. A few sentences is enough."
          error={errors.idea}
        />
        <TextAreaField
          id="targetCustomers"
          label="Who are your customers?"
          rows={2}
          placeholder="For example: university students and office workers nearby"
          error={errors.targetCustomers}
        />
      </fieldset>

      {/* A thin rule between the two groups of questions, as on a printed form. */}
      <div className="border-t pt-8">
        <fieldset className="space-y-5">
          <legend className="text-xl font-bold">Where and how</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField id="emirate" label="Emirate" options={EMIRATES} placeholder="Choose an emirate…" error={errors.emirate} />
            <SelectField id="sector" label="Sector" options={SECTORS} placeholder="Choose a sector…" error={errors.sector} />
          </div>
          <SelectField
            id="jurisdictionPref"
            label="Mainland or free zone?"
            options={JURISDICTION_PREFERENCES}
            defaultValue="unsure"
            hint="Not sure? The roadmap recommends one and explains why."
            error={errors.jurisdictionPref}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id="budgetAed"
              label="Budget for the first year (AED)"
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="50000"
              error={errors.budgetAed}
            />
            <TextField
              id="teamSize"
              label="People in the team, including you"
              type="number"
              min="1"
              inputMode="numeric"
              defaultValue="1"
              error={errors.teamSize}
            />
          </div>
        </fieldset>
      </div>

      <SubmitButton pending={pending} pendingText="Building your roadmap…">
        Build my roadmap
      </SubmitButton>
      {pending && <RoadLoader label="Finding the steps, fees and documents for your business…" className="panel px-6 py-8" />}
    </form>
  );
}
