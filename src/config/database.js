// config/database.js
import mongoose from "mongoose";

const DB_NAME = "Ecommarce-projects";

/**
 * Connect to MongoDB via Mongoose with auto-reconnect
 */
export const connectDB = async () => {
  // Support both MONGODB_URI and Mongodb_URL for backward compatibility
  const uri = process.env.MONGODB_URI || process.env.Mongodb_URL;

  if (!uri) {
    throw new Error(
      "❌ MongoDB URI is not defined in environment variables. Please set MONGODB_URI in .env file"
    );
  }

  if (mongoose.connection.readyState === 1) {
    console.log("Using existing MongoDB connection");
    return mongoose.connection;
  }

  try {
    await mongoose.connect(uri, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 10000, // fail fast if no server in 10s
      socketTimeoutMS: 45000,
    });

    console.log("✅ Successfully connected to MongoDB!");

    // Listen for connection events
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected.");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

/**
 * Get the native MongoDB db instance (via Mongoose connection)
 */
export const getDB = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("❌ Database not connected. Call connectDB first.");
  }
  return mongoose.connection.db;
};

/**
 * Gracefully close the MongoDB connection
 */
export const closeDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database:", error.message);
    throw error;
  }
};

export default { connectDB, getDB, closeDB };
