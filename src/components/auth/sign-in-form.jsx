"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordField, TextField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { LoadingOverlay } from "@/components/loaders/loading-overlay";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { postJson } from "@/lib/form-helpers";
import { signInSchema } from "@/lib/schemas/auth";

/** `notice` is a message shown before the first attempt, for example after a suspension. */
export function SignInForm({ notice = null }) {
  const router = useRouter();
  // Stays true until the next page opens, so the overlay covers the redirect too.
  const [leaving, setLeaving] = useState(false);
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: signInSchema,
    send: (data) => postJson("/api/auth/sign-in", data),
    onSuccess: (result) => {
      setLeaving(true);
      router.replace(result.redirectTo);
      router.refresh();
    },
  });

  return (
    <form method="post" noValidate onSubmit={handleSubmit} onChange={clearError} className="mt-8 space-y-5">
      {(pending || leaving) && <LoadingOverlay label="Signing in…" />}
      <FormAlert>{formError ?? notice}</FormAlert>
      <TextField id="email" label="Email" type="email" autoComplete="email" error={errors.email} />
      <div>
        <PasswordField id="password" label="Password" autoComplete="current-password" error={errors.password} />
        <Link
          href="/forgot-password"
          className="mt-1 inline-flex min-h-11 items-center rounded-md text-sm font-medium text-foreground decoration-primary underline underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Forgot your password?
        </Link>
      </div>
      <SubmitButton pending={pending} pendingText="Signing in…" className="w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
