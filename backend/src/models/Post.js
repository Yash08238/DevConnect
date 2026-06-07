const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "code", "project"],
      default: "text",
    },
    title: {
      type: String,
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },
    codeSnippet: {
      language: { type: String, default: "javascript" },
      code: { type: String, default: "" },
    },
    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    projectLink: {
      type: String,
      default: "",
    },
    githubLink: {
      type: String,
      default: "",
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default: null,
    },
    commentCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: like count
postSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ content: "text", title: "text", tags: "text" });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);