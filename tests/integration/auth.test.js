import bcrypt from "bcryptjs";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { LOCK_MINUTES, LoginAttempt, MAX_FAILURES } from "@/models/LoginAttempt";
import { MentorProfile } from "@/models/MentorProfile";
import { User } from "@/models/User";
import { setupTestDatabase } from "../helpers/database";

// The API routes read the signed-in user from the session cookie, and sign-in
// sets that cookie; here the tests choose who is signed in, and no cookie is set.
const session = vi.hoisted(() => ({ user: null }));
vi.mock("@/lib/session", () => ({ getCurrentUser: async () => session.user, createSession: async () => {} }));
// Emails land in this list instead of being sent.
const outbox = vi.hoisted(() => []);
vi.mock("@/lib/email", () => ({ appUrl: (path = "") => `http://localhost:3000${path}`, sendEmail: async (email) => outbox.push(email) }));

const { POST: signIn } = await import("@/app/api/auth/sign-in/route");
const { POST: changePassword } = await import("@/app/api/account/password/route");
const { PATCH: changeStatus } = await import("@/app/api/admin/users/[id]/route");
const { GET: me } = await import("@/app/api/auth/me/route");

setupTestDatabase("auth");

const PASSWORD = "Rightpass2026";
const WRONG = "Wrongpass2026";
const MINUTE = 60 * 1000;
let passwordHash;

beforeAll(async () => {
  passwordHash = await bcrypt.hash(PASSWORD, 4); // a low cost keeps the tests quick
});

afterEach(() => {
  vi.useRealTimers(); // undoes vi.setSystemTime()
});

// The user object the app passes around after sign-in (see lib/session.js).
async function makeUser(role, status = "active") {
  const user = await User.create({
    name: `Test ${role}`,
    email: `${role}-${Math.random().toString(36).slice(2, 10)}@test.local`,
    passwordHash,
    role,
    status,
  });
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, status: user.status };
}

/** Calls a route handler like the browser would. */
async function call(handler, url, { method = "POST", body, params } = {}) {
  const request = new Request(`http://localhost${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const response = await handler(request, { params: Promise.resolve(params) });
  return { status: response.status, body: await response.json() };
}

const signInWith = (email, password) => call(signIn, "/api/auth/sign-in", { body: { email, password } });

describe("failed sign-ins (NFR-04)", () => {
  test("five wrong passwords lock that email, even for the right password", async () => {
    const user = await makeUser("entrepreneur");
    for (let i = 0; i < MAX_FAILURES; i++) {
      expect(await signInWith(user.email, WRONG)).toMatchObject({ status: 401, body: { error: "Email or password is incorrect." } });
    }

    expect(await signInWith(user.email, PASSWORD)).toMatchObject({
      status: 429,
      body: { error: `Too many failed attempts. Wait ${LOCK_MINUTES} minutes, or reset your password.` },
    });
    // Other emails are not affected.
    const other = await makeUser("entrepreneur");
    expect(await signInWith(other.email, PASSWORD)).toMatchObject({ status: 200, body: { redirectTo: "/dashboard" } });
  });

  test("the lock lasts 15 minutes from the fifth wrong password, not from the first", async () => {
    const user = await makeUser("entrepreneur");
    const start = Date.now();
    // One wrong password every three minutes, so the fifth comes 12 minutes after the first.
    for (let i = 0; i < MAX_FAILURES; i++) {
      vi.setSystemTime(start + i * 3 * MINUTE);
      expect((await signInWith(user.email, WRONG)).status).toBe(401);
    }
    const fifth = start + 12 * MINUTE;

    // 16 minutes after the first wrong password, but only 4 after the fifth.
    vi.setSystemTime(fifth + 4 * MINUTE);
    expect(await signInWith(user.email, PASSWORD)).toMatchObject({
      status: 429,
      body: { error: expect.stringContaining("Wait 11 minutes,") },
    });

    // The tries refused during the lock do not make it longer.
    vi.setSystemTime(fifth + 14.5 * MINUTE);
    expect(await signInWith(user.email, PASSWORD)).toMatchObject({
      status: 429,
      body: { error: expect.stringContaining("Wait 1 minute,") },
    });

    vi.setSystemTime(fifth + LOCK_MINUTES * MINUTE + 1000);
    expect((await signInWith(user.email, PASSWORD)).status).toBe(200);
  });

  test("wrong passwords sent at the same moment cannot get past five", async () => {
    const user = await makeUser("entrepreneur");
    const tries = await Promise.all(Array.from({ length: 12 }, () => signInWith(user.email, WRONG)));
    const statuses = tries.map((result) => result.status);

    expect(statuses.filter((status) => status === 401)).toHaveLength(MAX_FAILURES);
    expect(statuses.filter((status) => status === 429)).toHaveLength(12 - MAX_FAILURES);
    expect((await signInWith(user.email, PASSWORD)).status).toBe(429);
  });

  test("after the lock ends, the right password works and the count starts again", async () => {
    const user = await makeUser("entrepreneur");
    for (let i = 0; i < MAX_FAILURES; i++) await signInWith(user.email, WRONG);

    vi.setSystemTime(Date.now() + LOCK_MINUTES * MINUTE + 1000);
    expect(await signInWith(user.email, PASSWORD)).toMatchObject({ status: 200, body: { redirectTo: "/dashboard" } });
    expect(await LoginAttempt.exists({ email: user.email })).toBeNull();

    // Four new wrong passwords are not enough to lock it again.
    for (let i = 0; i < MAX_FAILURES - 1; i++) expect((await signInWith(user.email, WRONG)).status).toBe(401);
    expect((await signInWith(user.email, PASSWORD)).status).toBe(200);
  });

  test("wrong current passwords on the account page count towards the same lock", async () => {
    const user = await makeUser("entrepreneur");
    session.user = user;
    const change = (currentPassword) =>
      call(changePassword, "/api/account/password", { body: { currentPassword, password: "Newpass2026" } });

    for (let i = 0; i < 3; i++) expect((await signInWith(user.email, WRONG)).status).toBe(401);
    for (let i = 0; i < 2; i++) expect((await change(WRONG)).status).toBe(400);

    expect(await change(PASSWORD)).toMatchObject({
      status: 429,
      body: { error: `Too many failed attempts. Wait ${LOCK_MINUTES} minutes and try again.` },
    });
    expect((await signInWith(user.email, PASSWORD)).status).toBe(429);
  });
});

describe("approving a rejected sign-up (FR-41)", () => {
  let admin;

  beforeAll(async () => {
    admin = await makeUser("admin");
  });

  function setStatus(user, status) {
    session.user = admin;
    return call(changeStatus, `/api/admin/users/${user.id}`, { method: "PATCH", body: { status }, params: { id: user.id } });
  }

  async function rejectedMentor() {
    const mentor = await makeUser("mentor", "pending");
    expect((await setStatus(mentor, "suspended")).status).toBe(200);
    expect(await User.findById(mentor.id).lean()).toMatchObject({ status: "suspended", rejected: true });
    outbox.length = 0;
    return mentor;
  }

  test("is refused while the user has no profile, like any approval", async () => {
    const mentor = await rejectedMentor();

    expect(await setStatus(mentor, "active")).toMatchObject({
      status: 400,
      body: { error: "This user has not filled in their profile yet." },
    });
    expect(await User.findById(mentor.id).lean()).toMatchObject({ status: "suspended", rejected: true });
    expect(outbox).toEqual([]);
  });

  test("works once the profile exists, and sends the approval email", async () => {
    const mentor = await rejectedMentor();
    await MentorProfile.create({ userId: mentor.id, headline: "Ran a café in Sharjah", bio: "I help new food businesses get started." });

    expect(await setStatus(mentor, "active")).toMatchObject({ status: 200, body: { user: { status: "active" } } });
    expect(await User.findById(mentor.id).lean()).toMatchObject({ status: "active", rejected: false });
    expect(outbox).toMatchObject([{ to: mentor.email, subject: "Your UAE Venture Guide account is approved" }]);
  });
});

describe("GET /api/auth/me", () => {
  test("answers like the other API routes: the user while waiting, 403 once suspended, 401 when signed out", async () => {
    const mentor = await makeUser("mentor", "pending");
    const asUser = (user) => {
      session.user = user;
      return call(me, "/api/auth/me", { method: "GET" });
    };

    expect(await asUser(mentor)).toMatchObject({ status: 200, body: { user: { id: mentor.id, status: "pending" } } });
    expect((await asUser({ ...mentor, status: "suspended" })).status).toBe(403);
    expect((await asUser(null)).status).toBe(401);
  });
});
