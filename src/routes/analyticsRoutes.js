// routes/analyticsRoutes.js
import express from "express";
import analyticsController from "../controllers/analyticsController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/dashboard/stats", asyncHandler(analyticsController.getDashboardStats));
router.get("/stats", asyncHandler(analyticsController.getAnalyticsStats));

export default router;
