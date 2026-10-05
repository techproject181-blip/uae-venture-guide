import mongoose from "mongoose";

// Failed sign-ins per email, to slow down password guessing (NFR-04).
// MongoDB deletes each record 15 minutes after the first failure.
export const LOCK_MINUTES = 15;

const loginAttemptSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  failures: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: LOCK_MINUTES * 60 },
});

if (mongoose.models.LoginAttempt) mongoose.deleteModel("LoginAttempt");
export const LoginAttempt = mongoose.model("LoginAttempt", loginAttemptSchema);
