"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { DeleteButton } from "@/components/delete-button";
import { BuildingDialog } from "@/components/plans/building-dialog";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest, useApiMutation } from "@/lib/query";

/**
 * "New version" makes a fresh roadmap from the same answers and keeps this one;
 * on a failed plan "Try again" rebuilds it in place. "Delete" removes the plan.
 * While the roadmap is built, the road animation shows in the middle of the
 * screen, until the finished plan is on the page.
 */
export function PlanActions({ planId, failed = false }) {
  const router = useRouter();
  const { mutateAsync, isPending: pending } = useApiMutation(() => apiRequest("POST", `/api/plans/${planId}/regenerate`));
  const confirm = useConfirm();
  // Opening the finished plan is part of the wait, so the animation stays until it shows.
  const [opening, startOpening] = useTransition();
  const building = pending || opening;

  async function regenerate() {
    // A failed plan has nothing to keep, so retrying needs no confirmation.
    if (
      !failed &&
      !(await confirm({
        title: "Make a new version?",
        description: "A new roadmap is built from your answers. This plan is kept as it is.",
        confirmLabel: "Make new version",
      }))
    )
      return;
    const result = await mutateAsync();
    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    if (failed) {
      if (result.status === "ready") toast.success("Roadmap ready.");
      else toast.error("The roadmap could not be made. Please try again.");
      startOpening(() => router.refresh());
      return;
    }
    // A new version that failed is still kept, with "Try again" on its overview.
    if (result.status === "ready") toast.success("New version ready.");
    else toast.error("The roadmap could not be made. Please try again.");
    startOpening(() => router.push(`/plans/${result.id}`));
  }

  return (
    <>
      <Button variant="outline" size="lg" onClick={regenerate} disabled={building}>
        <RefreshCw className={building ? "animate-spin" : undefined} aria-hidden="true" />
        {building ? "Building…" : failed ? "Try again" : "New version"}
      </Button>
      <BuildingDialog open={building} title={failed ? "Trying again" : "Building a new version"} />
      <DeleteButton
        url={`/api/plans/${planId}`}
        confirmText="Delete this plan? Its roadmap, budget and chat are deleted for good."
        redirectTo="/plans"
        doneText="Plan deleted."
      />
    </>
  );
}
