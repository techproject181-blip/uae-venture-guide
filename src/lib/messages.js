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
//     while the request is accepted;
//   - after it is completed the conversation stays readable but is closed;
//   - a pending or declined request has no conversation.
//
// Anyone else gets "not found", so request ids reveal nothing.

/** Requests that have a conversation. */
const WITH_CONVERSATION = ["accepted", "completed"];

/** How many messages one person may send in a minute, across all conversations. */
export const MESSAGES_PER_MINUTE = 30;

/** The most messages one read returns. */
const MAX_MESSAGES = 500;

/**
 * The conversation about request `requestId` as `user` sees it:
 * { request, isMentor, canSend }, or null when the user may not see it.
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
  return { request, isMentor, canSend: request.status === "accepted" && otherActive };
}

/** Like getConversation(), but throws a 404 for API routes. */
export async function findConversation(requestId, user) {
  const conversation = await getConversation(requestId, user);
  if (!conversation) throw new ApiError(404, "Request not found.");
  return conversation;
}

/**
 * The conversation's messages, oldest first, as plain objects
 * { id, body, createdAt, authorName, mine }. With `after` (a Date), only newer
 * ones. Requests accepted before messages existed kept the mentor's reply on
 * the request itself; it is shown as the first message.
 */
export async function listMessages(request, viewerId, { after } = {}) {
  await connectDB();
  const filter = { requestId: request._id };
  if (after) filter.createdAt = { $gt: after };
  const messages = await RequestMessage.find(filter).sort({ createdAt: 1, _id: 1 }).limit(MAX_MESSAGES).populate("authorId", "name").lean();
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
  if (!conversation.canSend) throw new ApiError(409, "This conversation is closed because the request is completed.");
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
