import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { FundingInterest } from "@/models/FundingInterest";
import { InterestMessage } from "@/models/InterestMessage";
import { MentorRequest } from "@/models/MentorRequest";
import { Plan } from "@/models/Plan";
import { RequestMessage } from "@/models/RequestMessage";

// The inbox side of the conversations: the newest message of each one, for
// the lists, and whether it holds anything new. A message is new to the viewer
// when the other person sent it after the viewer last had the conversation
// open (the *ReadAt times, set by markRead() and markInterestRead()).

/** Request statuses that have a conversation (see lib/messages.js). */
const REQUEST_CHAT = ["accepted", "completed"];

const toId = (id) => new mongoose.Types.ObjectId(String(id));

/**
 * For each conversation in `chats` (each { id, readAt }): its newest message
 * { body, createdAt, mine } and whether the other person wrote after readAt.
 * Returns a Map keyed by the conversation id as text; one with no messages is left out.
 */
async function summarise(Messages, key, chats, viewerId) {
  if (chats.length === 0) return new Map();
  await connectDB();
  const viewer = toId(viewerId);
  const rows = await Messages.aggregate([
    { $match: { [key]: { $in: chats.map((chat) => toId(chat.id)) } } },
    { $sort: { createdAt: -1, _id: -1 } },
    {
      $group: {
        _id: `$${key}`,
        body: { $first: "$body" },
        authorId: { $first: "$authorId" },
        createdAt: { $first: "$createdAt" },
        // When the other person last wrote. $max skips the nulls left by the viewer's own messages.
        theirLatest: { $max: { $cond: [{ $eq: ["$authorId", viewer] }, null, "$createdAt"] } },
      },
    },
  ]);
  const readAt = new Map(chats.map((chat) => [String(chat.id), chat.readAt ? new Date(chat.readAt) : null]));
  return new Map(
    rows.map((row) => {
      const read = readAt.get(String(row._id));
      return [
        String(row._id),
        {
          last: { body: row.body, createdAt: row.createdAt.toISOString(), mine: viewer.equals(row.authorId) },
          unread: Boolean(row.theirLatest) && (!read || row.theirLatest > read),
        },
      ];
    }),
  );
}

/** The guidance requests' conversations as `user` (their founder or mentor) sees them: Map of request id → { last, unread }. */
export function requestChats(requests, user) {
  const field = user.role === "mentor" ? "mentorReadAt" : "entrepreneurReadAt";
  const chats = requests.filter((request) => REQUEST_CHAT.includes(request.status)).map((request) => ({ id: request._id, readAt: request[field] }));
  return summarise(RequestMessage, "requestId", chats, user.id);
}

/** The funder conversations as `user` (the funder or the plan's owner) sees them: Map of interest id → { last, unread }. */
export function interestChats(interests, user) {
  const field = user.role === "funder" ? "funderReadAt" : "ownerReadAt";
  const chats = interests.filter((interest) => interest.status === "accepted").map((interest) => ({ id: interest._id, readAt: interest[field] }));
  return summarise(InterestMessage, "interestId", chats, user.id);
}

const countUnread = (chats) => [...chats.values()].filter((chat) => chat.unread).length;

/**
 * The numbers next to the navigation links, keyed by the link: what waits for
 * the user's answer (requests sent to a mentor, funder interest in a founder's
 * plans) plus the conversations with new messages.
 */
export async function navCounts(user) {
  if (user.status !== "active") return {};
  await connectDB();
  if (user.role === "mentor") {
    const [waiting, requests] = await Promise.all([
      MentorRequest.countDocuments({ mentorId: user.id, status: "pending" }),
      MentorRequest.find({ mentorId: user.id, status: { $in: REQUEST_CHAT } }).select("status mentorReadAt").lean(),
    ]);
    return { "/requests": waiting + countUnread(await requestChats(requests, user)) };
  }
  if (user.role === "entrepreneur") {
    const plans = await Plan.find({ ownerId: user.id }).distinct("_id");
    const [waiting, requests, interests] = await Promise.all([
      FundingInterest.countDocuments({ planId: { $in: plans }, status: "pending" }),
      MentorRequest.find({ entrepreneurId: user.id, status: { $in: REQUEST_CHAT } }).select("status entrepreneurReadAt").lean(),
      FundingInterest.find({ planId: { $in: plans }, status: "accepted" }).select("status ownerReadAt").lean(),
    ]);
    const [mentorChats, funderChats] = await Promise.all([requestChats(requests, user), interestChats(interests, user)]);
    return { "/requests": waiting + countUnread(mentorChats) + countUnread(funderChats) };
  }
  if (user.role === "funder") {
    const interests = await FundingInterest.find({ funderId: user.id, status: "accepted" }).select("status funderReadAt").lean();
    return { "/interests": countUnread(await interestChats(interests, user)) };
  }
  return {};
}
