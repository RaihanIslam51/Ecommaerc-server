// config/database.js
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.Mongodb_URL;

if (!uri) {
  throw new Error("❌ MongoDB URI is not defined in environment variables");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
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

    await client.connect();
    db = client.db("bdmart");
    
    console.log("✅ Successfully connected to MongoDB!");
    
    // Initialize default data
    await initializeDefaultData();
    
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
    await client.close();
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
const initializeDefaultData = async () => {
  try {
    const categoriesCollection = db.collection("categories");
    const categoryCount = await categoriesCollection.countDocuments();
    
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: "Electronics", icon: "💻", description: "Laptops, phones, and gadgets", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: "Clothing", icon: "👕", description: "Fashion and apparel", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: "Home & Kitchen", icon: "🏠", description: "Home essentials", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: "Sports", icon: "⚽", description: "Sports equipment", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: "Books", icon: "📚", description: "Books and literature", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: "Toys", icon: "🎮", description: "Toys and games", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: "Beauty", icon: "💄", description: "Beauty and cosmetics", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: "Health", icon: "🏥", description: "Health and wellness", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      
      await categoriesCollection.insertMany(defaultCategories);
      console.log("✅ Default categories initialized");
    }
  } catch (error) {
    console.error("❌ Error initializing default data:", error);
  }
};

export default { connectDB, getDB, closeDB };
