import { readBody, requireApiUser, route } from "@/lib/api";
import { findOwnPlan } from "@/lib/plans";
import { sharingSchema } from "@/lib/schemas/community";

// PATCH /api/plans/:id/sharing  { shared, pitchSummary }
// The owner shares the plan's pitch card with funders, or stops sharing.
// Stopping also ends the access of funders whose interest was accepted.
export const PATCH = route(async (request, { params }) => {
  const user = await requireApiUser("entrepreneur");
  const { id } = await params;
  const { shared, pitchSummary } = await readBody(request, sharingSchema);
  const plan = await findOwnPlan(id, user);

  plan.shared = shared;
  if (pitchSummary !== undefined) plan.pitchSummary = pitchSummary;
  await plan.save();
  return Response.json({ shared: plan.shared });
});
