import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { findOwnPlan } from "@/lib/plans";
import { documentSchema } from "@/lib/schemas/plans";

// PATCH /api/plans/:id/documents/:docId  { obtained: true | false }: tick a document off. Owner only.
export const PATCH = route(async (request, { params }) => {
  const user = await requireApiUser("entrepreneur");
  const { id, docId } = await params;
  const { obtained } = await readBody(request, documentSchema);

  const plan = await findOwnPlan(id, user);
  const document = plan.documents.id(docId);
  if (!document) throw new ApiError(404, "Document not found.");

  document.obtained = obtained;
  await plan.save();
  return Response.json({ ok: true });
});
