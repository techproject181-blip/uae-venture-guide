import { progressPercent } from "@/lib/budget";
import { connectDB } from "@/lib/db";
import { FunderProfile } from "@/models/FunderProfile";
import { FundingInterest } from "@/models/FundingInterest";
import { Plan } from "@/models/Plan";
import "@/models/User"; // registers the model that populate() reads from

// Queries for funders. A funder never receives a full plan from here: pitch
// cards hold only the fields below, and the full plan opens through
// canReadPlan() once the owner accepts their interest.

const PITCH_FIELDS = "title sector emirate budgetAed pitchSummary tasks.status updatedAt";

/** Shared, visible plans as pitch cards, optionally filtered by sector and emirate. */
export async function listPitchCards({ sector, emirate } = {}) {
  await connectDB();
  const filter = { shared: true, hiddenByAdmin: false, status: "ready" };
  if (sector) filter.sector = sector;
  if (emirate) filter.emirate = emirate;
  const plans = await Plan.find(filter).select(PITCH_FIELDS).sort({ updatedAt: -1 }).limit(60).lean();
  return plans.map(toPitchCard);
}

/** One plan as a pitch card, or null when it is not shared. */
export async function getPitchCard(planId) {
  await connectDB();
  const plan = await Plan.findOne({ _id: planId, status: "ready", shared: true, hiddenByAdmin: false }).select(PITCH_FIELDS).lean().catch(() => null);
  return plan && toPitchCard(plan);
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
