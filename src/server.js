// src/server.js
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log("=".repeat(50));
      console.log("🚀 RannarKaj.com Server Started Successfully!");
      console.log("=".repeat(50));
      console.log(`📡 Server running on port: ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`📚 Health Check: http://localhost:${PORT}/`);
      console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
