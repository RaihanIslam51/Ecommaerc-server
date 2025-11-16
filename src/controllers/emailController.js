// controllers/emailController.js
import { sendBulkEmail, verifyEmailConfig, sendEmail as sendSingleEmail } from "../utils/email.js";
import {
  successResponse,
  errorResponse,
  badRequestResponse
} from "../utils/response.js";
import { getDB } from "../config/database.js";

/**
 * Get all customer emails from orders
 */
const getAllCustomerEmails = async () => {
  try {
    const db = getDB();
    const ordersCollection = db.collection("orders");
    
    // Get unique customer emails from orders
    const orders = await ordersCollection.find({}).toArray();
    const emails = [...new Set(orders.map(order => order.customerInfo?.email).filter(Boolean))];
    
    return emails;
  } catch (error) {
    console.error("Error getting customer emails:", error);
    throw error;
  }
};

/**
 * Send email to all customers
 */
export const sendToAllCustomers = async (req, res) => {
  try {
    const { subject, message, htmlContent } = req.body;

    // Validation
    if (!subject || !message) {
      return badRequestResponse(res, "Subject and message are required");
    }

    // Verify email configuration first
    const verification = await verifyEmailConfig();
    if (!verification.success) {
      return errorResponse(
        res,
        "Email service not properly configured",
        503,
        verification.message
      );
    }

    // Get all customer emails
    const customerEmails = await getAllCustomerEmails();
    
    if (customerEmails.length === 0) {
      return badRequestResponse(res, "No customer emails found in the database");
    }

    // Generate professional HTML template if not provided
    const emailHTML = htmlContent || generateProfessionalEmailTemplate(subject, message);

    // Send emails to all customers
    await sendBulkEmail(customerEmails, subject, message, emailHTML);

    console.log(`✅ Email sent successfully to ${customerEmails.length} customers`);
    return successResponse(
      res,
      { 
        sentTo: customerEmails.length,
        recipients: customerEmails 
      },
      `Email sent successfully to ${customerEmails.length} customer${customerEmails.length > 1 ? 's' : ''}`
    );

  } catch (error) {
    console.error("❌ Error sending email to customers:", error);
    return errorResponse(res, "Failed to send emails to customers", 500, error.message);
  }
};

/**
 * Send email to specific recipients
 */
export const sendEmail = async (req, res) => {
  try {
    const { recipients, subject, message, htmlContent } = req.body;

    // Validation
    if (!recipients || recipients.length === 0) {
      return badRequestResponse(res, "At least one recipient is required");
    }

    if (!subject || !message) {
      return badRequestResponse(res, "Subject and message are required");
    }

    // Verify email configuration first
    const verification = await verifyEmailConfig();
    if (!verification.success) {
      if (verification.message.includes("not configured") || 
          verification.message.includes("placeholder")) {
        return errorResponse(
          res,
          "Email service not configured. Please contact administrator to set up email credentials in the .env file.",
          503,
          verification.message
        );
      }
      
      if (verification.message.includes("authentication") || 
          verification.message.includes("Invalid")) {
        return errorResponse(
          res,
          "Email authentication failed. Please check your email credentials.",
          503,
          verification.message
        );
      }
      
      return errorResponse(
        res,
        "Email service error",
        503,
        verification.message
      );
    }

    // Send emails
    await sendBulkEmail(recipients, subject, message, htmlContent);

    console.log(`✅ Email sent successfully to ${recipients.length} recipient(s)`);
    return successResponse(
      res,
      { sentTo: recipients.length },
      `Email sent successfully to ${recipients.length} recipient${recipients.length > 1 ? 's' : ''}`
    );

  } catch (error) {
    console.error("❌ Error sending email:", error);

    // Provide more detailed error messages
    let errorMessage = "Failed to send email";
    let errorDetails = error.message;

    if (error.code === 'EAUTH') {
      errorMessage = "Email authentication failed";
      errorDetails = "Invalid email credentials. Please check your EMAIL_USER and EMAIL_PASSWORD in .env file. For Gmail, use an App Password.";
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      errorMessage = "Connection failed";
      errorDetails = "Could not connect to email server. Check your internet connection.";
    } else if (error.code === 'EENVELOPE') {
      errorMessage = "Invalid email address";
      errorDetails = "One or more recipient email addresses are invalid.";
    }

    return errorResponse(res, errorMessage, 500, errorDetails);
  }
};

/**
 * Generate professional email template
 */
const generateProfessionalEmailTemplate = (subject, message) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            🛒 BDMart
          </h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
            Your Trusted Shopping Partner
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
            ${subject}
          </h2>
          
          <div style="color: #555555; line-height: 1.8; font-size: 16px; margin-bottom: 30px; white-space: pre-wrap;">
            ${message}
          </div>

          <!-- Call to Action Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://bdmart.com" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
              Visit BDMart
            </a>
          </div>

          <!-- Features Section -->
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Why Shop With Us?</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0;">
                  <span style="font-size: 20px; margin-right: 10px;">✅</span>
                  <span style="color: #555555; font-size: 14px;">Authentic Products</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0;">
                  <span style="font-size: 20px; margin-right: 10px;">🚚</span>
                  <span style="color: #555555; font-size: 14px;">Fast Delivery</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0;">
                  <span style="font-size: 20px; margin-right: 10px;">💯</span>
                  <span style="color: #555555; font-size: 14px;">Best Prices</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0;">
                  <span style="font-size: 20px; margin-right: 10px;">🔒</span>
                  <span style="color: #555555; font-size: 14px;">Secure Payment</span>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9f9f9; padding: 30px; border-top: 1px solid #eeeeee;">
          <!-- Social Media -->
          <div style="text-align: center; margin-bottom: 20px;">
            <p style="color: #888888; font-size: 14px; margin: 0 0 15px 0;">Follow us on social media</p>
            <div>
              <a href="#" style="display: inline-block; margin: 0 10px; text-decoration: none; color: #667eea; font-size: 24px;">📘</a>
              <a href="#" style="display: inline-block; margin: 0 10px; text-decoration: none; color: #667eea; font-size: 24px;">📷</a>
              <a href="#" style="display: inline-block; margin: 0 10px; text-decoration: none; color: #667eea; font-size: 24px;">🐦</a>
            </div>
          </div>

          <!-- Contact Info -->
          <div style="text-align: center; margin-bottom: 20px;">
            <p style="color: #888888; font-size: 13px; margin: 5px 0;">
              📧 Email: support@bdmart.com
            </p>
            <p style="color: #888888; font-size: 13px; margin: 5px 0;">
              📱 Phone: +880 1234-567890
            </p>
            <p style="color: #888888; font-size: 13px; margin: 5px 0;">
              🌐 Website: www.bdmart.com
            </p>
          </div>

          <!-- Copyright -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee;">
            <p style="color: #999999; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} BDMart. All rights reserved.
            </p>
            <p style="color: #999999; font-size: 11px; margin: 10px 0 0 0;">
              You received this email because you are a valued customer of BDMart.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Test email configuration
 */
export const testEmail = async (req, res) => {
  try {
    const verification = await verifyEmailConfig();
    
    if (!verification.success) {
      return errorResponse(res, "Email configuration test failed", 503, verification.message);
    }

    // Send test email
    const testSubject = "BDMart Email Configuration Test";
    const testMessage = "This is a test email from BDMart admin dashboard. Email service is working properly!";
    
    await sendSingleEmail(
      process.env.EMAIL_USER,
      testSubject,
      testMessage,
      generateProfessionalEmailTemplate(testSubject, testMessage)
    );

    return successResponse(
      res,
      { 
        configured: true,
        emailUser: process.env.EMAIL_USER,
        service: process.env.EMAIL_SERVICE || 'gmail'
      },
      "Email configuration is working! Test email sent successfully."
    );

  } catch (error) {
    console.error("❌ Email test failed:", error);
    return errorResponse(res, "Email test failed", 500, error.message);
  }
};

export default {
  sendEmail,
  sendToAllCustomers,
  testEmail
};
