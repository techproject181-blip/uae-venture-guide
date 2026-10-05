import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { findOwnPlan } from "@/lib/plans";
import { taskSchema } from "@/lib/schemas/plans";

async function findTask(params, user) {
  const { id, taskId } = await params;
  const plan = await findOwnPlan(id, user);
  const task = plan.tasks.id(taskId);
  if (!task) throw new ApiError(404, "Task not found.");
  return { plan, task };
}

// PATCH /api/plans/:id/tasks/:taskId: edit a task. Owner only.
export const PATCH = route(async (request, { params }) => {
  const user = await requireApiUser("entrepreneur");
  const data = await readBody(request, taskSchema);
  const { plan, task } = await findTask(params, user);
  if (!plan.phases.id(data.phaseId)) throw new ApiError(400, "Choose a phase of this plan.", { phaseId: "Choose a phase." });

  // Changing an official cost makes it the entrepreneur's own estimate.
  if (data.costMinAed !== task.costMinAed || data.costMaxAed !== task.costMaxAed) {
    task.costBasis = "estimate";
    task.feeReferenceId = undefined;
  }
  task.set(data);
  await plan.save();
  return Response.json({ ok: true });
});

// DELETE /api/plans/:id/tasks/:taskId. Owner only.
export const DELETE = route(async (request, { params }) => {
  const user = await requireApiUser("entrepreneur");
  const { plan, task } = await findTask(params, user);
  task.deleteOne();
  await plan.save();
  return Response.json({ ok: true });
});
