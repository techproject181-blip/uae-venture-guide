import { beforeAll, describe, expect, test, vi } from "vitest";
import { interestChats, listConversations, navCounts, requestChats } from "@/lib/inbox";
import { FundingInterest } from "@/models/FundingInterest";
import { InterestMessage } from "@/models/InterestMessage";
import { MentorRequest } from "@/models/MentorRequest";
import { Plan } from "@/models/Plan";
import { RequestMessage } from "@/models/RequestMessage";
import { User } from "@/models/User";
import { setupTestDatabase } from "../helpers/database";

// The API routes read the signed-in user from the session cookie; here the
// tests choose who is signed in instead.
const session = vi.hoisted(() => ({ user: null }));
vi.mock("@/lib/session", () => ({ getCurrentUser: async () => session.user }));

const { POST: readRequest } = await import("@/app/api/requests/[id]/read/route");
const { POST: readInterest } = await import("@/app/api/interests/[id]/read/route");
const { GET: notifications } = await import("@/app/api/notifications/route");

setupTestDatabase("inbox");

// The user object the app passes around after sign-in (see lib/session.js).
async function makeUser(role) {
  const user = await User.create({
    name: `Test ${role} ${Math.random().toString(36).slice(2, 6)}`,
    email: `${role}-${Math.random()}@test.local`,
    passwordHash: "x",
    role,
    status: "active",
  });
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, status: user.status };
}

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000);

function makeRequest(founder, mentor, status = "accepted", extra = {}) {
  return MentorRequest.create({
    entrepreneurId: founder.id,
    mentorId: mentor.id,
    topic: "Choosing a location",
    message: "Could you look at my plan?",
    status,
    ...extra,
  });
}

function say(request, author, body, minutes) {
  return RequestMessage.create({ requestId: request._id, authorId: author.id, body, createdAt: minutesAgo(minutes) });
}

/** Reads the request back the way the lists do, with its read times. */
const fresh = async (request) => MentorRequest.findById(request._id).lean();

/** Calls a route handler as `user`, like the browser would. */
async function call(handler, user, id) {
  session.user = user;
  const request = new Request("http://localhost/api/x", { method: id ? "POST" : "GET" });
  const response = await handler(request, { params: Promise.resolve({ id: String(id) }) });
  return { status: response.status, body: await response.json() };
}

let founder, mentor, funder, stranger;
beforeAll(async () => {
  [founder, mentor, funder, stranger] = await Promise.all([
    makeUser("entrepreneur"),
    makeUser("mentor"),
    makeUser("funder"),
    makeUser("entrepreneur"),
  ]);
});

describe("new messages in a guidance request", () => {
  test("a message from the other person after the last visit is new, and the newest message is the preview", async () => {
    const request = await makeRequest(founder, mentor);
    await say(request, mentor, "Happy to help.", 30);
    await say(request, founder, "Thank you!", 20);
    await MentorRequest.updateOne({ _id: request._id }, { entrepreneurReadAt: minutesAgo(25), mentorReadAt: minutesAgo(25) });

    const forFounder = (await requestChats([await fresh(request)], founder)).get(String(request._id));
    const forMentor = (await requestChats([await fresh(request)], mentor)).get(String(request._id));
    // The founder wrote last and read the mentor's message; the mentor has not seen the founder's.
    expect(forFounder).toMatchObject({ unread: 0, last: { body: "Thank you!", mine: true } });
    expect(forMentor).toMatchObject({ unread: 1, last: { body: "Thank you!", mine: false } });
  });

  test("a conversation never opened counts its messages from the other person as new, but not your own", async () => {
    const request = await makeRequest(founder, mentor);
    await say(request, founder, "Only my message so far.", 5);
    expect((await requestChats([await fresh(request)], founder)).get(String(request._id)).unread).toBe(0);
    expect((await requestChats([await fresh(request)], mentor)).get(String(request._id)).unread).toBe(1);
  });

  test("opening the conversation marks it read, for that person only", async () => {
    const request = await makeRequest(founder, mentor);
    await say(request, mentor, "Any news?", 5);
    await say(request, founder, "Not yet.", 4);

    expect(await call(readRequest, mentor, request._id)).toEqual({ status: 200, body: { ok: true } });
    const after = await fresh(request);
    expect((await requestChats([after], mentor)).get(String(request._id)).unread).toBe(0);
    expect((await requestChats([after], founder)).get(String(request._id)).unread).toBe(1);
    // Reading does not count as a change to the request.
    expect(after.updatedAt).toEqual(request.updatedAt);
  });

  test("nobody else can mark it read, and a pending request has no conversation", async () => {
    const request = await makeRequest(founder, mentor);
    expect((await call(readRequest, stranger, request._id)).status).toBe(404);
    const pending = await makeRequest(stranger, mentor, "pending");
    expect((await call(readRequest, mentor, pending._id)).status).toBe(404);
    expect((await requestChats([pending], mentor)).size).toBe(0);
  });
});

describe("new messages with a funder", () => {
  test("works the same way for the plan's owner and the funder", async () => {
    const plan = await Plan.create({
      ownerId: founder.id,
      title: "Karak café",
      idea: "A small café beside the university serving karak tea.",
      emirate: "sharjah",
      sector: "food_beverage",
      jurisdictionPref: "unsure",
      budgetAed: 120000,
      targetCustomers: "Students",
      teamSize: 1,
      status: "ready",
      shared: true,
      pitchSummary: "Karak tea and sandwiches for students in the evening, right beside the university.",
    });
    const interest = await FundingInterest.create({ funderId: funder.id, planId: plan._id, message: "Tell me more.", status: "accepted" });
    await InterestMessage.create({ interestId: interest._id, authorId: funder.id, body: "Can we meet?", createdAt: minutesAgo(3) });

    const chatsOf = async (user) => (await interestChats([await FundingInterest.findById(interest._id).lean()], user)).get(String(interest._id));
    expect(await chatsOf(founder)).toMatchObject({ unread: 1, last: { body: "Can we meet?", mine: false } });
    expect((await chatsOf(funder)).unread).toBe(0);

    expect((await call(readInterest, founder, interest._id)).status).toBe(200);
    expect((await chatsOf(founder)).unread).toBe(0);
    expect((await call(readInterest, stranger, interest._id)).status).toBe(404);
  });
});

describe("the Messages page", () => {
  test("lists mentor and funder chats together, newest first, with how many messages are new", async () => {
    const [owner, guide, backer] = await Promise.all([makeUser("entrepreneur"), makeUser("mentor"), makeUser("funder")]);
    const request = await makeRequest(owner, guide);
    await say(request, guide, "Happy to help.", 30);
    await say(request, guide, "Send me your budget.", 29);
    const plan = await Plan.create({
      ownerId: owner.id,
      title: "Tour company",
      idea: "Small-group desert tours for visitors who want a quiet trip.",
      emirate: "dubai",
      sector: "tourism_events",
      jurisdictionPref: "unsure",
      budgetAed: 80000,
      targetCustomers: "Visitors",
      teamSize: 2,
      status: "ready",
      shared: true,
      pitchSummary: "Quiet small-group desert tours with local guides for visitors who dislike crowds.",
    });
    // An accepted interest with no messages yet: the interest itself is the newest message.
    await FundingInterest.create({ funderId: backer.id, planId: plan._id, message: "Interested in your tours.", status: "accepted" });
    await makeRequest(owner, await makeUser("mentor"), "pending"); // no conversation yet

    const forOwner = await listConversations(owner);
    expect(forOwner.map(({ otherRole, title, unread, last }) => ({ otherRole, title, unread, body: last.body }))).toEqual([
      { otherRole: "Funder", title: "Tour company", unread: 0, body: "Interested in your tours." },
      { otherRole: "Mentor", title: "Choosing a location", unread: 2, body: "Send me your budget." },
    ]);
    expect(forOwner[1]).toMatchObject({ otherName: guide.name, href: `/requests/${request._id}` });

    const forFunder = await listConversations(backer);
    expect(forFunder).toEqual([expect.objectContaining({ otherName: owner.name, otherRole: "Entrepreneur", last: expect.objectContaining({ mine: true }) })]);
  });
});

describe("the numbers in the navigation", () => {
  test("Requests counts what waits for an answer, Messages the conversations with new messages", async () => {
    const [newFounder, newMentor] = await Promise.all([makeUser("entrepreneur"), makeUser("mentor")]);
    await makeRequest(newFounder, newMentor, "pending");
    const chat = await makeRequest(stranger, newMentor);
    await say(chat, stranger, "Hello?", 2);
    await say(chat, stranger, "Are you there?", 1);

    expect(await navCounts(newMentor)).toEqual({ "/requests": 1, "/messages": 1 });
    expect(await call(notifications, newMentor)).toEqual({ status: 200, body: { counts: { "/requests": 1, "/messages": 1 } } });

    await call(readRequest, newMentor, chat._id);
    expect(await navCounts(newMentor)).toEqual({ "/requests": 1, "/messages": 0 });
  });

  test("a funder has only the Messages number", async () => {
    const newFunder = await makeUser("funder");
    expect(await navCounts(newFunder)).toEqual({ "/messages": 0 });
  });
});
