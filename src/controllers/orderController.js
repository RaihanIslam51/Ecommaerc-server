// controllers/orderController.js
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse
} from "../utils/response.js";

/**
 * Get all orders
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    return successResponse(res, { orders }, "Orders fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return errorResponse(res, "Failed to fetch orders", 500);
  }
};

/**
 * Get single order by ID
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return notFoundResponse(res, "Order not found");
    }

    return successResponse(res, { order }, "Order fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    return errorResponse(res, "Failed to fetch order", 500);
  }
};

/**
 * Create new order
 */
export const createOrder = async (req, res) => {
  try {
    console.log("📦 Received order data:", JSON.stringify(req.body, null, 2));

    // Normalize order data
    const orderData = {
      customer: req.body.customer || req.body.customerInfo?.name || "Guest",
      customerInfo: req.body.customerInfo || {
        name: req.body.customer || "Guest",
        email: req.body.customerInfo?.email || "",
        phone: req.body.customerInfo?.phone || "",
        address: req.body.customerInfo?.address || req.body.shippingAddress?.address || ""
      },
      amount: parseFloat(req.body.amount || req.body.totalAmount) || 0,
      totalAmount: parseFloat(req.body.totalAmount || req.body.amount) || 0,
      status: req.body.status || "pending",
      date: req.body.date || req.body.orderDate || new Date().toISOString(),
      orderDate: req.body.orderDate || req.body.date || new Date().toISOString(),
      product: req.body.product || null,
      items: req.body.items || (req.body.product ? [{
        productId: req.body.product.productId,
        name: req.body.product.name,
        price: req.body.product.price,
        quantity: req.body.product.quantity,
        image: req.body.product.image
      }] : []),
      shippingAddress: req.body.shippingAddress || {
        address: req.body.customerInfo?.address || ""
      },
      paymentMethod: req.body.paymentMethod || "cash",
      deliveryTime: req.body.deliveryTime || "30 minutes"
    };

    const order = await Order.create(orderData);
    console.log("✅ Order saved with ID:", order._id);

    // Create notification for new order
    await Notification.createOrderNotification(order);
    console.log("🔔 Notification created");

    return createdResponse(res, { order }, "Order created successfully");
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return errorResponse(res, "Failed to create order", 500);
  }
};

/**
 * Update order
 */
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.update(id, req.body);
    if (!order) {
      return notFoundResponse(res, "Order not found");
    }

    return successResponse(res, { order }, "Order updated successfully");
  } catch (error) {
    console.error("❌ Error updating order:", error);
    return errorResponse(res, "Failed to update order", 500);
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return badRequestResponse(
        res,
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      );
    }

    const order = await Order.updateStatus(id, status);
    if (!order) {
      return notFoundResponse(res, "Order not found");
    }

    return successResponse(res, { order }, `Order status updated to ${status}`);
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    return errorResponse(res, "Failed to update order status", 500);
  }
};

/**
 * Delete order
 */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Order.delete(id);
    if (result.deletedCount === 0) {
      return notFoundResponse(res, "Order not found");
    }

    return successResponse(res, {}, "Order deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    return errorResponse(res, "Failed to delete order", 500);
  }
};

export default {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder
};
