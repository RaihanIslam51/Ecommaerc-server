// routes/bannerRoutes.js
import express from "express";
import bannerController from "../controllers/bannerController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// Public routes
router.get("/", asyncHandler(bannerController.getAllBanners));
router.get("/position/:position", asyncHandler(bannerController.getBannersByPosition));
router.get("/:id", asyncHandler(bannerController.getBannerById));

// Protected routes (admin)
router.post("/", asyncHandler(bannerController.createBanner));
router.put("/:id", asyncHandler(bannerController.updateBanner));
router.delete("/:id", asyncHandler(bannerController.deleteBanner));

export default router;
