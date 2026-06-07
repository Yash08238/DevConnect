const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");
const { updateProfileValidation } = require("../validators/user.validator");

router.get("/suggested", authenticate, userController.getSuggestedUsers);
router.get("/:username", userController.getUserProfile);
router.get("/:username/followers", userController.getFollowers);
router.get("/:username/following", userController.getFollowing);
router.put("/profile", authenticate, validate(updateProfileValidation), userController.updateProfile);
router.post("/avatar", authenticate, uploadSingle("avatar"), userController.uploadAvatar);
router.post("/:id/follow", authenticate, userController.followUser);
router.post("/:id/unfollow", authenticate, userController.unfollowUser);

module.exports = router;
