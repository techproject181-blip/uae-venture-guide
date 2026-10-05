import { getCurrentUser } from "@/lib/session";

// GET /api/auth/me: the signed-in user, or 401.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Not signed in." }, { status: 401 });
    return Response.json({ user });
  } catch (error) {
    console.error("Loading the current user failed:", error);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
