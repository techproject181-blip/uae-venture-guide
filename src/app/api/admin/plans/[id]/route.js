import { z } from "zod";
import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { Plan } from "@/models/Plan";

const schema = z.object({ hidden: z.boolean("Say whether to hide the plan.") });

// PATCH /api/admin/plans/:id  { hidden }: hide a shared plan from funders, or show it again. Administrators only.
export const PATCH = route(async (request, { params }) => {
  await requireApiUser("admin");
  const { id } = await params;
  const { hidden } = await readBody(request, schema);

  await connectDB();
  const plan = await Plan.findByIdAndUpdate(id, { hiddenByAdmin: hidden }, { returnDocument: "after" });
  if (!plan) throw new ApiError(404, "Plan not found.");
  return Response.json({ hiddenByAdmin: plan.hiddenByAdmin });
});
