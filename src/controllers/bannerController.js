// controllers/bannerController.js
import { ObjectId } from "mongodb";
import Banner from "../models/Banner.js";
import {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse
} from "../utils/response.js";

/**
 * Get all banners
 */
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll();
    return successResponse(res, { banners }, "Banners fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching banners:", error);
    return errorResponse(res, "Failed to fetch banners", 500);
  }
};

/**
 * Get banners by position
 */
export const getBannersByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    console.log('🔍 Fetching banners for position:', position);

    const banners = await Banner.findByPosition(position);
    console.log(`✅ Found ${banners.length} active ${position} banners`);

    return successResponse(res, { banners }, "Banners fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching banners:", error);
    return errorResponse(res, "Failed to fetch banners", 500);
  }
};

/**
 * Get banner by ID
 */
export const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return badRequestResponse(res, "Invalid banner ID");
    }

    const banner = await Banner.findById(id);
    if (!banner) {
      return notFoundResponse(res, "Banner not found");
    }

    return successResponse(res, { banner }, "Banner fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching banner:", error);
    return errorResponse(res, "Failed to fetch banner", 500);
  }
};

/**
 * Create new banner
 */
export const createBanner = async (req, res) => {
  try {
    console.log('📥 Received banner data:', req.body);

    const banner = await Banner.create(req.body);
    console.log('✅ Banner created with ID:', banner._id);

    return createdResponse(res, { bannerId: banner._id }, "Banner created successfully");
  } catch (error) {
    console.error("❌ Error creating banner:", error);
    return errorResponse(res, "Failed to create banner", 500);
  }
};

/**
 * Update banner
 */
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return badRequestResponse(res, "Invalid banner ID");
    }

    const banner = await Banner.update(id, req.body);
    if (!banner) {
      return notFoundResponse(res, "Banner not found");
    }

    return successResponse(res, { banner }, "Banner updated successfully");
  } catch (error) {
    console.error("❌ Error updating banner:", error);
    return errorResponse(res, "Failed to update banner", 500);
  }
};

/**
 * Delete banner
 */
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return badRequestResponse(res, "Invalid banner ID");
    }

    const result = await Banner.delete(id);
    if (result.deletedCount === 0) {
      return notFoundResponse(res, "Banner not found");
    }

    return successResponse(res, {}, "Banner deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting banner:", error);
    return errorResponse(res, "Failed to delete banner", 500);
  }
};

export default {
  getAllBanners,
  getBannersByPosition,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner
};
