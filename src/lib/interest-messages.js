import mongoose from "mongoose";
import { ApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { MESSAGES_PER_MINUTE } from "@/lib/messages";
import { FundingInterest } from "@/models/FundingInterest";
import { InterestMessage } from "@/models/InterestMessage";
import { Plan } from "@/models/Plan";
import { User } from "@/models/User";

// The conversation between a plan's owner and a funder. The same rules as the
// mentor conversation (lib/messages.js):
//
//   - only the owner and the funder may read it, while their account is active;
//   - it opens when the owner accepts the interest;
//   - it closes (stays readable) when the owner stops sharing the plan or an
//     administrator hides it;
//   - anyone else gets "not found".

/**
 * The conversation about interest `interestId` as `user` sees it:
 * { interest, plan, isFunder, canSend }, or null when the user may not see it.
 */
export async function getInterestConversation(interestId, user) {
  if (!user || user.status !== "active") return null;
  if (!mongoose.isValidObjectId(interestId)) return null;
  await connectDB();
  const interest = await FundingInterest.findById(interestId).lean();
  if (!interest || interest.status !== "accepted") return null;
  const plan = await Plan.findById(interest.planId).select("title ownerId shared hiddenByAdmin").lean();
  if (!plan) return null;
  const isFunder = String(interest.funderId) === user.id;
  const isOwner = String(plan.ownerId) === user.id;
  if (!isFunder && !isOwner) return null;
  // No point sending to someone whose account is suspended or removed.
  const otherId = isFunder ? plan.ownerId : interest.funderId;
  const otherActive = Boolean(await User.exists({ _id: otherId, status: "active" }));
  return { interest, plan, isFunder, canSend: Boolean(plan.shared && !plan.hiddenByAdmin && otherActive) };
}

/** Like getInterestConversation(), but throws a 404 for API routes. */
export async function findInterestConversation(interestId, user) {
  const conversation = await getInterestConversation(interestId, user);
  if (!conversation) throw new ApiError(404, "Conversation not found.");
  return conversation;
}

/** The messages, oldest first, as { id, body, createdAt, authorName, mine }. With `after`, only newer ones. */
export async function listInterestMessages(interest, viewerId, { after } = {}) {
  await connectDB();
  const filter = { interestId: interest._id };
  if (after) filter.createdAt = { $gt: after };
  const messages = await InterestMessage.find(filter).sort({ createdAt: 1, _id: 1 }).limit(500).populate("authorId", "name").lean();
  return messages.map((message) => toMessage(message, viewerId));
}

/** Saves a message from `user`. Throws when the conversation is closed or the user is sending too fast. */
export async function sendInterestMessage(conversation, user, body) {
  if (!conversation.canSend) throw new ApiError(409, "This conversation is closed because the plan is no longer shared.");
  await connectDB();
  const aMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recent = await InterestMessage.countDocuments({ authorId: user.id, createdAt: { $gt: aMinuteAgo } });
  if (recent >= MESSAGES_PER_MINUTE) {
    throw new ApiError(429, "You are sending messages too quickly. Please wait a minute and try again.");
  }
  const message = await InterestMessage.create({ interestId: conversation.interest._id, authorId: user.id, body });
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
