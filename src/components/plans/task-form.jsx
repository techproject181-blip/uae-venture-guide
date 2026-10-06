"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SelectField, TextAreaField, TextField } from "@/components/form/fields";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useApiForm } from "@/components/form/use-api-form";
import { sendJson } from "@/lib/form-helpers";
import { taskSchema } from "@/lib/schemas/plans";

/** Adds a task to a plan, or edits `task` when one is given. `onDone` runs after a successful save. */
export function TaskForm({ planId, phases, task = null, onDone }) {
  const router = useRouter();
  const idPrefix = task ? `task-${task._id}-` : "new-task-";
  const { errors, formError, pending, handleSubmit, clearError } = useApiForm({
    schema: taskSchema,
    send: (data) =>
      task ? sendJson("PATCH", `/api/plans/${planId}/tasks/${task._id}`, data) : sendJson("POST", `/api/plans/${planId}/tasks`, data),
    onSuccess: (result, form) => {
      toast.success(task ? "Task saved." : "Task added.");
      if (!task) form.reset();
      onDone?.();
      router.refresh();
    },
  });

  // Field ids must be unique on the page, but the API expects plain names,
  // so each input gets a prefixed id and an unprefixed name.
  const field = (name) => ({ id: `${idPrefix}${name}`, name, error: errors[name] });

  return (
    <form noValidate onSubmit={handleSubmit} onChange={clearError} className="@container space-y-4">
      <FormAlert>{formError}</FormAlert>
      <TextField label="Task" defaultValue={task?.title} {...field("title")} />
      <TextAreaField label="Details (optional)" rows={2} defaultValue={task?.description} {...field("description")} />
      <div className="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-4">
        <SelectField
          label="Phase"
          options={phases.map((phase) => ({ value: phase._id, label: phase.title }))}
          defaultValue={task?.phaseId ?? phases[0]?._id}
          {...field("phaseId")}
        />
        <TextField label="Days needed" type="number" min="0" inputMode="numeric" defaultValue={task?.estDays ?? 1} {...field("estDays")} />
        <TextField
          label="Lowest cost (AED)"
          type="number"
          min="0"
          inputMode="numeric"
          defaultValue={task?.costMinAed ?? 0}
          {...field("costMinAed")}
        />
        <TextField
          label="Highest cost (AED)"
          type="number"
          min="0"
          inputMode="numeric"
          defaultValue={task?.costMaxAed ?? 0}
          {...field("costMaxAed")}
        />
      </div>
      {(task?.costBasis === "reference" || task?.costBasis === "demo") && (
        <p className="text-sm text-muted-foreground">Changing the cost turns this fee into your own estimate.</p>
      )}
      {/* "Add task" is the page's one gold button; saving an edit uses the outline style. */}
      <SubmitButton pending={pending} pendingText="Saving…" variant={task ? "outline" : "default"}>
        {task ? "Save task" : "Add task"}
      </SubmitButton>
    </form>
  );
}
