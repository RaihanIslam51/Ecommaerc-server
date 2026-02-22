// server.js
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB, closeDB } from "./config/database.js";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 5000;

/**
 * Graceful shutdown helper
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
  try {
    await closeDB();
    console.log("👋 Server shut down cleanly.");
  } catch (err) {
    console.error("❌ Error during shutdown:", err.message);
  }
  process.exit(0);
};

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log("=".repeat(50));
      console.log("🚀 Ecommarce projects Server Started Successfully!");
      console.log("=".repeat(50));
      console.log(`📡 Port       : ${PORT}`);
      console.log(`🌐 URL        : http://localhost:${PORT}`);
      console.log(`📚 Health     : http://localhost:${PORT}/`);
      console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log("=".repeat(50));
    });

    // Close HTTP server before DB on shutdown
    process.on("SIGINT",  () => { server.close(() => gracefulShutdown("SIGINT"));  });
    process.on("SIGTERM", () => { server.close(() => gracefulShutdown("SIGTERM")); });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

startServer();
