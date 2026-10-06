"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RolePicker } from "@/components/auth/role-picker";
import { PasswordField, TextField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { LoadingOverlay } from "@/components/loaders/loading-overlay";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { postJson } from "@/lib/form-helpers";
import { signUpSchema } from "@/lib/schemas/auth";

export function SignUpForm() {
  const router = useRouter();
  // Stays true until the next page opens, so the overlay covers the redirect too.
  const [leaving, setLeaving] = useState(false);
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: signUpSchema,
    send: (data) => postJson("/api/auth/sign-up", data),
    onSuccess: (result) => {
      setLeaving(true);
      router.replace(result.redirectTo);
      router.refresh();
    },
  });

  return (
    <form method="post" noValidate onSubmit={handleSubmit} onChange={clearError} className="mt-8 space-y-5">
      {(pending || leaving) && <LoadingOverlay label="Creating your account…" />}
      <FormAlert>{formError}</FormAlert>
      <TextField id="name" label="Full name" autoComplete="name" error={errors.name} />
      <TextField id="email" label="Email" type="email" autoComplete="email" error={errors.email} />
      <PasswordField
        id="password"
        label="Password"
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number."
        error={errors.password}
      />
      <RolePicker error={errors.role} />
      <SubmitButton pending={pending} pendingText="Creating account…" className="w-full">
        Create account
      </SubmitButton>
    </form>
  );
}
