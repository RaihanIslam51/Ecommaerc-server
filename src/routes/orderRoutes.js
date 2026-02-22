// routes/orderRoutes.js
import express from "express";
import orderController from "../controllers/orderController.js";
import { validateOrderCreation, validateIdParam } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// Public routes
router.get("/", asyncHandler(orderController.getAllOrders));
router.get("/:id", asyncHandler(orderController.getOrderById));
router.post("/", validateOrderCreation, asyncHandler(orderController.createOrder));

// Protected routes (admin)
router.put("/:id", validateIdParam, asyncHandler(orderController.updateOrder));
router.patch("/:id/status", validateIdParam, asyncHandler(orderController.updateOrderStatus));
router.delete("/:id", validateIdParam, asyncHandler(orderController.deleteOrder));

export default router;
