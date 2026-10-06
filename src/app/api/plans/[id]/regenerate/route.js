import { requireApiUser, route } from "@/lib/api";
import { createPlanWithRoadmap, findOwnPlan, rebuildRoadmap } from "@/lib/plans";
import { consumeQuota } from "@/lib/quota";

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

  const intake = {
    title: `${plan.title} (new version)`.slice(0, 80),
    idea: plan.idea,
    emirate: plan.emirate,
    sector: plan.sector,
    jurisdictionPref: plan.jurisdictionPref,
    budgetAed: plan.budgetAed,
    targetCustomers: plan.targetCustomers,
    teamSize: plan.teamSize,
  };
  const fresh = await createPlanWithRoadmap(user.id, intake);
  return Response.json({ id: String(fresh._id), status: fresh.status }, { status: 201 });
});
