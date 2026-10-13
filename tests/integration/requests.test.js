import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { MentorProfile } from "@/models/MentorProfile";
import { MentorRequest } from "@/models/MentorRequest";
import { Plan } from "@/models/Plan";
import { User } from "@/models/User";
import { setupTestDatabase } from "../helpers/database";

// The routes read the signed-in user from the session cookie and send emails.
// Here the tests choose who is signed in, and keep each email to check it.
const session = vi.hoisted(() => ({ user: null }));
vi.mock("@/lib/session", () => ({ getCurrentUser: async () => session.user }));
const sent = vi.hoisted(() => []);
vi.mock("@/lib/email", () => ({
  appUrl: (path = "") => `http://localhost:3000${path}`,
  sendEmail: async (email) => {
    sent.push(email);
  },
}));

const { POST } = await import("@/app/api/requests/route");
const { PATCH, DELETE } = await import("@/app/api/requests/[id]/route");

setupTestDatabase("requests");

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

async function makeMentor({ status = "active", acceptingRequests = true } = {}) {
  const mentor = await makeUser("mentor", status);
  await MentorProfile.create({ userId: mentor.id, headline: "Café owner", bio: "Ten years of running cafés.", acceptingRequests });
  return mentor;
}

function makePlan(owner, status = "ready") {
  return Plan.create({
    ownerId: owner.id,
    title: "Karak café",
    idea: "A small café selling karak tea and snacks.",
    emirate: "dubai",
    sector: "food_beverage",
    jurisdictionPref: "unsure",
    budgetAed: 60000,
    targetCustomers: "Office workers nearby",
    status,
  });
}

/** Calls a route handler as `user`, like the browser would. */
async function call(handler, user, { id, method = "POST", body } = {}) {
  session.user = user;
  const request = new Request(`http://localhost/api/requests${id ? `/${id}` : ""}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const response = await handler(request, { params: Promise.resolve({ id: String(id) }) });
  return { status: response.status, body: await response.json() };
}

const ask = (mentor, extra = {}) => ({
  mentorId: mentor.id,
  topic: "Choosing a location",
  message: "Could you look at my plan and tell me where to start?",
  ...extra,
});

let founder, otherFounder;
beforeAll(async () => {
  [founder, otherFounder] = await Promise.all([makeUser("entrepreneur"), makeUser("entrepreneur")]);
});

beforeEach(async () => {
  sent.length = 0;
  await MentorRequest.deleteMany({});
});

describe("sending a guidance request", () => {
  test("a founder asks a mentor, with one of their finished plans, and the mentor gets an email", async () => {
    const mentor = await makeMentor();
    const plan = await makePlan(founder);
    const result = await call(POST, founder, { body: ask(mentor, { planId: String(plan._id) }) });
    expect(result.status).toBe(201);

    const saved = await MentorRequest.findById(result.body.id).lean();
    expect(saved).toMatchObject({ status: "pending", topic: "Choosing a location" });
    expect(String(saved.planId)).toBe(String(plan._id));
    expect(sent).toEqual([expect.objectContaining({ to: mentor.email, subject: "New guidance request: Choosing a location" })]);
  });

  test("only a finished plan of the founder's own can go with a request", async () => {
    const mentor = await makeMentor();
    const someoneElses = await makePlan(otherFounder);
    const failed = await makePlan(founder, "failed");

    const notMine = await call(POST, founder, { body: ask(mentor, { planId: String(someoneElses._id) }) });
    expect(notMine.status).toBe(400);
    expect(notMine.body.fieldErrors.planId).toBe("Choose one of your own plans.");

    const unfinished = await call(POST, founder, { body: ask(mentor, { planId: String(failed._id) }) });
    expect(unfinished.status).toBe(400);
    expect(unfinished.body.fieldErrors.planId).toBe("Only a plan with a finished roadmap can be attached.");
    expect(await MentorRequest.countDocuments()).toBe(0);
  });

  test("a mentor who is not taking requests, or whose account is not active, cannot be asked", async () => {
    const busy = await makeMentor({ acceptingRequests: false });
    expect((await call(POST, founder, { body: ask(busy) })).status).toBe(400);

    const suspended = await makeMentor({ status: "suspended" });
    expect((await call(POST, founder, { body: ask(suspended) })).status).toBe(404);
    expect(sent).toEqual([]);
  });

  test("a founder has only one waiting request with each mentor", async () => {
    const mentor = await makeMentor();
    expect((await call(POST, founder, { body: ask(mentor) })).status).toBe(201);
    expect((await call(POST, founder, { body: ask(mentor) })).status).toBe(409);
  });

  test("mentors cannot send requests", async () => {
    const mentor = await makeMentor();
    const other = await makeMentor();
    expect((await call(POST, mentor, { body: ask(other) })).status).toBe(403);
  });
});

describe("answering and withdrawing", () => {
  test("the mentor accepts or declines, and the founder gets an email each time", async () => {
    const mentor = await makeMentor();
    const first = await call(POST, founder, { body: ask(mentor) });
    sent.length = 0;
    const accepted = await call(PATCH, mentor, { id: first.body.id, method: "PATCH", body: { action: "accept" } });
    expect(accepted.body.status).toBe("accepted");

    const second = await call(POST, otherFounder, { body: ask(mentor) });
    const declined = await call(PATCH, mentor, { id: second.body.id, method: "PATCH", body: { action: "decline" } });
    expect(declined.body.status).toBe("declined");

    const subjects = sent.filter((email) => email.subject.startsWith("Your guidance request")).map(({ to, subject }) => ({ to, subject }));
    expect(subjects).toEqual([
      { to: founder.email, subject: "Your guidance request was accepted" },
      { to: otherFounder.email, subject: "Your guidance request was declined" },
    ]);
  });

  test("the founder can withdraw a waiting request, but not an answered one or someone else's", async () => {
    const mentor = await makeMentor();
    const waiting = await call(POST, founder, { body: ask(mentor) });
    expect((await call(DELETE, otherFounder, { id: waiting.body.id, method: "DELETE" })).status).toBe(404);
    expect((await call(DELETE, founder, { id: waiting.body.id, method: "DELETE" })).status).toBe(200);
    expect(await MentorRequest.exists({ _id: waiting.body.id })).toBeNull();

    const answered = await call(POST, founder, { body: ask(mentor) });
    await call(PATCH, mentor, { id: answered.body.id, method: "PATCH", body: { action: "accept" } });
    const late = await call(DELETE, founder, { id: answered.body.id, method: "DELETE" });
    expect(late.status).toBe(400);
    expect(await MentorRequest.exists({ _id: answered.body.id })).not.toBeNull();
  });
});
