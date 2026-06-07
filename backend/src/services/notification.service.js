const Notification = require("../models/Notification");
const { getIo } = require("../sockets");

exports.createNotification = async ({ recipient, sender, type, post, comment, community, job, message }) => {
  try {
    if (recipient.toString() === sender.toString()) return; // Don't notify self

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post,
      comment,
      community,
      job,
      message,
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate("sender", "name username avatar")
      .populate("post", "title")
      .populate("community", "name slug")
      .populate("job", "title");

    const io = getIo();
    if (io) {
      io.to(recipient.toString()).emit("new_notification", populatedNotification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
