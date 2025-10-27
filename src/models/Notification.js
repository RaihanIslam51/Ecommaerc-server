// models/Notification.js
import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";

class Notification {
  constructor() {
    this.collection = null;
  }

  /**
   * Get notifications collection
   */
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection("notifications");
    }
    return this.collection;
  }

  /**
   * Find all notifications
   */
  async findAll(limit = 20) {
    return await this.getCollection()
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Find notification by ID
   */
  async findById(id) {
    return await this.getCollection().findOne({ id });
  }

  /**
   * Find unread notifications
   */
  async findUnread() {
    return await this.getCollection()
      .find({ read: false })
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Create new notification
   */
  async create(notificationData) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notificationData,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    const result = await this.getCollection().insertOne(notification);
    return { ...notification, _id: result.insertedId };
  }

  /**
   * Mark notification as read
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
   * Delete notification
   */
  async delete(id) {
    return await this.getCollection().deleteOne({ id });
  }

  /**
   * Count unread notifications
   */
  async countUnread() {
    return await this.getCollection().countDocuments({ read: false });
  }

  /**
   * Create order notification
   */
  async createOrderNotification(order) {
    return await this.create({
      type: 'new_order',
      title: 'New Order Received',
      message: `Order #${order.id} has been placed by ${order.customer || order.customerInfo?.name || 'Guest'}`,
      orderId: order.id,
      amount: order.amount || order.totalAmount || 0
    });
  }
}

export default new Notification();
