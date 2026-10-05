import { describe, expect, test } from "vitest";
import { estimatedWeeks, firstYearCost, firstYearTotal, progressPercent, remainingBudget, totalsByCategory } from "@/lib/budget";

describe("firstYearCost", () => {
  test("counts a monthly cost 12 times, and a one-time or yearly cost once", () => {
    expect(firstYearCost(500, "monthly")).toBe(6000);
    expect(firstYearCost(500, "one_time")).toBe(500);
    expect(firstYearCost(500, "yearly")).toBe(500);
  });

  test("counts a missing amount as 0", () => {
    expect(firstYearCost(undefined, "monthly")).toBe(0);
  });
});

describe("budget totals", () => {
  const items = [
    { category: "licensing", estimatedAed: 15000, actualAed: 16000, recurrence: "one_time" },
    { category: "office", estimatedAed: 2000, actualAed: null, recurrence: "monthly" },
    { category: "licensing", estimatedAed: 1000, recurrence: "yearly" },
  ];

  test("adds up the first year of estimates", () => {
    expect(firstYearTotal(items)).toBe(15000 + 2000 * 12 + 1000);
  });

  test("skips items that have no actual amount yet", () => {
    expect(firstYearTotal(items, "actualAed")).toBe(16000);
  });

  test("groups the first-year totals by category", () => {
    expect(totalsByCategory(items)).toEqual({ licensing: 16000, office: 24000 });
  });

  test("gives a negative remaining budget when the plan is over budget", () => {
    expect(remainingBudget(50000, items)).toBe(10000);
    expect(remainingBudget(30000, items)).toBe(-10000);
  });
});

describe("progressPercent", () => {
  test("is the share of tasks that are done, rounded", () => {
    expect(progressPercent([{ status: "done" }, { status: "todo" }, { status: "in_progress" }])).toBe(33);
  });

  test("is 0 for a plan with no tasks", () => {
    expect(progressPercent([])).toBe(0);
  });
});

describe("estimatedWeeks", () => {
  test("adds up the longest step of each phase, because steps in a phase overlap", () => {
    const phases = [{ _id: "prepare" }, { _id: "licence" }];
    const tasks = [
      { phaseId: "prepare", estDays: 7 },
      { phaseId: "prepare", estDays: 14 },
      { phaseId: "licence", estDays: 7 },
    ];
    expect(estimatedWeeks(phases, tasks)).toBe(3);
  });

  test("is at least 1 week", () => {
    expect(estimatedWeeks([{ _id: "prepare" }], [])).toBe(1);
  });
});
