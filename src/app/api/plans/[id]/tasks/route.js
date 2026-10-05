import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { findOwnPlan } from "@/lib/plans";
import { taskSchema } from "@/lib/schemas/plans";

// POST /api/plans/:id/tasks: add the entrepreneur's own task. Owner only.
export const POST = route(async (request, { params }) => {
  const user = await requireApiUser("entrepreneur");
  const { id } = await params;
  const data = await readBody(request, taskSchema);
  const plan = await findOwnPlan(id, user);

  if (!plan.phases.id(data.phaseId)) throw new ApiError(400, "Choose a phase of this plan.", { phaseId: "Choose a phase." });

  // A cost the entrepreneur types in is always an estimate, never official.
  plan.tasks.push({ ...data, costBasis: "estimate", origin: "user", status: "todo" });
  await plan.save();
  return Response.json({ id: String(plan.tasks.at(-1)._id) }, { status: 201 });
});
