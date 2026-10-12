import mongoose from "mongoose";

// Failed sign-ins per email, to slow down password guessing (NFR-04).
// Five wrong passwords lock that email for 15 minutes, counted from the fifth.
// Each counted try moves expiresAt 15 minutes on, so the count also starts
// again after 15 quiet minutes. MongoDB deletes a record once expiresAt passes.
export const MAX_FAILURES = 5;
export const LOCK_MINUTES = 15;

const loginAttemptSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  failures: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

loginAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

if (mongoose.models.LoginAttempt) mongoose.deleteModel("LoginAttempt");
export const LoginAttempt = mongoose.model("LoginAttempt", loginAttemptSchema);

/**
 * Counts one password try for `email`, before the password is checked.
 * Returns 0 when the password may be checked, or the minutes left while the
 * email is locked. A right password then calls clearAttempts().
 *
 * Checking and counting happen in one database call, so tries sent at the
 * same moment cannot all see "4 so far" and all get through: only the first
 * five are let through, however close together they arrive.
 */
export async function countAttempt(email) {
  const now = new Date();
  const running = { $gt: ["$expiresAt", now] }; // false for a new record, or one whose 15 minutes are over
  const locked = { $and: [running, { $gte: ["$failures", MAX_FAILURES] }] };
  const attempt = await LoginAttempt.findOneAndUpdate(
    { email },
    [
      {
        $set: {
          failures: { $cond: [running, { $add: ["$failures", 1] }, 1] },
          // A locked email keeps its end time, so the lock ends 15 minutes after the fifth try.
          expiresAt: { $cond: [locked, "$expiresAt", new Date(now.getTime() + LOCK_MINUTES * 60 * 1000)] },
        },
      },
    ],
    { upsert: true, returnDocument: "after", updatePipeline: true },
  ).lean();

  if (attempt.failures <= MAX_FAILURES) return 0;
  return Math.ceil((attempt.expiresAt.getTime() - now.getTime()) / (60 * 1000));
}

/** Ends the count for `email`, after a right password or a password reset. */
export async function clearAttempts(email) {
  await LoginAttempt.deleteOne({ email });
}

/** "1 minute" or "12 minutes", for the lock message. */
export function minutesText(minutes) {
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}
