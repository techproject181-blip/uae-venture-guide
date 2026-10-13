import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { findSharedPlan, listPitchCards } from "@/lib/funding";
import { getInterestConversation, listInterestMessages, sendInterestMessage, whyInterestClosed } from "@/lib/interest-messages";
import { MAX_MESSAGES } from "@/lib/messages";
import { FunderProfile } from "@/models/FunderProfile";
import { FundingInterest } from "@/models/FundingInterest";
import { InterestMessage } from "@/models/InterestMessage";
import { Plan } from "@/models/Plan";
import { User } from "@/models/User";
import { setupTestDatabase } from "../helpers/database";

// The API routes read the signed-in user from the session cookie; here the
// tests choose who is signed in instead.
const session = vi.hoisted(() => ({ user: null }));
vi.mock("@/lib/session", () => ({ getCurrentUser: async () => session.user }));

const { GET, POST } = await import("@/app/api/interests/[id]/messages/route");
const { POST: sendInterest } = await import("@/app/api/plans/[id]/interest/route");

setupTestDatabase("interest_chat");

// The user object the app passes around after sign-in (see lib/session.js).
async function makeUser(role, status = "active") {
  const user = await User.create({
    name: `Test ${role} ${Math.random().toString(36).slice(2, 6)}`,
    email: `${role}-${Math.random()}@test.local`,
    passwordHash: "x",
    role,
    status,
  });
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, status: user.status };
}

/** A finished plan shared with funders; pass fields to change. */
function makePlan(owner, extra = {}) {
  return Plan.create({
    ownerId: owner.id,
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
    ...extra,
  });
}

function showInterest(funder, plan, status = "accepted") {
  return FundingInterest.create({ funderId: funder.id, planId: plan._id, message: "I would like to know more about the café.", status });
}

/** Calls a route handler at `path` as `user`, like the browser would. `id` is the id in the path. */
async function call(handler, user, path, id, { method = "GET", body } = {}) {
  session.user = user;
  const request = new Request(`http://localhost${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const response = await handler(request, { params: Promise.resolve({ id: String(id) }) });
  return { status: response.status, body: await response.json() };
}

let owner, funder, otherFunder, otherOwner, admin;
beforeAll(async () => {
  [owner, funder, otherFunder, otherOwner, admin] = await Promise.all([
    makeUser("entrepreneur"),
    makeUser("funder"),
    makeUser("funder"),
    makeUser("entrepreneur"),
    makeUser("admin"),
  ]);
});

beforeEach(async () => {
  await InterestMessage.deleteMany({});
});

describe("who may see the conversation between an owner and a funder", () => {
  test("the plan's owner and the accepted funder may read and send", async () => {
    const interest = await showInterest(funder, await makePlan(owner));
    expect(await getInterestConversation(interest._id, owner)).toMatchObject({ isFunder: false, canSend: true, closedReason: null });
    expect(await getInterestConversation(interest._id, funder)).toMatchObject({ isFunder: true, canSend: true, closedReason: null });

    const path = `/api/interests/${interest._id}/messages`;
    const sent = await call(POST, funder, path, interest._id, { method: "POST", body: { body: "When do you plan to open?" } });
    expect(sent.status).toBe(201);
    const read = await call(GET, owner, path, interest._id);
    expect(read.body).toMatchObject({ canSend: true, closedReason: null, closedText: null });
    expect(read.body.messages).toEqual([expect.objectContaining({ body: "When do you plan to open?", mine: false })]);
  });

  test("nobody else: not another funder, another founder or the administrator", async () => {
    const interest = await showInterest(funder, await makePlan(owner));
    for (const user of [otherFunder, otherOwner, admin, null]) {
      expect(await getInterestConversation(interest._id, user)).toBeNull();
    }
    const path = `/api/interests/${interest._id}/messages`;
    expect((await call(GET, otherFunder, path, interest._id)).status).toBe(404);
    expect((await call(GET, otherOwner, path, interest._id)).status).toBe(404);
    expect((await call(POST, otherFunder, path, interest._id, { method: "POST", body: { body: "Hello" } })).status).toBe(404);
  });

  test("not a suspended account, even the owner or the funder", async () => {
    const interest = await showInterest(funder, await makePlan(owner));
    expect(await getInterestConversation(interest._id, { ...owner, status: "suspended" })).toBeNull();
    expect(await getInterestConversation(interest._id, { ...funder, status: "suspended" })).toBeNull();
  });

  test("a pending or declined interest has no conversation", async () => {
    for (const status of ["pending", "declined"]) {
      const interest = await showInterest(funder, await makePlan(owner), status);
      expect(await getInterestConversation(interest._id, owner)).toBeNull();
      expect(await getInterestConversation(interest._id, funder)).toBeNull();
    }
  });

  test("an id that is not an interest id is simply not found", async () => {
    expect(await getInterestConversation("not-an-id", owner)).toBeNull();
  });
});

describe("a closed conversation", () => {
  test("stays readable when the owner stops sharing the plan, and opens again when it is shared", async () => {
    const plan = await makePlan(owner);
    const interest = await showInterest(funder, plan);
    await sendInterestMessage(await getInterestConversation(interest._id, funder), funder, "When do you plan to open?");
    await plan.updateOne({ shared: false });

    const closedText = "The plan is no longer shared, so the conversation is closed.";
    const conversation = await getInterestConversation(interest._id, owner);
    expect(conversation).toMatchObject({ canSend: false, closedReason: "unshared" });
    expect((await listInterestMessages(conversation.interest, owner.id)).map((m) => m.body)).toEqual(["When do you plan to open?"]);
    await expect(sendInterestMessage(conversation, owner, "Next spring.")).rejects.toMatchObject({ status: 409, message: closedText });

    const path = `/api/interests/${interest._id}/messages`;
    expect((await call(GET, funder, path, interest._id)).body).toMatchObject({ canSend: false, closedReason: "unshared", closedText });
    const refused = await call(POST, funder, path, interest._id, { method: "POST", body: { body: "Hello?" } });
    expect(refused).toMatchObject({ status: 409, body: { error: closedText } });

    // The interest stays accepted, so sharing the plan again opens the conversation again.
    await plan.updateOne({ shared: true });
    expect(await getInterestConversation(interest._id, funder)).toMatchObject({ canSend: true, closedReason: null });
  });

  test("says so when an administrator hides the plan", async () => {
    const interest = await showInterest(funder, await makePlan(owner, { hiddenByAdmin: true }));
    const conversation = await getInterestConversation(interest._id, funder);
    expect(conversation).toMatchObject({ canSend: false, closedReason: "hidden" });
    await expect(sendInterestMessage(conversation, funder, "Hello?")).rejects.toMatchObject({
      status: 409,
      message: "An administrator has hidden the plan from funders, so the conversation is closed.",
    });
  });

  test("says whose account is no longer active", async () => {
    const [someOwner, someFunder] = await Promise.all([makeUser("entrepreneur"), makeUser("funder")]);
    const interest = await showInterest(someFunder, await makePlan(someOwner));

    await User.updateOne({ _id: someOwner.id }, { status: "suspended" });
    const asFunder = await getInterestConversation(interest._id, someFunder);
    expect(asFunder).toMatchObject({ canSend: false, closedReason: "inactive" });
    expect(whyInterestClosed(asFunder)).toBe("The plan owner's account is no longer active, so the conversation is closed.");

    await User.updateOne({ _id: someOwner.id }, { status: "active" });
    await User.updateOne({ _id: someFunder.id }, { status: "suspended" });
    const asOwner = await getInterestConversation(interest._id, someOwner);
    expect(asOwner).toMatchObject({ canSend: false, closedReason: "inactive" });
    expect(whyInterestClosed(asOwner)).toBe("The funder's account is no longer active, so the conversation is closed.");
  });
});

describe("reading the messages", () => {
  test(`the first load shows the newest ${MAX_MESSAGES} messages of a long conversation, oldest first`, async () => {
    const interest = await showInterest(funder, await makePlan(owner));
    const start = Date.now() - 24 * 60 * 60 * 1000;
    await InterestMessage.insertMany(
      Array.from({ length: MAX_MESSAGES + 5 }, (_, i) => ({
        interestId: interest._id,
        authorId: i % 2 ? owner.id : funder.id,
        body: `Message ${i}`,
        createdAt: new Date(start + i * 1000),
      })),
    );

    const first = await listInterestMessages(interest, owner.id);
    expect(first).toHaveLength(MAX_MESSAGES);
    expect([first[0].body, first.at(-1).body]).toEqual(["Message 5", `Message ${MAX_MESSAGES + 4}`]);

    // With `after`, the list goes forward from that moment, oldest first.
    const later = await listInterestMessages(interest, owner.id, { after: new Date(start) });
    expect(later).toHaveLength(MAX_MESSAGES);
    expect(later[0].body).toBe("Message 1");
  });
});

describe("what funders can find", () => {
  test("a suspended owner's plans leave Discover, and the count leaves them out too", async () => {
    const [active, suspended] = await Promise.all([makeUser("entrepreneur"), makeUser("entrepreneur")]);
    // Only this test makes Fujairah retail plans, so the filter shows just these two.
    const filter = { emirate: "fujairah", sector: "retail" };
    const shown = await makePlan(active, filter);
    await makePlan(suspended, filter);
    await User.updateOne({ _id: suspended.id }, { status: "suspended" });

    const { cards, total } = await listPitchCards(filter);
    expect(cards.map((card) => String(card._id))).toEqual([String(shown._id)]);
    expect(total).toBe(1);

    // They come back once the account is active again.
    await User.updateOne({ _id: suspended.id }, { status: "active" });
    expect((await listPitchCards(filter)).total).toBe(2);
  });

  test("a suspended owner's plan takes no new interest", async () => {
    const [active, suspended, someFunder] = await Promise.all([
      makeUser("entrepreneur"),
      makeUser("entrepreneur", "suspended"),
      makeUser("funder"),
    ]);
    const open = await makePlan(active);
    const closed = await makePlan(suspended);
    expect(await findSharedPlan(closed._id)).toBeNull();
    expect(await findSharedPlan(open._id)).toMatchObject({ title: "Karak café" });

    await FunderProfile.create({
      userId: someFunder.id,
      organization: "Gulf Angels",
      funderType: "angel",
      ticketMinAed: 50000,
      ticketMaxAed: 250000,
      sectors: ["food_beverage"],
      bio: "I invest in small food and drink businesses across the UAE.",
    });
    const body = { message: "I invest in small food businesses and would like to see the full plan." };
    const refused = await call(sendInterest, someFunder, `/api/plans/${closed._id}/interest`, closed._id, { method: "POST", body });
    expect(refused.status).toBe(404);
    const sent = await call(sendInterest, someFunder, `/api/plans/${open._id}/interest`, open._id, { method: "POST", body });
    expect(sent.status).toBe(201);
  });

  test("Discover shows the newest plans first, a page at a time, and a page past the end shows the last page", async () => {
    const someOwner = await makeUser("entrepreneur");
    // Only this test makes Ajman education plans.
    const filter = { emirate: "ajman", sector: "education" };
    for (let i = 0; i < 5; i++) {
      await makePlan(someOwner, { ...filter, title: `School ${i}`, createdAt: new Date(Date.now() - (5 - i) * 60_000) });
    }

    const second = await listPitchCards({ ...filter, page: 2, pageSize: 2 });
    expect(second).toMatchObject({ total: 5, page: 2 });
    expect(second.cards.map((card) => card.title)).toEqual(["School 2", "School 1"]);

    const past = await listPitchCards({ ...filter, page: 9, pageSize: 2 });
    expect(past.page).toBe(3);
    expect(past.cards.map((card) => card.title)).toEqual(["School 0"]);
  });
});
