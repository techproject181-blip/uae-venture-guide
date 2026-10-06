import { connectDB } from "@/lib/db";
import { MentorProfile } from "@/models/MentorProfile";
import { User } from "@/models/User";

// Queries for the mentor directory. Only active mentors with a profile are listed.

/** Active mentors, optionally filtered by an area of expertise and an emirate. */
export async function listMentors({ expertise, emirate } = {}) {
  await connectDB();
  const filter = {};
  if (expertise) filter.expertise = expertise;
  if (emirate) filter.emirates = emirate;
  const profiles = await MentorProfile.find(filter).sort({ yearsExperience: -1 }).lean();

  const mentors = await User.find({ _id: { $in: profiles.map((p) => p.userId) }, role: "mentor", status: "active" })
    .select("name")
    .lean();
  const names = new Map(mentors.map((mentor) => [String(mentor._id), mentor.name]));
  return profiles
    .filter((profile) => names.has(String(profile.userId)))
    .map((profile) => ({ ...profile, name: names.get(String(profile.userId)) }));
}

/** One active mentor with their profile, or null. */
export async function getMentor(userId) {
  await connectDB();
  const [user, profile] = await Promise.all([
    User.findOne({ _id: userId, role: "mentor", status: "active" })
      .select("name")
      .lean()
      .catch(() => null),
    MentorProfile.findOne({ userId })
      .lean()
      .catch(() => null),
  ]);
  if (!user || !profile) return null;
  return { ...profile, name: user.name };
}
