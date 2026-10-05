import { readBody, requireApiUser, route } from "@/lib/api";
import { findOwnPlan } from "@/lib/plans";
import { budgetItemSchema } from "@/lib/schemas/plans";

// POST /api/plans/:id/budget: add a cost to the budget. Owner only.
export const POST = route(async (request, { params }) => {
  const user = await requireApiUser("entrepreneur");
  const { id } = await params;
  const data = await readBody(request, budgetItemSchema);
  const plan = await findOwnPlan(id, user);

  // An amount the entrepreneur types in is always an estimate, never official.
  plan.budgetItems.push({ ...data, costBasis: "estimate", origin: "user" });
  await plan.save();
  return Response.json({ id: String(plan.budgetItems.at(-1)._id) }, { status: 201 });
});
