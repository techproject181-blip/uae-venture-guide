import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { findConversation, listMessages, sendMessage, whyClosed } from "@/lib/messages";
import { fieldErrors } from "@/lib/schemas/helpers";
import { messagesQuerySchema, requestMessageSchema } from "@/lib/schemas/messages";

// GET /api/requests/:id/messages?after=<ISO date>
// The conversation between the founder and the mentor, oldest first. The page
// asks every few seconds with `after` set a little before the newest message it
// has received, so only recent messages come back; it skips the ones it has.
// `canSend` turns false once the request is completed or the other person's
// account is no longer active, and `closedText` then says why.
export const GET = route(async (request, { params }) => {
  const user = await requireApiUser();
  const { id } = await params;
  const query = messagesQuerySchema.safeParse({ after: new URL(request.url).searchParams.get("after") });
  if (!query.success) throw new ApiError(400, "The date is not valid.", fieldErrors(query.error));

  const conversation = await findConversation(id, user);
  const after = query.data.after ? new Date(query.data.after) : undefined;
  const messages = await listMessages(conversation.request, user.id, { after });
  return Response.json({
    status: conversation.request.status,
    canSend: conversation.canSend,
    closedReason: conversation.closedReason,
    closedText: whyClosed(conversation),
    messages,
  });
});

// POST /api/requests/:id/messages  { body }
// Sends a message, while the conversation is open. A closed one answers 409 with the reason.
export const POST = route(async (request, { params }) => {
  const user = await requireApiUser();
  const { id } = await params;
  const conversation = await findConversation(id, user);
  const { body } = await readBody(request, requestMessageSchema);
  const message = await sendMessage(conversation, user, body);
  return Response.json({ message }, { status: 201 });
});
