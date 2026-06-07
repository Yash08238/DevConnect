const Notification = require("../models/Notification");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

exports.getNotifications = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);

  const total = await Notification.countDocuments({ recipient: req.user.id });
  const notifications = await Notification.find({ recipient: req.user.id })
    .populate("sender", "name username avatar")
    .populate("post", "title")
    .populate("community", "name slug")
    .populate("job", "title")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });

  res.status(200).json(
    new ApiResponse(200, {
      notifications,
      unreadCount,
      meta: buildPaginationMeta(total, page, limit),
    })
  );
});

exports.markAsRead = asyncHandler(async (req, res, next) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true,
    readAt: Date.now(),
  });

  res.status(200).json(new ApiResponse(200, {}, "Notification marked as read"));
});

exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { recipient: req.user.id, isRead: false },
    { isRead: true, readAt: Date.now() }
  );

  res.status(200).json(new ApiResponse(200, {}, "All notifications marked as read"));
});
