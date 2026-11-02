import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["entrepreneur", "mentor", "funder", "admin"], required: true },
    // Entrepreneurs start active. Mentors and funders stay pending until an administrator approves them.
    status: { type: String, enum: ["active", "pending", "suspended"], required: true },
    // Password reset: only a hash of the emailed token is stored, so a database leak cannot reset passwords.
    passwordResetHash: String,
    passwordResetExpires: Date,
    // Sessions signed in before this moment stop working, so a password change signs out other devices.
    passwordChangedAt: Date,
    // True when an administrator rejected the sign-up, as opposed to suspending a working account.
    rejected: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.index({ status: 1, createdAt: -1 });

// Next.js re-runs this file after each edit in development. Dropping the old
// model first makes sure schema changes take effect without a restart. Only
// once connected: the build can also load this file twice (pages and API
// routes), and a model dropped before the connection opens leaves the other
// copy's queries waiting forever, so then the existing model is reused.
if (mongoose.models.User && mongoose.connection.readyState === 1) mongoose.deleteModel("User");
export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
