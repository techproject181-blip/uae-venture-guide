import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { toPlain } from "@/lib/api";
import { getMentor, listMentors, listPosts } from "@/lib/community";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { Source } from "@/models/Source";
import "@/models/User"; // registers the model that populate() reads from

// The one place the app caches data with Next's "use cache".
//
// Only public data is cached here: the official sources, the approved mentors
// and the published posts. Anything that depends on who is signed in (plans,
// conversations, requests, admin screens, the daily quota) is never cached and
// stays in the pages that read it.
//
// Every cached read carries tags. Code that changes the data calls
// expireTags() with the same tags, so the next visit reads fresh data. The
// lifetimes below are a safety net for changes made outside the app, such as
// running the seed script: stale data is gone within an hour (mentors, posts)
// or a day (sources).

/** The cache tags. Per-item tags let one change clear one page. */
export const TAGS = {
  sources: "sources",
  mentors: "mentors",
  posts: "posts",
  mentor: (id) => `mentor:${id}`,
  post: (id) => `post:${id}`,
};

/**
 * Clears the cached reads with these tags at once. Works in Route Handlers
 * and Server Actions. Outside a Next.js request (the database tests call the
 * route handlers directly) there is no cache, so there is nothing to clear.
 */
export function expireTags(...tags) {
  for (const tag of tags) {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch {
      // No Next.js request around this call, so no cache to clear.
    }
  }
}

/** How many sources one page of the sources list shows. */
export const SOURCES_PER_PAGE = 20;

/**
 * One page of active official sources, searched and filtered: { sources, total, page }.
 * Federal sources apply in every emirate, so they show with any emirate filter.
 * A page past the end gives the last page.
 */
export async function searchSources({ q = "", emirate = "", category = "", page = 1 } = {}) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.sources);

  const query = { active: true };
  if (q) query.$text = { $search: q };
  if (emirate) query.emirate = { $in: [emirate, null] };
  if (category) query.categories = category;

  await connectDB();
  const total = await Source.countDocuments(query);
  const current = Math.min(Math.max(1, page), Math.max(1, Math.ceil(total / SOURCES_PER_PAGE)));
  const sources = await Source.find(query, q ? { score: { $meta: "textScore" } } : {})
    .sort(q ? { score: { $meta: "textScore" }, _id: 1 } : { emirate: 1, title: 1, _id: 1 })
    .skip((current - 1) * SOURCES_PER_PAGE)
    .limit(SOURCES_PER_PAGE)
    .lean();
  return { sources: toPlain(sources), total, page: current };
}

/** Approved, active mentors, optionally filtered by expertise and emirate. */
export async function getMentors({ expertise = "", emirate = "" } = {}) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.mentors);
  return toPlain(await listMentors({ expertise, emirate }));
}

/** One active mentor's public profile, or null. */
export async function getMentorProfile(id) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.mentors, TAGS.mentor(String(id)));
  return toPlain(await getMentor(id));
}

/** One page of the published posts feed: { posts, total, page }. */
export async function getPublishedPosts(page = 1) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.posts);
  return toPlain(await listPosts({ page }));
}

/**
 * A post everyone may read (published, author's account active), with the
 * author's name, or null. Hidden posts and posts by inactive authors are not
 * cached: the page reads those itself for their author and administrators.
 */
export async function getPublicPost(id) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.posts, TAGS.post(String(id)));
  await connectDB();
  const post = await Post.findOne({ _id: id, status: "published" })
    .populate("authorId", "name status")
    .lean()
    .catch(() => null);
  if (!post || post.authorId?.status !== "active") return null;
  return toPlain(post);
}

/** An author's newest published posts (title and date), leaving out one post if given. */
export async function getPostsByAuthor(authorId, { exceptId = null, limit = 5 } = {}) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.posts);
  await connectDB();
  const filter = { authorId, status: "published" };
  if (exceptId) filter._id = { $ne: exceptId };
  const posts = await Post.find(filter)
    .select("title createdAt")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .catch(() => []);
  return toPlain(posts);
}
