"use client";

import { useRouter } from "next/navigation";
import { Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest, useApiMutation } from "@/lib/query";

// Pages are server components, which can only pass plain values, so the icon
// is chosen by name here rather than handed over as a component.
const ICONS = { delete: Trash2, undo: Undo2 };

/**
 * Asks for confirmation, then sends DELETE to `url`. Afterwards it goes to
 * `redirectTo`, or reloads the current page's data when there is none.
 */
export function DeleteButton({ url, confirmText, redirectTo, label = "Delete", doneText = "Deleted.", size = "lg", icon = "delete" }) {
  const Icon = ICONS[icon] ?? Trash2;
  const router = useRouter();
  const { mutateAsync, isPending: pending } = useApiMutation(() => apiRequest("DELETE", url));
  const confirm = useConfirm();

  async function remove() {
    if (!(await confirm({ title: `${label}?`, description: confirmText, confirmLabel: label, danger: true }))) return;
    const result = await mutateAsync();
    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    toast.success(doneText);
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  return (
    <Button variant="destructive" size={size} onClick={remove} disabled={pending}>
      <Icon aria-hidden="true" />
      {pending ? "Working…" : label}
    </Button>
  );
}
