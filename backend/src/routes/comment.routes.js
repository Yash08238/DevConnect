const express = require("express");
const router = express.Router({ mergeParams: true }); // Merge params to get postId from post routes if needed
const commentController = require("../controllers/comment.controller");
const { authenticate } = require("../middleware/auth");

router.post("/post/:postId", authenticate, commentController.createComment);
router.get("/post/:postId", commentController.getPostComments);
router.delete("/:id", authenticate, commentController.deleteComment);
router.put("/:id", authenticate, commentController.updateComment);

module.exports = router;
