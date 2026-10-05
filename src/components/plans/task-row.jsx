"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ExternalLink, Pencil } from "lucide-react";
import { toast } from "sonner";
import { DeleteButton } from "@/components/delete-button";
import { Fields } from "@/components/document";
import { Cost } from "@/components/plans/plan-bits";
import { TaskForm } from "@/components/plans/task-form";
import { Stamp } from "@/components/stamp";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { TASK_STATUSES } from "@/lib/constants";
import { sendJson } from "@/lib/form-helpers";
import { cn } from "@/lib/utils";

/**
 * One roadmap step, numbered like 1.2. The owner ticks the box to mark it
 * done, which presses the DONE stamp onto it; unticking undoes that. The
 * details (what it involves, who you deal with, sources, "in progress", edit
 * and delete) open when the title is pressed. Other viewers (a mentor or
 * funder with access) only read it.
 */
export function TaskRow({ planId, task, number, phases, sources, canEdit }) {
  const router = useRouter();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  // The status the owner just picked, shown until the saved plan comes back.
  const [pendingStatus, setPendingStatus] = useState(null);
  // True once the owner marks this step done here, so the DONE stamp is pressed on.
  const [pressed, setPressed] = useState(false);
  const [, startTransition] = useTransition();

  const status = pendingStatus ?? task.status;
  const done = status === "done";
  const links = task.sourceIds.map((id) => sources[id]).filter(Boolean);

  async function saveStatus(next) {
    setPendingStatus(next);
    setPressed(next === "done");
    const result = await sendJson("PATCH", `/api/plans/${planId}/tasks/${task._id}/status`, { status: next });
    if (!result.ok) {
      setPendingStatus(null);
      setPressed(false);
      toast.error(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    // Load the saved plan and drop the local copy in one step, so nothing flickers.
    startTransition(() => {
      router.refresh();
      setPendingStatus(null);
    });
  }

  return (
    <li className="py-1.5">
      <div className="flex flex-col gap-x-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {canEdit && (
            <label className="flex size-11 shrink-0 cursor-pointer items-center justify-center">
              <input
                type="checkbox"
                checked={done}
                disabled={pendingStatus !== null}
                onChange={(event) => saveStatus(event.target.checked ? "done" : "todo")}
                aria-label={`Mark as done: ${task.title}`}
                className="size-5 cursor-pointer accent-done disabled:cursor-wait"
              />
            </label>
          )}
          <span className="w-8 shrink-0 py-2.5 text-sm leading-6 text-muted-foreground tabular-nums">{number}</span>
          <h4 className="min-w-0 flex-1">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((shown) => !shown)}
              className="group/toggle flex min-h-11 w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-sm py-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className={cn("leading-6 font-medium underline-offset-4 group-hover/toggle:underline", done && "text-muted-foreground")}>
                {task.title}
              </span>
              {done && (
                <Stamp tone="done" pressed={pressed} className="-rotate-2">
                  Done
                </Stamp>
              )}
              {status === "in_progress" && <StatusBadge status="in_progress" />}
              <ChevronDown
                className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
                aria-hidden="true"
              />
            </button>
          </h4>
        </div>

        {/* A fixed column on wide screens, so the amounts line up from row to row. */}
        <div className={cn("pb-2 lg:flex lg:min-h-11 lg:w-60 lg:items-center lg:justify-end lg:pb-0", canEdit ? "pl-23 lg:pl-0" : "pl-10 lg:pl-0")}>
          <Cost min={task.costMinAed} max={task.costMaxAed} basis={task.costBasis} />
        </div>
      </div>

      <div id={panelId} hidden={!open} className={cn("space-y-4 pt-1 pb-5", canEdit ? "pl-23" : "pl-10")}>
        {task.description && <p className="max-w-2xl leading-relaxed">{task.description}</p>}
        <Fields
          items={[
            task.authority && { label: "Authority", value: task.authority },
            { label: "Time needed", value: `About ${task.estDays} ${task.estDays === 1 ? "day" : "days"}` },
          ]}
        />
        {links.length > 0 && (
          <div>
            <p className="field-label">{links.length === 1 ? "Official source" : "Official sources"}</p>
            <ul className="mt-1 space-y-1">
              {links.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-foreground underline decoration-primary underline-offset-4 hover:decoration-2">
                    {source.title}
                    <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {canEdit && (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="field-label block" htmlFor={`status-${task._id}`}>
                Status of {task.title}
              </label>
              <select
                id={`status-${task._id}`}
                value={status}
                onChange={(event) => saveStatus(event.target.value)}
                disabled={pendingStatus !== null}
                className="mt-1 h-11 w-40 cursor-pointer rounded-md border border-input bg-card px-3 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
              >
                {TASK_STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline" size="lg" aria-expanded={editing} onClick={() => setEditing((shown) => !shown)}>
              <Pencil aria-hidden="true" />
              Edit
            </Button>
          </div>
        )}
        {canEdit && editing && (
          <div className="max-w-4xl panel p-4 sm:p-5">
            <TaskForm planId={planId} phases={phases} task={task} onDone={() => setEditing(false)} />
            <div className="mt-5 flex justify-end border-t pt-4">
              <DeleteButton
                url={`/api/plans/${planId}/tasks/${task._id}`}
                confirmText="Delete this task?"
                doneText="Task deleted."
                label="Delete task"
              />
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
