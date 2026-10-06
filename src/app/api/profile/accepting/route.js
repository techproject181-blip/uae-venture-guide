import { z } from "zod";
import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { MentorProfile } from "@/models/MentorProfile";

const schema = z.object({ accepting: z.boolean("Choose on or off.") });

// PATCH /api/profile/accepting  { accepting }
// The mentor turns new guidance requests on or off from the dashboard.
export const PATCH = route(async (request) => {
  const mentor = await requireApiUser("mentor");
  const { accepting } = await readBody(request, schema);
  await connectDB();
  const result = await MentorProfile.updateOne({ userId: mentor.id }, { $set: { acceptingRequests: accepting } });
  if (result.matchedCount === 0) throw new ApiError(404, "Fill in your profile first.");
  return Response.json({ accepting });
});
