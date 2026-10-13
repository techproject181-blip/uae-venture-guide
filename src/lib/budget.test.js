import { describe, expect, test } from "vitest";
import { estimatedWeeks, firstYearCost, firstYearTotal, paidTotal, progressPercent, remainingBudget, totalsByCategory } from "@/lib/budget";

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
    { category: "office", estimatedAed: 2000, actualAed: 4000, recurrence: "monthly" }, // two months of rent paid so far
    { category: "licensing", estimatedAed: 1000, actualAed: null, recurrence: "yearly" },
    { category: "marketing", estimatedAed: 500, recurrence: "monthly" },
  ];

  test("adds up the first year of estimates", () => {
    expect(firstYearTotal(items)).toBe(15000 + 2000 * 12 + 1000 + 500 * 12);
  });

  test("adds up what was actually paid as entered, never 12 times for a monthly cost", () => {
    expect(paidTotal(items)).toBe(16000 + 4000);
  });

  test("counts nothing as paid for costs not paid yet", () => {
    expect(paidTotal([{ estimatedAed: 500, recurrence: "monthly" }])).toBe(0);
  });

  test("groups the first-year estimate and what was paid by category", () => {
    expect(totalsByCategory(items)).toEqual({
      licensing: { estimated: 16000, actual: 16000 },
      office: { estimated: 24000, actual: 4000 },
      marketing: { estimated: 6000, actual: 0 },
    });
  });

  test("gives category amounts that add up to the same totals as the page shows", () => {
    const totals = Object.values(totalsByCategory(items));
    expect(totals.reduce((sum, total) => sum + total.estimated, 0)).toBe(firstYearTotal(items));
    expect(totals.reduce((sum, total) => sum + total.actual, 0)).toBe(paidTotal(items));
  });

  test("gives a negative remaining budget when the plan is over budget", () => {
    expect(remainingBudget(50000, items)).toBe(4000);
    expect(remainingBudget(40000, items)).toBe(-6000);
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
