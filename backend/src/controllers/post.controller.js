const Post = require("../models/Post");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { uploadImage } = require("../services/cloudinary.service");
const { createNotification } = require("../services/notification.service");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

exports.createPost = asyncHandler(async (req, res, next) => {
  const { type, title, content, tags, community, projectLink, githubLink, codeSnippet } = req.body;

  const postData = {
    author: req.user.id,
    type: type || "text",
    title,
    content,
    tags: tags ? JSON.parse(tags) : [],
    community,
    projectLink,
    githubLink,
    codeSnippet: codeSnippet ? JSON.parse(codeSnippet) : undefined,
  };

  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => uploadImage(file.buffer, "posts"));
    const results = await Promise.all(uploadPromises);
    postData.images = results.map(r => ({ url: r.url, publicId: r.publicId }));
  }

  const post = await Post.create(postData);
  await post.populate("author", "name username avatar");

  res.status(201).json(new ApiResponse(201, post, "Post created successfully"));
});

exports.getFeed = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  if (req.query.type === "following" && req.user) {
    filter.author = { $in: [...req.user.following, req.user.id] };
  } else if (req.query.author) {
    filter.author = req.query.author;
  } else if (req.query.bookmarkedBy) {
    filter.bookmarkedBy = req.query.bookmarkedBy;
  } else if (req.query.community) {
    filter.community = req.query.community;
  }

  const total = await Post.countDocuments(filter);
  const posts = await Post.find(filter)
    .populate("author", "name username avatar")
    .populate("community", "name slug")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(200, {
      posts,
      meta: buildPaginationMeta(total, page, limit),
    })
  );
});

exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "name username avatar bio")
    .populate("community", "name slug avatar");

  if (!post) return next(new ApiError(404, "Post not found"));

  // Increment view count
  post.viewCount += 1;
  await post.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, post));
});

exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new ApiError(404, "Post not found"));

  if (post.likes.includes(req.user.id)) {
    return next(new ApiError(400, "You already liked this post"));
  }

  post.likes.push(req.user.id);
  await post.save({ validateBeforeSave: false });

  await createNotification({
    recipient: post.author,
    sender: req.user.id,
    type: "like",
    post: post._id,
    message: `${req.user.name} liked your post`,
  });

  res.status(200).json(new ApiResponse(200, {}, "Post liked successfully"));
});

exports.unlikePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new ApiError(404, "Post not found"));

  post.likes = post.likes.filter(id => id.toString() !== req.user.id.toString());
  await post.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, {}, "Post unliked successfully"));
});

exports.bookmarkPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new ApiError(404, "Post not found"));

  if (post.bookmarkedBy.includes(req.user.id)) {
    return next(new ApiError(400, "Post already bookmarked"));
  }

  post.bookmarkedBy.push(req.user.id);
  await post.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, {}, "Post bookmarked"));
});

exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new ApiError(404, "Post not found"));

  if (post.author.toString() !== req.user.id.toString() && req.user.role !== "admin") {
    return next(new ApiError(403, "Not authorized to delete this post"));
  }

  await post.deleteOne();

  res.status(200).json(new ApiResponse(200, {}, "Post deleted successfully"));
});

exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);
  if (!post) return next(new ApiError(404, "Post not found"));

  if (post.author.toString() !== req.user.id.toString() && req.user.role !== "admin") {
    return next(new ApiError(403, "Not authorized to update this post"));
  }

  const allowedFields = ["title", "content", "tags", "projectLink", "githubLink", "codeSnippet"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === "tags" && typeof req.body[field] === "string") {
        post[field] = JSON.parse(req.body[field]);
      } else if (field === "codeSnippet" && typeof req.body[field] === "string") {
        post[field] = JSON.parse(req.body[field]);
      } else {
        post[field] = req.body[field];
      }
    }
  });

  post.isEdited = true;
  await post.save();
  await post.populate("author", "name username avatar");

  res.status(200).json(new ApiResponse(200, post, "Post updated successfully"));
});

exports.unbookmarkPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new ApiError(404, "Post not found"));

  post.bookmarkedBy = post.bookmarkedBy.filter(id => id.toString() !== req.user.id.toString());
  await post.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, {}, "Post unbookmarked"));
});
