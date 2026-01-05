const logger = require("../utils/logger");
const { HTTP_STATUS, SUCCESS_MESSAGES } = require("../config/constants");
const { asyncHandler } = require("../utils/errorHandler");

/**
 * Verify Firebase token
 */
const verifyToken = asyncHandler((req, res) => {
  logger.info(`Token verified for user: ${req.user.uid}`);
  res.status(HTTP_STATUS.OK).json({
    message: SUCCESS_MESSAGES.AUTH_SUCCESS,
    user: req.user,
  });
});

/**
 * Health check
 */
const healthCheck = (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: "ok",
    service: "transaction-website-api",
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  verifyToken,
  healthCheck,
};
