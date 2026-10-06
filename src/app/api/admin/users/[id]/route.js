import { z } from "zod";
import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { appUrl, sendEmail } from "@/lib/email";
import { FunderProfile } from "@/models/FunderProfile";
import { MentorProfile } from "@/models/MentorProfile";
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
  const rejected = user.status === "pending" && status === "suspended";
  // Reactivating a rejected sign-up is really a late approval, so they get the approval email too.
  const lateApproval = user.status === "suspended" && status === "active" && user.rejected;

  if (approved) {
    // Approving someone with no profile would list an empty mentor or funder.
    const Profile = user.role === "mentor" ? MentorProfile : user.role === "funder" ? FunderProfile : null;
    if (Profile && !(await Profile.exists({ userId: user._id }))) {
      throw new ApiError(400, "This user has not filled in their profile yet.");
    }
  }

  user.status = status;
  if (rejected) user.rejected = true;
  if (lateApproval) user.rejected = false;
  await user.save();

  if (approved || lateApproval) {
    await sendEmail({
      to: user.email,
      subject: "Your UAE Venture Guide account is approved",
      text: `Hello ${user.name},\n\nAn administrator has approved your ${user.role} account. You can now sign in and use UAE Venture Guide:\n${appUrl("/sign-in")}\n`,
    });
  }

  if (rejected) {
    await sendEmail({
      to: user.email,
      subject: "Your UAE Venture Guide account was not approved",
      text: `Hello ${user.name},\n\nAn administrator has reviewed your ${user.role} account and could not approve it this time, so you cannot sign in with it.\n\nThank you for your interest in UAE Venture Guide.\n`,
    });
  }

  return Response.json({ user: { id: String(user._id), status: user.status } });
});
