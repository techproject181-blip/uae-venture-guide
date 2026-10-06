"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { sendJson } from "@/lib/form-helpers";
import { cn } from "@/lib/utils";

/** A switch for the mentor: whether founders can send new guidance requests. */
export function AcceptingSwitch({ initial }) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [pending, setPending] = useState(false);

  async function toggle() {
    const next = !on;
    setOn(next); // show the change at once, undo it if saving fails
    setPending(true);
    const result = await sendJson("PATCH", "/api/profile/accepting", { accepting: next });
    setPending(false);
    if (!result.ok) {
      setOn(!next);
      toast.error(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    toast.success(next ? "You are taking new requests." : "New requests are paused.");
    router.refresh();
  }

  return (
    <div className="panel flex items-center justify-between gap-4 p-5">
      <div className="min-w-0">
        <p id="accepting-label" className="font-semibold">
          Taking new requests
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">{on ? "Founders can ask you for guidance." : "Paused: founders see you are not taking requests."}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby="accepting-label"
        onClick={toggle}
        disabled={pending}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60",
          on ? "bg-primary" : "bg-ink-300",
        )}
      >
        <span className={cn("inline-block size-5 rounded-full bg-card shadow-sm transition-transform duration-200", on ? "translate-x-6" : "translate-x-1")} />
      </button>
    </div>
  );
}
