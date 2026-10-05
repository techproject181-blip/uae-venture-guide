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
  },
  { timestamps: true },
);

userSchema.index({ status: 1, createdAt: -1 });

// Next.js re-runs this file after each edit in development. Dropping the old
// model first makes sure schema changes take effect without a restart.
if (mongoose.models.User) mongoose.deleteModel("User");
export const User = mongoose.model("User", userSchema);
