import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { canReadPlan, createNewVersion, createPlanWithRoadmap, newVersionTitle, rebuildRoadmap } from "@/lib/plans";
import { generateRoadmap } from "@/lib/roadmap/generate";
import { FeeReference } from "@/models/FeeReference";
import { FundingInterest } from "@/models/FundingInterest";
import { MentorRequest } from "@/models/MentorRequest";
import { Plan } from "@/models/Plan";
import { User } from "@/models/User";
import { setupTestDatabase } from "../helpers/database";
import { addReferenceData, intake } from "../helpers/reference-data";

setupTestDatabase("roadmap");

// These tests are about the sample planner, so the AI stays off even when
// .env.local has an OpenAI key (the AI planner is tested in ai.test.js).
beforeAll(() => {
  vi.stubEnv("OPENAI_API_KEY", "");
});
afterAll(() => {
  vi.unstubAllEnvs();
});

let sources, fees;
beforeAll(async () => {
  ({ sources, fees } = await addReferenceData());
});

const task = (roadmap, title) => roadmap.tasks.find((t) => t.title.startsWith(title));

describe("official costs", () => {
  test("come from the fee reference for the plan's emirate and jurisdiction, with its source", async () => {
    const roadmap = await generateRoadmap(intake());
    expect(task(roadmap, "Reserve your trade name")).toMatchObject({
      costBasis: "reference",
      costMinAed: 620,
      costMaxAed: 620,
      feeReferenceId: fees.dubaiTradeName._id,
      sourceIds: [sources.det._id],
    });
  });

  test("never come from another emirate's fee or an inactive fee", async () => {
    const roadmap = await generateRoadmap(intake());
    const usedFees = roadmap.tasks.map((t) => String(t.feeReferenceId));
    expect(usedFees).not.toContain(String(fees.abuDhabiTradeName._id));
    expect(usedFees).not.toContain(String(fees.inactiveApproval._id));
    expect(task(roadmap, "Get initial approval")).toMatchObject({ costBasis: "estimate", feeReferenceId: undefined });
  });

  test("never come from an active fee whose source an administrator has hidden", async () => {
    // The only establishment card fee, on the inactive source.
    const hiddenSourceFee = await FeeReference.create({
      sourceId: sources.inactive._id,
      kind: "establishment_card",
      item: "Establishment card",
      emirate: "dubai",
      amountMinAed: 1500,
      amountMaxAed: 1500,
      recurrence: "one_time",
      verifiedAt: new Date(),
    });
    const roadmap = await generateRoadmap(intake());
    expect(task(roadmap, "Get the establishment card")).toMatchObject({ costBasis: "estimate", feeReferenceId: undefined });
    expect(roadmap.budgetItems.map((item) => String(item.feeReferenceId))).not.toContain(String(hiddenSourceFee._id));
  });

  test("are kept on the budget items made from them, so each one cites its fee", async () => {
    const roadmap = await generateRoadmap(intake());
    const item = (label) => roadmap.budgetItems.find((i) => i.label === label);
    expect(item("Trade name reservation")).toMatchObject({ costBasis: "reference", feeReferenceId: fees.dubaiTradeName._id });
    expect(item("Office or shop rent")).toMatchObject({ costBasis: "estimate", feeReferenceId: undefined });
  });

  test("use a federal fee in every emirate", async () => {
    for (const emirate of ["dubai", "fujairah"]) {
      const roadmap = await generateRoadmap(intake({ emirate }));
      expect(task(roadmap, "Get your Emirates ID")).toMatchObject({ costBasis: "reference", costMaxAed: 370 });
    }
  });

  test("from demo data are marked as demo fees, never as official", async () => {
    const demoFee = await FeeReference.create({
      sourceId: sources.det._id,
      kind: "trade_name",
      item: "Trade name reservation",
      emirate: "ajman",
      jurisdiction: "mainland",
      amountMinAed: 500,
      amountMaxAed: 500,
      recurrence: "one_time",
      verifiedAt: new Date(),
      demo: true,
    });
    const roadmap = await generateRoadmap(intake({ emirate: "ajman" }));
    expect(task(roadmap, "Reserve your trade name")).toMatchObject({ costBasis: "demo", costMaxAed: 500, feeReferenceId: demoFee._id });
  });

  test("are only marked official when they match a fee reference exactly", async () => {
    const roadmap = await generateRoadmap(intake({ teamSize: 3 }));
    const byId = new Map(Object.values(fees).map((fee) => [String(fee._id), fee]));
    for (const t of roadmap.tasks.filter((t) => t.costBasis === "reference")) {
      const fee = byId.get(String(t.feeReferenceId));
      expect(fee?.active).toBe(true);
      expect([t.costMinAed, t.costMaxAed]).toEqual([fee.amountMinAed, fee.amountMaxAed]);
    }
  });
});

describe("mainland or free zone", () => {
  test.each([
    ["food_beverage", "unsure", "mainland"],
    ["technology", "unsure", "free_zone"],
    ["technology", "mainland", "mainland"],
    ["food_beverage", "free_zone", "free_zone"],
  ])("a %s business with the choice %s gets %s", async (sector, jurisdictionPref, expected) => {
    const roadmap = await generateRoadmap(intake({ sector, jurisdictionPref }));
    expect(roadmap.recommendedJurisdiction).toBe(expected);
  });

  test.each([
    ["food_beverage", "free_zone", "a mainland licence or a local distributor to sell to the public"],
    ["technology", "free_zone", "Check its rules before you sell directly to customers on the mainland"],
    ["food_beverage", "mainland", "a shop or office with a registered lease"],
    ["technology", "mainland", "a free zone package is often cheaper"],
  ])("a %s business that chose %s is told what that choice means for it", async (sector, jurisdictionPref, tradeOff) => {
    const roadmap = await generateRoadmap(intake({ sector, jurisdictionPref }));
    expect(roadmap.jurisdictionReason).toContain(tradeOff);
  });

  test("a free zone plan uses the free zone's licence fee", async () => {
    const roadmap = await generateRoadmap(intake({ jurisdictionPref: "free_zone" }));
    expect(task(roadmap, "Pay for and collect your trade licence")).toMatchObject({
      costMaxAed: 20000,
      feeReferenceId: fees.dmccLicence._id,
    });
    expect(task(roadmap, "Reserve your trade name")).toBeUndefined();
  });
});

describe("the rest of the roadmap", () => {
  test("adds visa steps and salaries for employees", async () => {
    const roadmap = await generateRoadmap(intake({ teamSize: 3 }));
    expect(task(roadmap, "Get work permits and visas for your 2 employees")).toBeDefined();
    expect(roadmap.budgetItems).toContainEqual(expect.objectContaining({ category: "staff", estimatedAed: 10000, recurrence: "monthly" }));
  });

  test("warns about costs first when the plan is over budget", async () => {
    const roadmap = await generateRoadmap(intake({ budgetAed: 1000 }));
    expect(roadmap.risks[0]).toMatchObject({ title: "Costs are higher than planned", likelihood: "high" });
  });

  test("keeps money out of the summary, because the budget changes as the user edits it", async () => {
    const roadmap = await generateRoadmap(intake());
    expect(roadmap.summary).not.toMatch(/AED|\d{3,}/);
  });
});

describe("fee references", () => {
  const fee = () => ({
    sourceId: sources.det._id,
    kind: "other",
    item: "A test fee",
    amountMinAed: 500,
    amountMaxAed: 100,
    recurrence: "one_time",
    verifiedAt: new Date(),
    active: false, // kept out of every roadmap
  });

  test("cannot be saved with the highest amount below the lowest", async () => {
    await expect(FeeReference.create(fee())).rejects.toThrow("The highest amount cannot be below the lowest.");
  });

  test("cannot be changed to have the highest amount below the lowest", async () => {
    const saved = await FeeReference.create({ ...fee(), amountMaxAed: 500 });
    await expect(
      FeeReference.findByIdAndUpdate(saved._id, { amountMinAed: 900, amountMaxAed: 100 }, { runValidators: true }),
    ).rejects.toThrow("The highest amount cannot be below the lowest.");
  });
});

describe("a plan whose roadmap cannot be saved", () => {
  test("is saved as failed, without a half-made roadmap, and Try again rebuilds it", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(Plan.prototype, "save").mockRejectedValueOnce(new Error("The database did not answer"));
    const plan = await createPlanWithRoadmap(new mongoose.Types.ObjectId(), intake());
    vi.restoreAllMocks();

    expect(await Plan.findById(plan._id).lean()).toMatchObject({
      status: "failed",
      failureReason: "The roadmap could not be made. Please try again.",
      phases: [],
      tasks: [],
      budgetItems: [],
    });
    const retried = await rebuildRoadmap(await Plan.findById(plan._id));
    expect(retried.status).toBe("ready");
    expect(retried.tasks.length).toBeGreaterThan(0);
  });
});

describe("a new version of a plan", () => {
  test("is numbered, instead of stacking endings on the title", () => {
    expect(newVersionTitle("Karak café", ["Karak café"])).toBe("Karak café (version 2)");
    expect(newVersionTitle("Karak café (version 2)", ["Karak café", "Karak café (version 2)"])).toBe("Karak café (version 3)");
    expect(newVersionTitle("Karak café (new version) (new version)", ["Karak café"])).toBe("Karak café (version 2)");
  });

  test("keeps a long title within 80 characters, and still skips numbers in use", () => {
    const long = "A".repeat(80);
    const second = newVersionTitle(long, [long]);
    expect(second).toHaveLength(80);
    expect(second).toMatch(/A \(version 2\)$/);
    expect(newVersionTitle(long, [long, second])).toMatch(/A \(version 3\)$/);
  });

  test("is a new plan from the same answers, numbered among the owner's plans", async () => {
    const first = await createPlanWithRoadmap(new mongoose.Types.ObjectId(), intake());
    const second = await createNewVersion(first);
    const third = await createNewVersion(first); // again from the first, so it takes the next free number
    expect([second.title, third.title]).toEqual(["Karak café (version 2)", "Karak café (version 3)"]);
    expect(second.toObject()).toMatchObject({ status: "ready", idea: first.idea, targetCustomers: first.targetCustomers });
    expect(String(second.ownerId)).toBe(String(first.ownerId));
    expect(await Plan.countDocuments({ ownerId: first.ownerId })).toBe(3);
  });
});

describe("a plan whose owner's account is suspended", () => {
  test("closes to the mentor and funder who could read it, but not to an administrator", async () => {
    const account = (role) =>
      User.create({ name: `Test ${role}`, email: `${role}-${Math.random()}@test.local`, passwordHash: "x", role, status: "active" });
    const [owner, mentor, funder] = await Promise.all([account("entrepreneur"), account("mentor"), account("funder")]);
    const plan = await Plan.create({ ...intake(), ownerId: owner._id, status: "ready", shared: true });
    await MentorRequest.create({
      entrepreneurId: owner._id,
      mentorId: mentor._id,
      planId: plan._id,
      topic: "Licence",
      message: "Can you help?",
      status: "accepted",
    });
    await FundingInterest.create({ funderId: funder._id, planId: plan._id, message: "I would like to know more.", status: "accepted" });
    // The user object the app passes around after sign-in.
    const viewer = (user) => ({ id: String(user._id), role: user.role, status: user.status });
    expect(await canReadPlan(viewer(mentor), plan)).toBe(true);
    expect(await canReadPlan(viewer(funder), plan)).toBe(true);

    await owner.updateOne({ status: "suspended" });
    expect(await canReadPlan(viewer(mentor), plan)).toBe(false);
    expect(await canReadPlan(viewer(funder), plan)).toBe(false);
    expect(await canReadPlan({ id: String(new mongoose.Types.ObjectId()), role: "admin", status: "active" }, plan)).toBe(true);
  });
});
