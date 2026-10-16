import { z } from "zod";
import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { TAGS, expireTags } from "@/lib/cache";
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

  // Making a rejected sign-up active is a late approval, so it gets the same
  // profile check and approval email as one still waiting.
  const wasRejected = user.status === "suspended" && user.rejected;
  const approved = status === "active" && (user.status === "pending" || wasRejected);
  const rejected = user.status === "pending" && status === "suspended";

  if (approved) {
    // Approving someone with no profile would list an empty mentor or funder.
    const Profile = user.role === "mentor" ? MentorProfile : user.role === "funder" ? FunderProfile : null;
    if (Profile && !(await Profile.exists({ userId: user._id }))) {
      throw new ApiError(400, "This user has not filled in their profile yet.");
    }
  }

  // Suspending or rejecting also ends the account's sessions, so a token taken
  // before does not work again if the account is reactivated later. The person
  // then sees why at sign-in ("suspended" or "not approved").
  if (status === "suspended" && user.status !== "suspended") user.passwordChangedAt = new Date();
  user.status = status;
  if (rejected) user.rejected = true;
  if (approved) user.rejected = false;
  await user.save();
  // A mentor appears in the directory, and their posts in the feed, only while active.
  if (user.role === "mentor") expireTags(TAGS.mentors, TAGS.mentor(id), TAGS.posts);

  if (approved) {
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
