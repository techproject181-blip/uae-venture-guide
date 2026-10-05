import mongoose from "mongoose";
import { EMIRATES, EXPERTISE, SECTORS, valuesOf } from "../lib/constants.js";

// What a mentor shows in the public directory. One per mentor.
const mentorProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    headline: { type: String, required: true, trim: true, maxlength: 120 },
    bio: { type: String, required: true, trim: true, maxlength: 2000 },
    expertise: [{ type: String, enum: valuesOf(EXPERTISE) }],
    industries: [{ type: String, enum: valuesOf(SECTORS) }],
    emirates: [{ type: String, enum: valuesOf(EMIRATES) }],
    yearsExperience: { type: Number, min: 0, max: 60, default: 0 },
    linkedinUrl: { type: String, trim: true },
    acceptingRequests: { type: Boolean, default: true },
  },
  { timestamps: true },
);

if (mongoose.models.MentorProfile) mongoose.deleteModel("MentorProfile");
export const MentorProfile = mongoose.model("MentorProfile", mentorProfileSchema);
