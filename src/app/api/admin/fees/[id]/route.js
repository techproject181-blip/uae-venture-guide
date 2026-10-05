import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { feeSchema } from "@/lib/schemas/sources";
import { FeeReference } from "@/models/FeeReference";

// PATCH /api/admin/fees/:id: edit a fee reference. Administrators only.
export const PATCH = route(async (request, { params }) => {
  await requireApiUser("admin");
  const { id } = await params;
  const data = await readBody(request, feeSchema);

  await connectDB();
  const fee = await FeeReference.findByIdAndUpdate(id, data, { returnDocument: "after", runValidators: true });
  if (!fee) throw new ApiError(404, "Fee reference not found.");
  return Response.json({ id });
});

// DELETE /api/admin/fees/:id. Administrators only.
export const DELETE = route(async (request, { params }) => {
  await requireApiUser("admin");
  const { id } = await params;

  await connectDB();
  const fee = await FeeReference.findByIdAndDelete(id);
  if (!fee) throw new ApiError(404, "Fee reference not found.");
  return Response.json({ ok: true });
});
