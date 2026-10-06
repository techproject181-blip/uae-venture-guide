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

  // Optional fields left empty are removed. The schema drops them, so a plain
  // $set would keep the old value.
  const optionalKeys = isMentor ? ["linkedinUrl"] : [];
  const set = { userId: user.id };
  const unset = {};
  for (const [key, value] of Object.entries(profile)) {
    if (value === undefined || value === null || value === "") unset[key] = "";
    else set[key] = value;
  }
  for (const key of optionalKeys) if (!(key in set)) unset[key] = "";
  const update = Object.keys(unset).length > 0 ? { $set: set, $unset: unset } : { $set: set };

  await connectDB();
  const Profile = isMentor ? MentorProfile : FunderProfile;
  await Promise.all([
    User.updateOne({ _id: user.id }, { $set: { name } }),
    // upsert: the first save creates the profile.
    Profile.updateOne({ userId: user.id }, update, { upsert: true, runValidators: true }),
  ]);
  return Response.json({ ok: true });
});
