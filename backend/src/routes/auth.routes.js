const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const { authenticate } = require("../middleware/auth");
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../validators/auth.validator");

router.post("/register", authLimiter, validate(registerValidation), authController.register);
router.post("/login", authLimiter, validate(loginValidation), authController.login);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authLimiter, validate(forgotPasswordValidation), authController.forgotPassword);
router.post("/reset-password/:token", authLimiter, validate(resetPasswordValidation), authController.resetPassword);

module.exports = router;
