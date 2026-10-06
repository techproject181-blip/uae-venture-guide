import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { findInterestConversation, listInterestMessages, sendInterestMessage } from "@/lib/interest-messages";
import { fieldErrors } from "@/lib/schemas/helpers";
import { messagesQuerySchema, requestMessageSchema } from "@/lib/schemas/messages";

// GET /api/interests/:id/messages?after=<ISO date>
// The conversation between a plan's owner and a funder, oldest first. The page
// asks every few seconds with `after` set to its newest message.
export const GET = route(async (request, { params }) => {
  const user = await requireApiUser();
  const { id } = await params;
  const query = messagesQuerySchema.safeParse({ after: new URL(request.url).searchParams.get("after") });
  if (!query.success) throw new ApiError(400, "The date is not valid.", fieldErrors(query.error));

  const conversation = await findInterestConversation(id, user);
  const after = query.data.after ? new Date(query.data.after) : undefined;
  const messages = await listInterestMessages(conversation.interest, user.id, { after });
  return Response.json({ canSend: conversation.canSend, messages });
});

// POST /api/interests/:id/messages  { body }
export const POST = route(async (request, { params }) => {
  const user = await requireApiUser();
  const { id } = await params;
  const conversation = await findInterestConversation(id, user);
  const { body } = await readBody(request, requestMessageSchema);
  const message = await sendInterestMessage(conversation, user, body);
  return Response.json({ message }, { status: 201 });
});
