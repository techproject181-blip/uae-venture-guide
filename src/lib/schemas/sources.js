import { z } from "zod";
import { EMIRATES, FEE_KINDS, JURISDICTIONS, RECURRENCES, SOURCE_CATEGORIES, valuesOf } from "@/lib/constants";
import { aed, checkbox, multiChoice, optionalText, webUrl } from "@/lib/schemas/helpers";

// "" in the emirate drop-down means federal (all emirates), stored as null.
const emirate = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.enum(valuesOf(EMIRATES), "Choose an emirate.").nullable(),
);

// Checked against the current time on every call, with a day of slack for time zones.
const checkedOn = z.coerce
  .date("Enter the date you checked the page.")
  .refine((date) => date.getTime() <= Date.now() + 24 * 60 * 60 * 1000, "The date cannot be in the future.");

export const sourceSchema = z.object({
  title: z.string("Enter a title.").trim().min(3, "Enter a title.").max(160, "Use 160 characters or fewer."),
  publisher: z
    .string("Enter who publishes this page.")
    .trim()
    .min(2, "Enter who publishes this page.")
    .max(120, "Use 120 characters or fewer."),
  url: webUrl(),
  emirate,
  categories: multiChoice(valuesOf(SOURCE_CATEGORIES), "Choose valid categories.").refine(
    (list) => list.length > 0,
    "Choose at least one category.",
  ),
  summary: z.string("Write a short summary.").trim().min(10, "Write a short summary.").max(600, "Use 600 characters or fewer."),
  verifiedAt: checkedOn,
  active: checkbox(),
  demo: checkbox(),
});

export const feeSchema = z
  .object({
    sourceId: z.string().min(1, "Choose the source of this fee."),
    kind: z.enum(valuesOf(FEE_KINDS), "Choose what this fee is for."),
    item: z.string("Describe the fee.").trim().min(3, "Describe the fee.").max(160, "Use 160 characters or fewer."),
    emirate,
    jurisdiction: z.enum([...valuesOf(JURISDICTIONS), "any"], "Choose where this fee applies."),
    amountMinAed: aed("Enter the lowest amount."),
    amountMaxAed: aed("Enter the highest amount."),
    recurrence: z.enum(valuesOf(RECURRENCES), "Choose how often it is paid."),
    notes: optionalText(400),
    verifiedAt: checkedOn,
    active: checkbox(),
    demo: checkbox(),
  })
  .refine((fee) => fee.amountMaxAed >= fee.amountMinAed, {
    path: ["amountMaxAed"],
    message: "The highest amount cannot be below the lowest.",
  });
