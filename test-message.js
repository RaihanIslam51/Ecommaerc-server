// Test script to create sample messages
// Run this to test the message system: node test-message.js

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

async function createTestMessage() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");

    const db = client.db("bdmart");
    const messagesCollection = db.collection("messages");

    // Create multiple test messages
    const messages = [
      {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customerName: "রহিম আহমেদ",
        phone: "+8801712345678",
        email: "rahim@example.com",
        message: "আমি আপনার ওয়েবসাইট থেকে একটি ল্যাপটপ অর্ডার করতে চাই। দয়া করে আমাকে কল করুন।",
        type: "customer_message",
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: `msg_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
        customerName: "Karim Sheikh",
        phone: "+8801987654321",
        email: "karim@example.com",
        message: "Can you provide bulk discount for 10 phones? Please call me ASAP.",
        type: "inquiry",
        read: false,
        createdAt: new Date(Date.now() - 300000).toISOString() // 5 min ago
      },
      {
        id: `msg_${Date.now() + 2}_${Math.random().toString(36).substr(2, 9)}`,
        customerName: "Fatima Rahman",
        phone: "+8801555666777",
        email: "fatima@example.com",
        message: "আমার অর্ডার এখনো পৌঁছায়নি। অর্ডার নম্বর: ORD-123456. দয়া করে হেল্প করুন।",
        type: "complaint",
        read: false,
        createdAt: new Date(Date.now() - 600000).toISOString() // 10 min ago
      }
    ];

    for (const message of messages) {
      await messagesCollection.insertOne(message);
      console.log(`✅ Message created from ${message.customerName}`);
    }

    console.log("\n📧 Total messages created: " + messages.length);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("👋 Connection closed");
  }
}

createTestMessage();
