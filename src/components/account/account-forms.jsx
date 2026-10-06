"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PasswordField, TextField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { postJson, sendJson } from "@/lib/form-helpers";
import { accountSchema, changePasswordSchema } from "@/lib/schemas/auth";

/** The name on the account. The email is shown but cannot be changed here. */
export function AccountDetailsForm({ name, email }) {
  const router = useRouter();
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: accountSchema,
    send: (data) => sendJson("PATCH", "/api/account", data),
    onSuccess: () => {
      toast.success("Your name is saved.");
      router.refresh();
    },
  });

  return (
    <form method="post" noValidate onSubmit={handleSubmit} onChange={clearError} className="space-y-5">
      <FormAlert>{formError}</FormAlert>
      <TextField id="name" label="Full name" autoComplete="name" defaultValue={name} error={errors.name} />
      <TextField id="email" label="Email" type="email" value={email} readOnly disabled hint="Your email is your sign-in name, so it cannot be changed." />
      <SubmitButton pending={pending} pendingText="Saving…">
        Save name
      </SubmitButton>
    </form>
  );
}

/** Change the password: the current one first, then the new one. */
export function ChangePasswordForm() {
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: changePasswordSchema,
    send: (data) => postJson("/api/account/password", data),
    onSuccess: (_result, form) => {
      toast.success("Your password is changed.");
      form?.reset();
    },
  });

  return (
    <form method="post" noValidate onSubmit={handleSubmit} onChange={clearError} className="space-y-5">
      <FormAlert>{formError}</FormAlert>
      <PasswordField id="currentPassword" label="Current password" autoComplete="current-password" error={errors.currentPassword} />
      <PasswordField
        id="password"
        label="New password"
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number."
        error={errors.password}
      />
      <SubmitButton pending={pending} pendingText="Saving…">
        Change password
      </SubmitButton>
    </form>
  );
}
