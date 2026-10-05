import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { findOwnPlan } from "@/lib/plans";
import { taskStatusSchema } from "@/lib/schemas/plans";

// PATCH /api/plans/:id/tasks/:taskId/status  { status: "todo" | "in_progress" | "done" }. Owner only.
export const PATCH = route(async (request, { params }) => {
  const user = await requireApiUser("entrepreneur");
  const { id, taskId } = await params;
  const { status } = await readBody(request, taskStatusSchema);

  const plan = await findOwnPlan(id, user);
  const task = plan.tasks.id(taskId);
  if (!task) throw new ApiError(404, "Task not found.");

  task.status = status;
  task.completedAt = status === "done" ? new Date() : undefined;
  await plan.save();
  return Response.json({ ok: true });
});
