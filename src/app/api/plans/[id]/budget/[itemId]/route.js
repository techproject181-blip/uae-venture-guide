import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { findOwnPlan } from "@/lib/plans";
import { budgetItemSchema } from "@/lib/schemas/plans";

async function findItem(params, user) {
  const { id, itemId } = await params;
  const plan = await findOwnPlan(id, user);
  const item = plan.budgetItems.id(itemId);
  if (!item) throw new ApiError(404, "Budget item not found.");
  return { plan, item };
}

// PATCH /api/plans/:id/budget/:itemId: edit a cost, including the actual amount paid. Owner only.
export const PATCH = route(async (request, { params }) => {
  const user = await requireApiUser("entrepreneur");
  const data = await readBody(request, budgetItemSchema);
  const { plan, item } = await findItem(params, user);

  // Changing an official amount or how often it is paid makes it the entrepreneur's own estimate.
  if (data.estimatedAed !== item.estimatedAed || data.recurrence !== item.recurrence) item.costBasis = "estimate";
  item.category = data.category;
  item.label = data.label;
  item.estimatedAed = data.estimatedAed;
  item.recurrence = data.recurrence;
  item.actualAed = data.actualAed; // undefined clears it
  await plan.save();
  return Response.json({ ok: true });
});

// DELETE /api/plans/:id/budget/:itemId. Owner only.
export const DELETE = route(async (request, { params }) => {
  const user = await requireApiUser("entrepreneur");
  const { plan, item } = await findItem(params, user);
  item.deleteOne();
  await plan.save();
  return Response.json({ ok: true });
});
