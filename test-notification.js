// Test script to create sample notifications
// Run this to test the notification system: node test-notification.js

import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.Mongodb_URL;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function createTestNotification() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");

    const db = client.db("bdmart");
    const notificationsCollection = db.collection("notifications");

    // Create a test notification
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'new_order',
      title: 'New Order Received',
      message: `Order #ORD-${Date.now()} has been placed by Test Customer`,
      orderId: `ORD-${Date.now()}`,
      amount: 299.99,
      read: false,
      createdAt: new Date().toISOString()
    };

    await notificationsCollection.insertOne(notification);
    console.log("✅ Test notification created successfully!");
    console.log("📧 Notification:", notification);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("👋 Connection closed");
  }
}

createTestNotification();
