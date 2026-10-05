"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PitchCard } from "@/components/funding/pitch-card";
import { CheckboxField, TextAreaField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { Panel, Split } from "@/components/layout";
import { sendJson } from "@/lib/form-helpers";
import { sharingSchema } from "@/lib/schemas/community";

// What happens once the card is shared, in order. Interest is answered on the Requests page.
const HOW_IT_WORKS = [
  "Funders find your card on their Discover page. They see only the card.",
  "A funder who likes it sends you a message of interest.",
  "You accept or decline it on your Requests page. Only if you accept do they see the full plan.",
  "Turning sharing off hides the card and ends every funder's access.",
];

/**
 * The owner writes a pitch summary and turns sharing on or off, with a live
 * preview of the pitch card beside the form. `notice` shows above the form.
 */
export function SharingForm({ planId, card, shared, notice }) {
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
    <Split
      aside={
        <>
          <Panel title="Preview of what funders see" flush bodyClassName="px-5 sm:px-6">
            <PitchCard card={{ ...card, pitchSummary: summary || "Your pitch summary appears here." }} framed={false} />
          </Panel>
          <Panel title="How sharing works">
            <ol className="space-y-3 text-sm">
              {HOW_IT_WORKS.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-medium text-accent-foreground tabular-nums">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </>
      }
    >
      {notice}
      <form noValidate onSubmit={handleSubmit} onChange={clearError}>
        <Panel
          title="Share with funders"
          description="Funders browse pitch cards and can ask to see your plan. You decide who gets in."
          footer={
            <SubmitButton pending={pending} pendingText="Saving…">
              Save sharing settings
            </SubmitButton>
          }
          bodyClassName="space-y-6"
        >
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
        </Panel>
      </form>
    </Split>
  );
}
