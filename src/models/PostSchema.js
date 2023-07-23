import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    linkedInPost: { type: Object },
    userId: { type: String, require: true },
    postDetails: { type: Object },
    postResponses: { type: Object }
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
