import { z } from "zod";
import { BUDGET_CATEGORIES, EMIRATES, JURISDICTION_PREFERENCES, RECURRENCES, SECTORS, TASK_STATUSES, valuesOf } from "@/lib/constants";
import { optionalText, optionalWholeNumber, wholeNumber } from "@/lib/schemas/helpers";

export const intakeSchema = z.object({
  title: z.string("Give the plan a short name.").trim().min(3, "Give the plan a short name.").max(80, "Use 80 characters or fewer."),
  idea: z.string("Describe your idea in a few sentences (at least 30 characters).")
    .trim()
    .min(30, "Describe your idea in a few sentences (at least 30 characters).")
    .max(2000, "Use 2,000 characters or fewer."),
  emirate: z.enum(valuesOf(EMIRATES), "Choose an emirate."),
  sector: z.enum(valuesOf(SECTORS), "Choose a sector."),
  jurisdictionPref: z.enum(valuesOf(JURISDICTION_PREFERENCES), "Choose one of the options."),
  budgetAed: wholeNumber(0, 100_000_000, "Enter your budget in whole dirhams."),
  targetCustomers: z.string("Describe who your customers are.").trim().min(5, "Describe who your customers are.").max(1000, "Use 1,000 characters or fewer."),
  teamSize: wholeNumber(1, 500, "Enter how many people, including you (1 to 500)."),
});

export const taskSchema = z
  .object({
    title: z.string("Give the task a short title.").trim().min(3, "Give the task a short title.").max(160, "Use 160 characters or fewer."),
    description: optionalText(1000),
    phaseId: z.string().min(1, "Choose a phase."),
    estDays: wholeNumber(0, 365, "Enter the number of days (0 to 365)."),
    costMinAed: wholeNumber(0, 10_000_000, "Enter the lowest cost in whole dirhams."),
    costMaxAed: wholeNumber(0, 10_000_000, "Enter the highest cost in whole dirhams."),
  })
  .refine((task) => task.costMaxAed >= task.costMinAed, {
    path: ["costMaxAed"],
    message: "The highest cost cannot be below the lowest.",
  });

export const taskStatusSchema = z.object({
  status: z.enum(valuesOf(TASK_STATUSES), "Choose a valid status."),
});

export const documentSchema = z.object({ obtained: z.boolean() });

export const budgetItemSchema = z.object({
  category: z.enum(valuesOf(BUDGET_CATEGORIES), "Choose a category."),
  label: z.string("Name the cost.").trim().min(2, "Name the cost.").max(120, "Use 120 characters or fewer."),
  estimatedAed: wholeNumber(0, 10_000_000, "Enter the estimated amount in whole dirhams."),
  actualAed: optionalWholeNumber(0, 10_000_000, "Enter the actual amount in whole dirhams, or leave it empty."),
  recurrence: z.enum(valuesOf(RECURRENCES), "Choose how often you pay it."),
});

export const chatSchema = z.object({
  message: z.string("Type a question.").trim().min(2, "Type a question.").max(1000, "Use 1,000 characters or fewer."),
});
