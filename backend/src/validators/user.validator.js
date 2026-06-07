const { body } = require("express-validator");

exports.updateProfileValidation = [
  body("name").optional().trim().isLength({ max: 100 }).withMessage("Name must be less than 100 characters"),
  body("bio").optional().trim().isLength({ max: 500 }).withMessage("Bio must be less than 500 characters"),
  body("location").optional().trim().isLength({ max: 100 }).withMessage("Location must be less than 100 characters"),
  body("skills").optional().isArray().withMessage("Skills must be an array"),
  body("socialLinks").optional().isObject().withMessage("Social links must be an object"),
  body("socialLinks.github").optional().trim().isURL().withMessage("Must be a valid URL"),
  body("socialLinks.linkedin").optional().trim().isURL().withMessage("Must be a valid URL"),
  body("socialLinks.twitter").optional().trim().isURL().withMessage("Must be a valid URL"),
  body("socialLinks.website").optional().trim().isURL().withMessage("Must be a valid URL"),
];
