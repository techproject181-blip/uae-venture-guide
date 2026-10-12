import { connectDB } from "@/lib/db";
import { MentorProfile } from "@/models/MentorProfile";
import { Post } from "@/models/Post";
import { User } from "@/models/User";

// Queries for the mentor directory and the experience posts. Only active
// mentors with a profile are listed, and only posts whose author's account is
// active are shown, so a suspended mentor's posts leave the feed with them.

/** How many posts one page of the feed shows: full rows of two or three cards. */
export const POSTS_PER_PAGE = 24;

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

/**
 * One page of published posts by authors whose account is active, newest
 * first, with each author's name: { posts, total, page }. A page past the end
 * gives the last page.
 */
export async function listPosts({ page = 1, pageSize = POSTS_PER_PAGE } = {}) {
  await connectDB();
  const authors = await Post.find({ status: "published" }).distinct("authorId");
  const activeAuthors = await User.find({ _id: { $in: authors }, status: "active" }).distinct("_id");
  const filter = { status: "published", authorId: { $in: activeAuthors } };
  const total = await Post.countDocuments(filter);
  const current = Math.min(page, Math.max(1, Math.ceil(total / pageSize)));
  // _id breaks ties, so no post shows on two pages.
  const posts = await Post.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip((current - 1) * pageSize)
    .limit(pageSize)
    .populate("authorId", "name")
    .lean();
  return { posts, total, page: current };
}
