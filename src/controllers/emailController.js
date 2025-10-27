// controllers/emailController.js
import { sendBulkEmail, verifyEmailConfig } from "../utils/email.js";
import {
  successResponse,
  errorResponse,
  badRequestResponse
} from "../utils/response.js";

/**
 * Send email to multiple recipients
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

export default {
  sendEmail
};
