"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PasswordField, TextField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { Stamp } from "@/components/stamp";
import { postJson } from "@/lib/form-helpers";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/schemas/auth";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: forgotPasswordSchema,
    send: (data) => postJson("/api/auth/forgot-password", data),
    onSuccess: () => setSent(true),
  });

  if (sent) {
    return (
      <div role="status" className="mt-8 rounded-lg border bg-card px-4 py-4">
        <Stamp tone="done">Sent</Stamp>
        <p className="mt-3">If an account uses that email, a reset link is on its way. It expires in one hour.</p>
      </div>
    );
  }

  return (
    <form method="post" noValidate onSubmit={handleSubmit} onChange={clearError} className="mt-8 space-y-5">
      <FormAlert>{formError}</FormAlert>
      <TextField id="email" label="Email" type="email" autoComplete="email" error={errors.email} />
      <SubmitButton pending={pending} pendingText="Sending…" className="w-full">
        Send reset link
      </SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ token }) {
  const router = useRouter();
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: resetPasswordSchema,
    send: (data) => postJson("/api/auth/reset-password", data),
    onSuccess: () => {
      toast.success("Your password is changed. Please sign in.");
      router.replace("/sign-in");
    },
  });

  return (
    <form method="post" noValidate onSubmit={handleSubmit} onChange={clearError} className="mt-8 space-y-5">
      <FormAlert>{formError ?? errors.token}</FormAlert>
      <input type="hidden" name="token" value={token} />
      <PasswordField
        id="password"
        label="New password"
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number."
        error={errors.password}
      />
      <SubmitButton pending={pending} pendingText="Saving…" className="w-full">
        Save new password
      </SubmitButton>
    </form>
  );
}
