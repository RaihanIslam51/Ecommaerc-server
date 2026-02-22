// controllers/messageController.js
import Message from "../models/Message.js";
import {
  successResponse,
  errorResponse,
  createdResponse
} from "../utils/response.js";

/**
 * Get all messages
 */
export const getAllMessages = async (req, res) => {
  try {
    console.log("📨 GET /messages request received");
    
    const { limit } = req.query;
    const messages = await Message.findAll(parseInt(limit) || 20);
    
    console.log(`✅ Found ${messages.length} messages`);
    return successResponse(res, { messages }, "Messages fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    return errorResponse(res, "Failed to fetch messages", 500);
  }
};

/**
 * Get unread messages
 */
export const getUnreadMessages = async (req, res) => {
  try {
    const messages = await Message.findUnread();
    
    return successResponse(res, { messages }, "Unread messages fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching unread messages:", error);
    return errorResponse(res, "Failed to fetch unread messages", 500);
  }
};

/**
 * Create new message
 */
export const createMessage = async (req, res) => {
  try {
    const messageData = {
      customerName: req.body.customerName || "Guest",
      phone: req.body.phone || "",
      email: req.body.email || "",
      message: req.body.message || "",
      type: req.body.type || "customer_message"
    };

    const message = await Message.create(messageData);
    console.log(`📨 New message from ${message.customerName}`);

    return createdResponse(res, { data: message }, "Message sent successfully");
  } catch (error) {
    console.error("❌ Error creating message:", error);
    return errorResponse(res, "Failed to send message", 500);
  }
};

/**
 * Mark message as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Message.markAsRead(id);
    
    return successResponse(res, {}, "Message marked as read");
  } catch (error) {
    console.error("❌ Error marking message as read:", error);
    return errorResponse(res, "Failed to mark message as read", 500);
  }
};

/**
 * Mark all messages as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Message.markAllAsRead();
    
    return successResponse(res, {}, "All messages marked as read");
  } catch (error) {
    console.error("❌ Error marking all messages as read:", error);
    return errorResponse(res, "Failed to mark all messages as read", 500);
  }
};

/**
 * Delete message
 */
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Message.delete(id);
    
    return successResponse(res, {}, "Message deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting message:", error);
    return errorResponse(res, "Failed to delete message", 500);
  }
};

export default {
  getAllMessages,
  getUnreadMessages,
  createMessage,
  markAsRead,
  markAllAsRead,
  deleteMessage
};
