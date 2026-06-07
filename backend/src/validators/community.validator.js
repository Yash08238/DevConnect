const { body } = require("express-validator");

exports.createCommunityValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name must be less than 100 characters"),
  body("slug").trim().notEmpty().withMessage("Slug is required").matches(/^[a-z0-9-]+$/).withMessage("Slug can only contain lowercase letters, numbers, and hyphens"),
  body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description must be less than 1000 characters"),
  body("isPrivate").optional().isBoolean().withMessage("isPrivate must be a boolean"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

exports.updateCommunityValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name must be less than 100 characters"),
  body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description must be less than 1000 characters"),
  body("isPrivate").optional().isBoolean().withMessage("isPrivate must be a boolean"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("rules").optional().isArray().withMessage("Rules must be an array"),
];
