import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

// A funder telling a plan's owner they are interested. When the owner accepts,
// the funder may read the full plan for as long as it stays shared.
const fundingInterestSchema = new mongoose.Schema(
  {
    planId: { type: ObjectId, ref: "Plan", required: true },
    funderId: { type: ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    respondedAt: Date,
  },
  { timestamps: true },
);

// A funder can send one interest request per plan.
fundingInterestSchema.index({ planId: 1, funderId: 1 }, { unique: true });
fundingInterestSchema.index({ funderId: 1, createdAt: -1 });

if (mongoose.models.FundingInterest) mongoose.deleteModel("FundingInterest");
export const FundingInterest = mongoose.model("FundingInterest", fundingInterestSchema);
