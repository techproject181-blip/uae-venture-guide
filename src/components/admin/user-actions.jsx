"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { sendJson } from "@/lib/form-helpers";
import { cn } from "@/lib/utils";

// Which buttons each status shows. Rejecting a new account suspends it.
// Approve is the gold main button; reject and suspend are red outlines.
const ACTIONS = {
  pending: [
    { label: "Approve", status: "active", done: "Account approved.", variant: "default" },
    { label: "Reject", status: "suspended", done: "Account rejected.", confirm: "Reject this account?", variant: "destructive" },
  ],
  active: [
    {
      label: "Suspend",
      danger: true,
      status: "suspended",
      done: "Account suspended.",
      confirm: "Suspend this account?",
      detail: "The user is signed out at once and cannot sign in until you reactivate them.",
      variant: "destructive",
    },
  ],
  suspended: [{ label: "Reactivate", status: "active", done: "Account reactivated.", variant: "default" }],
};

/** The approve, reject, suspend and reactivate buttons for one user. */
export function UserActions({ userId, status, className }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const confirm = useConfirm();

  async function change(action) {
    if (action.confirm && !(await confirm({ title: action.confirm, description: action.detail, confirmLabel: action.label, danger: action.danger || action.variant === "destructive" }))) return;
    setPending(true);
    const result = await sendJson("PATCH", `/api/admin/users/${userId}`, { status: action.status });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    toast.success(action.done);
    router.refresh();
  }

  return (
    <div className={cn("flex flex-wrap justify-end gap-2", className)}>
      {ACTIONS[status]?.map((action) => (
        <Button key={action.label} className="h-9 px-3.5 text-sm" variant={action.variant} disabled={pending} onClick={() => change(action)}>
          {action.label}
        </Button>
      ))}
    </div>
  );
}
