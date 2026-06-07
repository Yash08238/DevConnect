const { body } = require("express-validator");

exports.registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name must be less than 100 characters"),
  body("username").trim().notEmpty().withMessage("Username is required").isLength({ min: 3, max: 30 }).withMessage("Username must be between 3 and 30 characters").matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Please enter a valid email"),
  body("password").trim().notEmpty().withMessage("Password is required").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

exports.loginValidation = [
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Please enter a valid email"),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

exports.forgotPasswordValidation = [
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Please enter a valid email"),
];

exports.resetPasswordValidation = [
  body("password").trim().notEmpty().withMessage("Password is required").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];
