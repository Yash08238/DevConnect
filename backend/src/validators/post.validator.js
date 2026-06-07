const { body } = require("express-validator");

exports.createPostValidation = [
  body("type").optional().isIn(["text", "image", "code", "project"]).withMessage("Invalid post type"),
  body("title").optional().trim().isLength({ max: 300 }).withMessage("Title must be less than 300 characters"),
  body("content").trim().notEmpty().withMessage("Content is required").isLength({ max: 5000 }).withMessage("Content must be less than 5000 characters"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

exports.updatePostValidation = [
  body("title").optional().trim().isLength({ max: 300 }).withMessage("Title must be less than 300 characters"),
  body("content").optional().trim().notEmpty().withMessage("Content is required").isLength({ max: 5000 }).withMessage("Content must be less than 5000 characters"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];
