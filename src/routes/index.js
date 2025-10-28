// routes/index.js
import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import productRoutes from "./productRoutes.js";
import orderRoutes from "./orderRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import bannerRoutes from "./bannerRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import messageRoutes from "./messageRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import emailRoutes from "./emailRoutes.js";
import chatSessionRoutes from "./chatSessions.js";
import { getDashboardStats } from "../controllers/analyticsController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// Health check
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 BDMart API Server is running!",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      products: "/api/products",
      orders: "/api/orders",
      categories: "/api/categories",
      banners: "/api/banners",
      notifications: "/api/notifications",
      messages: "/api/messages",
      analytics: "/api/analytics",
      email: "/api/email",
      chatSessions: "/api/chat-sessions"
    }
  });
});

// Dashboard stats endpoint (commonly used, so mount it directly)
router.get("/dashboard/stats", asyncHandler(getDashboardStats));

// Route mounting
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/categories", categoryRoutes);
router.use("/banners", bannerRoutes);
router.use("/notifications", notificationRoutes);
router.use("/messages", messageRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/api", emailRoutes); // /api/send-email
router.use("/chat-sessions", chatSessionRoutes);

export default router;
