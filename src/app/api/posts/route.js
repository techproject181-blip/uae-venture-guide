import { readBody, requireApiUser, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { postFromForm, postSchema } from "@/lib/schemas/community";
import { Post } from "@/models/Post";

// POST /api/posts: a mentor publishes an experience post.
export const POST = route(async (request) => {
  const user = await requireApiUser("mentor");
  const data = await readBody(request, postSchema);

  await connectDB();
  const post = await Post.create({ ...postFromForm(data), authorId: user.id });
  return Response.json({ id: String(post._id) }, { status: 201 });
});
