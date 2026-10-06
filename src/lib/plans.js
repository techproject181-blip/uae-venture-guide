import { cache } from "react";
import { ApiError, toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { generateRoadmap } from "@/lib/roadmap/generate";
import { FundingInterest } from "@/models/FundingInterest";
import { MentorRequest } from "@/models/MentorRequest";
import { Plan } from "@/models/Plan";

// Every rule about who may see or change a plan lives here, so the pages and
// API routes all apply the same rules.

/**
 * Whether `user` may read `plan`: its owner, an administrator, a mentor with an
 * accepted guidance request for it, or a funder whose interest the owner
 * accepted, for as long as the plan stays shared and not hidden.
 */
export async function canReadPlan(user, plan) {
  if (!user || user.status !== "active") return false;
  if (String(plan.ownerId) === user.id || user.role === "admin") return true;
  if (user.role === "mentor") {
    return Boolean(await MentorRequest.exists({ mentorId: user.id, planId: plan._id, status: "accepted" }));
  }
  if (user.role === "funder") {
    if (!plan.shared || plan.hiddenByAdmin) return false;
    return Boolean(await FundingInterest.exists({ funderId: user.id, planId: plan._id, status: "accepted" }));
  }
  return false;
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
  const intake = {
    title: plan.title,
    idea: plan.idea,
    emirate: plan.emirate,
    sector: plan.sector,
    jurisdictionPref: plan.jurisdictionPref,
    budgetAed: plan.budgetAed,
    targetCustomers: plan.targetCustomers,
    teamSize: plan.teamSize,
  };
  plan.status = "generating";
  plan.failureReason = undefined;
  await fillRoadmap(plan, intake);
  return plan;
}

async function fillRoadmap(plan, intake) {
  await connectDB();
  try {
    Object.assign(plan, await generateRoadmap(intake), { status: "ready" });
  } catch (error) {
    console.error("Roadmap generation failed:", error);
    plan.status = "failed";
    plan.failureReason = "The roadmap could not be made. Please try again.";
  }
  await plan.save();
}
