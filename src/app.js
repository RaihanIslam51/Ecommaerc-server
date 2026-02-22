// src/app.js
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

// Lazy email transporter — created on first use to avoid startup failure if env vars are missing
let _transporter = null;
const getTransporter = () => {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ZAP_EMAIL,
        pass: process.env.ZAP_APP_PASSWORD,
      },
    });
  }
  return _transporter;
};

// Security headers
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Simple rate limiter (no extra package needed)
const rateLimitMap = new Map();
app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 200;

  const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }
  record.count++;
  rateLimitMap.set(ip, record);

  if (record.count > maxRequests) {
    return res.status(429).json({ success: false, message: "Too many requests, please slow down." });
  }
  next();
});

// CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'https://rannarkaj.com',
      'https://www.rannarkaj.com',
    ];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error(`CORS policy: origin '${origin}' not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers (limit payload size to prevent abuse)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// API Routes (root health check is handled inside routes/index.js)
// prefix routes with /api so client requests match expected paths
app.use("/api", routes);
// also support non-prefixed paths for convenience (many clients hit /categories etc)
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

    await getTransporter().sendMail(emailObj);
    
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
