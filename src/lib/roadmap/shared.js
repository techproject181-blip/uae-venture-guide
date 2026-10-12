import { connectDB } from "../db.js";
import { FeeReference } from "../../models/FeeReference.js";
import { Source } from "../../models/Source.js";

// What both planners use: the sample planner (generate.js) and the AI planner
// (ai-planner.js) get the same fees and sources, make costs from a fee the same
// way, and turn costs into budget lines the same way.
// Imports are relative (not "@/...") so scripts/seed.mjs can run this file in plain Node.

// Sectors whose customers usually come in person, which suits a mainland licence.
export const LOCAL_SECTORS = ["food_beverage", "retail", "health_wellness", "tourism_events", "education"];

/**
 * The fees and official sources a roadmap in `emirate` may use: the active ones
 * for that emirate or the whole UAE. A fee is used only while its source is
 * active too, so hiding a source also stops its fees.
 */
export async function loadReferences(emirate) {
  await connectDB();
  const near = { active: true, emirate: { $in: [emirate, null] } };
  const activeSourceIds = await Source.find({ active: true }).distinct("_id");
  const [fees, sources] = await Promise.all([
    FeeReference.find({ ...near, sourceId: { $in: activeSourceIds } }).lean(),
    Source.find(near).lean(),
  ]);
  return { fees, sources };
}

/** Whether a fee applies to a mainland or free zone company, as `jurisdiction` says. */
export function feeFits(fee, jurisdiction) {
  return fee.jurisdiction === jurisdiction || fee.jurisdiction === "any";
}

/**
 * A step's cost taken from a fee reference: its amounts, how often it is paid,
 * and its source. A fee from the demo data was never checked, so it is marked
 * "demo", not official.
 */
export function feeCost(fee) {
  return {
    min: fee.amountMinAed,
    max: fee.amountMaxAed,
    basis: fee.demo ? "demo" : "reference",
    feeId: fee._id,
    sourceId: fee.sourceId,
    recurrence: fee.recurrence,
  };
}

/** The budget line for a step's cost: the middle of its range, citing the fee it comes from, if any. */
export function budgetItem({ category, label }, cost) {
  return {
    category,
    label,
    estimatedAed: Math.round((cost.min + cost.max) / 2),
    recurrence: cost.recurrence,
    costBasis: cost.basis,
    feeReferenceId: cost.feeId,
    origin: "planner",
  };
}

/** Monthly costs every new business has, as estimates the entrepreneur can edit. */
export function runningCosts({ teamSize }) {
  const items = [
    { category: "technology", label: "Website, software and phone", estimatedAed: 500, recurrence: "monthly" },
    { category: "marketing", label: "Ongoing marketing", estimatedAed: 1500, recurrence: "monthly" },
  ];
  if (teamSize > 1) {
    items.push({
      category: "staff",
      label: `Salaries for ${teamSize - 1} ${teamSize === 2 ? "employee" : "employees"}`,
      estimatedAed: 5000 * (teamSize - 1),
      recurrence: "monthly",
    });
  }
  return items.map((item) => ({ ...item, costBasis: "estimate", origin: "planner" }));
}

/**
 * Mainland or free zone, with the reason. The founder's own choice stands, and
 * the reason says what it means for a business like theirs; a founder who is
 * not sure gets the one that suits the sector.
 */
export function recommendJurisdiction({ jurisdictionPref, sector }) {
  const local = LOCAL_SECTORS.includes(sector);
  if (jurisdictionPref === "mainland") {
    return {
      jurisdiction: "mainland",
      reason: local
        ? "You chose mainland, which suits a business with walk-in customers: you can trade directly with customers across the UAE. " +
          "In return you need a shop or office with a registered lease, often the biggest setup cost."
        : "You chose mainland. You can trade directly with customers across the UAE, but you need an office with a registered lease. " +
          "For a business that works online or from a desk, a free zone package is often cheaper.",
    };
  }
  if (jurisdictionPref === "free_zone") {
    return {
      jurisdiction: "free_zone",
      reason: local
        ? "You chose a free zone. Its package often includes the licence, a desk and a visa allowance in one price. " +
          "But a business with walk-in customers, like a shop or café, usually needs a mainland licence " +
          "or a local distributor to sell to the public."
        : "You chose a free zone, which suits a business that works online or from a shared desk. " +
          "Its package often includes the licence, a desk and a visa allowance in one price. " +
          "Check its rules before you sell directly to customers on the mainland.",
    };
  }
  if (local) {
    return {
      jurisdiction: "mainland",
      reason: "Your customers will mostly visit you in person in the emirate, which is what a mainland licence is for.",
    };
  }
  return {
    jurisdiction: "free_zone",
    reason: "Your business can work online or from a shared desk, and a free zone package is usually the simplest way to start.",
  };
}
