import { beforeAll, describe, expect, test } from "vitest";
import { canReadPlan } from "@/lib/plans";
import { FundingInterest } from "@/models/FundingInterest";
import { MentorRequest } from "@/models/MentorRequest";
import { Plan } from "@/models/Plan";
import { User } from "@/models/User";
import { setupTestDatabase } from "../helpers/database";

setupTestDatabase("access");

// The user object the app passes around after sign-in (see lib/session.js).
async function makeUser(role, status = "active") {
  const user = await User.create({
    name: `Test ${role}`,
    email: `${role}-${status}-${Math.random()}@test.local`,
    passwordHash: "x",
    role,
    status,
  });
  return { id: String(user._id), role: user.role, status: user.status };
}

async function makePlan(ownerId, extra = {}) {
  return Plan.create({
    ownerId,
    title: "Karak café",
    idea: "A small café beside the university serving karak tea.",
    emirate: "sharjah",
    sector: "food_beverage",
    jurisdictionPref: "unsure",
    budgetAed: 120000,
    targetCustomers: "Students",
    teamSize: 1,
    status: "ready",
    ...extra,
  });
}

function askMentor(mentor, plan, status) {
  return MentorRequest.create({
    entrepreneurId: plan.ownerId,
    mentorId: mentor.id,
    planId: plan._id,
    topic: "Licence",
    message: "Can you help?",
    status,
  });
}

function showInterest(funder, plan, status) {
  return FundingInterest.create({ funderId: funder.id, planId: plan._id, message: "I would like to know more.", status });
}

describe("who may read a plan", () => {
  let owner, plan;

  beforeAll(async () => {
    owner = await makeUser("entrepreneur");
    plan = await makePlan(owner.id, { shared: true });
  });

  test("its owner and the administrator", async () => {
    expect(await canReadPlan(owner, plan)).toBe(true);
    expect(await canReadPlan(await makeUser("admin"), plan)).toBe(true);
  });

  test("not another entrepreneur, and not a signed-out visitor", async () => {
    expect(await canReadPlan(await makeUser("entrepreneur"), plan)).toBe(false);
    expect(await canReadPlan(null, plan)).toBe(false);
  });

  test("not its owner once the account is suspended", async () => {
    expect(await canReadPlan({ ...owner, status: "suspended" }, plan)).toBe(false);
  });

  test("a mentor only while their guidance request is accepted", async () => {
    const mentor = await makeUser("mentor");
    expect(await canReadPlan(mentor, plan)).toBe(false);

    const request = await askMentor(mentor, plan, "pending");
    expect(await canReadPlan(mentor, plan)).toBe(false);

    await request.updateOne({ status: "accepted" });
    expect(await canReadPlan(mentor, plan)).toBe(true);

    await request.updateOne({ status: "completed" });
    expect(await canReadPlan(mentor, plan)).toBe(false);
  });

  test("not a mentor whose account is still waiting for approval", async () => {
    const mentor = await makeUser("mentor", "pending");
    await askMentor(mentor, plan, "accepted");
    expect(await canReadPlan(mentor, plan)).toBe(false);
  });

  test("a funder only after the owner accepts their interest", async () => {
    const funder = await makeUser("funder");
    const interest = await showInterest(funder, plan, "pending");
    expect(await canReadPlan(funder, plan)).toBe(false);

    await interest.updateOne({ status: "accepted" });
    expect(await canReadPlan(funder, plan)).toBe(true);
  });

  test("not a funder once the plan stops being shared or is hidden by the administrator", async () => {
    const funder = await makeUser("funder");
    const unshared = await makePlan(owner.id, { shared: false });
    const hidden = await makePlan(owner.id, { shared: true, hiddenByAdmin: true });
    await showInterest(funder, unshared, "accepted");
    await showInterest(funder, hidden, "accepted");

    expect(await canReadPlan(funder, unshared)).toBe(false);
    expect(await canReadPlan(funder, hidden)).toBe(false);
  });

  test("not a funder whose interest was declined", async () => {
    const funder = await makeUser("funder");
    await showInterest(funder, plan, "declined");
    expect(await canReadPlan(funder, plan)).toBe(false);
  });
});
