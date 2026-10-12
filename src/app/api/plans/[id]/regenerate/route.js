import { requireApiUser, route } from "@/lib/api";
import { createNewVersion, findOwnPlan, rebuildRoadmap } from "@/lib/plans";
import { consumeQuota } from "@/lib/quota";

// The AI can take a minute or more to write a roadmap. On hosts that limit how
// long a request may run, this one may run for up to two minutes.
export const maxDuration = 120;

// POST /api/plans/:id/regenerate: make a fresh roadmap from the same answers,
// as a new plan, so the earlier one is kept. A failed plan has nothing worth
// keeping, so it is rebuilt in place instead. Owner only.
export const POST = route(async (request, { params }) => {
  const user = await requireApiUser("entrepreneur");
  const { id } = await params;
  const plan = await findOwnPlan(id, user);
  await consumeQuota(user.id, "generations");

  if (plan.status === "failed") {
    await rebuildRoadmap(plan);
    return Response.json({ id: String(plan._id), status: plan.status });
  }

  // Titled "… (version 2)", "… (version 3)" and so on, never "(new version) (new version)".
  const fresh = await createNewVersion(plan);
  return Response.json({ id: String(fresh._id), status: fresh.status }, { status: 201 });
});
