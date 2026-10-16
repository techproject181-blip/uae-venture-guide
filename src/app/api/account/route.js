import { readBody, requireApiUserOrPending, route } from "@/lib/api";
import { TAGS, expireTags } from "@/lib/cache";
import { connectDB } from "@/lib/db";
import { accountSchema } from "@/lib/schemas/auth";
import { User } from "@/models/User";

// PATCH /api/account  { name }
// Any signed-in user changes the name shown on their account.
export const PATCH = route(async (request) => {
  const user = await requireApiUserOrPending();
  const { name } = await readBody(request, accountSchema);
  await connectDB();
  await User.updateOne({ _id: user.id }, { $set: { name } });
  // A mentor's name shows on their profile and on their posts.
  if (user.role === "mentor") expireTags(TAGS.mentors, TAGS.mentor(user.id), TAGS.posts);
  return Response.json({ ok: true });
});
