import bcrypt from "bcryptjs";
import { fromOtherSite } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { createSession } from "@/lib/session";
import { signInSchema } from "@/lib/schemas/auth";
import { fieldErrors } from "@/lib/schemas/helpers";
import { clearAttempts, countAttempt, minutesText } from "@/models/LoginAttempt";
import { User } from "@/models/User";

// The hash of a random password. Checking against it when the email is unknown
// makes every failed sign-in take the same time, so the response time does not
// reveal which emails have an account.
const DUMMY_HASH = "$2b$10$oniKR91pR2coTSKXB2hAFe0pURt13c5DjCWFhZqe6WGKuqypoWvOS";

// POST /api/auth/sign-in  { email, password }
export async function POST(request) {
  if (fromOtherSite(request)) return Response.json({ error: "Please use the form on this website." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const parsed = signInSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return Response.json({ error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) }, { status: 400 });
  }
  const { email, password } = parsed.data;

  try {
    await connectDB();
    // Each try is counted before the password is checked. After five wrong
    // passwords for this email, stop checking until the lock ends.
    const lockedFor = await countAttempt(email);
    if (lockedFor) {
      return Response.json({ error: `Too many failed attempts. Wait ${minutesText(lockedFor)}, or reset your password.` }, { status: 429 });
    }

    const user = await User.findOne({ email });
    const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !passwordMatches) {
      return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    await clearAttempts(email);
    if (user.status === "suspended") {
      if (user.rejected) {
        return Response.json({ error: "This account was not approved. Please contact the administrator." }, { status: 403 });
      }
      return Response.json({ error: "This account is suspended. Please contact the administrator." }, { status: 403 });
    }

    await createSession(user);
    return Response.json({ redirectTo: user.status === "pending" ? "/pending" : "/dashboard" });
  } catch (error) {
    console.error("Sign-in failed:", error);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
