"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { sendJson } from "@/lib/form-helpers";

/** Hides or shows a post or a shared plan. `url` is the admin API route for it. */
export function HideButton({ url, hidden, what }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const confirm = useConfirm();

  async function toggle() {
    if (!hidden && !(await confirm({ title: `Hide this ${what}?`, description: "Other users will no longer see it. It stays saved, and you can show it again.", confirmLabel: "Hide", danger: true }))) return;
    setPending(true);
    const result = await sendJson("PATCH", url, { hidden: !hidden });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    toast.success(hidden ? `The ${what} is visible again.` : `The ${what} is hidden.`);
    router.refresh();
  }

  return (
    <Button variant={hidden ? "outline" : "destructive"} size="lg" onClick={toggle} disabled={pending}>
      {hidden ? "Show" : "Hide"}
    </Button>
  );
}
