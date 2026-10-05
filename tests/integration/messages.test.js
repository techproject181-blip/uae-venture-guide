import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { getConversation, listMessages, MESSAGES_PER_MINUTE, sendMessage } from "@/lib/messages";
import { MentorRequest } from "@/models/MentorRequest";
import { RequestMessage } from "@/models/RequestMessage";
import { User } from "@/models/User";
import { setupTestDatabase } from "../helpers/database";

// The API routes read the signed-in user from the session cookie; here the
// tests choose who is signed in instead.
const session = vi.hoisted(() => ({ user: null }));
vi.mock("@/lib/session", () => ({ getCurrentUser: async () => session.user }));

const { GET, POST } = await import("@/app/api/requests/[id]/messages/route");
const { PATCH } = await import("@/app/api/requests/[id]/route");

setupTestDatabase("messages");

// The user object the app passes around after sign-in (see lib/session.js).
async function makeUser(role, status = "active") {
  const user = await User.create({ name: `Test ${role} ${Math.random().toString(36).slice(2, 6)}`, email: `${role}-${Math.random()}@test.local`, passwordHash: "x", role, status });
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, status: user.status };
}

function makeRequest(founder, mentor, status, extra = {}) {
  return MentorRequest.create({ entrepreneurId: founder.id, mentorId: mentor.id, topic: "Choosing a location", message: "Could you look at my plan?", status, ...extra });
}

/** Calls a route handler as `user`, like the browser would. */
async function call(handler, user, requestId, { method = "GET", query = "", body } = {}) {
  session.user = user;
  const request = new Request(`http://localhost/api/requests/${requestId}/messages${query}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const response = await handler(request, { params: Promise.resolve({ id: String(requestId) }) });
  return { status: response.status, body: await response.json() };
}

let founder, mentor, stranger, otherMentor, admin;
beforeAll(async () => {
  [founder, mentor, stranger, otherMentor, admin] = await Promise.all([
    makeUser("entrepreneur"),
    makeUser("mentor"),
    makeUser("entrepreneur"),
    makeUser("mentor"),
    makeUser("admin"),
  ]);
});

beforeEach(async () => {
  await RequestMessage.deleteMany({});
});

describe("who may see a conversation", () => {
  test("the founder and the mentor of an accepted request may read and send", async () => {
    const request = await makeRequest(founder, mentor, "accepted");
    const asFounder = await getConversation(request._id, founder);
    const asMentor = await getConversation(request._id, mentor);
    expect(asFounder).toMatchObject({ isMentor: false, canSend: true });
    expect(asMentor).toMatchObject({ isMentor: true, canSend: true });
  });

  test("nobody else: not another founder, another mentor or the administrator", async () => {
    const request = await makeRequest(founder, mentor, "accepted");
    for (const user of [stranger, otherMentor, admin, null]) {
      expect(await getConversation(request._id, user)).toBeNull();
    }
  });

  test("not a suspended or waiting account, even its own founder or mentor", async () => {
    const request = await makeRequest(founder, mentor, "accepted");
    expect(await getConversation(request._id, { ...founder, status: "suspended" })).toBeNull();
    expect(await getConversation(request._id, { ...mentor, status: "pending" })).toBeNull();
  });

  test("a pending or declined request has no conversation", async () => {
    const pending = await makeRequest(founder, otherMentor, "pending");
    const declined = await makeRequest(founder, mentor, "declined");
    for (const request of [pending, declined]) {
      expect(await getConversation(request._id, founder)).toBeNull();
      expect(await getConversation(request._id, request.mentorId.equals(mentor.id) ? mentor : otherMentor)).toBeNull();
    }
    await pending.deleteOne(); // only one waiting request per pair is allowed
  });

  test("a completed request stays readable but is closed", async () => {
    const request = await makeRequest(founder, mentor, "completed");
    await RequestMessage.create({ requestId: request._id, authorId: mentor.id, body: "Good luck with the opening!" });
    const conversation = await getConversation(request._id, founder);
    expect(conversation).toMatchObject({ canSend: false });
    expect((await listMessages(conversation.request, founder.id)).map((m) => m.body)).toEqual(["Good luck with the opening!"]);
    await expect(sendMessage(conversation, founder, "One more question")).rejects.toMatchObject({ status: 409 });
  });

  test("an id that is not a request id is simply not found", async () => {
    expect(await getConversation("not-an-id", founder)).toBeNull();
  });
});

describe("sending and reading messages", () => {
  test("messages come back oldest first, with the author's name and whether they are the viewer's", async () => {
    const request = await makeRequest(founder, mentor, "accepted");
    const conversation = await getConversation(request._id, founder);
    await sendMessage(conversation, founder, "  Hello Omar  ");
    await sendMessage(await getConversation(request._id, mentor), mentor, "Hello! Happy to help.");

    const seenByFounder = await listMessages(conversation.request, founder.id);
    expect(seenByFounder.map(({ body, mine, authorName }) => ({ body, mine, authorName }))).toEqual([
      { body: "Hello Omar", mine: true, authorName: founder.name },
      { body: "Hello! Happy to help.", mine: false, authorName: mentor.name },
    ]);
    const seenByMentor = await listMessages(conversation.request, mentor.id);
    expect(seenByMentor.map((m) => m.mine)).toEqual([false, true]);
  });

  test("`after` returns only newer messages", async () => {
    const request = await makeRequest(founder, mentor, "accepted");
    const conversation = await getConversation(request._id, founder);
    const first = await sendMessage(conversation, founder, "First");
    await new Promise((resolve) => setTimeout(resolve, 5));
    await sendMessage(conversation, founder, "Second");
    const newer = await listMessages(conversation.request, founder.id, { after: new Date(first.createdAt) });
    expect(newer.map((m) => m.body)).toEqual(["Second"]);
  });

  test("a mentor's reply saved on an older request shows as the first message", async () => {
    const request = await makeRequest(founder, mentor, "accepted", { mentorReply: "Happy to help.", respondedAt: new Date(Date.now() - 60_000) });
    const conversation = await getConversation(request._id, founder);
    await sendMessage(conversation, founder, "Thank you!");
    const list = await listMessages(conversation.request, founder.id);
    expect(list.map(({ body, mine }) => ({ body, mine }))).toEqual([
      { body: "Happy to help.", mine: false },
      { body: "Thank you!", mine: true },
    ]);
  });

  test(`no more than ${MESSAGES_PER_MINUTE} messages a minute from one person`, async () => {
    const request = await makeRequest(founder, mentor, "accepted");
    const conversation = await getConversation(request._id, mentor);
    await RequestMessage.insertMany(
      Array.from({ length: MESSAGES_PER_MINUTE }, (_, i) => ({ requestId: request._id, authorId: mentor.id, body: `Message ${i}` })),
    );
    await expect(sendMessage(conversation, mentor, "One too many")).rejects.toMatchObject({ status: 429 });
    // The other person is not held back.
    await expect(sendMessage(await getConversation(request._id, founder), founder, "Still fine")).resolves.toMatchObject({ body: "Still fine" });
  });
});

describe("the messages API", () => {
  test("the founder sends, the mentor reads it, and a stranger gets 404", async () => {
    const request = await makeRequest(founder, mentor, "accepted");
    const sent = await call(POST, founder, request._id, { method: "POST", body: { body: "Is the small shop better?" } });
    expect(sent.status).toBe(201);
    expect(sent.body.message).toMatchObject({ body: "Is the small shop better?", mine: true, authorName: founder.name });

    const read = await call(GET, mentor, request._id);
    expect(read.status).toBe(200);
    expect(read.body).toMatchObject({ status: "accepted", canSend: true });
    expect(read.body.messages).toEqual([expect.objectContaining({ body: "Is the small shop better?", mine: false })]);

    expect((await call(GET, stranger, request._id)).status).toBe(404);
    expect((await call(POST, stranger, request._id, { method: "POST", body: { body: "Hi" } })).status).toBe(404);
    expect((await call(GET, otherMentor, request._id)).status).toBe(404);
  });

  test("polling with `after` returns nothing when there is nothing new", async () => {
    const request = await makeRequest(founder, mentor, "accepted");
    const sent = await call(POST, mentor, request._id, { method: "POST", body: { body: "Hello" } });
    const poll = await call(GET, founder, request._id, { query: `?after=${encodeURIComponent(sent.body.message.createdAt)}` });
    expect(poll.body.messages).toEqual([]);
    expect((await call(GET, founder, request._id, { query: "?after=yesterday" })).status).toBe(400);
  });

  test("an empty or too long message is refused with a field error", async () => {
    const request = await makeRequest(founder, mentor, "accepted");
    const empty = await call(POST, founder, request._id, { method: "POST", body: { body: "   " } });
    expect(empty.status).toBe(400);
    expect(empty.body.fieldErrors.body).toBe("Write a message.");
    const long = await call(POST, founder, request._id, { method: "POST", body: { body: "x".repeat(2001) } });
    expect(long.status).toBe(400);
  });

  test("signed-out and suspended users are turned away", async () => {
    const request = await makeRequest(founder, mentor, "accepted");
    expect((await call(GET, null, request._id)).status).toBe(401);
    expect((await call(GET, { ...founder, status: "suspended" }, request._id)).status).toBe(403);
  });

  test("a pending request has no conversation, and a completed one is closed", async () => {
    const pending = await makeRequest(founder, mentor, "pending");
    expect((await call(GET, founder, pending._id)).status).toBe(404);
    await pending.deleteOne();

    const completed = await makeRequest(founder, mentor, "completed");
    const read = await call(GET, founder, completed._id);
    expect(read.body).toMatchObject({ status: "completed", canSend: false });
    expect((await call(POST, founder, completed._id, { method: "POST", body: { body: "Hello?" } })).status).toBe(409);
  });

  test("a reply written when accepting becomes the first message", async () => {
    const request = await makeRequest(founder, mentor, "pending");
    session.user = mentor;
    const response = await PATCH(
      new Request(`http://localhost/api/requests/${request._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", reply: "Happy to help. Send me your budget." }),
      }),
      { params: Promise.resolve({ id: String(request._id) }) },
    );
    expect(response.status).toBe(200);
    const read = await call(GET, founder, request._id);
    expect(read.body.messages.map(({ body, mine }) => ({ body, mine }))).toEqual([{ body: "Happy to help. Send me your budget.", mine: false }]);
  });
});
