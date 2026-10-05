"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendJson } from "@/lib/form-helpers";

/** The plan owner accepts or declines a funder's interest. Accepting opens the full plan to that funder. */
export function InterestActions({ interestId }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function act(action) {
    if (action === "accept" && !window.confirm("Accept? This funder can then read your full plan and see your email.")) return;
    setPending(true);
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
      <Button size="lg" onClick={() => act("accept")} disabled={pending}>
        Accept and share the plan
      </Button>
      <Button variant="destructive" size="lg" onClick={() => act("decline")} disabled={pending}>
        Decline
      </Button>
    </div>
  );
}
