// routes/notificationRoutes.js
import express from "express";
import notificationController from "../controllers/notificationController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/", asyncHandler(notificationController.getAllNotifications));
router.get("/unread", asyncHandler(notificationController.getUnreadNotifications));
router.post("/:id/read", asyncHandler(notificationController.markAsRead));
router.post("/read-all", asyncHandler(notificationController.markAllAsRead));
router.delete("/:id", asyncHandler(notificationController.deleteNotification));

export default router;
