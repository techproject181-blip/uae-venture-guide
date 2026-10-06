import { readBody, requireApiUserOrPending, route } from "@/lib/api";
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
  return Response.json({ ok: true });
});
