"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { sendJson } from "@/lib/form-helpers";

const DONE = { accept: "Request accepted.", decline: "Request declined.", complete: "Request marked as completed." };

/** The mentor's answer to a request: accept or decline with a reply, or complete it later. */
export function RequestActions({ requestId, status }) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [pending, setPending] = useState(false);
  const confirm = useConfirm();

  async function act(action) {
    if (action === "complete" && !(await confirm({ title: "Mark as completed?", description: "The founder's plan is no longer shared with you, and the conversation becomes read-only.", confirmLabel: "Mark completed" }))) return;
    setPending(true);
    const result = await sendJson("PATCH", `/api/requests/${requestId}`, { action, reply: reply.trim() || undefined });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    toast.success(DONE[action]);
    router.refresh();
  }

  if (status === "accepted") {
    return (
      <Button variant="outline" size="lg" onClick={() => act("complete")} disabled={pending}>
        Mark as completed
      </Button>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="space-y-2">
        <label htmlFor={`reply-${requestId}`} className="block text-sm font-medium">
          Reply (optional)
        </label>
        <textarea
          id={`reply-${requestId}`}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          rows={3}
          maxLength={2000}
          className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="lg" onClick={() => act("accept")} disabled={pending}>
          Accept
        </Button>
        <Button variant="destructive" size="lg" onClick={() => act("decline")} disabled={pending}>
          Decline
        </Button>
      </div>
    </div>
  );
}
