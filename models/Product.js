// models/Product.js
import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";

class Product {
  constructor() {
    this.collection = null;
  }

  /**
   * Get products collection
   */
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection("products");
    }
    return this.collection;
  }

  /**
   * Find all products
   */
  async findAll() {
    return await this.getCollection().find().toArray();
  }

  /**
   * Find product by ID
   */
  async findById(id) {
    try {
      // Try to convert to ObjectId if it's a valid hex string
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        return await this.getCollection().findOne({ _id: new ObjectId(id) });
      }
      // Otherwise, search by string ID
      return await this.getCollection().findOne({ _id: id });
    } catch (error) {
      console.error('Error finding product by ID:', error);
      return null;
    }
  }

  /**
   * Search products
   */
  async search(query, limit = 20) {
    const searchRegex = new RegExp(query, 'i');
    
    return await this.getCollection()
      .find({
        $or: [
          { name: searchRegex },
          { category: searchRegex },
          { brand: searchRegex },
          { description: searchRegex },
          { tags: searchRegex }
        ]
      })
      .limit(limit)
      .toArray();
  }

  /**
   * Create new product
   */
  async create(productData) {
    const product = {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await this.getCollection().insertOne(product);
    return { ...product, _id: result.insertedId };
  }

  /**
   * Update product
   */
  async update(id, updates) {
    try {
      delete updates._id; // Remove _id if exists
      
      const data = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Try to convert to ObjectId if it's a valid hex string
      const query = /^[0-9a-fA-F]{24}$/.test(id) 
        ? { _id: new ObjectId(id) }
        : { _id: id };
      
      await this.getCollection().updateOne(query, { $set: data });
      
      return await this.findById(id);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product
   */
  async delete(id) {
    try {
      // Try to convert to ObjectId if it's a valid hex string
      const query = /^[0-9a-fA-F]{24}$/.test(id) 
        ? { _id: new ObjectId(id) }
        : { _id: id };
      
      return await this.getCollection().deleteOne(query);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async findByCategory(category) {
    return await this.getCollection()
      .find({ category: { $regex: category, $options: 'i' } })
      .toArray();
  }

  /**
   * Get low stock products
   */
  async getLowStock(threshold = 10) {
    return await this.getCollection()
      .find({
        stock: { $gt: 0, $lt: threshold }
      })
      .toArray();
  }

  /**
   * Count products
   */
  async count() {
    return await this.getCollection().countDocuments();
  }

  /**
   * Count active products (in stock)
   */
  async countActive() {
    return await this.getCollection().countDocuments({ stock: { $gt: 0 } });
  }
}

export default new Product();
