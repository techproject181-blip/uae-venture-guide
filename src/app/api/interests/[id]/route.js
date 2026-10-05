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
  const plan = await Plan.findOne({ _id: interest.planId, ownerId: owner.id }).select("title").lean();
  if (!plan) throw new ApiError(404, "Interest request not found."); // not this user's plan
  if (interest.status !== "pending") throw new ApiError(400, `This request is already ${interest.status}.`);

  interest.status = action === "accept" ? "accepted" : "declined";
  interest.respondedAt = new Date();
  await interest.save();

  const funder = await User.findById(interest.funderId).lean();
  if (funder) {
    await sendEmail({
      to: funder.email,
      subject: `Your interest in ${plan.title} was ${interest.status}`,
      text: `Hello ${funder.name},\n\n${owner.name} ${interest.status} your interest in "${plan.title}".${
        action === "accept" ? `\n\nYou can now read the full plan and contact the owner:\n${appUrl("/interests")}` : ""
      }\n`,
    });
  }
  return Response.json({ status: interest.status });
});
