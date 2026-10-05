import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { sourceSchema } from "@/lib/schemas/sources";
import { FeeReference } from "@/models/FeeReference";
import { Source } from "@/models/Source";

// PATCH /api/admin/sources/:id: edit a source. Administrators only.
export const PATCH = route(async (request, { params }) => {
  await requireApiUser("admin");
  const { id } = await params;
  const data = await readBody(request, sourceSchema);

  await connectDB();
  const source = await Source.findByIdAndUpdate(id, data, { returnDocument: "after", runValidators: true });
  if (!source) throw new ApiError(404, "Source not found.");
  return Response.json({ id });
});

// DELETE /api/admin/sources/:id: delete a source and its fee references. Administrators only.
export const DELETE = route(async (request, { params }) => {
  await requireApiUser("admin");
  const { id } = await params;

  await connectDB();
  const source = await Source.findByIdAndDelete(id);
  if (!source) throw new ApiError(404, "Source not found.");
  await FeeReference.deleteMany({ sourceId: id });
  return Response.json({ ok: true });
});
