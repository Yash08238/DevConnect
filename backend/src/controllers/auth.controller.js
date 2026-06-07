const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { generateTokenPair } = require("../utils/generateTokens");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/email.service");

const sendTokenResponse = (user, statusCode, res) => {
  const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);

  user.refreshTokens.push(refreshToken);
  user.save({ validateBeforeSave: false });

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res
    .status(statusCode)
    .cookie("accessToken", accessToken, { ...options, expires: new Date(Date.now() + 15 * 60 * 1000) })
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(statusCode, {
        user,
        accessToken,
      }, "Authentication successful")
    );
};

exports.register = asyncHandler(async (req, res, next) => {
  const { name, username, email, password } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return next(new ApiError(400, "User with this email or username already exists"));
  }

  const user = await User.create({
    name,
    username,
    email,
    password,
  });

  const verifyToken = crypto.randomBytes(20).toString("hex");
  user.emailVerifyToken = crypto.createHash("sha256").update(verifyToken).digest("hex");
  user.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationEmail(user.email, verifyToken);
  } catch (err) {
    console.error("Email error:", err);
    // don't fail registration if email fails, but log it
  }

  sendTokenResponse(user, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return next(new ApiError(401, "Invalid email or password"));
  }

  if (!user.isActive) {
    return next(new ApiError(401, "Account is deactivated"));
  }

  sendTokenResponse(user, 200, res);
});

exports.logout = asyncHandler(async (req, res, next) => {
  if (req.user) {
    req.user.refreshTokens = [];
    await req.user.save({ validateBeforeSave: false });
  }

  res
    .status(200)
    .cookie("accessToken", "none", { expires: new Date(Date.now() + 1 * 1000), httpOnly: true })
    .cookie("refreshToken", "none", { expires: new Date(Date.now() + 1 * 1000), httpOnly: true })
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json(new ApiResponse(200, user, "User profile retrieved"));
});

exports.refreshToken = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return next(new ApiError(401, "No refresh token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || "refreshsecretkey");

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(token)) {
      return next(new ApiError(401, "Invalid refresh token"));
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id, user.role);

    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, { ...options, expires: new Date(Date.now() + 15 * 60 * 1000) })
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, {
          user,
          accessToken,
          refreshToken: newRefreshToken,
        }, "Token refreshed successfully")
      );
  } catch (err) {
    return next(new ApiError(401, "Invalid or expired refresh token"));
  }
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError(404, "User not found with this email"));
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user.email, resetToken);
    res.status(200).json(new ApiResponse(200, {}, "Reset email sent successfully"));
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ApiError(500, "Email could not be sent"));
  }
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const passwordResetToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError(400, "Invalid or expired token"));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});
