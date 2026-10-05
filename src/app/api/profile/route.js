import { readBody, requireApiUserOrPending, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { funderProfileSchema, mentorProfileSchema } from "@/lib/schemas/community";
import { FunderProfile } from "@/models/FunderProfile";
import { MentorProfile } from "@/models/MentorProfile";
import { User } from "@/models/User";

// PUT /api/profile: save the mentor's or funder's own profile.
// Allowed while the account is pending, so the administrator can review it.
export const PUT = route(async (request) => {
  const user = await requireApiUserOrPending("mentor", "funder");
  const isMentor = user.role === "mentor";
  const { name, ...profile } = await readBody(request, isMentor ? mentorProfileSchema : funderProfileSchema);

  await connectDB();
  const Profile = isMentor ? MentorProfile : FunderProfile;
  await Promise.all([
    User.updateOne({ _id: user.id }, { $set: { name } }),
    // upsert: the first save creates the profile.
    Profile.updateOne({ userId: user.id }, { $set: { ...profile, userId: user.id } }, { upsert: true, runValidators: true }),
  ]);
  return Response.json({ ok: true });
});
