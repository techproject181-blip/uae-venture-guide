import mongoose from "mongoose";

// How many roadmaps and chat messages a user made on one day (UAE time).
// Used for the daily limits and the administrator's usage page.
const aiUsageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    day: { type: String, required: true }, // "YYYY-MM-DD" in UAE time
    generations: { type: Number, default: 0 },
    chatMessages: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// One document per user per day. The unique index is also what makes the limit
// check safe when two requests arrive at the same moment (see lib/quota.js).
aiUsageSchema.index({ userId: 1, day: 1 }, { unique: true });
// Old usage is deleted automatically after 180 days.
aiUsageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

if (mongoose.models.AiUsage) mongoose.deleteModel("AiUsage");
export const AiUsage = mongoose.model("AiUsage", aiUsageSchema);
