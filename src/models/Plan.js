import mongoose from "mongoose";
import {
  BUDGET_CATEGORIES,
  EMIRATES,
  JURISDICTIONS,
  JURISDICTION_PREFERENCES,
  LEVELS,
  RECURRENCES,
  SECTORS,
  TASK_STATUSES,
  valuesOf,
} from "../lib/constants.js";

const { ObjectId } = mongoose.Schema.Types;
// reference = backed by a checked fee reference ("Official" on screen); demo = backed by a
// fee reference from the demo data, not checked yet ("Demo fee"); estimate = the planner's guess.
const COST_BASIS = ["reference", "demo", "estimate"];
const ORIGIN = ["planner", "user"]; // who added it: the roadmap planner or the entrepreneur

const phaseSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 120 },
  description: { type: String, default: "", maxlength: 400 },
});

const taskSchema = new mongoose.Schema({
  phaseId: { type: ObjectId, required: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, default: "", trim: true, maxlength: 1000 },
  authority: { type: String, default: "", trim: true, maxlength: 160 },
  costMinAed: { type: Number, default: 0, min: 0 },
  costMaxAed: { type: Number, default: 0, min: 0 },
  costBasis: { type: String, enum: COST_BASIS, default: "estimate" },
  feeReferenceId: { type: ObjectId, ref: "FeeReference" },
  estDays: { type: Number, default: 1, min: 0 },
  status: { type: String, enum: valuesOf(TASK_STATUSES), default: "todo" },
  completedAt: Date,
  origin: { type: String, enum: ORIGIN, default: "user" },
  sourceIds: [{ type: ObjectId, ref: "Source" }],
});

const budgetItemSchema = new mongoose.Schema({
  category: { type: String, enum: valuesOf(BUDGET_CATEGORIES), required: true },
  label: { type: String, required: true, trim: true, maxlength: 120 },
  estimatedAed: { type: Number, required: true, min: 0 },
  actualAed: { type: Number, min: 0 },
  recurrence: { type: String, enum: valuesOf(RECURRENCES), default: "one_time" },
  costBasis: { type: String, enum: COST_BASIS, default: "estimate" },
  origin: { type: String, enum: ORIGIN, default: "user" },
});

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 120 },
  description: { type: String, default: "", maxlength: 400 },
  required: { type: Boolean, default: true },
  obtained: { type: Boolean, default: false },
  sourceId: { type: ObjectId, ref: "Source" },
});

const riskSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 160 },
  description: { type: String, default: "", maxlength: 600 },
  likelihood: { type: String, enum: valuesOf(LEVELS), required: true },
  impact: { type: String, enum: valuesOf(LEVELS), required: true },
  mitigation: { type: String, default: "", maxlength: 600 },
});

// One document per plan, with its roadmap inside, so saving a new roadmap is a single write.
const planSchema = new mongoose.Schema(
  {
    ownerId: { type: ObjectId, ref: "User", required: true },

    // What the entrepreneur entered in the intake form.
    title: { type: String, required: true, trim: true, maxlength: 80 },
    idea: { type: String, required: true, trim: true, maxlength: 2000 },
    emirate: { type: String, enum: valuesOf(EMIRATES), required: true },
    sector: { type: String, enum: valuesOf(SECTORS), required: true },
    jurisdictionPref: { type: String, enum: valuesOf(JURISDICTION_PREFERENCES), required: true },
    budgetAed: { type: Number, required: true, min: 0 },
    targetCustomers: { type: String, required: true, trim: true, maxlength: 1000 },
    teamSize: { type: Number, default: 1, min: 1 },

    // The generated roadmap.
    status: { type: String, enum: ["generating", "ready", "failed"], default: "generating" },
    failureReason: String,
    generator: String, // which planner made it, for example "sample-planner-v1"
    generatedAt: Date,
    summary: { type: String, default: "" },
    recommendedJurisdiction: { type: String, enum: [...valuesOf(JURISDICTIONS), null], default: null },
    jurisdictionReason: { type: String, default: "" },
    phases: [phaseSchema],
    tasks: [taskSchema],
    budgetItems: [budgetItemSchema],
    documents: [documentSchema],
    risks: [riskSchema],

    // Sharing with funders.
    shared: { type: Boolean, default: false },
    pitchSummary: { type: String, trim: true, maxlength: 600 },
    hiddenByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

planSchema.index({ ownerId: 1, updatedAt: -1 });
planSchema.index({ shared: 1, hiddenByAdmin: 1, emirate: 1, sector: 1 });

if (mongoose.models.Plan) mongoose.deleteModel("Plan");
export const Plan = mongoose.model("Plan", planSchema);
