import { beforeAll, describe, expect, test } from "vitest";
import { generateRoadmap } from "@/lib/roadmap/generate";
import { FeeReference } from "@/models/FeeReference";
import { setupTestDatabase } from "../helpers/database";
import { addReferenceData, intake } from "../helpers/reference-data";

setupTestDatabase("roadmap");

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
