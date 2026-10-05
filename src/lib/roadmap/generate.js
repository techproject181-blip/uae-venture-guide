import mongoose from "mongoose";
import { estimatedWeeks, firstYearTotal } from "../budget.js";
import { EMIRATES, JURISDICTIONS, SECTORS, labelOf } from "../constants.js";
import { connectDB } from "../db.js";
import { formatAed } from "../format.js";
import {
  DOCUMENTS,
  LICENSING_AUTHORITIES,
  PHASES,
  SECTOR_RISKS,
  SECTOR_STEPS,
  STEPS,
} from "./templates.js";
import { FeeReference } from "../../models/FeeReference.js";
import { Source } from "../../models/Source.js";

// Imports are relative (not "@/...") so scripts/seed-demo.mjs can run this file in plain Node.
//
// The sample planner builds a startup roadmap from rules and the official fee
// references, while no AI provider is connected. It returns the same shape an
// AI planner will return, so the rest of the app does not change when one is
// added: only generateRoadmap() picks a different planner.

export const GENERATOR = "sample-planner-v1";

// Sectors whose customers usually come in person, which suits a mainland licence.
const LOCAL_SECTORS = ["food_beverage", "retail", "health_wellness", "tourism_events", "education"];

/** Builds the roadmap for a plan's intake answers. */
export async function generateRoadmap(intake) {
  await connectDB();
  const near = { active: true, emirate: { $in: [intake.emirate, null] } };
  const [fees, sources] = await Promise.all([FeeReference.find(near).lean(), Source.find(near).lean()]);

  const { jurisdiction, reason } = recommendJurisdiction(intake);
  const context = { intake, jurisdiction, fees, sources };

  const phases = PHASES.map((phase) => ({ ...phase, _id: new mongoose.Types.ObjectId() }));
  const phaseId = Object.fromEntries(phases.map((phase) => [phase.key, phase._id]));

  const steps = STEPS.filter((step) => !step.only || step.only === jurisdiction);
  if (intake.teamSize > 1) steps.push(teamStep(intake.teamSize - 1, jurisdiction));
  steps.push({ phase: "launch", authority: "", ...SECTOR_STEPS[intake.sector] });
  steps.sort((a, b) => PHASES.findIndex((p) => p.key === a.phase) - PHASES.findIndex((p) => p.key === b.phase));

  const tasks = [];
  const budgetItems = [];
  for (const step of steps) {
    const cost = costFor(step, context);
    tasks.push({
      phaseId: phaseId[step.phase],
      title: step.title,
      description: step.description,
      authority: authorityName(step.authority, context),
      costMinAed: cost.min,
      costMaxAed: cost.max,
      costBasis: cost.basis,
      feeReferenceId: cost.feeId,
      estDays: step.days,
      origin: "planner",
      sourceIds: cost.sourceId ? [cost.sourceId] : sourcesFor(step, context),
    });
    if (step.budget && cost.max > 0) {
      budgetItems.push({
        ...step.budget,
        estimatedAed: Math.round((cost.min + cost.max) / 2),
        recurrence: cost.recurrence,
        costBasis: cost.basis,
        origin: "planner",
      });
    }
  }
  budgetItems.push(...runningCosts(intake));

  const total = firstYearTotal(budgetItems);
  const licensingSource = pickSource(context, jurisdiction === "free_zone" ? "free_zones" : "licensing");
  const documents = DOCUMENTS.filter((doc) => !doc.only || doc.only === jurisdiction).map(({ only, ...doc }) => ({
    ...doc,
    obtained: false,
    sourceId: licensingSource?._id,
  }));

  return {
    generator: GENERATOR,
    generatedAt: new Date(),
    recommendedJurisdiction: jurisdiction,
    jurisdictionReason: reason,
    summary: summaryText({ intake, jurisdiction, tasks, phases }),
    phases: phases.map(({ key, ...phase }) => phase),
    tasks,
    budgetItems,
    documents,
    risks: risksFor({ intake, jurisdiction, total }),
  };
}

function recommendJurisdiction({ jurisdictionPref, sector }) {
  if (jurisdictionPref === "mainland") {
    return { jurisdiction: "mainland", reason: "You chose mainland. A mainland licence lets you trade directly with customers across the UAE." };
  }
  if (jurisdictionPref === "free_zone") {
    return { jurisdiction: "free_zone", reason: "You chose a free zone. Free zone packages usually include the licence, a desk and a visa allowance in one price." };
  }
  if (LOCAL_SECTORS.includes(sector)) {
    return { jurisdiction: "mainland", reason: "Your customers will mostly visit you in person in the emirate, which is what a mainland licence is for." };
  }
  return { jurisdiction: "free_zone", reason: "Your business can work online or from a shared desk, and a free zone package is usually the simplest way to start." };
}

/**
 * The official fee for a step when one exists, otherwise the template's estimate.
 * A fee from the demo data was never checked, so it is marked "demo", not official.
 */
function costFor(step, { intake, jurisdiction, fees }) {
  const fee = step.fee && findFee(fees, step.fee, intake.emirate, jurisdiction);
  if (fee) {
    return {
      min: fee.amountMinAed,
      max: fee.amountMaxAed,
      basis: fee.demo ? "demo" : "reference",
      feeId: fee._id,
      sourceId: fee.sourceId,
      recurrence: fee.recurrence,
    };
  }
  const [min, max] = Array.isArray(step.estimate) ? step.estimate : step.estimate[jurisdiction];
  return { min, max, basis: "estimate", recurrence: step.recurrence ?? "one_time" };
}

/** Prefers a fee for this emirate and jurisdiction, then any jurisdiction, then a federal fee. */
function findFee(fees, kind, emirate, jurisdiction) {
  const ofKind = fees.filter((fee) => fee.kind === kind);
  const fits = (fee) => fee.jurisdiction === jurisdiction || fee.jurisdiction === "any";
  return (
    ofKind.find((fee) => fee.emirate === emirate && fee.jurisdiction === jurisdiction) ??
    ofKind.find((fee) => fee.emirate === emirate && fits(fee)) ??
    ofKind.find((fee) => fee.emirate === null && fits(fee)) ??
    null
  );
}

function sourcesFor(step, context) {
  const category = step.sourceCategory ?? (step.authority === "licensing" ? "licensing" : null);
  const source = category && pickSource(context, category);
  return source ? [source._id] : [];
}

/** A source in this category, preferring the emirate's own over a federal one. */
function pickSource({ intake, sources }, category) {
  const inCategory = sources.filter((source) => source.categories.includes(category));
  return inCategory.find((source) => source.emirate === intake.emirate) ?? inCategory[0] ?? null;
}

function teamStep(employees, jurisdiction) {
  return {
    phase: "visas",
    title: `Get work permits and visas for your ${employees === 1 ? "first employee" : `${employees} employees`}`,
    description: "Each employee needs a work permit and a residence visa sponsored by the company.",
    authority: jurisdiction === "mainland" ? "labour" : "free_zone",
    estimate: [3000 * employees, 6000 * employees],
    days: 14,
    budget: { category: "visa", label: "Employee visas and work permits" },
  };
}

/** Monthly costs every new business has, as estimates the entrepreneur can edit. */
function runningCosts({ teamSize }) {
  const items = [
    { category: "technology", label: "Website, software and phone", estimatedAed: 500, recurrence: "monthly" },
    { category: "marketing", label: "Ongoing marketing", estimatedAed: 1500, recurrence: "monthly" },
  ];
  if (teamSize > 1) {
    items.push({ category: "staff", label: `Salaries for ${teamSize - 1} ${teamSize === 2 ? "employee" : "employees"}`, estimatedAed: 5000 * (teamSize - 1), recurrence: "monthly" });
  }
  return items.map((item) => ({ ...item, costBasis: "estimate", origin: "planner" }));
}

function authorityName(key, { intake, jurisdiction }) {
  const emirate = labelOf(EMIRATES, intake.emirate);
  // The founder still has to pick a free zone, so the step does not name one.
  const freeZone = "Your chosen free zone authority";
  const names = {
    licensing: jurisdiction === "free_zone" ? freeZone : LICENSING_AUTHORITIES[intake.emirate],
    free_zone: freeZone,
    municipality: `${emirate} Municipality`,
    immigration:
      intake.emirate === "dubai"
        ? "General Directorate of Residency and Foreigners Affairs Dubai"
        : "Federal Authority for Identity, Citizenship, Customs and Port Security",
    health: { dubai: "Dubai Health Authority", abu_dhabi: "Department of Health Abu Dhabi" }[intake.emirate] ?? "Emirates Health Services",
    labour: "Ministry of Human Resources and Emiratisation",
    tax: "Federal Tax Authority",
    bank: "Your chosen bank",
    education:
      { dubai: "Knowledge and Human Development Authority", abu_dhabi: "Department of Education and Knowledge", sharjah: "Sharjah Private Education Authority" }[intake.emirate] ??
      "Ministry of Education",
    tourism: { dubai: "Dubai Department of Economy and Tourism", abu_dhabi: "Department of Culture and Tourism Abu Dhabi" }[intake.emirate] ?? `${emirate} tourism department`,
    media: "UAE Media Council",
  };
  return names[key] ?? "";
}

function risksFor({ intake, jurisdiction, total }) {
  const overBudget = total > intake.budgetAed;
  const risks = [
    {
      title: "Costs are higher than planned",
      description: overBudget
        ? `The estimated first-year cost of ${formatAed(total)} is above your budget of ${formatAed(intake.budgetAed)}.`
        : "Fees, rent and setup costs often turn out higher than the first estimate.",
      likelihood: overBudget ? "high" : "medium",
      impact: "high",
      mitigation: "Keep at least three months of costs in reserve, and check every official fee before you pay.",
    },
    {
      title: "Approvals take longer than expected",
      description: "The licence, visa and bank steps can each take a few weeks.",
      likelihood: "medium",
      impact: "medium",
      mitigation: "Prepare all documents early, and start the visa and bank steps as soon as the licence is issued.",
    },
    {
      title: "Too few customers in the first months",
      description: "New businesses often take longer than planned to find paying customers.",
      likelihood: "medium",
      impact: "high",
      mitigation: "Test demand with a small offer before signing long contracts, and track sales every week.",
    },
  ];
  if (jurisdiction === "free_zone" && LOCAL_SECTORS.includes(intake.sector)) {
    risks.push({
      title: "Selling directly to mainland customers may be limited",
      description: "Many free zone licences limit trading directly with customers outside the free zone.",
      likelihood: "medium",
      impact: "medium",
      mitigation: "Check your free zone's rules, or choose a mainland licence if most customers are local.",
    });
  }
  if (SECTOR_RISKS[intake.sector]) risks.push(SECTOR_RISKS[intake.sector]);
  return risks;
}

// The summary leaves out money: costs change as the entrepreneur edits the
// budget, and the pages show the live totals next to it.
function summaryText({ intake, jurisdiction, tasks, phases }) {
  const weeks = estimatedWeeks(phases, tasks);
  const sector = labelOf(SECTORS, intake.sector).toLowerCase();
  const where = labelOf(JURISDICTIONS, jurisdiction).toLowerCase();
  return (
    `A plan to start a ${sector} business in ${labelOf(EMIRATES, intake.emirate)} as a ${where} company. ` +
    `It has ${tasks.length} steps in ${phases.length} phases and takes about ${weeks} weeks.`
  );
}
