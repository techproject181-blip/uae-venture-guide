"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SelectField, TextAreaField, TextField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { postJson } from "@/lib/form-helpers";
import { mentorRequestSchema } from "@/lib/schemas/community";

/** An entrepreneur asks this mentor for guidance, and may attach one of their plans. */
export function RequestForm({ mentorId, mentorName, plans }) {
  const router = useRouter();
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: mentorRequestSchema,
    send: (data) => postJson("/api/requests", data),
    onSuccess: () => {
      toast.success(`Request sent to ${mentorName}.`);
      router.push("/requests");
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit} onChange={clearError} className="space-y-5">
      <FormAlert>{formError}</FormAlert>
      <input type="hidden" name="mentorId" value={mentorId} />
      <TextField id="topic" label="What do you need help with?" placeholder="For example: Choosing between mainland and a free zone" error={errors.topic} />
      <TextAreaField id="message" label="Message" rows={4} hint="Say a little about your idea and where you are stuck." error={errors.message} />
      <SelectField
        id="planId"
        label="Attach a plan (optional)"
        options={plans.map((plan) => ({ value: plan._id, label: plan.title }))}
        placeholder="No plan"
        hint="If the mentor accepts, they can read this plan until the request is completed."
        error={errors.planId}
      />
      <SubmitButton pending={pending} pendingText="Sending…">Send request</SubmitButton>
    </form>
  );
}
