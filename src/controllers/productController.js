// controllers/productController.js
import Product from "../models/Product.js";
import {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse
} from "../utils/response.js";

/**
 * Get all products
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    return successResponse(res, { products }, "Products fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return errorResponse(res, "Failed to fetch products", 500);
  }
};

/**
 * Get single product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return notFoundResponse(res, "Product not found");
    }

    return successResponse(res, { product }, "Product fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return errorResponse(res, "Failed to fetch product", 500);
  }
};

/**
 * Search products
 */
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.params;
    console.log('🔍 Searching for:', query);

    const products = await Product.search(query);
    console.log(`✅ Found ${products.length} products`);

    return successResponse(
      res,
      {
        count: products.length,
        products
      },
      "Search completed successfully"
    );
  } catch (error) {
    console.error("❌ Error searching products:", error);
    return errorResponse(res, "Failed to search products", 500);
  }
};

/**
 * Create new product
 */
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    return createdResponse(
      res,
      { product },
      "Product added successfully"
    );
  } catch (error) {
    console.error("❌ Error creating product:", error);
    return errorResponse(res, "Failed to add product", 500);
  }
};

/**
 * Update product
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.update(id, req.body);
    if (!product) {
      return notFoundResponse(res, "Product not found");
    }

    return successResponse(res, { product }, "Product updated successfully");
  } catch (error) {
    console.error("❌ Error updating product:", error);
    return errorResponse(res, "Failed to update product", 500);
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️  Attempting to delete product with ID:', id);

    const result = await Product.delete(id);
    
    console.log('Delete result:', result);
    
    if (result.deletedCount === 0) {
      console.log('⚠️  Product not found with ID:', id);
      return notFoundResponse(res, "Product not found");
    }

    console.log('✅ Product deleted successfully:', id);
    return successResponse(res, {}, "Product deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    console.error("Error details:", error.message);
    return errorResponse(res, `Failed to delete product: ${error.message}`, 500);
  }
};

export default {
  getAllProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
