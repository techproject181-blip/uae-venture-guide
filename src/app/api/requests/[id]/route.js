import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { appUrl, sendEmail } from "@/lib/email";
import { mentorReplySchema } from "@/lib/schemas/community";
import { MentorRequest } from "@/models/MentorRequest";
import { User } from "@/models/User";

// Which status each action needs and leads to.
const MOVES = {
  accept: { from: "pending", to: "accepted" },
  decline: { from: "pending", to: "declined" },
  complete: { from: "accepted", to: "completed" },
};

// PATCH /api/requests/:id  { action: "accept" | "decline" | "complete", reply? }
// The mentor answers a request. Accepting lets them read the attached plan until the request is completed.
export const PATCH = route(async (request, { params }) => {
  const mentor = await requireApiUser("mentor");
  const { id } = await params;
  const { action, reply } = await readBody(request, mentorReplySchema);

  await connectDB();
  const guidance = await MentorRequest.findOne({ _id: id, mentorId: mentor.id });
  if (!guidance) throw new ApiError(404, "Request not found.");
  const move = MOVES[action];
  if (guidance.status !== move.from) throw new ApiError(400, `This request is already ${guidance.status}.`);

  guidance.status = move.to;
  guidance.respondedAt = new Date();
  if (reply) guidance.mentorReply = reply;
  await guidance.save();

  if (action !== "complete") {
    const entrepreneur = await User.findById(guidance.entrepreneurId).lean();
    if (entrepreneur) {
      await sendEmail({
        to: entrepreneur.email,
        subject: `Your guidance request was ${move.to}`,
        text: `Hello ${entrepreneur.name},\n\n${mentor.name} ${move.to} your request "${guidance.topic}".${reply ? `\n\nTheir reply:\n${reply}` : ""}\n\nSee the details here:\n${appUrl("/requests")}\n`,
      });
    }
  }
  return Response.json({ status: guidance.status });
});
