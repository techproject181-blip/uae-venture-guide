"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendJson } from "@/lib/form-helpers";

/**
 * Asks for confirmation, then sends DELETE to `url`. Afterwards it goes to
 * `redirectTo`, or reloads the current page's data when there is none.
 */
export function DeleteButton({ url, confirmText, redirectTo, label = "Delete", doneText = "Deleted.", size = "lg" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function remove() {
    if (!window.confirm(confirmText)) return;
    setPending(true);
    const result = await sendJson("DELETE", url);
    setPending(false);
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
      <Trash2 aria-hidden="true" />
      {label}
    </Button>
  );
}
