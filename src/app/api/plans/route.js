import { readBody, requireApiUser, route } from "@/lib/api";
import { createPlanWithRoadmap } from "@/lib/plans";
import { consumeQuota } from "@/lib/quota";
import { intakeSchema } from "@/lib/schemas/plans";

// POST /api/plans: create a plan from the intake form and make its roadmap. Entrepreneurs only.
export const POST = route(async (request) => {
  const user = await requireApiUser("entrepreneur");
  const intake = await readBody(request, intakeSchema);
  await consumeQuota(user.id, "generations"); // counts against the daily limit, or answers 429

  const plan = await createPlanWithRoadmap(user.id, intake);
  return Response.json({ id: String(plan._id), status: plan.status }, { status: 201 });
});
