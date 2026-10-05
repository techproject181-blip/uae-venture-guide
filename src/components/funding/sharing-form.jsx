"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PitchCard } from "@/components/funding/pitch-card";
import { CheckboxField, TextAreaField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { sendJson } from "@/lib/form-helpers";
import { sharingSchema } from "@/lib/schemas/community";

/** The owner writes a pitch summary and turns sharing on or off, with a live preview of the pitch card. */
export function SharingForm({ planId, card, shared }) {
  const router = useRouter();
  const [summary, setSummary] = useState(card.pitchSummary ?? "");
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: sharingSchema,
    send: (data) => sendJson("PATCH", `/api/plans/${planId}/sharing`, data),
    onSuccess: (result) => {
      toast.success(result.shared ? "Your plan is shared with funders." : "Your plan is no longer shared.");
      router.refresh();
    },
  });

  return (
    <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
      <form noValidate onSubmit={handleSubmit} onChange={clearError} className="space-y-6 panel p-5 sm:p-6">
        <FormAlert>{formError}</FormAlert>
        <TextAreaField
          id="pitchSummary"
          label="Pitch summary"
          rows={6}
          maxLength={600}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          hint="What the business does, who it is for and why it will work. Funders read this first."
          error={errors.pitchSummary}
        />
        <CheckboxField
          id="shared"
          label="Share this plan's pitch card with funders"
          defaultChecked={shared}
          hint="Funders see only the card. They see the full plan only if you accept their interest. Turning sharing off ends their access."
        />
        <SubmitButton pending={pending} pendingText="Saving…">Save sharing settings</SubmitButton>
      </form>
      <div>
        <p className="mb-3 field-label">Preview of what funders see</p>
        <PitchCard card={{ ...card, pitchSummary: summary || "Your pitch summary appears here." }} />
      </div>
    </div>
  );
}
