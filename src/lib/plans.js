import { cache } from "react";
import { ApiError, toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { generateRoadmap } from "@/lib/roadmap/generate";
import { FundingInterest } from "@/models/FundingInterest";
import { MentorRequest } from "@/models/MentorRequest";
import { Plan } from "@/models/Plan";
import { User } from "@/models/User";

// Every rule about who may see or change a plan lives here, so the pages and
// API routes all apply the same rules.

/**
 * Whether `user` may read `plan`: its owner, an administrator, a mentor with an
 * accepted guidance request for it, or a funder whose interest the owner
 * accepted, for as long as the plan stays shared and not hidden. Mentors and
 * funders also need the owner's account to be active, so a suspended owner's
 * plan closes to them.
 */
export async function canReadPlan(user, plan) {
  if (!user || user.status !== "active") return false;
  if (String(plan.ownerId) === user.id || user.role === "admin") return true;
  if (user.role === "mentor") {
    return Boolean(await MentorRequest.exists({ mentorId: user.id, planId: plan._id, status: "accepted" })) && (await ownerIsActive(plan));
  }
  if (user.role === "funder") {
    if (!plan.shared || plan.hiddenByAdmin) return false;
    return (
      Boolean(await FundingInterest.exists({ funderId: user.id, planId: plan._id, status: "accepted" })) && (await ownerIsActive(plan))
    );
  }
  return false;
}

async function ownerIsActive(plan) {
  return Boolean(await User.exists({ _id: plan.ownerId, status: "active" }));
}

/**
 * For API routes that change a plan: the plan, if `user` owns it. Anyone else
 * gets 404, not 403, so ids of other people's plans reveal nothing.
 */
export async function findOwnPlan(planId, user) {
  await connectDB();
  const plan = await Plan.findOne({ _id: planId, ownerId: user.id });
  if (!plan) throw new ApiError(404, "Plan not found.");
  return plan;
}

/**
 * For plan pages: { plan, isOwner }, or null when the viewer may not see it.
 * cache() lets the layout and the page share one database read per request.
 */
export const getPlanForViewer = cache(async (planId, user) => {
  await connectDB();
  const plan = await Plan.findById(planId)
    .lean()
    .catch(() => null);
  if (!plan || !(await canReadPlan(user, plan))) return null;
  return { plan: toPlain(plan), isOwner: String(plan.ownerId) === user.id };
});

/** Creates a plan from intake answers and fills in its roadmap, saved in a single write. */
export async function createPlanWithRoadmap(ownerId, intake) {
  await connectDB();
  const plan = new Plan({ ...intake, ownerId, status: "generating" });
  await fillRoadmap(plan, intake);
  return plan;
}

/** Builds the roadmap again on an existing plan (used to retry a failed one), keeping its title and answers. */
export async function rebuildRoadmap(plan) {
  plan.status = "generating";
  plan.failureReason = undefined;
  await fillRoadmap(plan, intakeOf(plan));
  return plan;
}

/**
 * Makes a fresh roadmap from the same answers as a new plan, so the earlier
 * one is kept. The new plan's title is numbered among the owner's plans.
 */
export async function createNewVersion(plan) {
  await connectDB();
  const titles = await Plan.find({ ownerId: plan.ownerId }).distinct("title");
  return createPlanWithRoadmap(plan.ownerId, { ...intakeOf(plan), title: newVersionTitle(plan.title, titles) });
}

// Later versions end in "(version 2)", "(version 3)"… Older ones ended in
// "(new version)", sometimes more than once.
const VERSION_ENDINGS = /(\s*\((new version|version \d+)\))+$/i;

/**
 * The title for a new version of the plan called `title`: the title without
 * any earlier version ending, with the lowest number from 2 that none of
 * `takenTitles` (the owner's plan titles) has yet. "Karak café" -> "Karak café (version 2)".
 * Exported for the tests.
 * @internal
 */
export function newVersionTitle(title, takenTitles = []) {
  const base = title.replace(VERSION_ENDINGS, "") || title;
  // Titles are at most 80 characters, so a long one is shortened to fit the ending.
  const numbered = (version) => {
    const ending = ` (version ${version})`;
    return `${base.slice(0, 80 - ending.length).trimEnd()}${ending}`;
  };
  let version = 2;
  while (takenTitles.includes(numbered(version))) version += 1;
  return numbered(version);
}

/** The intake answers saved on a plan. */
function intakeOf(plan) {
  return {
    title: plan.title,
    idea: plan.idea,
    emirate: plan.emirate,
    sector: plan.sector,
    jurisdictionPref: plan.jurisdictionPref,
    budgetAed: plan.budgetAed,
    targetCustomers: plan.targetCustomers,
    teamSize: plan.teamSize,
  };
}

async function fillRoadmap(plan, intake) {
  await connectDB();
  try {
    Object.assign(plan, await generateRoadmap(intake), { status: "ready" });
    await plan.save();
  } catch (error) {
    // Making or saving the roadmap failed. The plan is saved as failed without
    // the half-made roadmap (which may be what could not be saved), so the
    // overview offers "Try again".
    console.error("Roadmap generation failed:", error);
    Object.assign(plan, {
      status: "failed",
      failureReason: "The roadmap could not be made. Please try again.",
      generator: undefined,
      generatedAt: undefined,
      summary: "",
      recommendedJurisdiction: null,
      jurisdictionReason: "",
      phases: [],
      tasks: [],
      budgetItems: [],
      documents: [],
      risks: [],
    });
    await plan.save();
  }
}
