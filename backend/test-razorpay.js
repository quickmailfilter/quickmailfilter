#!/usr/bin/env node

/**
 * Razorpay Configuration Test Script
 *
 * This script checks if your Razorpay configuration is working correctly
 * Run from the backend folder: node test-razorpay.js
 */

require("dotenv").config();

console.log("🔍 Razorpay Configuration Test\n");

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log("1️⃣  Checking environment variables:");
console.log(
  `   RAZORPAY_KEY_ID: ${
    keyId ? "✅ Set (" + keyId.length + " chars)" : "❌ NOT SET"
  }`,
);
console.log(
  `   RAZORPAY_KEY_SECRET: ${
    keySecret ? "✅ Set (" + keySecret.length + " chars)" : "❌ NOT SET"
  }`,
);

if (!keyId || !keySecret) {
  console.log("\n❌ ERROR: Razorpay credentials are missing!");
  console.log("\n📝 How to fix:");
  console.log("   1. Go to backend/.env file");
  console.log("   2. Make sure these lines are present:");
  console.log("      RAZORPAY_KEY_ID=rzp_test_xxxxx");
  console.log("      RAZORPAY_KEY_SECRET=xxxxxxx");
  console.log("   3. Save the file");
  console.log("   4. Restart the backend: npm run dev");
  process.exit(1);
}

console.log("\n2️⃣  Validating key format:");
const keyIdValid = keyId.startsWith("rzp_");
const keySecretValid = keySecret.length > 10;

console.log(
  `   Key ID format: ${
    keyIdValid ? "✅ Valid (starts with 'rzp_')" : "❌ Invalid format"
  }`,
);
console.log(
  `   Key Secret length: ${
    keySecretValid ? "✅ Valid (>10 chars)" : "❌ Too short"
  }`,
);

if (!keyIdValid || !keySecretValid) {
  console.log("\n❌ ERROR: Razorpay key format is invalid!");
  console.log("   Check your keys in backend/.env file");
  process.exit(1);
}

console.log("\n3️⃣  Checking for .env file:");
const fs = require("fs");
const envPath = "./.env";
const envExists = fs.existsSync(envPath);
console.log(`   .env file: ${envExists ? "✅ Found" : "❌ Not found"}`);

if (envExists) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const hasKeyId = envContent.includes("RAZORPAY_KEY_ID");
  const hasKeySecret = envContent.includes("RAZORPAY_KEY_SECRET");
  console.log(`   Contains RAZORPAY_KEY_ID: ${hasKeyId ? "✅ Yes" : "❌ No"}`);
  console.log(
    `   Contains RAZORPAY_KEY_SECRET: ${hasKeySecret ? "✅ Yes" : "❌ No"}`,
  );
}

console.log("\n✅ All checks passed!");
console.log("\n📋 Next steps:");
console.log("   1. Run: npm run dev");
console.log(
  "   2. Check if you see '✅ Razorpay payment gateway initialized' message",
);
console.log("   3. Try making a payment in the frontend\n");
