const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Community name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    avatar: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    banner: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rules: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    tags: [{ type: String, trim: true }],
    isPrivate: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    postCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

communitySchema.virtual("memberCount").get(function () {
  return this.members.length;
});

communitySchema.index({ name: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Community", communitySchema);
