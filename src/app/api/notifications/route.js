import { requireApiUser, route } from "@/lib/api";
import { navCounts } from "@/lib/inbox";

// GET /api/notifications
// The numbers next to the navigation links, keyed by the link, for example
// { counts: { "/requests": 2 } }. The navigation asks every 15 seconds, so a
// new message shows without reloading the page.
export const GET = route(async () => {
  const user = await requireApiUser();
  return Response.json({ counts: await navCounts(user) });
});
