"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PasswordField, ReadOnlyField, TextField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { postJson, sendJson } from "@/lib/form-helpers";
import { accountSchema, changePasswordSchema } from "@/lib/schemas/auth";

/** The bottom strip of a settings card: a short note on the left, the save button on the right. */
function CardFooter({ note, children }) {
  return (
    <div className="flex flex-col gap-3 border-t bg-ink-50/60 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">{note}</p>
      {children}
    </div>
  );
}

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
    <form method="post" noValidate onSubmit={handleSubmit} onChange={clearError}>
      <div className="space-y-5 p-5">
        <FormAlert>{formError}</FormAlert>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField id="name" label="Full name" autoComplete="name" defaultValue={name} error={errors.name} />
          <ReadOnlyField id="email" label="Email" value={email} title="Your email is your sign-in name, so it cannot be changed." />
        </div>
      </div>
      <CardFooter note="Your email is your sign-in name, so it cannot be changed.">
        <SubmitButton pending={pending} pendingText="Saving…">
          Save name
        </SubmitButton>
      </CardFooter>
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
    <form method="post" noValidate onSubmit={handleSubmit} onChange={clearError}>
      <div className="space-y-5 p-5">
        <FormAlert>{formError}</FormAlert>
        <div className="grid gap-5 md:grid-cols-2">
          <PasswordField id="currentPassword" label="Current password" autoComplete="current-password" error={errors.currentPassword} />
          <PasswordField id="password" label="New password" autoComplete="new-password" error={errors.password} />
        </div>
      </div>
      <CardFooter note="At least 8 characters, with a letter and a number.">
        <SubmitButton pending={pending} pendingText="Saving…">
          Change password
        </SubmitButton>
      </CardFooter>
    </form>
  );
}
