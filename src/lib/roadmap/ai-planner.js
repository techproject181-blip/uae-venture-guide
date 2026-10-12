import mongoose from "mongoose";
import { aiModel, generateJson } from "../ai/openai.js";
import {
  BUDGET_CATEGORIES,
  EMIRATES,
  FEE_KINDS,
  JURISDICTIONS,
  JURISDICTION_PREFERENCES,
  LEVELS,
  RECURRENCES,
  SECTORS,
  labelOf,
  valuesOf,
} from "../constants.js";
import { budgetItem, feeCost, feeFits, recommendJurisdiction, runningCosts } from "./shared.js";
import { PHASES } from "./templates.js";

// Imports are relative (not "@/...") so scripts/seed.mjs can run this file in plain Node.
//
// The AI planner, used when an OpenAI key is set. The model gets the founder's
// answers and the same fees and sources the sample planner uses, each with its
// id, and sends the roadmap back as JSON in a fixed shape. Every part is
// checked before anything is saved (sanitiseRoadmap below): a cost is official
// only when it cites one of the fees given, and then its amounts come from the
// fee, never from the model.

const PHASE_KEYS = PHASES.map((phase) => phase.key);
const JURISDICTION_VALUES = valuesOf(JURISDICTIONS);
const MAX_AED = 10_000_000; // the most the step and budget forms accept
const MAX_TASKS = 30;
const MAX_DOCUMENTS = 15;
const MAX_RISKS = 10;

const INSTRUCTIONS = `You are the roadmap planner of UAE Venture Guide, which helps people start a business in the United Arab Emirates.
From the founder's answers, write their startup roadmap: the steps in order, what each step costs, the documents to collect and the main risks.

Rules:
- Write short, plain English for someone starting their first business. Do not include links or web addresses.
- Put each step in one of the phases given, in the order the founder does them. Most roadmaps have 10 to 20 steps.
- Use only the fee references and official sources given, and never invent fees, amounts or sources.
- When a fee reference is the cost of a step, put its id in feeId; otherwise feeId is null. A fee for mainland companies does not apply to a free zone company, and the other way round.
- When an official source covers a step or a document, put its id in sourceId; otherwise sourceId is null.
- For every step, also give your own estimate of its cost in whole dirhams, even when you cite a fee. A free step is 0 to 0.
- The app adds the monthly running costs itself (website, software and phone; ongoing marketing; staff salaries), so leave those out.
- If the founder chose mainland or a free zone, keep that choice and explain what it means for this business. If they are not sure, recommend one and say why.
- Keep amounts of money out of the summary: the plan's pages show the live totals next to it.`;

// The JSON the model must send back. In strict mode every object lists all its
// fields in "required", allows no others, and optional values are null.
const text = (description) => ({ type: "string", description });
const idOrNull = (description) => ({ type: ["string", "null"], description });
const oneOf = (values, description) => ({ type: "string", enum: values, description });
const listOf = (properties) => ({
  type: "array",
  items: { type: "object", additionalProperties: false, required: Object.keys(properties), properties },
});

export const ROADMAP_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "recommendedJurisdiction", "jurisdictionReason", "tasks", "documents", "risks"],
  properties: {
    summary: text("Two or three sentences on what the plan covers, with no amounts of money."),
    recommendedJurisdiction: oneOf(JURISDICTION_VALUES, "Mainland or free zone."),
    jurisdictionReason: text("Why this suits the business, in one to three sentences."),
    tasks: listOf({
      phase: oneOf(PHASE_KEYS, "The key of the phase the step belongs to."),
      title: text("A short instruction, for example: Reserve your trade name."),
      description: text("One or two sentences on what to do."),
      authority: text("Who the founder deals with for this step, or an empty string."),
      feeId: idOrNull("The id of the fee reference that is the cost of this step, or null."),
      sourceId: idOrNull("The id of the official source for this step, or null."),
      estimateMinAed: { type: "integer", description: "Your estimate of the lowest cost, in whole dirhams." },
      estimateMaxAed: { type: "integer", description: "Your estimate of the highest cost, in whole dirhams." },
      recurrence: oneOf(valuesOf(RECURRENCES), "How often the cost is paid."),
      days: { type: "integer", description: "About how many days the step takes." },
      budgetCategory: oneOf(valuesOf(BUDGET_CATEGORIES), "The budget category of the cost."),
      budgetLabel: text("A short name for the cost in the budget, for example: Trade licence."),
    }),
    documents: listOf({
      name: text("For example: Passport copy."),
      description: text("One sentence on what is needed."),
      required: { type: "boolean", description: "False when only some founders need it." },
      sourceId: idOrNull("The id of the official source that asks for it, or null."),
    }),
    risks: listOf({
      title: text("A short name for the risk."),
      description: text("One or two sentences."),
      likelihood: oneOf(valuesOf(LEVELS), "How likely it is."),
      impact: oneOf(valuesOf(LEVELS), "How much harm it would do."),
      mitigation: text("What to do about it, in one or two sentences."),
    }),
  },
};

/**
 * Asks the AI for the roadmap and checks it. Throws when the AI fails or its
 * answer is unusable, so the plan is marked failed and "Try again" works.
 */
export async function aiRoadmap(intake, { fees, sources }) {
  const model = aiModel();
  const answer = await generateJson({
    name: "startup_roadmap",
    instructions: INSTRUCTIONS,
    input: roadmapInput(intake, fees, sources),
    schema: ROADMAP_SCHEMA,
  });
  return { generator: `openai:${model}`, generatedAt: new Date(), ...sanitiseRoadmap(answer, { intake, fees, sources }) };
}

/** The founder's answers, the phases, and the only fees and sources the model may cite, each with its id. */
function roadmapInput(intake, fees, sources) {
  const where = (emirate) => (emirate ? labelOf(EMIRATES, emirate) : "All emirates");
  const data = {
    founder: {
      planName: intake.title,
      idea: intake.idea,
      customers: intake.targetCustomers,
      emirate: labelOf(EMIRATES, intake.emirate),
      sector: labelOf(SECTORS, intake.sector),
      mainlandOrFreeZone: labelOf(JURISDICTION_PREFERENCES, intake.jurisdictionPref),
      firstYearBudgetAed: intake.budgetAed,
      peopleInTeam: intake.teamSize,
    },
    phases: PHASES.map(({ key, title, description }) => ({ key, title, description })),
    feeReferences: fees.map((fee) => ({
      id: String(fee._id),
      kind: labelOf(FEE_KINDS, fee.kind),
      item: fee.item,
      emirate: where(fee.emirate),
      forCompanies: fee.jurisdiction === "any" ? "Mainland and free zone" : labelOf(JURISDICTIONS, fee.jurisdiction),
      amountMinAed: fee.amountMinAed,
      amountMaxAed: fee.amountMaxAed,
      paid: labelOf(RECURRENCES, fee.recurrence),
    })),
    officialSources: sources.map((source) => ({
      id: String(source._id),
      title: source.title,
      publisher: source.publisher,
      emirate: where(source.emirate),
      summary: source.summary,
    })),
  };
  return `The founder's answers, the phases, and the only fee references and official sources you may use:\n${JSON.stringify(data)}`;
}

/**
 * Checks the model's roadmap and keeps only what a plan may store, so the
 * accuracy rule holds whatever the model wrote:
 * - a cost is official (or demo) only when the step cites one of the fees given
 *   that fits the plan; its amounts, how often it is paid, its label and its
 *   source then come from the fee. Any other cost is an estimate, in whole
 *   dirhams that are never negative.
 * - source ids the model was not given are dropped;
 * - the founder's own choice of mainland or free zone always wins;
 * - budget lines are made from the step costs, as in the sample planner;
 * - text is cut to the lengths a plan can store.
 * Throws when the answer cannot be used (no summary, no steps), so the plan is
 * marked failed and "Try again" works.
 */
export function sanitiseRoadmap(answer, { intake, fees, sources }) {
  if (!isObject(answer) || ![answer.tasks, answer.documents, answer.risks].every(Array.isArray)) {
    throw new Error("The AI roadmap is missing its steps, documents or risks.");
  }
  const summary = clip(answer.summary, 1000);
  if (!summary) throw new Error("The AI roadmap has no summary.");

  const feesById = new Map(fees.map((fee) => [String(fee._id), fee]));
  const sourceIds = new Map(sources.map((source) => [String(source._id), source._id]));

  // The founder's own choice always wins. The model's reason is kept only when
  // it argues for the licence the plan ends up with.
  const byRules = recommendJurisdiction(intake); // the founder's choice, or the sample planner's pick when they are not sure
  const pick = JURISDICTION_VALUES.includes(answer.recommendedJurisdiction) ? answer.recommendedJurisdiction : null;
  const pickReason = clip(answer.jurisdictionReason, 1000);
  const founderChose = JURISDICTION_VALUES.includes(intake.jurisdictionPref);
  const jurisdiction = !founderChose && pick && pickReason ? pick : byRules.jurisdiction;
  const jurisdictionReason = pick === jurisdiction && pickReason ? pickReason : byRules.reason;

  const phases = PHASES.map((phase) => ({ ...phase, _id: new mongoose.Types.ObjectId() }));
  const phaseIds = new Map(phases.map((phase) => [phase.key, phase._id]));
  // Steps in phase order; inside a phase they keep the model's order.
  const steps = answer.tasks
    .filter((step) => isObject(step) && phaseIds.has(step.phase) && clip(step.title, 160))
    .slice(0, MAX_TASKS)
    .sort((a, b) => PHASE_KEYS.indexOf(a.phase) - PHASE_KEYS.indexOf(b.phase));
  if (steps.length === 0) throw new Error("The AI roadmap has no usable steps.");

  const tasks = [];
  const budgetItems = [];
  for (const step of steps) {
    const fee = feesById.get(step.feeId);
    const cost = fee && feeFits(fee, jurisdiction) ? feeCost(fee) : estimate(step);
    const sourceId = sourceIds.get(step.sourceId);
    const title = clip(step.title, 160);
    tasks.push({
      phaseId: phaseIds.get(step.phase),
      title,
      description: clip(step.description, 1000),
      authority: clip(step.authority, 160),
      costMinAed: cost.min,
      costMaxAed: cost.max,
      costBasis: cost.basis,
      feeReferenceId: cost.feeId,
      estDays: wholeNumber(step.days, 365),
      origin: "planner",
      // A fee's own source comes first, as in the sample planner.
      sourceIds: cost.sourceId ? [cost.sourceId] : sourceId ? [sourceId] : [],
    });
    if (cost.max > 0) {
      const category = valuesOf(BUDGET_CATEGORIES).includes(step.budgetCategory) ? step.budgetCategory : "other";
      budgetItems.push(budgetItem({ category, label: clip(step.budgetLabel, 120) || clip(title, 120) }, cost));
    }
  }
  budgetItems.push(...runningCosts(intake));

  const documents = answer.documents
    .filter(isObject)
    .map((doc) => ({
      name: clip(doc.name, 120),
      description: clip(doc.description, 400),
      required: doc.required !== false,
      obtained: false,
      sourceId: sourceIds.get(doc.sourceId),
    }))
    .filter((doc) => doc.name)
    .slice(0, MAX_DOCUMENTS);

  const levels = valuesOf(LEVELS);
  const risks = answer.risks
    .filter((risk) => isObject(risk) && levels.includes(risk.likelihood) && levels.includes(risk.impact))
    .map((risk) => ({
      title: clip(risk.title, 160),
      description: clip(risk.description, 600),
      likelihood: risk.likelihood,
      impact: risk.impact,
      mitigation: clip(risk.mitigation, 600),
    }))
    .filter((risk) => risk.title)
    .slice(0, MAX_RISKS);

  return {
    recommendedJurisdiction: jurisdiction,
    jurisdictionReason,
    summary,
    phases: phases.map(({ key, ...phase }) => phase),
    tasks,
    budgetItems,
    documents,
    risks,
  };
}

/** The model's own estimate for a step without a usable fee: whole dirhams, never negative, lowest first. */
function estimate(step) {
  const [min, max] = [wholeNumber(step.estimateMinAed, MAX_AED), wholeNumber(step.estimateMaxAed, MAX_AED)].sort((a, b) => a - b);
  const recurrence = valuesOf(RECURRENCES).includes(step.recurrence) ? step.recurrence : "one_time";
  return { min, max, basis: "estimate", recurrence };
}

/** A whole number from 0 to `max`. Anything that is not a number counts as 0. */
function wholeNumber(value, max) {
  const number = Math.round(Number(value));
  return Number.isNaN(number) ? 0 : Math.min(Math.max(number, 0), max);
}

/** Text with its spaces tidied, cut to `max` characters; anything that is not text becomes "". */
function clip(value, max) {
  const tidy = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  return tidy.length > max ? `${tidy.slice(0, max - 1).trimEnd()}…` : tidy;
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
