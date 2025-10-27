// controllers/authController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  unauthorizedResponse
} from "../utils/response.js";

/**
 * User Registration (Sign Up)
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return errorResponse(res, "User with this email already exists", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      address: address || ""
    });

    // Remove password from response
    delete user.password;

    return createdResponse(res, { user }, "User registered successfully");
  } catch (error) {
    console.error("❌ Error in signup:", error);
    return errorResponse(res, "Failed to register user", 500, error.message);
  }
};

/**
 * User Login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return unauthorizedResponse(res, "Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return unauthorizedResponse(res, "Invalid email or password");
    }

    // Remove password from response
    delete user.password;

    return successResponse(res, { user }, "Login successful");
  } catch (error) {
    console.error("❌ Error in login:", error);
    return errorResponse(res, "Failed to login", 500, error.message);
  }
};

/**
 * Get User Profile
 */
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    // Remove password from response
    delete user.password;

    return successResponse(res, { user }, "Profile fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    return errorResponse(res, "Failed to fetch profile", 500);
  }
};

/**
 * Update User Profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Don't allow password or role update through this route
    delete updates.password;
    delete updates.role;

    const user = await User.update(userId, updates);
    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    // Remove password from response
    delete user.password;

    return successResponse(res, { user }, "Profile updated successfully");
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    return errorResponse(res, "Failed to update profile", 500);
  }
};

/**
 * Change Password
 */
export const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return errorResponse(res, "All fields are required", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return unauthorizedResponse(res, "Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.updatePassword(userId, hashedPassword);

    return successResponse(res, {}, "Password changed successfully");
  } catch (error) {
    console.error("❌ Error changing password:", error);
    return errorResponse(res, "Failed to change password", 500);
  }
};

/**
 * Reset Password (Admin only)
 */
export const resetPassword = async (req, res) => {
  try {
    const { userId, email, tempPassword, adminId } = req.body;

    if (!userId || !email || !tempPassword || !adminId) {
      return errorResponse(res, "All fields are required", 400);
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user || user.email !== email) {
      return notFoundResponse(res, "User not found");
    }

    // Hash temporary password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update user password
    await User.getCollection().updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          passwordResetRequired: true,
          passwordResetAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    );

    return successResponse(
      res,
      {
        data: {
          userId: user._id,
          email: user.email,
          tempPassword
        }
      },
      "Password reset successfully"
    );
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    return errorResponse(res, "Failed to reset password", 500);
  }
};

export default {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  resetPassword
};
