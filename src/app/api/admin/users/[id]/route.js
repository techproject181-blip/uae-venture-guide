import { z } from "zod";
import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { appUrl, sendEmail } from "@/lib/email";
import { User } from "@/models/User";

const schema = z.object({ status: z.enum(["active", "suspended"], "Choose a valid status.") });

// PATCH /api/admin/users/:id  { status: "active" | "suspended" }
// Approve or reactivate (active), or reject or suspend (suspended). Administrators only.
export const PATCH = route(async (request, { params }) => {
  const admin = await requireApiUser("admin");
  const { id } = await params;
  const { status } = await readBody(request, schema);

  if (id === admin.id) throw new ApiError(400, "You cannot change your own account.");

  await connectDB();
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found.");
  if (user.role === "admin") throw new ApiError(400, "Administrator accounts cannot be changed here.");

  const approved = user.status === "pending" && status === "active";
  user.status = status;
  await user.save();

  if (approved) {
    await sendEmail({
      to: user.email,
      subject: "Your UAE Venture Guide account is approved",
      text: `Hello ${user.name},\n\nAn administrator has approved your ${user.role} account. You can now sign in and use UAE Venture Guide:\n${appUrl("/sign-in")}\n`,
    });
  }

  return Response.json({ user: { id: String(user._id), status: user.status } });
});
