import mongoose from "mongoose";
import { ApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { MentorRequest } from "@/models/MentorRequest";
import { RequestMessage } from "@/models/RequestMessage";
import { User } from "@/models/User";

// Every rule about the conversation between a founder and a mentor lives here,
// so the page and the API routes apply the same rules:
//
//   - only the request's founder and mentor may read it, and only while their
//     account is active;
//   - there is a conversation once the mentor accepts; both may send messages
//     while the request is accepted and the other person's account is active;
//   - after it is completed, or once the other account is no longer active,
//     the conversation stays readable but is closed;
//   - a pending or declined request has no conversation.
//
// Anyone else gets "not found", so request ids reveal nothing.

/** Requests that have a conversation. */
const WITH_CONVERSATION = ["accepted", "completed"];

/** How many messages one person may send in a minute, across all conversations. */
export const MESSAGES_PER_MINUTE = 30;

/** The most messages one read returns. */
export const MAX_MESSAGES = 500;

/**
 * The conversation about request `requestId` as `user` sees it:
 * { request, isMentor, canSend, closedReason }, or null when the user may not
 * see it. closedReason says why a closed conversation is closed: "completed"
 * (the request is completed) or "inactive" (the other person's account is no
 * longer active). It is null while both may send.
 */
export async function getConversation(requestId, user) {
  if (!user || user.status !== "active") return null;
  if (!mongoose.isValidObjectId(requestId)) return null;
  await connectDB();
  const request = await MentorRequest.findOne({ _id: requestId, $or: [{ entrepreneurId: user.id }, { mentorId: user.id }] }).lean();
  if (!request || !WITH_CONVERSATION.includes(request.status)) return null;
  const isMentor = String(request.mentorId) === user.id;
  // No point sending to someone whose account is suspended or removed.
  const otherActive = Boolean(await User.exists({ _id: isMentor ? request.entrepreneurId : request.mentorId, status: "active" }));
  const closedReason = request.status === "completed" ? "completed" : otherActive ? null : "inactive";
  return { request, isMentor, canSend: closedReason === null, closedReason };
}

/** Like getConversation(), but throws a 404 for API routes. */
export async function findConversation(requestId, user) {
  const conversation = await getConversation(requestId, user);
  if (!conversation) throw new ApiError(404, "Request not found.");
  return conversation;
}

/** Why the conversation is closed, as one short sentence for the page and the API, or null while it is open. */
export function whyClosed({ closedReason, isMentor }) {
  if (closedReason === "completed") return "The request is completed, so the conversation is closed.";
  if (closedReason === "inactive") {
    return `The ${isMentor ? "founder" : "mentor"}'s account is no longer active, so the conversation is closed.`;
  }
  return null;
}

/**
 * The conversation's messages, oldest first, as plain objects
 * { id, body, createdAt, authorName, mine }. Without `after` (the first load),
 * the newest ones; with `after` (a Date), the ones after it. Requests accepted
 * before messages existed kept the mentor's reply on the request itself; it is
 * shown as the first message.
 */
export async function listMessages(request, viewerId, { after } = {}) {
  await connectDB();
  const filter = { requestId: request._id };
  if (after) filter.createdAt = { $gt: after };
  // The first load takes the newest messages, so a long conversation still ends
  // with its latest ones; a later read takes the next ones in order.
  const order = after ? 1 : -1;
  const messages = await RequestMessage.find(filter)
    .sort({ createdAt: order, _id: order })
    .limit(MAX_MESSAGES)
    .populate("authorId", "name")
    .lean();
  if (!after) messages.reverse();
  const list = messages.map((message) => toMessage(message, viewerId));

  if (!after && request.mentorReply && request.status !== "declined") {
    const mentor = await User.findById(request.mentorId).select("name").lean();
    list.unshift({
      id: `reply-${request._id}`,
      body: request.mentorReply,
      createdAt: new Date(request.respondedAt ?? request.updatedAt).toISOString(),
      authorName: mentor?.name ?? "A removed account",
      mine: String(request.mentorId) === String(viewerId),
    });
  }
  return list;
}

/**
 * Saves a message from `user` in the conversation. Throws when the conversation
 * is closed, or when the user has sent too many messages in the last minute.
 */
export async function sendMessage(conversation, user, body) {
  if (!conversation.canSend) throw new ApiError(409, whyClosed(conversation));
  await connectDB();
  const aMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recent = await RequestMessage.countDocuments({ authorId: user.id, createdAt: { $gt: aMinuteAgo } });
  if (recent >= MESSAGES_PER_MINUTE) {
    throw new ApiError(429, "You are sending messages too quickly. Please wait a minute and try again.");
  }
  const message = await RequestMessage.create({ requestId: conversation.request._id, authorId: user.id, body });
  return toMessage({ ...message.toObject(), authorId: { _id: user.id, name: user.name } }, user.id);
}

function toMessage(message, viewerId) {
  const author = message.authorId;
  return {
    id: String(message._id),
    body: message.body,
    createdAt: new Date(message.createdAt).toISOString(),
    authorName: author?.name ?? "A removed account",
    mine: String(author?._id ?? author) === String(viewerId),
  };
}
