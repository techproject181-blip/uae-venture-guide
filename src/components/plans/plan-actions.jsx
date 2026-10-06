"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { DeleteButton } from "@/components/delete-button";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { postJson } from "@/lib/form-helpers";

/**
 * "New version" makes a fresh roadmap from the same answers and keeps this one;
 * on a failed plan "Try again" rebuilds it in place. "Delete" removes the plan.
 */
export function PlanActions({ planId, failed = false }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const confirm = useConfirm();

  async function regenerate() {
    // A failed plan has nothing to keep, so retrying needs no confirmation.
    if (!failed && !(await confirm({ title: "Make a new version?", description: "A new roadmap is built from your answers. This plan is kept as it is.", confirmLabel: "Make new version" }))) return;
    setPending(true);
    const result = await postJson(`/api/plans/${planId}/regenerate`);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    if (failed) {
      if (result.status === "ready") toast.success("Roadmap ready.");
      else toast.error("The roadmap could not be made. Please try again.");
      router.refresh();
      return;
    }
    toast.success("New version ready.");
    router.push(`/plans/${result.id}`);
  }

  return (
    <>
      <Button variant="outline" size="lg" onClick={regenerate} disabled={pending}>
        <RefreshCw className={pending ? "animate-spin" : undefined} aria-hidden="true" />
        {pending ? "Building…" : failed ? "Try again" : "New version"}
      </Button>
      <DeleteButton
        url={`/api/plans/${planId}`}
        confirmText="Delete this plan? Its roadmap, budget and chat are deleted for good."
        redirectTo="/plans"
        doneText="Plan deleted."
      />
    </>
  );
}
