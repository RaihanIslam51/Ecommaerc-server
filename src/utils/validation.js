// utils/validation.js
import { VALIDATION } from "../config/constants.js";

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) return { valid: false, message: "Password is required" };
  
  if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters long`
    };
  }
  
  if (password.length > VALIDATION.MAX_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: `Password must not exceed ${VALIDATION.MAX_PASSWORD_LENGTH} characters`
    };
  }
  
  return { valid: true };
};

/**
 * Validate required fields
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  return { valid: true };
};

/**
 * Validate ObjectId format
 */
export const validateObjectId = (id) => {
  // Check if it's a valid 24-character hex string (MongoDB ObjectId)
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    return true;
  }
  
  // Also accept numeric IDs (for compatibility)
  if (/^\d+$/.test(id)) {
    return true;
  }
  
  // Accept alphanumeric IDs (for UUID or other formats)
  if (/^[a-zA-Z0-9_-]+$/.test(id) && id.length >= 3 && id.length <= 50) {
    return true;
  }
  
  return false;
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  // Basic phone validation - can be customized based on country
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Sanitize string (remove potentially harmful characters)
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '').trim();
};

/**
 * Validate order status
 */
export const validateOrderStatus = (status) => {
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  return validStatuses.includes(status);
};

/**
 * Validate user role
 */
export const validateUserRole = (role) => {
  const validRoles = ['user', 'admin'];
  return validRoles.includes(role);
};

/**
 * Validate pagination params
 */
export const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  
  return {
    page: pageNum > 0 ? pageNum : 1,
    limit: limitNum > 0 && limitNum <= 100 ? limitNum : 10
  };
};

export default {
  validateEmail,
  validatePassword,
  validateRequiredFields,
  validateObjectId,
  validatePhone,
  sanitizeString,
  validateOrderStatus,
  validateUserRole,
  validatePagination
};
