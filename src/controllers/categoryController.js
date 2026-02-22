// controllers/categoryController.js
import Category from "../models/Category.js";
import { getDB } from "../config/database.js";
import {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse
} from "../utils/response.js";

/**
 * Get all categories with dynamic product count
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    
    // Get products collection to count products per category
    const productsCollection = getDB().collection("products");
    
    // Get all unique category names from products for debugging
    const uniqueCategories = await productsCollection.distinct("category");
    console.log("📦 Unique categories in products:", uniqueCategories);
    
    // Calculate product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        // Case-insensitive search for category name
        const productCount = await productsCollection.countDocuments({
          category: { $regex: new RegExp(`^${category.name}$`, 'i') }
        });
        
        console.log(`📊 Category "${category.name}": ${productCount} products`);
        
        return {
          ...category,
          productCount
        };
      })
    );
    
    return successResponse(res, { categories: categoriesWithCount }, "Categories fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return errorResponse(res, "Failed to fetch categories", 500);
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return notFoundResponse(res, "Category not found");
    }

    return successResponse(res, { category }, "Category fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching category:", error);
    return errorResponse(res, "Failed to fetch category", 500);
  }
};

/**
 * Create new category
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, icon } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findByName(name);
    if (existingCategory) {
      return badRequestResponse(res, "Category already exists");
    }

    const category = await Category.create({
      name,
      description: description || "",
      image: image || "",
      icon: icon || "📦"
    });

    console.log(`✅ Category created: ${name}`);

    return createdResponse(res, { category }, "Category created successfully");
  } catch (error) {
    console.error("❌ Error creating category:", error);
    return errorResponse(res, "Failed to create category", 500);
  }
};

/**
 * Update category
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.update(id, req.body);
    if (!category) {
      return notFoundResponse(res, "Category not found");
    }

    return successResponse(res, { category }, "Category updated successfully");
  } catch (error) {
    console.error("❌ Error updating category:", error);
    return errorResponse(res, "Failed to update category", 500);
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Category.delete(id);
    if (result.deletedCount === 0) {
      return notFoundResponse(res, "Category not found");
    }

    return successResponse(res, {}, "Category deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting category:", error);
    return errorResponse(res, "Failed to delete category", 500);
  }
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
