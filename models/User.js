// models/User.js
import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";

class User {
  constructor() {
    this.collection = null;
  }

  /**
   * Get users collection
   */
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection("users");
    }
    return this.collection;
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    return await this.getCollection().findOne({ email });
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    return await this.getCollection().findOne({ _id: new ObjectId(id) });
  }

  /**
   * Create new user
   */
  async create(userData) {
    const user = {
      ...userData,
      role: userData.role || "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await this.getCollection().insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  /**
   * Update user
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
   * Delete user
   */
  async delete(id) {
    return await this.getCollection().deleteOne({ _id: new ObjectId(id) });
  }

  /**
   * Find all users with pagination and filters
   */
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = ""
    } = options;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const total = await this.getCollection().countDocuments(query);
    const users = await this.getCollection()
      .find(query)
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return {
      users,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  }

  /**
   * Count users by role
   */
  async countByRole() {
    const total = await this.getCollection().countDocuments();
    const admins = await this.getCollection().countDocuments({ role: "admin" });
    
    return {
      total,
      admins,
      users: total - admins
    };
  }

  /**
   * Update user role
   */
  async updateRole(id, role) {
    return await this.update(id, { role });
  }

  /**
   * Update password
   */
  async updatePassword(id, hashedPassword) {
    return await this.getCollection().updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date().toISOString()
        }
      }
    );
  }
}

export default new User();
