// models/Order.js
import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";

class Order {
  constructor() {
    this.collection = null;
  }

  /**
   * Get orders collection
   */
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection("orders");
    }
    return this.collection;
  }

  /**
   * Find all orders
   */
  async findAll() {
    return await this.getCollection()
      .find()
      .sort({ orderDate: -1 })
      .toArray();
  }

  /**
   * Find order by ID (MongoDB _id or custom id)
   */
  async findById(id) {
    // Try MongoDB ObjectId first
    if (ObjectId.isValid(id) && id.length === 24) {
      return await this.getCollection().findOne({ _id: new ObjectId(id) });
    }
    // Try custom order ID
    return await this.getCollection().findOne({ id });
  }

  /**
   * Create new order
   */
  async create(orderData) {
    const order = {
      id: `ORD-${Date.now()}`,
      ...orderData,
      orderDate: orderData.orderDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await this.getCollection().insertOne(order);
    return { ...order, _id: result.insertedId };
  }

  /**
   * Update order
   */
  async update(id, updates) {
    const data = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.getCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    
    return await this.findById(id);
  }

  /**
   * Update order status
   */
  async updateStatus(id, status) {
    await this.getCollection().updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date().toISOString()
        }
      }
    );
    
    return await this.getCollection().findOne({ _id: new ObjectId(id) });
  }

  /**
   * Delete order
   */
  async delete(id) {
    return await this.getCollection().deleteOne({ _id: new ObjectId(id) });
  }

  /**
   * Get orders by status
   */
  async findByStatus(status) {
    return await this.getCollection()
      .find({ status })
      .sort({ orderDate: -1 })
      .toArray();
  }

  /**
   * Get orders by date range
   */
  async findByDateRange(startDate, endDate) {
    return await this.getCollection()
      .find({
        orderDate: {
          $gte: startDate.toISOString(),
          $lte: endDate.toISOString()
        }
      })
      .toArray();
  }

  /**
   * Get orders by customer email
   */
  async findByCustomerEmail(email) {
    return await this.getCollection()
      .find({ "customerInfo.email": email })
      .sort({ orderDate: -1 })
      .toArray();
  }

  /**
   * Count orders
   */
  async count() {
    return await this.getCollection().countDocuments();
  }

  /**
   * Count orders by status
   */
  async countByStatus() {
    const orders = await this.findAll();
    
    return {
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
  }

  /**
   * Calculate total revenue
   */
  async calculateTotalRevenue() {
    const orders = await this.findAll();
    return orders.reduce((sum, order) => sum + (order.totalAmount || order.amount || 0), 0);
  }
}

export default new Order();
