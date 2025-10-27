// middleware/validate.js
import { badRequestResponse } from "../utils/response.js";
import {
  validateEmail,
  validatePassword,
  validateRequiredFields,
  validateObjectId
} from "../utils/validation.js";

/**
 * Validate user registration
 */
export const validateUserRegistration = (req, res, next) => {
  const { name, email, password } = req.body;

  // Check required fields
  const fieldsCheck = validateRequiredFields(req.body, ['name', 'email', 'password']);
  if (!fieldsCheck.valid) {
    return badRequestResponse(res, fieldsCheck.message);
  }

  // Validate email
  if (!validateEmail(email)) {
    return badRequestResponse(res, "Invalid email format");
  }

  // Validate password
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return badRequestResponse(res, passwordCheck.message);
  }

  next();
};

/**
 * Validate user login
 */
export const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;

  const fieldsCheck = validateRequiredFields(req.body, ['email', 'password']);
  if (!fieldsCheck.valid) {
    return badRequestResponse(res, fieldsCheck.message);
  }

  if (!validateEmail(email)) {
    return badRequestResponse(res, "Invalid email format");
  }

  next();
};

/**
 * Validate ObjectId param
 */
export const validateIdParam = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return badRequestResponse(res, "ID parameter is required");
  }

  if (!validateObjectId(id)) {
    return badRequestResponse(res, "Invalid ID format");
  }

  next();
};

/**
 * Validate product creation
 */
export const validateProductCreation = (req, res, next) => {
  const requiredFields = ['name', 'price', 'category'];
  
  const fieldsCheck = validateRequiredFields(req.body, requiredFields);
  if (!fieldsCheck.valid) {
    return badRequestResponse(res, fieldsCheck.message);
  }

  if (req.body.price && (isNaN(req.body.price) || req.body.price < 0)) {
    return badRequestResponse(res, "Price must be a positive number");
  }

  next();
};

/**
 * Validate order creation
 */
export const validateOrderCreation = (req, res, next) => {
  const requiredFields = ['customerInfo', 'items', 'totalAmount'];
  
  const fieldsCheck = validateRequiredFields(req.body, requiredFields);
  if (!fieldsCheck.valid) {
    return badRequestResponse(res, fieldsCheck.message);
  }

  if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
    return badRequestResponse(res, "Order must contain at least one item");
  }

  if (isNaN(req.body.totalAmount) || req.body.totalAmount < 0) {
    return badRequestResponse(res, "Total amount must be a positive number");
  }

  next();
};

/**
 * Validate message creation
 */
export const validateMessageCreation = (req, res, next) => {
  const requiredFields = ['customerName', 'message'];
  
  const fieldsCheck = validateRequiredFields(req.body, requiredFields);
  if (!fieldsCheck.valid) {
    return badRequestResponse(res, fieldsCheck.message);
  }

  if (req.body.email && !validateEmail(req.body.email)) {
    return badRequestResponse(res, "Invalid email format");
  }

  next();
};

/**
 * Validate category creation
 */
export const validateCategoryCreation = (req, res, next) => {
  const requiredFields = ['name'];
  
  const fieldsCheck = validateRequiredFields(req.body, requiredFields);
  if (!fieldsCheck.valid) {
    return badRequestResponse(res, fieldsCheck.message);
  }

  next();
};

export default {
  validateUserRegistration,
  validateUserLogin,
  validateIdParam,
  validateProductCreation,
  validateOrderCreation,
  validateMessageCreation,
  validateCategoryCreation
};
