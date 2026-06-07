const Comment = require("../models/Comment");
const Post = require("../models/Post");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { createNotification } = require("../services/notification.service");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

exports.createComment = asyncHandler(async (req, res, next) => {
  const { content, parentId } = req.body;
  const post = await Post.findById(req.params.postId);

  if (!post) return next(new ApiError(404, "Post not found"));

  let parentComment = null;
  let depth = 0;

  if (parentId) {
    parentComment = await Comment.findById(parentId);
    if (!parentComment) return next(new ApiError(404, "Parent comment not found"));
    depth = parentComment.depth + 1;
    if (depth > 3) return next(new ApiError(400, "Maximum reply depth reached"));
  }

  const comment = await Comment.create({
    author: req.user.id,
    post: post._id,
    parent: parentId || null,
    content,
    depth,
  });

  post.commentCount += 1;
  await post.save({ validateBeforeSave: false });

  await comment.populate("author", "name username avatar");

  // Notify post author
  if (post.author.toString() !== req.user.id) {
    await createNotification({
      recipient: post.author,
      sender: req.user.id,
      type: "comment",
      post: post._id,
      comment: comment._id,
      message: `${req.user.name} commented on your post`,
    });
  }

  // Notify parent comment author
  if (parentComment && parentComment.author.toString() !== req.user.id) {
    await createNotification({
      recipient: parentComment.author,
      sender: req.user.id,
      type: "comment",
      post: post._id,
      comment: comment._id,
      message: `${req.user.name} replied to your comment`,
    });
  }

  res.status(201).json(new ApiResponse(201, comment, "Comment added successfully"));
});

exports.getPostComments = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = { post: req.params.postId, parent: null }; // Get top-level comments

  const total = await Comment.countDocuments(filter);
  const comments = await Comment.find(filter)
    .populate("author", "name username avatar")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  // Fetch direct replies for these comments
  const commentIds = comments.map(c => c._id);
  const replies = await Comment.find({ parent: { $in: commentIds } })
    .populate("author", "name username avatar")
    .sort("createdAt");

  res.status(200).json(
    new ApiResponse(200, {
      comments,
      replies,
      meta: buildPaginationMeta(total, page, limit),
    })
  );
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return next(new ApiError(404, "Comment not found"));

  if (comment.author.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ApiError(403, "Not authorized to delete this comment"));
  }

  // Soft delete
  comment.isDeleted = true;
  comment.content = "[Comment deleted]";
  comment.deletedAt = Date.now();
  await comment.save();

  // Decrement post comment count
  const post = await Post.findById(comment.post);
  if (post && post.commentCount > 0) {
    post.commentCount -= 1;
    await post.save({ validateBeforeSave: false });
  }

  res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

exports.updateComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return next(new ApiError(404, "Comment not found"));

  if (comment.author.toString() !== req.user.id.toString() && req.user.role !== "admin") {
    return next(new ApiError(403, "Not authorized to edit this comment"));
  }

  comment.content = req.body.content;
  comment.isEdited = true;
  await comment.save();

  res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
});
