// controllers/userController.js
import User from "../models/User.js";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  badRequestResponse
} from "../utils/response.js";

/**
 * Get all users with pagination and search
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, search, role } = req.query;

    const result = await User.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || "",
      role: role || ""
    });

    // Get stats
    const stats = await User.countByRole();

    return successResponse(
      res,
      {
        users: result.users,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: result.pages
        },
        stats: {
          totalUsers: stats.total,
          totalAdmins: stats.admins,
          totalRegularUsers: stats.users
        }
      },
      "Users fetched successfully"
    );
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return errorResponse(res, "Failed to fetch users", 500);
  }
};

/**
 * Get single user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    // Remove password from response
    delete user.password;

    return successResponse(res, { user }, "User fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return errorResponse(res, "Failed to fetch user", 500);
  }
};

/**
 * Update user role (Admin only)
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, adminId } = req.body;

    // Validate role
    if (!["user", "admin"].includes(role)) {
      return badRequestResponse(res, "Invalid role. Must be 'user' or 'admin'");
    }

    // Prevent self-demotion
    if (id === adminId && role === "user") {
      return badRequestResponse(res, "You cannot demote yourself");
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    // Update role
    const updatedUser = await User.updateRole(id, role);

    // Remove password from response
    delete updatedUser.password;

    return successResponse(
      res,
      { user: updatedUser },
      `User role updated to ${role}`
    );
  } catch (error) {
    console.error("❌ Error updating user role:", error);
    return errorResponse(res, "Failed to update user role", 500);
  }
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    // Prevent self-deletion
    if (id === adminId) {
      return badRequestResponse(res, "You cannot delete yourself");
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    // Delete user
    await User.delete(id);

    return successResponse(res, {}, "User deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return errorResponse(res, "Failed to delete user", 500);
  }
};

export default {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
};
