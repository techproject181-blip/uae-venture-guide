import { readBody, requireApiUser, route } from "@/lib/api";
import { createPlanWithRoadmap } from "@/lib/plans";
import { consumeQuota } from "@/lib/quota";
import { intakeSchema } from "@/lib/schemas/plans";

// The AI can take a minute or more to write a roadmap. On hosts that limit how
// long a request may run, this one may run for up to two minutes.
export const maxDuration = 120;

// POST /api/plans: create a plan from the intake form and make its roadmap. Entrepreneurs only.
export const POST = route(async (request) => {
  const user = await requireApiUser("entrepreneur");
  const intake = await readBody(request, intakeSchema);
  await consumeQuota(user.id, "generations"); // counts against the daily limit, or answers 429

  const plan = await createPlanWithRoadmap(user.id, intake);
  return Response.json({ id: String(plan._id), status: plan.status }, { status: 201 });
});
