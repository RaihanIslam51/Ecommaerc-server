// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Create email transporter with ZAP credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ZAP_EMAIL,
    pass: process.env.ZAP_APP_PASSWORD,
  },
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://rannarkaj.com', 'https://www.rannarkaj.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 RannarKaj.com API Server is running!",
    version: "2.0.0",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/", routes);

// Payment confirmation email endpoint
app.post("/send-payment-email", async (req, res) => {
  try {
    // Get payment info from request body
    const { transactionId, email, customerName, parcelInfo, totalAmount, items } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: "Customer email is required" 
      });
    }

    // Create items list HTML if items are provided
    let itemsHtml = '';
    if (items && items.length > 0) {
      itemsHtml = `
        <h3>Order Items:</h3>
        <ul style="list-style: none; padding: 0;">
          ${items.map(item => `
            <li style="padding: 10px; border-bottom: 1px solid #eee;">
              <strong>${item.name || item.productName}</strong> - Quantity: ${item.quantity} - Price: ৳${item.price}
            </li>
          `).join('')}
        </ul>
      `;
    }

    const emailObj = {
      from: `RannarKaj.com <${process.env.ZAP_EMAIL}>`,
      to: email,
      subject: "Order Confirmation - RannarKaj.com",
      html: `
        <div style="font-family: Arial; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0a7cff;">Order Confirmation</h2>

          <p>Dear ${customerName || 'Customer'},</p>
          <p>Thank you for your order. Your order has been received and is being processed.</p>

          <h3>Order Details:</h3>
          ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}
          ${parcelInfo ? `<p><strong>Order Info:</strong> ${parcelInfo}</p>` : ''}
          ${totalAmount ? `<p><strong>Total Amount:</strong> ৳${totalAmount}</p>` : ''}
          
          ${itemsHtml}

          <br/>
          <p style="font-size: 14px; color: #555;">
            This is an automated email from <strong>RannarKaj.com</strong>.
          </p>
          <p style="font-size: 12px; color: #888;">
            If you have any questions, please contact us.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(emailObj);
    
    res.status(200).json({ 
      success: true, 
      message: "Order confirmation email sent successfully!" 
    });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to send email",
      details: error.message 
    });
  }
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
