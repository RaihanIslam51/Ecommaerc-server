// utils/email.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Create email transporter
 */
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file");
  }

  // Check for placeholder values
  if (process.env.EMAIL_USER === 'your-email@gmail.com' || 
      process.env.EMAIL_PASSWORD === 'your-app-password') {
    throw new Error("Email credentials are still set to placeholder values");
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true, message: "Email configuration verified" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/**
 * Send single email
 */
export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter
    await transporter.verify();

    const mailOptions = {
      from: `"BDMart" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || generateDefaultEmailTemplate(subject, text)
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

/**
 * Send email to multiple recipients
 */
export const sendBulkEmail = async (recipients, subject, text, html = null) => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter
    await transporter.verify();

    const emailPromises = recipients.map(async (email) => {
      const mailOptions = {
        from: `"BDMart" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        text,
        html: html || generateDefaultEmailTemplate(subject, text)
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);
    return { success: true, count: recipients.length };
  } catch (error) {
    console.error("❌ Error sending bulk email:", error);
    throw error;
  }
};

/**
 * Generate default email template
 */
const generateDefaultEmailTemplate = (subject, message) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🛒 BDMart</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">${subject}</h2>
        <div style="color: #555; line-height: 1.6; white-space: pre-wrap;">${message}</div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} BDMart. All rights reserved.
        </p>
      </div>
    </div>
  `;
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmation = async (customerEmail, order) => {
  const subject = `Order Confirmation - ${order.id}`;
  const text = `Your order ${order.id} has been received and is being processed.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Total Amount:</strong> ৳${order.totalAmount || order.amount}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <p>We'll notify you when your order ships.</p>
    </div>
  `;
  
  return await sendEmail(customerEmail, subject, text, html);
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, tempPassword) => {
  const subject = "Password Reset - BDMart";
  const text = `Your temporary password is: ${tempPassword}. Please login and change your password immediately.`;
  const html = generateDefaultEmailTemplate(subject, text);
  
  return await sendEmail(email, subject, text, html);
};

export default {
  sendEmail,
  sendBulkEmail,
  sendOrderConfirmation,
  sendPasswordResetEmail,
  verifyEmailConfig
};
