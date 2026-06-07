const { body } = require("express-validator");

exports.createJobValidation = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }).withMessage("Title must be less than 200 characters"),
  body("company.name").trim().notEmpty().withMessage("Company name is required"),
  body("description").trim().notEmpty().withMessage("Description is required").isLength({ max: 10000 }).withMessage("Description must be less than 10000 characters"),
  body("type").optional().isIn(["full-time", "part-time", "contract", "internship", "freelance"]).withMessage("Invalid job type"),
  body("workMode").optional().isIn(["remote", "onsite", "hybrid"]).withMessage("Invalid work mode"),
  body("experienceLevel").optional().isIn(["entry", "mid", "senior", "lead", "executive"]).withMessage("Invalid experience level"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

exports.updateJobValidation = [
  body("title").optional().trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }).withMessage("Title must be less than 200 characters"),
  body("company.name").optional().trim().notEmpty().withMessage("Company name is required"),
  body("description").optional().trim().notEmpty().withMessage("Description is required").isLength({ max: 10000 }).withMessage("Description must be less than 10000 characters"),
  body("type").optional().isIn(["full-time", "part-time", "contract", "internship", "freelance"]).withMessage("Invalid job type"),
  body("workMode").optional().isIn(["remote", "onsite", "hybrid"]).withMessage("Invalid work mode"),
  body("experienceLevel").optional().isIn(["entry", "mid", "senior", "lead", "executive"]).withMessage("Invalid experience level"),
  body("status").optional().isIn(["open", "closed", "paused"]).withMessage("Invalid status"),
];
