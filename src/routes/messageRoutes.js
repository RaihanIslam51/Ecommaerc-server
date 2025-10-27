// routes/messageRoutes.js
import express from "express";
import messageController from "../controllers/messageController.js";
import { validateMessageCreation } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/", asyncHandler(messageController.getAllMessages));
router.get("/unread", asyncHandler(messageController.getUnreadMessages));
router.post("/", validateMessageCreation, asyncHandler(messageController.createMessage));
router.post("/:id/read", asyncHandler(messageController.markAsRead));
router.post("/read-all", asyncHandler(messageController.markAllAsRead));
router.delete("/:id", asyncHandler(messageController.deleteMessage));

export default router;
