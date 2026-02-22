import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Environment Variables Check:\n");
console.log("================================");

// Server Config
console.log("📡 Server Configuration:");
console.log("  PORT:", process.env.PORT || "❌ NOT SET");
console.log("  NODE_ENV:", process.env.NODE_ENV || "❌ NOT SET");
console.log("");

// Database
console.log("🗄️  Database Configuration:");
console.log("  MONGODB_URI:", process.env.MONGODB_URI ? "✅ SET" : "❌ NOT SET");
if (process.env.MONGODB_URI) {
  console.log("    →", process.env.MONGODB_URI.substring(0, 50) + "...");
}
console.log("");

// Email Configuration
console.log("📧 Email Configuration:");
console.log("  ZAP_EMAIL:", process.env.ZAP_EMAIL || "❌ NOT SET");
console.log("  ZAP_APP_PASSWORD:", process.env.ZAP_APP_PASSWORD ? "✅ SET (" + process.env.ZAP_APP_PASSWORD.length + " chars)" : "❌ NOT SET");
console.log("");

console.log("  EMAIL_USER:", process.env.EMAIL_USER || "❌ NOT SET");
console.log("  EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "✅ SET (" + process.env.EMAIL_PASSWORD.length + " chars)" : "❌ NOT SET");
console.log("  EMAIL_SERVICE:", process.env.EMAIL_SERVICE || "❌ NOT SET");
console.log("");

// Other
console.log("🔧 Other Configuration:");
console.log("  CLIENT_URL:", process.env.CLIENT_URL || "❌ NOT SET");
console.log("  ADMIN_EMAIL:", process.env.ADMIN_EMAIL || "❌ NOT SET");
console.log("  JWT_SECRET:", process.env.JWT_SECRET ? "✅ SET" : "❌ NOT SET");
console.log("");

console.log("================================");

// Summary
const requiredVars = [
  "PORT",
  "MONGODB_URI",
  "ZAP_EMAIL",
  "ZAP_APP_PASSWORD"
];

const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length === 0) {
  console.log("✅ All required environment variables are set!");
} else {
  console.log("❌ Missing required variables:", missing.join(", "));
}
