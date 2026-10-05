import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { feeSchema } from "@/lib/schemas/sources";
import { FeeReference } from "@/models/FeeReference";
import { Source } from "@/models/Source";

// POST /api/admin/fees: add a fee reference to a source. Administrators only.
export const POST = route(async (request) => {
  await requireApiUser("admin");
  const data = await readBody(request, feeSchema);

  await connectDB();
  if (!(await Source.exists({ _id: data.sourceId }))) throw new ApiError(404, "Source not found.");
  const fee = await FeeReference.create(data);
  return Response.json({ id: String(fee._id) }, { status: 201 });
});
