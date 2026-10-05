import mongoose from "mongoose";

// One message in a plan's chat with the AI assistant. Kept apart from the plan
// because a chat can grow without limit.
const chatMessageSchema = new mongoose.Schema(
  {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, maxlength: 8000 },
    sourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Source" }],
  },
  { timestamps: true },
);

chatMessageSchema.index({ planId: 1, createdAt: 1 });

if (mongoose.models.ChatMessage) mongoose.deleteModel("ChatMessage");
export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
