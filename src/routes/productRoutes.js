// routes/productRoutes.js
import express from "express";
import productController from "../controllers/productController.js";
import { validateProductCreation, validateIdParam } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// Public routes
router.get("/", asyncHandler(productController.getAllProducts));
router.get("/search/:query", asyncHandler(productController.searchProducts));
router.get("/:id", validateIdParam, asyncHandler(productController.getProductById));

// Protected routes (admin)
router.post("/", validateProductCreation, asyncHandler(productController.createProduct));
router.put("/:id", validateIdParam, asyncHandler(productController.updateProduct));
router.delete("/:id", validateIdParam, asyncHandler(productController.deleteProduct));

export default router;
