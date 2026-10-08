import { z } from "zod";

// Used by both the forms (instant feedback) and the API routes (the real check).

export const SIGN_UP_ROLES = ["entrepreneur", "mentor", "funder"];

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address."));

// Spaces at the start and end are trimmed off, so a stray space from a paste or
// a phone keyboard cannot make a password that nobody can type again.
export const password = z
  .string()
  .trim()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.") // bcrypt ignores anything after 72 bytes
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.");

export const signUpSchema = z.object({
  name: z.string("Enter your full name.").trim().min(2, "Enter your full name.").max(80, "Use 80 characters or fewer."),
  email,
  password,
  role: z.enum(SIGN_UP_ROLES, "Choose how you are joining."),
});

export const signInSchema = z.object({
  email,
  password: z.string().trim().min(1, "Enter your password."),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "This reset link is not complete."),
  password,
});

/** The account page: the name everyone sees. */
export const accountSchema = z.object({
  name: z.string("Enter your full name.").trim().min(2, "Enter your full name.").max(80, "Use 80 characters or fewer."),
});

/** The account page: a new password, given the current one. */
export const changePasswordSchema = z.object({
  currentPassword: z.string().trim().min(1, "Enter your current password."),
  password,
});
