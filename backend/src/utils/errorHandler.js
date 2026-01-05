const logger = require("./logger");
const { HTTP_STATUS, ERROR_MESSAGES } = require("../config/constants");

/**
 * Custom application error class
 */
class AppError extends Error {
  constructor(
    message,
    statusCode = HTTP_STATUS.INTERNAL_ERROR,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error handler wrapper
 * Catches errors from async route handlers and passes to error middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 */
const handleError = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_ERROR;

  // Log error
  logger.error("Error occurred:", {
    statusCode: error.statusCode,
    message: error.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Send error response
  res.status(error.statusCode).json({
    status: error.status || "error",
    message: error.isOperational
      ? error.message
      : ERROR_MESSAGES.INTERNAL_ERROR,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    status: "fail",
    message: ERROR_MESSAGES.ROUTE_NOT_FOUND,
    path: req.originalUrl,
  });
};

module.exports = {
  AppError,
  asyncHandler,
  handleError,
  notFoundHandler,
};
