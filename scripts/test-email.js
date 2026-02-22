import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Testing Email Configuration...");
console.log("ZAP_EMAIL:", process.env.ZAP_EMAIL);
console.log("ZAP_APP_PASSWORD:", process.env.ZAP_APP_PASSWORD ? "✅ Set" : "❌ Not Set");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ZAP_EMAIL,
    pass: process.env.ZAP_APP_PASSWORD,
  },
});

async function testEmail() {
  try {
    console.log("\n📧 Verifying transporter...");
    await transporter.verify();
    console.log("✅ Transporter verified successfully!");

    console.log("\n📨 Sending test email...");
    const info = await transporter.sendMail({
      from: `RannarKaj.com <${process.env.ZAP_EMAIL}>`,
      to: "fm8826144@gmail.com",
      subject: "Test Email from RannarKaj.com",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>✅ Email Test Successful!</h2>
          <p>This is a test email from RannarKaj.com server.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully!");
    console.log("📬 Message ID:", info.messageId);
    console.log("📧 Email sent to: fm8826144@gmail.com");
  } catch (error) {
    console.error("❌ Email test failed:", error.message);
    console.error("Full error:", error);
  }
}

testEmail();
