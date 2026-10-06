import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { createSession } from "@/lib/session";
import { signUpSchema } from "@/lib/schemas/auth";
import { fieldErrors } from "@/lib/schemas/helpers";
import { User } from "@/models/User";

// POST /api/auth/sign-up  { name, email, password, role }
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const parsed = signUpSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return Response.json({ error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) }, { status: 400 });
  }
  const { name, email, password, role } = parsed.data;

  try {
    await connectDB();
    if (await User.exists({ email })) return emailTaken();

    const user = await User.create({
      name,
      email,
      role,
      passwordHash: await bcrypt.hash(password, 10),
      status: role === "entrepreneur" ? "active" : "pending",
    });
    await createSession(user);

    return Response.json({ redirectTo: user.status === "active" ? "/dashboard" : "/pending" }, { status: 201 });
  } catch (error) {
    // 11000 is MongoDB's duplicate-key error: two sign-ups with the same email at the same moment.
    if (error?.code === 11000) return emailTaken();
    console.error("Sign-up failed:", error);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

function emailTaken() {
  const message = "An account with this email already exists.";
  return Response.json({ error: message, fieldErrors: { email: message } }, { status: 409 });
}
