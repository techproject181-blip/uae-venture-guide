import mongoose from "mongoose";
import { describe, expect, test } from "vitest";
import { ROADMAP_SCHEMA, sanitiseRoadmap } from "@/lib/roadmap/ai-planner";

// The checks on the AI's roadmap, with no AI and no database: plain fees and
// sources stand in for the ones the planner loads.

const newId = () => new mongoose.Types.ObjectId();
const det = { _id: newId(), title: "Business licences in Dubai", emirate: "dubai", categories: ["licensing"] };
const icp = { _id: newId(), title: "Residence visas and Emirates ID", emirate: null, categories: ["visas"] };

const fee = (fields) => ({
  _id: newId(),
  sourceId: det._id,
  item: fields.kind,
  emirate: "dubai",
  jurisdiction: "mainland",
  recurrence: "one_time",
  demo: false,
  ...fields,
});
const fees = {
  tradeName: fee({ kind: "trade_name", amountMinAed: 620, amountMaxAed: 620 }),
  demoLicence: fee({ kind: "trade_licence", amountMinAed: 12000, amountMaxAed: 18000, recurrence: "yearly", demo: true }),
  freeZoneLicence: fee({
    kind: "trade_licence",
    jurisdiction: "free_zone",
    amountMinAed: 30000,
    amountMaxAed: 50000,
    recurrence: "yearly",
  }),
  emiratesId: fee({ kind: "emirates_id", sourceId: icp._id, emirate: null, jurisdiction: "any", amountMinAed: 370, amountMaxAed: 370 }),
};

/** What the planner passes in: the founder's answers and the fees and sources it loaded. */
const given = (answers = {}) => ({
  intake: {
    title: "Karak café",
    emirate: "dubai",
    sector: "food_beverage",
    jurisdictionPref: "mainland",
    budgetAed: 150000,
    teamSize: 1,
    ...answers,
  },
  fees: Object.values(fees),
  sources: [det, icp],
});

/** One step as the model writes it; pass fields to change. */
const step = (fields = {}) => ({
  phase: "licence",
  title: "Pay for your trade licence",
  description: "Pay the fee and collect the licence.",
  authority: "Dubai Department of Economy and Tourism",
  feeId: null,
  sourceId: null,
  estimateMinAed: 10000,
  estimateMaxAed: 20000,
  recurrence: "yearly",
  days: 7,
  budgetCategory: "licensing",
  budgetLabel: "Trade licence",
  ...fields,
});

const RISK = {
  title: "Costs are higher than planned",
  description: "Fees and rent often rise.",
  likelihood: "medium",
  impact: "high",
  mitigation: "Keep three months of costs in reserve.",
};

/** A whole answer as the model writes it; pass fields to change. */
const answer = (fields = {}) => ({
  summary: "A plan to open a karak café in Dubai.",
  recommendedJurisdiction: "mainland",
  jurisdictionReason: "Your customers visit in person, which is what a mainland licence is for.",
  tasks: [step()],
  documents: [{ name: "Passport copy", description: "A clear colour copy.", required: true, sourceId: null }],
  risks: [RISK],
  ...fields,
});

const firstTask = (roadmap) => roadmap.tasks[0];

describe("costs in an AI roadmap", () => {
  test("take the amounts, how often they are paid, the Official label and the source from a fee the step cites, never from the model", () => {
    const cites = step({
      phase: "prepare",
      title: "Reserve your trade name",
      feeId: String(fees.tradeName._id),
      sourceId: String(icp._id),
      estimateMinAed: 1,
      estimateMaxAed: 99999,
      recurrence: "monthly",
      budgetLabel: "Trade name reservation",
    });
    const roadmap = sanitiseRoadmap(answer({ tasks: [cites] }), given());
    expect(firstTask(roadmap)).toMatchObject({
      costBasis: "reference",
      costMinAed: 620,
      costMaxAed: 620,
      feeReferenceId: fees.tradeName._id,
      sourceIds: [det._id],
    });
    expect(roadmap.budgetItems[0]).toMatchObject({
      label: "Trade name reservation",
      estimatedAed: 620,
      recurrence: "one_time",
      costBasis: "reference",
      feeReferenceId: fees.tradeName._id,
    });
  });

  test("are marked as demo fees when the fee comes from the demo data", () => {
    const roadmap = sanitiseRoadmap(answer({ tasks: [step({ feeId: String(fees.demoLicence._id) })] }), given());
    expect(firstTask(roadmap)).toMatchObject({ costBasis: "demo", costMinAed: 12000, costMaxAed: 18000 });
    expect(roadmap.budgetItems[0]).toMatchObject({ costBasis: "demo", estimatedAed: 15000, recurrence: "yearly" });
  });

  test("are estimates when the step cites a fee id the model was not given", () => {
    for (const feeId of [String(newId()), "trade-licence-fee", 42]) {
      const task = firstTask(sanitiseRoadmap(answer({ tasks: [step({ feeId })] }), given()));
      expect(task).toMatchObject({ costBasis: "estimate", costMinAed: 10000, costMaxAed: 20000 });
      expect(task.feeReferenceId).toBeUndefined();
    }
  });

  test("are estimates when the fee is for the other kind of company, while a fee for any company counts", () => {
    const roadmap = sanitiseRoadmap(
      answer({
        tasks: [step({ feeId: String(fees.freeZoneLicence._id) }), step({ phase: "visas", feeId: String(fees.emiratesId._id) })],
      }),
      given({ jurisdictionPref: "mainland" }),
    );
    expect(roadmap.tasks.map((task) => task.costBasis)).toEqual(["estimate", "reference"]);
  });

  test("are whole dirhams, never negative, lowest first and no more than the forms accept", () => {
    const roadmap = sanitiseRoadmap(
      answer({
        tasks: [
          step({ estimateMinAed: 25000.6, estimateMaxAed: -40 }),
          step({ estimateMinAed: "a lot", estimateMaxAed: 1e12, days: 9999 }),
          step({ days: -3 }),
        ],
      }),
      given(),
    );
    expect(roadmap.tasks.map((task) => [task.costMinAed, task.costMaxAed])).toEqual([
      [0, 25001],
      [0, 10_000_000],
      [10000, 20000],
    ]);
    expect(roadmap.tasks.map((task) => task.estDays)).toEqual([7, 365, 0]);
  });
});

describe("sources in an AI roadmap", () => {
  test("keep only the ids the model was given", () => {
    const roadmap = sanitiseRoadmap(
      answer({
        tasks: [step({ sourceId: String(det._id) }), step({ sourceId: String(newId()) })],
        documents: [
          { name: "Passport copy", description: "", required: true, sourceId: String(icp._id) },
          { name: "Passport-size photo", description: "", required: true, sourceId: "not-a-source" },
        ],
      }),
      given(),
    );
    expect(roadmap.tasks.map((task) => task.sourceIds)).toEqual([[det._id], []]);
    expect(roadmap.documents.map((doc) => doc.sourceId)).toEqual([icp._id, undefined]);
  });
});

describe("the licence in an AI roadmap", () => {
  test("is the founder's own choice whatever the model recommends, with the reason for that choice", () => {
    const roadmap = sanitiseRoadmap(
      answer({ recommendedJurisdiction: "free_zone", jurisdictionReason: "A free zone package is cheaper." }),
      given({ jurisdictionPref: "mainland" }),
    );
    expect(roadmap.recommendedJurisdiction).toBe("mainland");
    expect(roadmap.jurisdictionReason).toContain("You chose mainland");
  });

  test("keeps the model's reason when it agrees with the founder's choice", () => {
    const roadmap = sanitiseRoadmap(answer(), given({ jurisdictionPref: "mainland" }));
    expect(roadmap.jurisdictionReason).toBe("Your customers visit in person, which is what a mainland licence is for.");
  });

  test("follows the model when the founder is not sure, and its fees then fit that choice", () => {
    const roadmap = sanitiseRoadmap(
      answer({
        recommendedJurisdiction: "free_zone",
        jurisdictionReason: "You sell online, so a free zone package is simplest.",
        tasks: [step({ feeId: String(fees.freeZoneLicence._id) })],
      }),
      given({ jurisdictionPref: "unsure", sector: "technology" }),
    );
    expect(roadmap).toMatchObject({
      recommendedJurisdiction: "free_zone",
      jurisdictionReason: "You sell online, so a free zone package is simplest.",
    });
    expect(firstTask(roadmap)).toMatchObject({ costBasis: "reference", costMaxAed: 50000 });
  });

  test("falls back to the sample planner's pick when the model gives no usable one", () => {
    const roadmap = sanitiseRoadmap(
      answer({ recommendedJurisdiction: "offshore", jurisdictionReason: "" }),
      given({ jurisdictionPref: "unsure" }),
    );
    expect(roadmap.recommendedJurisdiction).toBe("mainland"); // a café's customers come in person
    expect(roadmap.jurisdictionReason).toContain("mainland licence");
  });
});

describe("the budget of an AI roadmap", () => {
  test("has a line for each step that costs money, citing its fee, and the usual running costs", () => {
    const roadmap = sanitiseRoadmap(
      answer({
        tasks: [
          step({
            phase: "prepare",
            title: "Reserve your trade name",
            feeId: String(fees.tradeName._id),
            budgetLabel: "Trade name reservation",
          }),
          step({ phase: "prepare", title: "Choose your business activity", estimateMinAed: 0, estimateMaxAed: 0 }),
          step({
            phase: "launch",
            title: "Plan your launch marketing",
            estimateMinAed: 2000,
            estimateMaxAed: 8000,
            recurrence: "one_time",
            budgetCategory: "marketing",
            budgetLabel: " ",
          }),
        ],
      }),
      given({ teamSize: 3 }),
    );
    expect(roadmap.budgetItems).toEqual([
      {
        category: "licensing",
        label: "Trade name reservation",
        estimatedAed: 620,
        recurrence: "one_time",
        costBasis: "reference",
        feeReferenceId: fees.tradeName._id,
        origin: "planner",
      },
      // A blank budget name falls back to the step's title.
      {
        category: "marketing",
        label: "Plan your launch marketing",
        estimatedAed: 5000,
        recurrence: "one_time",
        costBasis: "estimate",
        origin: "planner",
      },
      {
        category: "technology",
        label: "Website, software and phone",
        estimatedAed: 500,
        recurrence: "monthly",
        costBasis: "estimate",
        origin: "planner",
      },
      {
        category: "marketing",
        label: "Ongoing marketing",
        estimatedAed: 1500,
        recurrence: "monthly",
        costBasis: "estimate",
        origin: "planner",
      },
      {
        category: "staff",
        label: "Salaries for 2 employees",
        estimatedAed: 10000,
        recurrence: "monthly",
        costBasis: "estimate",
        origin: "planner",
      },
    ]);
  });
});

describe("the rest of an AI roadmap", () => {
  test("puts the steps in phase order, keeping the model's order inside a phase", () => {
    const roadmap = sanitiseRoadmap(
      answer({
        tasks: [
          step({ phase: "launch", title: "Open" }),
          step({ phase: "prepare", title: "First" }),
          step({ phase: "prepare", title: "Second" }),
        ],
      }),
      given(),
    );
    expect(roadmap.phases.map((phase) => phase.title)).toEqual([
      "Prepare",
      "Licence and premises",
      "Visas and identity",
      "Bank and tax",
      "Launch",
    ]);
    expect(roadmap.tasks.map((task) => task.title)).toEqual(["First", "Second", "Open"]);
    expect(roadmap.tasks[0].phaseId).toBe(roadmap.phases[0]._id);
    expect(roadmap.tasks[2].phaseId).toBe(roadmap.phases[4]._id);
  });

  test("keeps text within what a plan can store, and drops documents and risks it cannot use", () => {
    const roadmap = sanitiseRoadmap(
      answer({
        tasks: [step({ title: `Reserve ${"a".repeat(300)}`, description: "  Pay   the\nfee.  " })],
        documents: [
          { name: "", description: "A document with no name.", required: true, sourceId: null },
          { name: "Passport-size photo", description: "", required: false, sourceId: null },
        ],
        risks: [{ ...RISK, title: "Unclear", likelihood: "very high" }, RISK],
      }),
      given(),
    );
    expect(firstTask(roadmap).title).toHaveLength(160);
    expect(firstTask(roadmap).title.endsWith("…")).toBe(true);
    expect(firstTask(roadmap).description).toBe("Pay the fee.");
    expect(roadmap.documents).toEqual([{ name: "Passport-size photo", description: "", required: false, obtained: false }]);
    expect(roadmap.risks.map((risk) => risk.title)).toEqual(["Costs are higher than planned"]);
  });
});

describe("an AI answer that cannot be used", () => {
  test.each([
    ["nothing", null],
    ["text instead of a roadmap", "Here is your roadmap"],
    ["no list of steps", answer({ tasks: "none" })],
    ["no steps", answer({ tasks: [] })],
    ["only steps in unknown phases or without titles", answer({ tasks: [step({ phase: "someday" }), step({ title: "   " })] })],
    ["no summary", answer({ summary: "" })],
  ])("throws when it has %s, so the plan is marked failed", (_, bad) => {
    expect(() => sanitiseRoadmap(bad, given())).toThrow();
  });
});

describe("the schema the model must follow", () => {
  /** Every object in a JSON Schema, the schema itself included. */
  function objectsIn(schema) {
    if (schema.type === "array") return objectsIn(schema.items);
    if (schema.type !== "object") return [];
    return [schema, ...Object.values(schema.properties).flatMap(objectsIn)];
  }

  test("is strict: each object requires all its fields and allows no others", () => {
    const objects = objectsIn(ROADMAP_SCHEMA);
    expect(objects).toHaveLength(4); // the roadmap, a step, a document and a risk
    for (const object of objects) {
      expect(object.additionalProperties).toBe(false);
      expect([...object.required].sort()).toEqual(Object.keys(object.properties).sort());
    }
  });
});
