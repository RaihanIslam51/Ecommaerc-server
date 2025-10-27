// routes/categoryRoutes.js
import express from "express";
import categoryController from "../controllers/categoryController.js";
import { validateCategoryCreation, validateIdParam } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// Public routes
router.get("/", asyncHandler(categoryController.getAllCategories));
router.get("/:id", validateIdParam, asyncHandler(categoryController.getCategoryById));

// Protected routes (admin)
router.post("/", validateCategoryCreation, asyncHandler(categoryController.createCategory));
router.put("/:id", validateIdParam, asyncHandler(categoryController.updateCategory));
router.delete("/:id", validateIdParam, asyncHandler(categoryController.deleteCategory));

export default router;
