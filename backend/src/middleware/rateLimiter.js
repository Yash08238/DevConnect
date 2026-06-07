const rateLimit = require("express-rate-limit");
const ApiError = require("../utils/ApiError");

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
  handler: (req, res, next) => {
    next(new ApiError(429, "Too many requests from this IP, please try again after 15 minutes"));
  },
});

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  handler: (req, res, next) => {
    next(new ApiError(429, "Too many requests from this IP, please try again after 15 minutes"));
  },
});
