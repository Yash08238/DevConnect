const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    company: {
      name: { type: String, required: true, trim: true },
      logo: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
      website: { type: String, default: "" },
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      maxlength: [10000, "Description cannot exceed 10000 characters"],
    },
    requirements: [{ type: String, trim: true }],
    responsibilities: [{ type: String, trim: true }],
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "USD" },
      period: { type: String, enum: ["hour", "month", "year"], default: "year" },
      isPublic: { type: Boolean, default: true },
    },
    location: {
      type: String,
      default: "Remote",
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "freelance"],
      default: "full-time",
    },
    workMode: {
      type: String,
      enum: ["remote", "onsite", "hybrid"],
      default: "remote",
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "lead", "executive"],
      default: "mid",
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        appliedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["applied", "reviewing", "interview", "offered", "rejected"],
          default: "applied",
        },
      },
    ],
    status: {
      type: String,
      enum: ["open", "closed", "paused"],
      default: "open",
    },
    deadline: { type: Date },
    viewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

jobSchema.virtual("applicantCount").get(function () {
  return this.applicants.length;
});

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ tags: 1 });
jobSchema.index({ title: "text", description: "text", tags: "text", "company.name": "text" });

module.exports = mongoose.model("Job", jobSchema);
