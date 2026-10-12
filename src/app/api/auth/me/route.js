import { requireApiUserOrPending, route } from "@/lib/api";

// GET /api/auth/me: the signed-in user. Like the other API routes it answers
// 401 when nobody is signed in and 403 when the account is suspended; an
// account still waiting for approval gets its details.
export const GET = route(async () => {
  const user = await requireApiUserOrPending();
  return Response.json({ user });
});
