import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { appUrl, sendEmail } from "@/lib/email";
import { interestSchema } from "@/lib/schemas/community";
import { FundingInterest } from "@/models/FundingInterest";
import { Plan } from "@/models/Plan";
import { User } from "@/models/User";

// POST /api/plans/:id/interest  { message }: a funder tells the owner of a shared plan they are interested.
export const POST = route(async (request, { params }) => {
  const funder = await requireApiUser("funder");
  const { id } = await params;
  const { message } = await readBody(request, interestSchema);

  await connectDB();
  const plan = await Plan.findOne({ _id: id, shared: true, hiddenByAdmin: false }).select("title ownerId").lean();
  if (!plan) throw new ApiError(404, "This plan is not shared any more.");

  try {
    const interest = await FundingInterest.create({ planId: plan._id, funderId: funder.id, message });
    const owner = await User.findById(plan.ownerId).lean();
    if (owner) {
      await sendEmail({
        to: owner.email,
        subject: `A funder is interested in ${plan.title}`,
        text: `Hello ${owner.name},\n\n${funder.name} is interested in your plan "${plan.title}".\n\nTheir message:\n${message}\n\nAccept or decline here:\n${appUrl("/requests")}\n`,
      });
    }
    return Response.json({ id: String(interest._id) }, { status: 201 });
  } catch (error) {
    if (error?.code === 11000) throw new ApiError(409, "You have already sent interest in this plan.");
    throw error;
  }
});
