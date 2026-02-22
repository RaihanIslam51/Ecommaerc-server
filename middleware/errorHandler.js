// middleware/errorHandler.js
import { errorResponse } from "../utils/response.js";

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return errorResponse(res, "Duplicate entry found", 409, err.keyValue);
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    return errorResponse(res, "Validation error", 400, err.message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, "Invalid token", 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, "Token expired", 401);
  }

  // Default error
  return errorResponse(
    res,
    err.message || "Internal server error",
    err.statusCode || 500
  );
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

/**
 * Async handler wrapper to catch errors in async routes
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default { errorHandler, notFoundHandler, asyncHandler };
