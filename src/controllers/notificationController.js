// controllers/notificationController.js
import Notification from "../models/Notification.js";
import {
  successResponse,
  errorResponse
} from "../utils/response.js";

/**
 * Get all notifications
 */
export const getAllNotifications = async (req, res) => {
  try {
    const { limit } = req.query;
    const notifications = await Notification.findAll(parseInt(limit) || 20);
    
    return successResponse(res, { notifications }, "Notifications fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    return errorResponse(res, "Failed to fetch notifications", 500);
  }
};

/**
 * Get unread notifications
 */
export const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findUnread();
    
    return successResponse(res, { notifications }, "Unread notifications fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching unread notifications:", error);
    return errorResponse(res, "Failed to fetch unread notifications", 500);
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Notification.markAsRead(id);
    
    return successResponse(res, {}, "Notification marked as read");
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    return errorResponse(res, "Failed to mark notification as read", 500);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead();
    
    return successResponse(res, {}, "All notifications marked as read");
  } catch (error) {
    console.error("❌ Error marking all notifications as read:", error);
    return errorResponse(res, "Failed to mark all notifications as read", 500);
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Notification.delete(id);
    
    return successResponse(res, {}, "Notification deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
    return errorResponse(res, "Failed to delete notification", 500);
  }
};

export default {
  getAllNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
