const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const validate = require("../middleware/validate");
const { authenticate, optionalAuth } = require("../middleware/auth");
const { uploadArray } = require("../middleware/upload");
const { createPostValidation, updatePostValidation } = require("../validators/post.validator");

router.route("/")
  .post(authenticate, uploadArray("images", 4), validate(createPostValidation), postController.createPost)
  .get(optionalAuth, postController.getFeed);

router.route("/:id")
  .get(postController.getPost)
  .put(authenticate, validate(updatePostValidation), postController.updatePost)
  .delete(authenticate, postController.deletePost);

router.post("/:id/like", authenticate, postController.likePost);
router.post("/:id/unlike", authenticate, postController.unlikePost);
router.post("/:id/bookmark", authenticate, postController.bookmarkPost);
router.post("/:id/unbookmark", authenticate, postController.unbookmarkPost);

module.exports = router;
