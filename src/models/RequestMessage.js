import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

// One message in the conversation between a founder and a mentor about a
// guidance request. Kept apart from the request because a conversation can
// grow without limit.
const requestMessageSchema = new mongoose.Schema(
  {
    requestId: { type: ObjectId, ref: "MentorRequest", required: true },
    authorId: { type: ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
  },
  { timestamps: true },
);

// A conversation is always read oldest first.
requestMessageSchema.index({ requestId: 1, createdAt: 1 });
// For the "messages sent in the last minute" limit.
requestMessageSchema.index({ authorId: 1, createdAt: -1 });

if (mongoose.models.RequestMessage) mongoose.deleteModel("RequestMessage");
export const RequestMessage = mongoose.model("RequestMessage", requestMessageSchema);
