"use client";

import { useState } from "react";
import { focusFirstError, formValues } from "@/lib/form-helpers";
import { fieldErrors } from "@/lib/schemas/helpers";

/**
 * The shared logic of every form: check the values with the Zod schema,
 * send them with `send(data)`, show the errors the API returns, and call
 * `onSuccess(result, form)` when it worked.
 */
export function useApiForm({ schema, send, onSuccess }) {
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [pending, setPending] = useState(false);

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

    setPending(true);
    setErrors({});
    setFormError(null);
    const result = await send(parsed.data);
    if (!result.ok) {
      const found = result.fieldErrors ?? {};
      setErrors(found);
      setFormError(result.error ?? "Something went wrong. Please try again.");
      setPending(false);
      focusFirstError(form, found);
      return;
    }
    await onSuccess?.(result, form);
    setPending(false);
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

  return { errors, formError, pending, handleSubmit, clearError };
}
