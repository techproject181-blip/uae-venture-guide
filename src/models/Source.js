import mongoose from "mongoose";
import { EMIRATES, SOURCE_CATEGORIES, valuesOf } from "../lib/constants.js";

// An official web page (government or free zone) that the administrator has
// checked. Roadmaps and chat answers may only link to active sources.
const sourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    publisher: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true, trim: true },
    emirate: { type: String, enum: [...valuesOf(EMIRATES), null], default: null }, // null = federal, all emirates
    categories: [{ type: String, enum: valuesOf(SOURCE_CATEGORIES) }],
    summary: { type: String, required: true, trim: true, maxlength: 600 },
    verifiedAt: { type: Date, required: true }, // when the administrator last checked the page
    active: { type: Boolean, default: true },
    demo: { type: Boolean, default: false }, // sample data, not checked
  },
  { timestamps: true },
);

// Lets the public directory search by words in the title, publisher and summary.
sourceSchema.index({ title: "text", publisher: "text", summary: "text" }, { name: "sources_text" });
sourceSchema.index({ active: 1, emirate: 1 });

if (mongoose.models.Source) mongoose.deleteModel("Source");
export const Source = mongoose.model("Source", sourceSchema);
