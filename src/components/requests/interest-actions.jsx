"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest, useApiMutation } from "@/lib/query";

/** The plan owner accepts or declines a funder's interest. Accepting opens the full plan to that funder. */
export function InterestActions({ interestId }) {
  const router = useRouter();
  const mutation = useApiMutation((action) => apiRequest("PATCH", `/api/interests/${interestId}`, { action }));
  // The action being saved ("accept" or "decline"), or false.
  const pending = mutation.isPending && mutation.variables;
  const confirm = useConfirm();

  async function act(action) {
    if (
      action === "accept" &&
      !(await confirm({
        title: "Accept this funder?",
        description: "They can then read your full plan, and you can message each other here.",
        confirmLabel: "Accept",
      }))
    )
      return;
    const result = await mutation.mutateAsync(action);
    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    toast.success(action === "accept" ? "Interest accepted." : "Interest declined.");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => act("accept")} disabled={Boolean(pending)}>
        {pending === "accept" ? "Saving…" : "Accept and share the plan"}
      </Button>
      <Button variant="destructive" onClick={() => act("decline")} disabled={Boolean(pending)}>
        {pending === "decline" ? "Saving…" : "Decline"}
      </Button>
    </div>
  );
}
