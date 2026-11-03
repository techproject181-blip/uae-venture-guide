import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { FundingInterest } from "@/models/FundingInterest";
import { InterestMessage } from "@/models/InterestMessage";
import { MentorRequest } from "@/models/MentorRequest";
import { Plan } from "@/models/Plan";
import { RequestMessage } from "@/models/RequestMessage";
import "@/models/User"; // registers the model that populate() reads from

// The inbox side of the conversations: the newest message of each one, how
// many messages are new, the Messages page that lists every conversation of a
// user, and the numbers in the navigation. A message is new to the viewer when
// the other person sent it after the viewer last had the conversation open
// (the *ReadAt times, set by markRead() and markInterestRead()).

/** Request statuses that have a conversation (see lib/messages.js). */
const REQUEST_CHAT = ["accepted", "completed"];

const toId = (id) => new mongoose.Types.ObjectId(String(id));

/**
 * For each conversation in `chats` (each { id, readAt }): its newest message
 * { body, createdAt, mine } and `unread`, how many messages the other person
 * sent after readAt. Returns a Map keyed by the conversation id as text; one
 * with no messages is left out.
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
  // Only conversations with something new need counting, so most need no second read.
  const unread = await Promise.all(
    rows.map((row) => {
      const read = readAt.get(String(row._id));
      if (!row.theirLatest || (read && row.theirLatest <= read)) return 0;
      return Messages.countDocuments({
        [key]: row._id,
        authorId: { $ne: viewer },
        ...(read && { createdAt: { $gt: read } }),
      });
    }),
  );
  return new Map(
    rows.map((row, index) => [
      String(row._id),
      {
        last: { body: row.body, createdAt: row.createdAt.toISOString(), mine: viewer.equals(row.authorId) },
        unread: unread[index],
      },
    ]),
  );
}

/** The guidance requests' conversations as `user` (their entrepreneur or mentor) sees them: Map of request id → { last, unread }. */
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

/**
 * Every conversation of `user`, with mentors and funders alike, newest first,
 * for the Messages page. Each is { id, href, otherName, otherRole, title,
 * closed, last, unread }. One without messages yet shows the request or the
 * interest it started from as its newest message.
 */
export async function listConversations(user) {
  await connectDB();
  const isMentor = user.role === "mentor";
  const isFunder = user.role === "funder";
  const ownPlans = user.role === "entrepreneur" ? await Plan.find({ ownerId: user.id }).distinct("_id") : [];

  const [requests, interests] = await Promise.all([
    isFunder
      ? []
      : MentorRequest.find({ [isMentor ? "mentorId" : "entrepreneurId"]: user.id, status: { $in: REQUEST_CHAT } })
          .populate("mentorId", "name")
          .populate("entrepreneurId", "name")
          .lean(),
    isMentor
      ? []
      : FundingInterest.find(isFunder ? { funderId: user.id, status: "accepted" } : { planId: { $in: ownPlans }, status: "accepted" })
          .populate("funderId", "name")
          .populate({ path: "planId", select: "title shared hiddenByAdmin ownerId", populate: { path: "ownerId", select: "name" } })
          .lean(),
  ]);
  const [mentorChats, funderChats] = await Promise.all([requestChats(requests, user), interestChats(interests, user)]);

  const conversations = [
    ...requests.map((request) => {
      const chat = mentorChats.get(String(request._id));
      const other = isMentor ? request.entrepreneurId : request.mentorId;
      return {
        id: String(request._id),
        href: `/requests/${request._id}`,
        otherName: other?.name ?? "A removed account",
        otherRole: isMentor ? "Entrepreneur" : "Mentor",
        title: request.topic,
        closed: request.status === "completed",
        last: chat?.last ?? { body: request.message, createdAt: new Date(request.createdAt).toISOString(), mine: !isMentor },
        unread: chat?.unread ?? 0,
      };
    }),
    ...interests.map((interest) => {
      const chat = funderChats.get(String(interest._id));
      const plan = interest.planId;
      return {
        id: String(interest._id),
        href: `/interests/${interest._id}`,
        otherName: (isFunder ? plan?.ownerId?.name : interest.funderId?.name) ?? "A removed account",
        otherRole: isFunder ? "Entrepreneur" : "Funder",
        title: plan?.title ?? "A deleted plan",
        closed: !plan?.shared || Boolean(plan?.hiddenByAdmin),
        last: chat?.last ?? { body: interest.message, createdAt: new Date(interest.createdAt).toISOString(), mine: isFunder },
        unread: chat?.unread ?? 0,
      };
    }),
  ];
  return conversations.sort((a, b) => (a.last.createdAt < b.last.createdAt ? 1 : -1));
}

/**
 * The numbers next to the navigation links, keyed by the link: next to
 * /requests ("Guidance requests" for mentors, "Mentors & funders" for
 * entrepreneurs), what waits for the user's answer (requests sent to a mentor,
 * funder interest in an entrepreneur's plans); next to "Messages", the
 * conversations with new messages.
 */
export async function navCounts(user) {
  if (user.status !== "active" || user.role === "admin") return {};
  await connectDB();
  const plans = user.role === "entrepreneur" ? await Plan.find({ ownerId: user.id }).distinct("_id") : [];
  const [waiting, conversations] = await Promise.all([
    user.role === "mentor"
      ? MentorRequest.countDocuments({ mentorId: user.id, status: "pending" })
      : user.role === "entrepreneur"
        ? FundingInterest.countDocuments({ planId: { $in: plans }, status: "pending" })
        : 0,
    listConversations(user),
  ]);
  const unread = conversations.filter((conversation) => conversation.unread > 0).length;
  return user.role === "funder" ? { "/messages": unread } : { "/requests": waiting, "/messages": unread };
}
