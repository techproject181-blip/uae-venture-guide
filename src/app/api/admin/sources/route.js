import { readBody, requireApiUser, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { sourceSchema } from "@/lib/schemas/sources";
import { Source } from "@/models/Source";

// POST /api/admin/sources: add an official source. Administrators only.
export const POST = route(async (request) => {
  await requireApiUser("admin");
  const data = await readBody(request, sourceSchema);

  await connectDB();
  const source = await Source.create(data);
  return Response.json({ id: String(source._id) }, { status: 201 });
});
