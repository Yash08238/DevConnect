const express = require("express");
const router = express.Router();
const communityController = require("../controllers/community.controller");
const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { uploadArray } = require("../middleware/upload"); // Wait, better to use upload fields for avatar and banner, but for simplicity let's use multer fields if needed, or upload from frontend and send url. Actually, we built communityController to handle req.files.avatar and req.files.banner.
// We need a specific upload middleware for fields.

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { createCommunityValidation } = require("../validators/community.validator");

router.route("/")
  .post(authenticate, upload.fields([{ name: "avatar", maxCount: 1 }, { name: "banner", maxCount: 1 }]), validate(createCommunityValidation), communityController.createCommunity)
  .get(communityController.getCommunities);

router.get("/:slug", communityController.getCommunity);
router.post("/:slug/join", authenticate, communityController.joinCommunity);
router.post("/:slug/leave", authenticate, communityController.leaveCommunity);

module.exports = router;
