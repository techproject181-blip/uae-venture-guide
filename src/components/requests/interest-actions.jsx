"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { sendJson } from "@/lib/form-helpers";

/** The plan owner accepts or declines a funder's interest. Accepting opens the full plan to that funder. */
export function InterestActions({ interestId }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const confirm = useConfirm();

  async function act(action) {
    if (action === "accept" && !(await confirm({ title: "Accept this funder?", description: "They can then read your full plan, and you can message each other here.", confirmLabel: "Accept" }))) return;
    setPending(action);
    const result = await sendJson("PATCH", `/api/interests/${interestId}`, { action });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    toast.success(action === "accept" ? "Interest accepted." : "Interest declined.");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="lg" onClick={() => act("accept")} disabled={Boolean(pending)}>
        {pending === "accept" ? "Saving…" : "Accept and share the plan"}
      </Button>
      <Button variant="destructive" size="lg" onClick={() => act("decline")} disabled={Boolean(pending)}>
        {pending === "decline" ? "Saving…" : "Decline"}
      </Button>
    </div>
  );
}
