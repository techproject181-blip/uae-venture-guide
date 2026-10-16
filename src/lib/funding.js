import mongoose from "mongoose";
import { progressPercent } from "@/lib/budget";
import { connectDB } from "@/lib/db";
import { FunderProfile } from "@/models/FunderProfile";
import { FundingInterest } from "@/models/FundingInterest";
import { Plan } from "@/models/Plan";
import { User } from "@/models/User"; // also registers the model that populate() reads from

// Queries for funders. A funder never receives a full plan from here: pitch
// cards hold only the fields below, and the full plan opens through
// canReadPlan() once the owner accepts their interest.
//
// Funders find a plan only while it is shared, finished and not hidden by an
// administrator, and while its owner's account is active: a suspended owner's
// plans leave Discover and take no new interest until the account is active again.

const PITCH_FIELDS = "title sector emirate budgetAed pitchSummary tasks.status updatedAt";

const SHARED = { shared: true, hiddenByAdmin: false, status: "ready" };

/** How many pitch cards one page of Discover shows. */
export const PITCH_CARDS_PER_PAGE = 20;

/** `filter` for shared plans, limited to owners whose account is active. */
async function sharedPlansFilter(filter = {}) {
  const shared = { ...SHARED, ...filter };
  const owners = await Plan.find(shared).distinct("ownerId");
  const activeOwners = await User.find({ _id: { $in: owners }, status: "active" }).distinct("_id");
  return { ...shared, ownerId: { $in: activeOwners } };
}

/**
 * One page of the plans funders may find, as pitch cards, newest first, and
 * optionally filtered by sector and emirate: { cards, total, page }. A page
 * past the end gives the last page.
 */
export async function listPitchCards({ sector, emirate, page = 1, pageSize = PITCH_CARDS_PER_PAGE } = {}) {
  await connectDB();
  const filter = await sharedPlansFilter({ ...(sector && { sector }), ...(emirate && { emirate }) });
  const total = await Plan.countDocuments(filter);
  const current = Math.min(page, Math.max(1, Math.ceil(total / pageSize)));
  // _id breaks ties, so no card shows on two pages.
  const plans = await Plan.find(filter)
    .select(PITCH_FIELDS)
    .sort({ updatedAt: -1, _id: -1 })
    .skip((current - 1) * pageSize)
    .limit(pageSize)
    .lean();
  return { cards: plans.map(toPitchCard), total, page: current };
}

/** A plan funders may find, as { _id, title, ownerId }, or null. */
export async function findSharedPlan(planId) {
  if (!mongoose.isValidObjectId(planId)) return null;
  await connectDB();
  const plan = await Plan.findOne({ _id: planId, ...SHARED })
    .select("title ownerId")
    .lean();
  if (!plan || !(await User.exists({ _id: plan.ownerId, status: "active" }))) return null;
  return plan;
}

function toPitchCard({ tasks, ...plan }) {
  return { ...plan, progress: progressPercent(tasks ?? []) };
}

/** Interest requests sent to the owner's plans, with the funder's profile. */
export async function listInterestsForOwner(ownerId) {
  await connectDB();
  const planIds = await Plan.find({ ownerId }).distinct("_id");
  const interests = await FundingInterest.find({ planId: { $in: planIds } })
    .populate("funderId", "name")
    .populate("planId", "title")
    .sort({ createdAt: -1 })
    .lean();
  const profiles = await FunderProfile.find({ userId: { $in: interests.map((i) => i.funderId?._id) } }).lean();
  const byUser = new Map(profiles.map((profile) => [String(profile.userId), profile]));
  return interests.map((interest) => ({ ...interest, funderProfile: byUser.get(String(interest.funderId?._id)) ?? null }));
}

/** The funder's own interest requests, with each plan's title and owner. */
export async function listInterestsForFunder(funderId) {
  await connectDB();
  return FundingInterest.find({ funderId })
    .populate({ path: "planId", select: "title shared hiddenByAdmin ownerId", populate: { path: "ownerId", select: "name" } })
    .sort({ createdAt: -1 })
    .lean();
}
