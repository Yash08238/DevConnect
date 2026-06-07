const Community = require("../models/Community");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { uploadImage } = require("../services/cloudinary.service");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

exports.createCommunity = asyncHandler(async (req, res, next) => {
  const { name, slug, description, tags, isPrivate } = req.body;

  const existing = await Community.findOne({ slug });
  if (existing) return next(new ApiError(400, "Community slug already exists"));

  const communityData = {
    name,
    slug,
    description,
    tags: tags ? JSON.parse(tags) : [],
    isPrivate,
    creator: req.user.id,
    moderators: [req.user.id],
    members: [req.user.id],
  };

  if (req.files) {
    if (req.files.avatar) {
      const avatarRes = await uploadImage(req.files.avatar[0].buffer, "community_avatars");
      communityData.avatar = { url: avatarRes.url, publicId: avatarRes.publicId };
    }
    if (req.files.banner) {
      const bannerRes = await uploadImage(req.files.banner[0].buffer, "community_banners");
      communityData.banner = { url: bannerRes.url, publicId: bannerRes.publicId };
    }
  }

  const community = await Community.create(communityData);

  res.status(201).json(new ApiResponse(201, community, "Community created successfully"));
});

exports.getCommunities = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);

  const total = await Community.countDocuments();
  const communities = await Community.find()
    .sort("-memberCount")
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(200, {
      communities,
      meta: buildPaginationMeta(total, page, limit),
    })
  );
});

exports.getCommunity = asyncHandler(async (req, res, next) => {
  const community = await Community.findOne({ slug: req.params.slug })
    .populate("moderators", "name username avatar")
    .populate("members", "name username avatar");

  if (!community) return next(new ApiError(404, "Community not found"));

  res.status(200).json(new ApiResponse(200, community));
});

exports.joinCommunity = asyncHandler(async (req, res, next) => {
  const community = await Community.findOne({ slug: req.params.slug });
  if (!community) return next(new ApiError(404, "Community not found"));

  if (community.members.includes(req.user.id)) {
    return next(new ApiError(400, "You are already a member"));
  }

  community.members.push(req.user.id);
  await community.save();

  res.status(200).json(new ApiResponse(200, {}, "Joined community successfully"));
});

exports.leaveCommunity = asyncHandler(async (req, res, next) => {
  const community = await Community.findOne({ slug: req.params.slug });
  if (!community) return next(new ApiError(404, "Community not found"));

  if (community.creator.toString() === req.user.id) {
    return next(new ApiError(400, "Creator cannot leave the community"));
  }

  community.members = community.members.filter(id => id.toString() !== req.user.id.toString());
  community.moderators = community.moderators.filter(id => id.toString() !== req.user.id.toString());
  await community.save();

  res.status(200).json(new ApiResponse(200, {}, "Left community successfully"));
});
