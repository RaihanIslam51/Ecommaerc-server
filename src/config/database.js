// config/database.js
import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.Mongodb_URL;

if (!uri) {
  throw new Error("❌ MongoDB URI is not defined in environment variables");
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
    await client.connect();
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
    await client.close();
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
const initializeDefaultData = async () => {
  try {
    const categoriesCollection = db.collection("categories");
    const categoryCount = await categoriesCollection.countDocuments();
    
    if (categoryCount === 0) {
      const defaultCategories = [
        {
          name: "Fresh Vegetables",
          icon: "🥕",
          description: "Fresh, organic vegetables including carrots, potatoes, tomatoes, and more",
          productCount: 0,
          status: "active",
          color: "#10b981",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Fresh Fruits",
          icon: "🍎",
          description: "Seasonal fresh fruits, berries, and tropical fruits",
          productCount: 0,
          status: "active",
          color: "#f59e0b",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Leafy Greens",
          icon: "🥬",
          description: "Fresh leafy vegetables including spinach, lettuce, kale, and herbs",
          productCount: 0,
          status: "active",
          color: "#22c55e",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Ready-to-Cook Meals",
          icon: "🍽️",
          description: "Pre-prepped meals that are ready to cook in minutes",
          productCount: 0,
          status: "active",
          color: "#ef4444",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Meal Kits",
          icon: "🥘",
          description: "Complete meal kits with ingredients and recipes for easy cooking",
          productCount: 0,
          status: "active",
          color: "#8b5cf6",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Fresh Herbs & Spices",
          icon: "🌿",
          description: "Aromatic herbs, spices, and seasonings for cooking",
          productCount: 0,
          status: "active",
          color: "#06b6d4",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Organic Products",
          icon: "🌱",
          description: "Certified organic vegetables, fruits, and food items",
          productCount: 0,
          status: "active",
          color: "#16a34a",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Healthy Snacks",
          icon: "🥜",
          description: "Nutritious snacks, nuts, seeds, and healthy alternatives",
          productCount: 0,
          status: "active",
          color: "#ea580c",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Dairy & Eggs",
          icon: "🥛",
          description: "Fresh dairy products, eggs, and milk alternatives",
          productCount: 0,
          status: "active",
          color: "#64748b",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Beverages",
          icon: "🧃",
          description: "Fresh juices, smoothies, and healthy drink options",
          productCount: 0,
          status: "active",
          color: "#3b82f6",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Grains & Cereals",
          icon: "🌾",
          description: "Whole grains, rice, quinoa, and healthy cereals",
          productCount: 0,
          status: "active",
          color: "#a855f7",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Seasonal Specials",
          icon: "🎁",
          description: "Limited-time seasonal vegetables, fruits, and special offers",
          productCount: 0,
          status: "active",
          color: "#ec4899",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      await categoriesCollection.insertMany(defaultCategories);
      console.log("✅ Default categories initialized");
    }
  } catch (error) {
    console.error("❌ Error initializing default data:", error);
  }
};

export default { connectDB, getDB, closeDB };
