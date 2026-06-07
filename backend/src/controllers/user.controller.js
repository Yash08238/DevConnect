const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { uploadImage, deleteImage } = require("../services/cloudinary.service");
const { createNotification } = require("../services/notification.service");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username })
    .populate("followers", "name username avatar")
    .populate("following", "name username avatar");

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  res.status(200).json(new ApiResponse(200, user));
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = ["name", "bio", "location", "skills", "socialLinks", "portfolio"];
  const updateData = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});

exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, "Please upload an image"));

  const user = await User.findById(req.user.id);

  if (user.avatar && user.avatar.publicId) {
    await deleteImage(user.avatar.publicId);
  }

  const result = await uploadImage(req.file.buffer, "avatars");
  user.avatar = { url: result.url, publicId: result.publicId };
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});

exports.followUser = asyncHandler(async (req, res, next) => {
  const userToFollow = await User.findById(req.params.id);
  if (!userToFollow) return next(new ApiError(404, "User not found"));
  
  if (userToFollow.id === req.user.id) {
    return next(new ApiError(400, "You cannot follow yourself"));
  }

  if (req.user.following.includes(userToFollow.id)) {
    return next(new ApiError(400, "You are already following this user"));
  }

  req.user.following.push(userToFollow.id);
  userToFollow.followers.push(req.user.id);

  await Promise.all([req.user.save({ validateBeforeSave: false }), userToFollow.save({ validateBeforeSave: false })]);

  await createNotification({
    recipient: userToFollow.id,
    sender: req.user.id,
    type: "follow",
    message: `${req.user.name} started following you`,
  });

  res.status(200).json(new ApiResponse(200, {}, "User followed successfully"));
});

exports.unfollowUser = asyncHandler(async (req, res, next) => {
  const userToUnfollow = await User.findById(req.params.id);
  if (!userToUnfollow) return next(new ApiError(404, "User not found"));

  req.user.following = req.user.following.filter(id => id.toString() !== userToUnfollow.id.toString());
  userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user.id.toString());

  await Promise.all([req.user.save({ validateBeforeSave: false }), userToUnfollow.save({ validateBeforeSave: false })]);

  res.status(200).json(new ApiResponse(200, {}, "User unfollowed successfully"));
});

exports.getSuggestedUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({
    _id: { $ne: req.user.id, $nin: req.user.following },
    isActive: true,
  })
    .select("name username avatar bio followerCount")
    .sort("-followerCount")
    .limit(5);

  res.status(200).json(new ApiResponse(200, users));
});

exports.getFollowers = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username }).populate("followers", "name username avatar bio");
  if (!user) return next(new ApiError(404, "User not found"));
  res.status(200).json(new ApiResponse(200, user.followers));
});

exports.getFollowing = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username }).populate("following", "name username avatar bio");
  if (!user) return next(new ApiError(404, "User not found"));
  res.status(200).json(new ApiResponse(200, user.following));
});
