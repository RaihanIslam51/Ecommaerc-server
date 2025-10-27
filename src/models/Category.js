// models/Category.js
import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";

class Category {
  constructor() {
    this.collection = null;
  }

  /**
   * Get categories collection
   */
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection("categories");
    }
    return this.collection;
  }

  /**
   * Find all categories
   */
  async findAll() {
    return await this.getCollection()
      .find()
      .sort({ name: 1 })
      .toArray();
  }

  /**
   * Find category by ID
   */
  async findById(id) {
    return await this.getCollection().findOne({ _id: new ObjectId(id) });
  }

  /**
   * Find category by name
   */
  async findByName(name) {
    return await this.getCollection().findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
  }

  /**
   * Create new category
   */
  async create(categoryData) {
    const category = {
      ...categoryData,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await this.getCollection().insertOne(category);
    return { ...category, _id: result.insertedId };
  }

  /**
   * Update category
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
   * Delete category
   */
  async delete(id) {
    return await this.getCollection().deleteOne({ _id: new ObjectId(id) });
  }

  /**
   * Update product count
   */
  async updateProductCount(id, count) {
    return await this.getCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { productCount: count, updatedAt: new Date().toISOString() } }
    );
  }

  /**
   * Count categories
   */
  async count() {
    return await this.getCollection().countDocuments();
  }
}

export default new Category();
