// utils/response.js

/**
 * Send success response
 */
export const successResponse = (res, data = {}, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};

/**
 * Send error response
 */
export const errorResponse = (res, message = "Error", statusCode = 500, details = null) => {
  const response = {
    success: false,
    message
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
export const paginatedResponse = (res, data, pagination, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination
  });
};

/**
 * Send created response
 */
export const createdResponse = (res, data = {}, message = "Created successfully") => {
  return res.status(201).json({
    success: true,
    message,
    ...data
  });
};

/**
 * Send not found response
 */
export const notFoundResponse = (res, message = "Resource not found") => {
  return res.status(404).json({
    success: false,
    message
  });
};

/**
 * Send bad request response
 */
export const badRequestResponse = (res, message = "Bad request", details = null) => {
  const response = {
    success: false,
    message
  };

  if (details) {
    response.details = details;
  }

  return res.status(400).json(response);
};

/**
 * Send unauthorized response
 */
export const unauthorizedResponse = (res, message = "Unauthorized") => {
  return res.status(401).json({
    success: false,
    message
  });
};

/**
 * Send forbidden response
 */
export const forbiddenResponse = (res, message = "Forbidden") => {
  return res.status(403).json({
    success: false,
    message
  });
};

export default {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse
};
