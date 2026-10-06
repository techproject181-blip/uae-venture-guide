import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

// An entrepreneur asking a mentor for guidance, optionally with a plan attached.
// While accepted, the mentor may read the attached plan.
const mentorRequestSchema = new mongoose.Schema(
  {
    entrepreneurId: { type: ObjectId, ref: "User", required: true },
    mentorId: { type: ObjectId, ref: "User", required: true },
    planId: { type: ObjectId, ref: "Plan" },
    topic: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ["pending", "accepted", "declined", "completed"], default: "pending" },
    mentorReply: { type: String, trim: true, maxlength: 2000 },
    respondedAt: Date,
  },
  { timestamps: true },
);

// Only one waiting request per entrepreneur and mentor at a time.
mentorRequestSchema.index({ entrepreneurId: 1, mentorId: 1 }, { unique: true, partialFilterExpression: { status: "pending" } });
mentorRequestSchema.index({ mentorId: 1, status: 1, createdAt: -1 });

if (mongoose.models.MentorRequest) mongoose.deleteModel("MentorRequest");
export const MentorRequest = mongoose.model("MentorRequest", mentorRequestSchema);
