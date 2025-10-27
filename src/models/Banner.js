// models/Banner.js
import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";

class Banner {
  constructor() {
    this.collection = null;
  }

  /**
   * Get banners collection
   */
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection("banners");
    }
    return this.collection;
  }

  /**
   * Find all banners
   */
  async findAll() {
    return await this.getCollection()
      .find()
      .sort({ order: 1, createdAt: -1 })
      .toArray();
  }

  /**
   * Find banner by ID
   */
  async findById(id) {
    return await this.getCollection().findOne({ _id: new ObjectId(id) });
  }

  /**
   * Find banners by position
   */
  async findByPosition(position) {
    return await this.getCollection()
      .find({ position, isActive: true })
      .sort({ order: 1 })
      .toArray();
  }

  /**
   * Create new banner
   */
  async create(bannerData) {
    const banner = {
      ...bannerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await this.getCollection().insertOne(banner);
    return { ...banner, _id: result.insertedId };
  }

  /**
   * Update banner
   */
  async update(id, updates) {
    delete updates._id; // Remove _id if exists
    
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
   * Delete banner
   */
  async delete(id) {
    return await this.getCollection().deleteOne({ _id: new ObjectId(id) });
  }

  /**
   * Toggle banner active status
   */
  async toggleActive(id) {
    const banner = await this.findById(id);
    if (!banner) return null;
    
    return await this.update(id, { isActive: !banner.isActive });
  }

  /**
   * Count banners
   */
  async count() {
    return await this.getCollection().countDocuments();
  }

  /**
   * Count active banners
   */
  async countActive() {
    return await this.getCollection().countDocuments({ isActive: true });
  }
}

export default new Banner();
