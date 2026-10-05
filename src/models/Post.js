import mongoose from "mongoose";

// An experience post by a mentor: Markdown text, up to five pictures and an
// optional small chart.
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, required: true, trim: true, maxlength: 200 }, // read out by screen readers
  },
  { _id: false },
);

const chartSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["bar", "line", "pie"], required: true },
    title: { type: String, trim: true, maxlength: 120 },
    labels: [{ type: String, trim: true, maxlength: 40 }],
    values: [{ type: Number }],
  },
  { _id: false },
);

const postSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    body: { type: String, required: true, maxlength: 20000 }, // Markdown, shown without raw HTML
    images: { type: [imageSchema], validate: [(list) => list.length <= 5, "At most five pictures."] },
    chart: chartSchema,
    status: { type: String, enum: ["published", "hidden"], default: "published" }, // hidden = removed by an administrator
  },
  { timestamps: true },
);

postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ authorId: 1, createdAt: -1 });

if (mongoose.models.Post) mongoose.deleteModel("Post");
export const Post = mongoose.model("Post", postSchema);
