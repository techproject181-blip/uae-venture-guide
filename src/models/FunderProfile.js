import mongoose from "mongoose";
import { FUNDER_TYPES, SECTORS, valuesOf } from "../lib/constants.js";

// Who a funder is and what they invest in. Plan owners see it with an interest request.
const funderProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    organization: { type: String, required: true, trim: true, maxlength: 120 },
    funderType: { type: String, enum: valuesOf(FUNDER_TYPES), required: true },
    ticketMinAed: { type: Number, min: 0, required: true },
    ticketMaxAed: { type: Number, min: 0, required: true },
    sectors: [{ type: String, enum: valuesOf(SECTORS) }],
    bio: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

if (mongoose.models.FunderProfile) mongoose.deleteModel("FunderProfile");
export const FunderProfile = mongoose.model("FunderProfile", funderProfileSchema);
