import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { appUrl, sendEmail } from "@/lib/email";
import { mentorRequestSchema } from "@/lib/schemas/community";
import { MentorProfile } from "@/models/MentorProfile";
import { MentorRequest } from "@/models/MentorRequest";
import { Plan } from "@/models/Plan";
import { User } from "@/models/User";

// POST /api/requests: an entrepreneur asks a mentor for guidance.
export const POST = route(async (request) => {
  const user = await requireApiUser("entrepreneur");
  const data = await readBody(request, mentorRequestSchema);

  await connectDB();
  const [mentor, profile] = await Promise.all([
    User.findOne({ _id: data.mentorId, role: "mentor", status: "active" }).lean(),
    MentorProfile.findOne({ userId: data.mentorId }).lean(),
  ]);
  if (!mentor || !profile) throw new ApiError(404, "Mentor not found.");
  if (!profile.acceptingRequests) throw new ApiError(400, "This mentor is not taking new requests right now.");
  if (data.planId && !(await Plan.exists({ _id: data.planId, ownerId: user.id }))) {
    throw new ApiError(400, "Choose one of your own plans.", { planId: "Choose one of your own plans." });
  }

  try {
    const created = await MentorRequest.create({ ...data, entrepreneurId: user.id });
    await sendEmail({
      to: mentor.email,
      subject: `New guidance request: ${data.topic}`,
      text: `Hello ${mentor.name},\n\n${user.name} asked for your guidance on "${data.topic}".\n\nRead and answer the request here:\n${appUrl("/requests")}\n`,
    });
    return Response.json({ id: String(created._id) }, { status: 201 });
  } catch (error) {
    // The partial unique index allows one waiting request per entrepreneur and mentor.
    if (error?.code === 11000) throw new ApiError(409, "You already have a waiting request with this mentor.");
    throw error;
  }
});
