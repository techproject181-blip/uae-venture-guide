import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { postFromForm, postSchema } from "@/lib/schemas/community";
import { Post } from "@/models/Post";

async function findOwnPost(params, user) {
  const { id } = await params;
  await connectDB();
  const post = await Post.findOne({ _id: id, authorId: user.id });
  if (!post) throw new ApiError(404, "Post not found.");
  return post;
}

// PATCH /api/posts/:id: the author edits their post.
export const PATCH = route(async (request, { params }) => {
  const user = await requireApiUser("mentor");
  const data = await readBody(request, postSchema);
  const post = await findOwnPost(params, user);

  const { title, body, images, chart } = postFromForm(data);
  post.set({ title, body, images });
  post.chart = chart; // undefined removes the chart
  await post.save();
  return Response.json({ ok: true });
});

// DELETE /api/posts/:id: the author deletes their post.
export const DELETE = route(async (request, { params }) => {
  const user = await requireApiUser("mentor");
  const post = await findOwnPost(params, user);
  await post.deleteOne();
  return Response.json({ ok: true });
});
