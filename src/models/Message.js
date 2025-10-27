// models/Message.js
import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";

class Message {
  constructor() {
    this.collection = null;
  }

  /**
   * Get messages collection
   */
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection("messages");
    }
    return this.collection;
  }

  /**
   * Find all messages
   */
  async findAll(limit = 20) {
    return await this.getCollection()
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Find message by ID
   */
  async findById(id) {
    return await this.getCollection().findOne({ id });
  }

  /**
   * Find unread messages
   */
  async findUnread() {
    return await this.getCollection()
      .find({ read: false })
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Create new message
   */
  async create(messageData) {
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...messageData,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    const result = await this.getCollection().insertOne(message);
    return { ...message, _id: result.insertedId };
  }

  /**
   * Mark message as read
   */
  async markAsRead(id) {
    return await this.getCollection().updateOne(
      { id },
      { $set: { read: true } }
    );
  }

  /**
   * Mark all as read
   */
  async markAllAsRead() {
    return await this.getCollection().updateMany(
      { read: false },
      { $set: { read: true } }
    );
  }

  /**
   * Delete message
   */
  async delete(id) {
    return await this.getCollection().deleteOne({ id });
  }

  /**
   * Count unread messages
   */
  async countUnread() {
    return await this.getCollection().countDocuments({ read: false });
  }

  /**
   * Find messages by customer email
   */
  async findByCustomerEmail(email) {
    return await this.getCollection()
      .find({ email })
      .sort({ createdAt: -1 })
      .toArray();
  }
}

export default new Message();
