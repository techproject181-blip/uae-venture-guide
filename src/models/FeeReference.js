import mongoose from "mongoose";
import { EMIRATES, FEE_KINDS, JURISDICTIONS, RECURRENCES, valuesOf } from "../lib/constants.js";

// An official fee, entered by the administrator from a source page. A roadmap
// cost marked "official" must come from one of these; anything else is an estimate.
const feeReferenceSchema = new mongoose.Schema(
  {
    sourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Source", required: true },
    kind: { type: String, enum: valuesOf(FEE_KINDS), required: true },
    item: { type: String, required: true, trim: true, maxlength: 160 }, // for example "Trade licence, professional activity"
    emirate: { type: String, enum: [...valuesOf(EMIRATES), null], default: null }, // null = federal, all emirates
    jurisdiction: { type: String, enum: [...valuesOf(JURISDICTIONS), "any"], default: "any" },
    amountMinAed: { type: Number, required: true, min: 0 },
    amountMaxAed: { type: Number, required: true, min: 0 },
    recurrence: { type: String, enum: valuesOf(RECURRENCES), required: true },
    notes: { type: String, trim: true, maxlength: 400 },
    verifiedAt: { type: Date, required: true },
    active: { type: Boolean, default: true },
    demo: { type: Boolean, default: false },
  },
  { timestamps: true },
);

feeReferenceSchema.index({ kind: 1, emirate: 1, active: 1 });
feeReferenceSchema.index({ sourceId: 1 });

if (mongoose.models.FeeReference) mongoose.deleteModel("FeeReference");
export const FeeReference = mongoose.model("FeeReference", feeReferenceSchema);
