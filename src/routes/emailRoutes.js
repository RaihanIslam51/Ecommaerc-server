// routes/emailRoutes.js
import express from "express";
import emailController from "../controllers/emailController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.post("/send-email", asyncHandler(emailController.sendEmail));

export default router;
