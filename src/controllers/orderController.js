// controllers/orderController.js
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse
} from "../utils/response.js";

dotenv.config();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ZAP_EMAIL,
    pass: process.env.ZAP_APP_PASSWORD,
  },
});

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

    // Send confirmation email to customer
    try {
      console.log("📧 Attempting to send email to:", orderData.customerInfo?.email);
      
      if (orderData.customerInfo?.email) {
        console.log("✅ Email address found, preparing email...");
        
        const itemsHtml = orderData.items.map(item => `
          <li style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${item.name}</strong> - Quantity: ${item.quantity} - Price: ৳${item.price}
          </li>
        `).join('');

        const emailObj = {
          from: `RannarKaj.com <${process.env.ZAP_EMAIL}>`,
          to: orderData.customerInfo.email,
          subject: "Order Confirmation - RannarKaj.com",
          html: `
            <div style="font-family: Arial; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🛒 RannarKaj.com</h1>
              </div>
              <div style="padding: 20px; background: #ffffff;">
                <h2 style="color: #0a7cff; margin-top: 0;">Order Confirmation</h2>
                <p>Dear <strong>${orderData.customerInfo.name || 'Customer'}</strong>,</p>
                <p>Thank you for your order. Your order has been received and is being processed.</p>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">📋 Order Details</h3>
                  <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
                  <p style="margin: 5px 0;"><strong>Customer Name:</strong> ${orderData.customerInfo.name}</p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${orderData.customerInfo.email}</p>
                  <p style="margin: 5px 0;"><strong>Phone:</strong> ${orderData.customerInfo.phone || 'N/A'}</p>
                  <p style="margin: 5px 0;"><strong>Total Amount:</strong> <span style="color: #10b981; font-size: 18px; font-weight: bold;">৳${orderData.totalAmount}</span></p>
                  <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
                  <p style="margin: 5px 0;"><strong>Delivery Time:</strong> ${orderData.deliveryTime}</p>
                </div>

                <h3 style="color: #333;">📦 Order Items</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${itemsHtml}
                </ul>

                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">📍 Shipping Address</h3>
                  <p style="margin: 0;">${orderData.customerInfo.address}</p>
                </div>

                <div style="border-top: 2px solid #e5e7eb; margin-top: 20px; padding-top: 20px;">
                  <p style="font-size: 14px; color: #555; margin: 5px 0;">
                    This is an automated email from <strong>RannarKaj.com</strong>.
                  </p>
                  <p style="font-size: 12px; color: #888; margin: 5px 0;">
                    If you have any questions, please contact us at support@rannarkaj.com
                  </p>
                </div>
              </div>
              <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="margin: 0; font-size: 12px; color: #6b7280;">
                  © ${new Date().getFullYear()} RannarKaj.com. All rights reserved.
                </p>
              </div>
            </div>
          `,
        };

        console.log("📨 Sending email via transporter...");
        const emailResult = await transporter.sendMail(emailObj);
        console.log("✅ Confirmation email sent successfully!");
        console.log("📬 Message ID:", emailResult.messageId);
        console.log("📧 Sent to:", orderData.customerInfo.email);
      } else {
        console.log("⚠️ No email address provided in customerInfo");
      }
    } catch (emailError) {
      console.error("❌ Failed to send confirmation email:", emailError.message);
      console.error("Full error:", emailError);
      // Don't fail the order if email fails
    }

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
