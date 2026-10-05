import { createHash, randomBytes } from "node:crypto";
import { readBody, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { appUrl, sendEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/schemas/auth";
import { User } from "@/models/User";

const ONE_HOUR = 60 * 60 * 1000;

// POST /api/auth/forgot-password  { email }
// Always gives the same answer, so nobody can use it to find out which emails have accounts.
export const POST = route(async (request) => {
  const { email } = await readBody(request, forgotPasswordSchema);

  await connectDB();
  const user = await User.findOne({ email });
  if (user && user.status !== "suspended") {
    const token = randomBytes(32).toString("hex");
    user.passwordResetHash = createHash("sha256").update(token).digest("hex");
    user.passwordResetExpires = new Date(Date.now() + ONE_HOUR);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Reset your UAE Venture Guide password",
      text: `Hello ${user.name},\n\nUse this link to choose a new password. It works once and expires in one hour:\n${appUrl(`/reset-password?token=${token}`)}\n\nIf you did not ask for this, you can ignore this email.\n`,
    });
  }

  return Response.json({ ok: true });
});
