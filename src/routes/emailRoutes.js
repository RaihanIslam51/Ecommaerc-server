// routes/emailRoutes.js
import express from "express";
import emailController from "../controllers/emailController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// Send email to specific recipients
router.post("/send-email", asyncHandler(emailController.sendEmail));

// Send email to all customers
router.post("/send-to-all-customers", asyncHandler(emailController.sendToAllCustomers));

// Test email configuration
router.get("/test", asyncHandler(emailController.testEmail));

export default router;
