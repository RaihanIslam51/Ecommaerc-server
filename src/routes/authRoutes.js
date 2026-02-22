// routes/authRoutes.js
import express from "express";
import authController from "../controllers/authController.js";
import { validateUserRegistration, validateUserLogin } from "../middleware/validate.js";
import { verifyAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// Public routes
router.post("/signup", validateUserRegistration, asyncHandler(authController.signup));
router.post("/login", validateUserLogin, asyncHandler(authController.login));

// Protected routes
router.get("/profile/:userId", asyncHandler(authController.getProfile));
router.put("/profile/:userId", asyncHandler(authController.updateProfile));
router.post("/change-password", asyncHandler(authController.changePassword));

// Admin only routes
router.post("/reset-password", verifyAdmin, asyncHandler(authController.resetPassword));

export default router;
