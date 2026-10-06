import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { appUrl, sendEmail } from "@/lib/email";
import { interestReplySchema } from "@/lib/schemas/community";
import { FundingInterest } from "@/models/FundingInterest";
import { Plan } from "@/models/Plan";
import { User } from "@/models/User";

// PATCH /api/interests/:id  { action: "accept" | "decline" }
// The plan owner answers a funder. Accepting lets the funder read the full plan while it stays shared.
export const PATCH = route(async (request, { params }) => {
  const owner = await requireApiUser("entrepreneur");
  const { id } = await params;
  const { action } = await readBody(request, interestReplySchema);

  await connectDB();
  const interest = await FundingInterest.findById(id);
  if (!interest) throw new ApiError(404, "Interest request not found.");
  const plan = await Plan.findOne({ _id: interest.planId, ownerId: owner.id }).select("title shared hiddenByAdmin").lean();
  if (!plan) throw new ApiError(404, "Interest request not found."); // not this user's plan
  if (interest.status !== "pending") throw new ApiError(400, `This request is already ${interest.status}.`);
  // An accepted funder could not open an unshared or hidden plan anyway.
  if (action === "accept" && (!plan.shared || plan.hiddenByAdmin)) throw new ApiError(409, "Share the plan again before accepting.");

  interest.status = action === "accept" ? "accepted" : "declined";
  interest.respondedAt = new Date();
  await interest.save();

  const funder = await User.findById(interest.funderId).lean();
  if (funder) {
    await sendEmail({
      to: funder.email,
      subject: `Your interest in ${plan.title} was ${interest.status}`,
      text: `Hello ${funder.name},\n\n${owner.name} ${interest.status} your interest in "${plan.title}".${
        action === "accept" ? `\n\nYou can now read the full plan and message the owner:\n${appUrl(`/interests/${interest._id}`)}` : ""
      }\n`,
    });
  }
  return Response.json({ status: interest.status });
});

// DELETE /api/interests/:id
// The funder withdraws interest the owner has not answered yet.
export const DELETE = route(async (_request, { params }) => {
  const funder = await requireApiUser("funder");
  const { id } = await params;
  await connectDB();
  const interest = await FundingInterest.findOne({ _id: id, funderId: funder.id });
  if (!interest) throw new ApiError(404, "Interest request not found.");
  if (interest.status !== "pending") throw new ApiError(400, `This request is already ${interest.status}, so it cannot be withdrawn.`);
  await interest.deleteOne();
  return Response.json({ ok: true });
});
