"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { sendJson } from "@/lib/form-helpers";
import { cn } from "@/lib/utils";

/** One document in the checklist. The owner ticks it off once they have it. */
export function DocumentRow({ planId, document, source, canEdit }) {
  const router = useRouter();
  // The tick the owner just made, shown until the saved plan comes back.
  const [pending, setPending] = useState(null);
  const [, startTransition] = useTransition();
  const obtained = pending ?? document.obtained;
  const id = `doc-${document._id}`;

  async function toggle(event) {
    const next = event.target.checked;
    setPending(next);
    const result = await sendJson("PATCH", `/api/plans/${planId}/documents/${document._id}`, { obtained: next });
    if (!result.ok) {
      setPending(null);
      toast.error(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    // Load the saved plan and drop the local copy in one step, so nothing flickers.
    startTransition(() => {
      router.refresh();
      setPending(null);
    });
  }

  return (
    <li className="px-5 pt-2 pb-4 sm:px-6">
      {/* The whole line is the tick box's label, so it is easy to tap. */}
      <label htmlFor={id} className={cn("flex min-h-11 items-center gap-4", canEdit && "cursor-pointer")}>
        <input
          id={id}
          type="checkbox"
          checked={obtained}
          onChange={toggle}
          disabled={!canEdit || pending !== null}
          aria-describedby={`${id}-text`}
          className="size-5 shrink-0 cursor-pointer accent-primary disabled:cursor-default"
        />
        <span className={cn("font-medium", obtained && "text-muted-foreground line-through")}>{document.name}</span>
      </label>
      <div className="-mt-1.5 pl-9">
        <p id={`${id}-text`} className="max-w-2xl text-sm text-muted-foreground">
          {document.description}
        </p>
        {source && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2"
          >
            {source.title}
            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>
    </li>
  );
}
