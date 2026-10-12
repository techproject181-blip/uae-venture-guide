import bcrypt from "bcryptjs";
import { ApiError, readBody, requireApiUserOrPending, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { changePasswordSchema } from "@/lib/schemas/auth";
import { createSession } from "@/lib/session";
import { clearAttempts, countAttempt, minutesText } from "@/models/LoginAttempt";
import { User } from "@/models/User";

// POST /api/account/password  { currentPassword, password }
// Changes the password after checking the current one.
export const POST = route(async (request) => {
  const signedIn = await requireApiUserOrPending();
  const { currentPassword, password } = await readBody(request, changePasswordSchema);

  await connectDB();
  const user = await User.findById(signedIn.id);
  if (!user) throw new ApiError(404, "User not found.");

  // Stop guesses at the current password, using the same counter and limit as sign-in.
  const lockedFor = await countAttempt(user.email);
  if (lockedFor) {
    throw new ApiError(429, `Too many failed attempts. Wait ${minutesText(lockedFor)} and try again.`);
  }
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new ApiError(400, "Your current password is not right.", { currentPassword: "Your current password is not right." });
  }
  await clearAttempts(user.email);

  user.passwordHash = await bcrypt.hash(password, 10);
  user.passwordChangedAt = new Date();
  await user.save();
  // Other devices are signed out; give this one a fresh session so it stays signed in.
  await createSession(user);
  return Response.json({ ok: true });
});
