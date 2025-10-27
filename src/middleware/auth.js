// middleware/auth.js
import { unauthorizedResponse, forbiddenResponse } from "../utils/response.js";
import User from "../models/User.js";

/**
 * Verify admin role
 */
export const verifyAdmin = async (req, res, next) => {
  try {
    const { adminId } = req.body;

    if (!adminId) {
      return unauthorizedResponse(res, "Admin ID is required");
    }

    const admin = await User.findById(adminId);

    if (!admin) {
      return unauthorizedResponse(res, "Admin not found");
    }

    if (admin.role !== "admin") {
      return forbiddenResponse(res, "Admin access required");
    }

    req.admin = admin;
    next();
  } catch (error) {
    return unauthorizedResponse(res, "Authentication failed");
  }
};

/**
 * Verify user authentication (can be enhanced with JWT)
 */
export const verifyAuth = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return unauthorizedResponse(res, "User ID is required");
    }

    const user = await User.findById(userId);

    if (!user) {
      return unauthorizedResponse(res, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    return unauthorizedResponse(res, "Authentication failed");
  }
};

/**
 * Optional auth - doesn't fail if no auth provided
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const { userId } = req.body || req.query;

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

export default { verifyAdmin, verifyAuth, optionalAuth };
