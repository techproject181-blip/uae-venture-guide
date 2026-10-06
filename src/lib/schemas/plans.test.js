import { describe, expect, test } from "vitest";
import { fieldErrors } from "@/lib/schemas/helpers";
import { budgetItemSchema, intakeSchema, taskSchema } from "@/lib/schemas/plans";

describe("intakeSchema", () => {
  const form = {
    title: "Karak café near campus",
    idea: "A small café beside the university serving karak tea and sandwiches.",
    emirate: "sharjah",
    sector: "food_beverage",
    jurisdictionPref: "unsure",
    budgetAed: "120000",
    targetCustomers: "University students",
    teamSize: "3",
  };

  test("turns the form's text into numbers", () => {
    expect(intakeSchema.parse(form)).toMatchObject({ budgetAed: 120000, teamSize: 3 });
  });

  test("refuses an emirate that is not on the list", () => {
    const result = intakeSchema.safeParse({ ...form, emirate: "doha" });
    expect(fieldErrors(result.error)).toEqual({ emirate: "Choose an emirate." });
  });

  test("refuses a team of 0 and a budget with fils", () => {
    const result = intakeSchema.safeParse({ ...form, teamSize: "0", budgetAed: "1000.50" });
    expect(Object.keys(fieldErrors(result.error))).toEqual(["budgetAed", "teamSize"]);
  });
});

describe("taskSchema", () => {
  test("refuses a highest cost below the lowest cost", () => {
    const result = taskSchema.safeParse({ title: "Rent a shop", phaseId: "p1", estDays: "5", costMinAed: "500", costMaxAed: "100" });
    expect(fieldErrors(result.error)).toEqual({ costMaxAed: "The highest cost cannot be below the lowest." });
  });
});

describe("budgetItemSchema", () => {
  test("lets the actual amount stay empty until it is known", () => {
    const item = budgetItemSchema.parse({
      category: "office",
      label: "Shop rent",
      estimatedAed: "3000",
      actualAed: "",
      recurrence: "monthly",
    });
    expect(item.actualAed).toBeUndefined();
  });
});
