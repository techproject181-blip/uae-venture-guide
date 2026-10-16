import { z } from "zod";
import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { TAGS, expireTags } from "@/lib/cache";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";

const schema = z.object({ hidden: z.boolean("Say whether to hide the post.") });

// PATCH /api/admin/posts/:id  { hidden }: hide an unsuitable post, or show it again. Administrators only.
export const PATCH = route(async (request, { params }) => {
  await requireApiUser("admin");
  const { id } = await params;
  const { hidden } = await readBody(request, schema);

  await connectDB();
  const post = await Post.findByIdAndUpdate(id, { status: hidden ? "hidden" : "published" }, { returnDocument: "after" });
  if (!post) throw new ApiError(404, "Post not found.");
  expireTags(TAGS.posts, TAGS.post(id));
  return Response.json({ status: post.status });
});
