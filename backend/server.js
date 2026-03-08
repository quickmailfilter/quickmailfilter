/**
 * Email Validator Backend API Server
 * Provides email validation REST API endpoints
 *
 * Usage:
 * 1. npm install
 * 2. npm run build
 * 3. npm start
 */

require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const crypto = require("crypto");

// Import backend validators
let validate;
try {
  validate = require("./dist/index.js").default;
} catch (e) {
  console.warn(
    "⚠️  Backend validator not built. Run: npm run build in backend/",
  );
  validate = null;
}

const app = express();
const PORT = process.env.PORT || 3004;
const NODE_ENV = process.env.NODE_ENV || "development";

// ========== MIDDLEWARE ==========

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS - Allow API calls from authorized origins
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ========== RAZORPAY SERVICE INITIALIZATION ==========

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpayConfigured = !!(razorpayKeyId && razorpayKeySecret);

if (!razorpayConfigured) {
  console.warn(
    "⚠️  Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable payments.",
  );
} else {
  console.log("✅ Razorpay payment gateway initialized");
}

// Payment storage (in production, use proper database)
const paymentTransactions = new Map();

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    server: "email-validator-saas",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Email validation endpoint
app.post("/api/validate", async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Invalid email parameter" });
  }

  try {
    // Use built-in validator if available
    if (validate && typeof validate === "function") {
      const result = await validate(email);
      // Return the consolidated result
      return res.json(result);
    }

    // Fallback: Use Disify API
    console.log("Using Disify API fallback for:", email);
    const disifyRes = await axios.get(`https://disify.com/api/email/${email}`, {
      timeout: 5000,
    });

    res.json({
      valid:
        disifyRes.data.format &&
        !disifyRes.data.disposable &&
        disifyRes.data.dns,
      disposable: disifyRes.data.disposable,
      role: false,
      accept_all: false,
      security_score: disifyRes.data.dns ? 70 : 10,
      validators: {
        regex: { valid: disifyRes.data.format },
        mx: { valid: disifyRes.data.dns },
        disposable: { valid: !disifyRes.data.disposable },
      },
      reason: disifyRes.data.disposable
        ? "disposable"
        : !disifyRes.data.dns
        ? "mx"
        : undefined,
    });
  } catch (error) {
    console.error("Validation error:", error.message);
    res.status(500).json({
      error: "Validation failed",
      message: error.message,
    });
  }
});

// Bulk validation endpoint
app.post("/api/validate-bulk", async (req, res) => {
  const { emails } = req.body;

  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: "Invalid emails array" });
  }

  if (emails.length > 1000) {
    return res.status(400).json({ error: "Maximum 1000 emails per request" });
  }

  try {
    const results = await Promise.all(
      emails.map((email) => {
        if (validate && typeof validate === "function") {
          return validate(email)
            .then((result) => ({
              email,
              is_valid: result.isValid,
              ...result,
            }))
            .catch((err) => ({
              email,
              is_valid: false,
              error: err.message,
            }));
        } else {
          // Fallback for bulk
          return axios
            .get(`https://disify.com/api/email/${email}`, { timeout: 2000 })
            .then((r) => ({
              email,
              is_valid: r.data.dns && !r.data.disposable,
            }))
            .catch(() => ({ email, is_valid: false }));
        }
      }),
    );

    res.json({
      total: emails.length,
      results,
    });
  } catch (error) {
    console.error("Bulk validation error:", error);
    res.status(500).json({ error: "Bulk validation failed" });
  }
});

// ========== PAYMENT/RAZORPAY ROUTES ==========

/**
 * Create Razorpay Order
 * POST /api/payment/create-order
 * Body: { planName: string, amount: number, userEmail: string, userId?: string }
 */
app.post("/api/payment/create-order", async (req, res) => {
  if (!razorpayConfigured) {
    return res.status(503).json({
      error: "Payment service unavailable",
      message: "Razorpay is not configured",
    });
  }

  const { planName, amount, userEmail, userId } = req.body;

  if (!planName || !amount || !userEmail) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["planName", "amount", "userEmail"],
    });
  }

  if (amount < 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString(
      "base64",
    );
    const receipt = `order-${Date.now()}-${planName.replace(/\s+/g, "-")}`;

    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: Math.round(amount * 100), // Convert to paise
        currency: "INR",
        receipt,
        notes: {
          plan_name: planName,
          user_email: userEmail,
          user_id: userId || "guest",
          created_at: new Date().toISOString(),
        },
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    // Store order info locally
    paymentTransactions.set(response.data.id, {
      orderId: response.data.id,
      planName,
      amount,
      userEmail,
      userId: userId || null,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Order created: ${response.data.id}`);

    res.json({
      success: true,
      orderId: response.data.id,
      amount,
      currency: "INR",
      keyId: razorpayKeyId,
    });
  } catch (error) {
    console.error(
      "❌ Order creation error:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      error: "Failed to create payment order",
      message: error.response?.data?.description || error.message,
    });
  }
});

/**
 * Verify Payment
 * POST /api/payment/verify
 * Body: { orderId: string, paymentId: string, signature: string }
 */
app.post("/api/payment/verify", async (req, res) => {
  if (!razorpayConfigured) {
    return res.status(503).json({
      error: "Payment service unavailable",
      message: "Razorpay is not configured",
    });
  }

  const { orderId, paymentId, signature } = req.body;

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["orderId", "paymentId", "signature"],
    });
  }

  try {
    // Verify signature
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(body)
      .digest("hex");

    const signatureMatch = expectedSignature === signature;

    if (!signatureMatch) {
      console.error("❌ Signature verification failed for payment:", paymentId);
      return res.status(400).json({
        success: false,
        valid: false,
        error: "Payment signature verification failed",
      });
    }

    // Fetch payment details
    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString(
      "base64",
    );
    const paymentResponse = await axios.get(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        headers: { Authorization: `Basic ${auth}` },
        timeout: 30000,
      },
    );

    const payment = paymentResponse.data;

    // Verify payment is captured
    if (payment.status !== "captured") {
      console.error("❌ Payment not captured:", paymentId);
      return res.status(400).json({
        success: false,
        valid: false,
        error: `Payment status is ${payment.status}, not captured`,
      });
    }

    // Update transaction record
    if (paymentTransactions.has(orderId)) {
      const transaction = paymentTransactions.get(orderId);
      transaction.paymentId = paymentId;
      transaction.signature = signature;
      transaction.status = "captured";
      transaction.method = payment.method;
      transaction.updatedAt = new Date().toISOString();
      paymentTransactions.set(orderId, transaction);
    }

    console.log(`✅ Payment verified: ${paymentId} for order ${orderId}`);

    res.json({
      success: true,
      valid: true,
      message: "Payment verified successfully",
      paymentId,
      orderId,
      amount: payment.amount / 100, // Convert back to INR
      method: payment.method,
      transactionData: paymentTransactions.get(orderId),
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error.message);
    res.status(500).json({
      success: false,
      valid: false,
      error: "Failed to verify payment",
      message: error.message,
    });
  }
});

/**
 * Get Payment Status
 * GET /api/payment/status/:orderId
 */
app.get("/api/payment/status/:orderId", (req, res) => {
  const { orderId } = req.params;

  const transaction = paymentTransactions.get(orderId);

  if (!transaction) {
    return res.status(404).json({
      error: "Order not found",
      orderId,
    });
  }

  res.json({
    orderId,
    ...transaction,
  });
});

/**
 * Get Pricing Plans
 * GET /api/payment/plans
 */
app.get("/api/payment/plans", (req, res) => {
  const plans = [
    {
      id: "plan-free",
      name: "Free Trial",
      price: 0,
      currency: "INR",
      description: "Perfect for testing our service",
      quota: 1000,
      features: [
        "1,000 monthly verifications",
        "Format validation",
        "Domain & MX checks",
        "Disposable detection",
      ],
      popular: false,
      active: true,
    },
    {
      id: "plan-business",
      name: "Business",
      price: 4099,
      currency: "INR",
      description: "For growing businesses",
      quota: 50000,
      features: [
        "50,000 monthly verifications",
        "Bulk list cleaning",
        "Advanced filtering",
        "Priority support",
        "API access",
        "Custom integrations",
      ],
      popular: true,
      active: true,
    },
    {
      id: "plan-enterprise",
      name: "Enterprise",
      price: 16599,
      currency: "INR",
      description: "For large organizations",
      quota: 150000,
      features: [
        "150,000 monthly verifications",
        "24/7 premium support",
        "Custom integrations",
        "SLA guarantee",
        "Dedicated account manager",
        "Advanced reporting",
      ],
      popular: false,
      active: true,
    },
  ];

  res.json({
    success: true,
    plans,
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
    message: "This endpoint does not exist. Use /api/health or /api/validate",
  });
});

// ========== ERROR HANDLING ==========

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: NODE_ENV === "development" ? err.message : undefined,
  });
});

// ========== START SERVER ==========

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Email Validator API Backend          ║
╚════════════════════════════════════════╝

🚀 Server running on port: ${PORT}
🌍 Environment: ${NODE_ENV}
⏰ Started at: ${new Date().toISOString()}

📍 Health Check:
   GET http://localhost:${PORT}/api/health

📧 Email Validation:
   POST http://localhost:${PORT}/api/validate
   Body: { "email": "user@example.com" }

📨 Bulk Validation:
   POST http://localhost:${PORT}/api/validate-bulk
   Body: { "emails": ["user1@example.com", "user2@example.com"] }

Documentation: See README.md for full API documentation
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal: closing HTTP server");
  process.exit(0);
});
