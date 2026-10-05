"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendJson } from "@/lib/form-helpers";

/** Hides or shows a post or a shared plan. `url` is the admin API route for it. */
export function HideButton({ url, hidden, what }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!hidden && !window.confirm(`Hide this ${what}? Other users will no longer see it.`)) return;
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
