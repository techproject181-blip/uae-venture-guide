import { AlertCircle } from "lucide-react";

/** A message for the whole form, such as "Email or password is incorrect." Renders nothing when empty. */
export function FormAlert({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive-surface p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
