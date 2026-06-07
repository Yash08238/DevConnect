const Job = require("../models/Job");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { uploadImage } = require("../services/cloudinary.service");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

exports.createJob = asyncHandler(async (req, res, next) => {
  const jobData = { ...req.body, postedBy: req.user.id };
  
  if (req.body.tags) {
    jobData.tags = JSON.parse(req.body.tags);
  }

  if (req.file) {
    const result = await uploadImage(req.file.buffer, "company_logos");
    jobData.company = {
      ...jobData.company,
      logo: { url: result.url, publicId: result.publicId },
    };
  }

  const job = await Job.create(jobData);

  res.status(201).json(new ApiResponse(201, job, "Job posted successfully"));
});

exports.getJobs = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = { status: "open" };

  if (req.query.type) filter.type = req.query.type;
  if (req.query.workMode) filter.workMode = req.query.workMode;
  if (req.query.experienceLevel) filter.experienceLevel = req.query.experienceLevel;

  const total = await Job.countDocuments(filter);
  const jobs = await Job.find(filter)
    .populate("postedBy", "name username avatar")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(200, {
      jobs,
      meta: buildPaginationMeta(total, page, limit),
    })
  );
});

exports.getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id).populate("postedBy", "name username avatar");
  if (!job) return next(new ApiError(404, "Job not found"));

  job.viewCount += 1;
  await job.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, job));
});

exports.applyJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) return next(new ApiError(404, "Job not found"));

  if (job.status !== "open") {
    return next(new ApiError(400, "This job is no longer accepting applications"));
  }

  const hasApplied = job.applicants.some((app) => app.user.toString() === req.user.id.toString());
  if (hasApplied) {
    return next(new ApiError(400, "You have already applied for this job"));
  }

  job.applicants.push({ user: req.user.id });
  await job.save();

  res.status(200).json(new ApiResponse(200, {}, "Application submitted successfully"));
});
