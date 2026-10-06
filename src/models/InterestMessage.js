import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

// One message in the conversation between a plan's owner and a funder, once
// the owner has accepted the funder's interest.
const interestMessageSchema = new mongoose.Schema(
  {
    interestId: { type: ObjectId, ref: "FundingInterest", required: true },
    authorId: { type: ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
  },
  { timestamps: true },
);

// A conversation is always read oldest first.
interestMessageSchema.index({ interestId: 1, createdAt: 1 });
// For the "messages sent in the last minute" limit.
interestMessageSchema.index({ authorId: 1, createdAt: -1 });

if (mongoose.models.InterestMessage) mongoose.deleteModel("InterestMessage");
export const InterestMessage = mongoose.model("InterestMessage", interestMessageSchema);
