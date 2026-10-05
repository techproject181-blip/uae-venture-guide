"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TextAreaField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { Button } from "@/components/ui/button";
import { postJson } from "@/lib/form-helpers";
import { interestSchema } from "@/lib/schemas/community";

/** "I'm interested" on a pitch card: opens a short message form, then sends it to the owner. */
export function InterestForm({ planId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: interestSchema,
    send: (data) => postJson(`/api/plans/${planId}/interest`, data),
    onSuccess: () => {
      toast.success("Interest sent. The owner will be emailed.");
      setOpen(false);
      router.refresh();
    },
  });

  if (!open) {
    return (
      <Button size="lg" className="w-full sm:w-auto" onClick={() => setOpen(true)}>
        I am interested
      </Button>
    );
  }
  return (
    <form noValidate onSubmit={handleSubmit} onChange={clearError} className="max-w-xl space-y-4">
      <FormAlert>{formError}</FormAlert>
      {/* The button that opened the form is gone, so keyboard focus moves into the message box. */}
      <TextAreaField
        id={`message-${planId}`}
        name="message"
        label="Message to the owner"
        rows={3}
        hint="Say who you are and what interests you about the plan."
        error={errors.message}
        autoFocus
      />
      <div className="flex flex-wrap gap-2">
        <SubmitButton pending={pending} pendingText="Sending…">
          Send
        </SubmitButton>
        <Button type="button" variant="outline" size="lg" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
