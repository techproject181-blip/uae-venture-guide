import { requireApiUser, route } from "@/lib/api";
import { findOwnPlan } from "@/lib/plans";
import { ChatMessage } from "@/models/ChatMessage";
import { FundingInterest } from "@/models/FundingInterest";
import { MentorRequest } from "@/models/MentorRequest";

// DELETE /api/plans/:id: delete a plan and everything that belongs to it. Owner only.
export const DELETE = route(async (request, { params }) => {
  const user = await requireApiUser("entrepreneur");
  const { id } = await params;
  const plan = await findOwnPlan(id, user);

  await Promise.all([
    plan.deleteOne(),
    ChatMessage.deleteMany({ planId: plan._id }),
    FundingInterest.deleteMany({ planId: plan._id }),
    // Guidance requests stay, without the plan attached.
    MentorRequest.updateMany({ planId: plan._id }, { $unset: { planId: 1 } }),
  ]);
  return Response.json({ ok: true });
});
