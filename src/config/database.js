// config/database.js
import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Support both MONGODB_URI and Mongodb_URL for backward compatibility
const uri = process.env.MONGODB_URI || process.env.Mongodb_URL;

if (!uri) {
  throw new Error("❌ MongoDB URI is not defined in environment variables. Please set MONGODB_URI in .env file");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

let db = null;

/**
 * Connect to MongoDB
 */
export const connectDB = async () => {
  try {
    if (db) {
      console.log("📦 Using existing database connection");
      return db;
    }

    // Connect with native MongoDB driver
    // await client.connect();
    db = client.db("bdmart");
    
    // Connect with Mongoose for models
    await mongoose.connect(uri, {
      dbName: "bdmart"
    });
    
    console.log("✅ Successfully connected to MongoDB!");
    
    // Initialize default data
    // await initializeDefaultData();
    
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

/**
 * Get database instance
 */
export const getDB = () => {
  if (!db) {
    throw new Error("❌ Database not initialized. Call connectDB first.");
  }
  return db;
};

/**
 * Close database connection
 */
export const closeDB = async () => {
  try {
    // await client.close();
    await mongoose.disconnect();
    db = null;
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database:", error);
    throw error;
  }
};

/**
 * Initialize default data (categories, etc.)
 */


export default { connectDB, getDB, closeDB };
