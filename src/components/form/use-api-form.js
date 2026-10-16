"use client";

import { useState } from "react";
import { focusFirstError, formValues } from "@/lib/form-helpers";
import { useApiMutation } from "@/lib/query";
import { fieldErrors } from "@/lib/schemas/helpers";

/**
 * The shared logic of every form: check the values with the Zod schema,
 * send them with `send(data)` (a React Query mutation), show the errors the API returns, and call
 * `onSuccess(result, form)` when it worked.
 */
export function useApiForm({ schema, send, onSuccess }) {
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  // The mutation stays pending until onSuccess has finished too, so the
  // button keeps its busy state while the page moves on.
  const mutation = useApiMutation(async ({ data, form }) => {
    const result = await send(data);
    if (result.ok) await onSuccess?.(result, form);
    return result;
  });

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;

    // Check in the browser first for instant feedback; the API checks again.
    const parsed = schema.safeParse(formValues(form));
    if (!parsed.success) {
      const found = fieldErrors(parsed.error);
      setErrors(found);
      setFormError(null);
      focusFirstError(form, found);
      return;
    }

    setErrors({});
    setFormError(null);
    const result = await mutation.mutateAsync({ data: parsed.data, form });
    if (!result.ok) {
      const found = result.fieldErrors ?? {};
      setErrors(found);
      setFormError(result.error ?? "Something went wrong. Please try again.");
      focusFirstError(form, found);
    }
  }

  // Clear a field's error as soon as the user edits it.
  function clearError(event) {
    const { name } = event.target;
    if (!errors[name]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  return { errors, formError, pending: mutation.isPending, handleSubmit, clearError };
}
