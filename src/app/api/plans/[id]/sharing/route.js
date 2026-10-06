import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
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
  // A plan without a finished roadmap has nothing to show funders.
  if (plan.status !== "ready") throw new ApiError(400, "Only a finished roadmap can be shared.");

  plan.shared = shared;
  // The form always sends the summary, and an empty box comes through as
  // undefined, so a missing value means the owner cleared it.
  plan.pitchSummary = pitchSummary ?? "";
  await plan.save();
  return Response.json({ shared: plan.shared });
});
