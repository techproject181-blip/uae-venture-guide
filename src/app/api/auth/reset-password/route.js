import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { ApiError, readBody, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/schemas/auth";
import { LoginAttempt } from "@/models/LoginAttempt";
import { User } from "@/models/User";

// POST /api/auth/reset-password  { token, password }
export const POST = route(async (request) => {
  const { token, password } = await readBody(request, resetPasswordSchema);

  await connectDB();
  const user = await User.findOne({
    passwordResetHash: createHash("sha256").update(token).digest("hex"),
    passwordResetExpires: { $gt: new Date() },
  });
  if (!user) throw new ApiError(400, "This reset link has expired or was already used. Please ask for a new one.");

  user.passwordHash = await bcrypt.hash(password, 10);
  user.passwordResetHash = undefined; // the link works only once
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();
  // The sign-in lock message promises a reset unlocks the account.
  await LoginAttempt.deleteOne({ email: user.email });

  return Response.json({ ok: true });
});
