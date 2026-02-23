// routes/userRoutes.js
import express from "express";
import userController from "../controllers/userController.js";
import { verifyAdmin } from "../middleware/auth.js";
import { validateIdParam } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// All user routes require admin access
router.get("/", asyncHandler(userController.getAllUsers));
router.get("/:id", validateIdParam, asyncHandler(userController.getUserById));
router.put("/:id/role", validateIdParam, verifyAdmin, asyncHandler(userController.updateUserRole));
router.delete("/:id", validateIdParam, verifyAdmin, asyncHandler(userController.deleteUser));

export default router;
