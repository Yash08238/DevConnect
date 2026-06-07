const jwt = require("jsonwebtoken");

/**
 * Generate a short-lived access token (15 minutes)
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );
};

/**
 * Generate a long-lived refresh token (7 days)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
  );
};

/**
 * Generate both tokens and return them
 */
const generateTokenPair = (userId, role) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId);
  return { accessToken, refreshToken };
};

module.exports = { generateAccessToken, generateRefreshToken, generateTokenPair };
