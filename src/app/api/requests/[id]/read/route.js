import { requireApiUser, route } from "@/lib/api";
import { findConversation, markRead } from "@/lib/messages";

// POST /api/requests/:id/read
// The conversation page calls this when it opens and when new messages come
// in, so they stop counting as new in the lists and the navigation.
export const POST = route(async (request, { params }) => {
  const user = await requireApiUser();
  const { id } = await params;
  await markRead(await findConversation(id, user));
  return Response.json({ ok: true });
});
