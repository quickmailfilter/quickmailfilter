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
const admin = require("firebase-admin");

// Initialize Firebase Admin if credentials are provided
let firebaseInitialized = false;
if (
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL
) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    firebaseInitialized = true;
    console.log("✅ Firebase Admin SDK initialized");
  } catch (error) {
    console.warn("⚠️  Firebase initialization error:", error.message);
  }
} else {
  console.warn(
    "⚠️  Firebase credentials not provided. Contact submissions will be stored in memory only.",
  );
}

// In-memory storage for contact submissions (in production, use Firebase)
const contactSubmissions = [];

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

// DEBUG: Check configuration status (remove in production)
app.get("/api/debug/config", (req, res) => {
  res.json({
    razorpayConfigured,
    razorpayKeyIdExists: !!razorpayKeyId,
    razorpayKeySecretExists: !!razorpayKeySecret,
    razorpayKeyIdLength: razorpayKeyId?.length || 0,
    razorpayKeySecretLength: razorpayKeySecret?.length || 0,
    nodeEnv: NODE_ENV,
    corsOrigin: process.env.CORS_ORIGIN,
    port: PORT,
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
      message:
        "Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables. See RAZORPAY_CONFIGURATION.md for setup instructions.",
      setup_guide:
        "https://github.com/yourusername/email-validator/blob/main/RAZORPAY_CONFIGURATION.md",
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
      quota: 50,
      features: [
        "50 monthly verifications",
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

� Configuration Status:
   ${
     razorpayConfigured
       ? "✅ Razorpay: CONFIGURED"
       : "❌ Razorpay: NOT CONFIGURED"
   }
   Debug: GET http://localhost:${PORT}/api/debug/config

📧 Email Validation:
   POST http://localhost:${PORT}/api/validate
   Body: { "email": "user@example.com" }

📨 Bulk Validation:
   POST http://localhost:${PORT}/api/validate-bulk
   Body: { "emails": ["user1@example.com", "user2@example.com"] }

💳 Payment:
   ${
     razorpayConfigured
       ? "✅ POST http://localhost:" + PORT + "/api/payment/create-order"
       : "❌ Payment endpoint unavailable (Razorpay not configured)"
   }

Documentation: See README.md for full API documentation
  `);
});

// ========== CONTACT SUBMISSIONS ROUTES ==========

/**
 * Submit Contact Form
 * POST /api/contact/submit
 * Body: { name: string, email: string, subject: string, message: string, phone?: string }
 */
app.post("/api/contact/submit", async (req, res) => {
  const { name, email, subject, message, phone } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["name", "email", "subject", "message"],
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Invalid email format",
    });
  }

  const submission = {
    id: `contact-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || "",
    subject: subject.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
    read: false,
    status: "new",
  };

  try {
    // Try to save to Firebase if available
    if (firebaseInitialized) {
      try {
        const db = admin.firestore();
        await db
          .collection("contactSubmissions")
          .doc(submission.id)
          .set(submission);
        console.log(
          `✅ Contact submission saved to Firebase: ${submission.id}`,
        );
      } catch (firebaseError) {
        console.error("Firebase storage error:", firebaseError.message);
        // Fall back to in-memory storage
        contactSubmissions.push(submission);
      }
    } else {
      // Store in memory
      contactSubmissions.push(submission);
      console.log(`📝 Contact submission stored in memory: ${submission.id}`);
      console.log(`   Total submissions: ${contactSubmissions.length}`);
    }

    res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
      submissionId: submission.id,
    });
  } catch (error) {
    console.error("❌ Contact submission error:", error.message);
    res.status(500).json({
      error: "Failed to submit contact form",
      message: error.message,
    });
  }
});

/**
 * Get All Contact Submissions (Admin Only)
 * GET /api/contact/submissions
 * Query: ?limit=50&offset=0&sort=createdAt&order=desc
 */
app.get("/api/contact/submissions", async (req, res) => {
  const {
    limit = 50,
    offset = 0,
    sort = "createdAt",
    order = "desc",
  } = req.query;

  try {
    let submissions = [];

    // Try to fetch from Firebase if available
    if (firebaseInitialized) {
      try {
        const db = admin.firestore();
        let query = db.collection("contactSubmissions");

        // Apply sorting
        const orderDirection = order === "desc" ? "desc" : "asc";
        query = query.orderBy(sort, orderDirection);

        // Apply pagination
        const snapshot = await query
          .limit(parseInt(limit))
          .offset(parseInt(offset))
          .get();

        submissions = snapshot.docs.map((doc) => ({
          ...doc.data(),
        }));

        // Get total count
        const countSnapshot = await db.collection("contactSubmissions").get();
        const total = countSnapshot.size;

        console.log(
          `✅ Retrieved ${submissions.length} contact submissions from Firebase`,
        );

        return res.json({
          success: true,
          submissions,
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
        });
      } catch (firebaseError) {
        console.error("Firebase retrieval error:", firebaseError.message);
        // Fall back to in-memory storage
      }
    }

    // Return in-memory submissions
    submissions = contactSubmissions
      .slice()
      .sort((a, b) => {
        const multiplier = order === "asc" ? 1 : -1;
        if (sort === "createdAt") {
          return (
            multiplier *
            (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          );
        }
        return 0;
      })
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      submissions,
      total: contactSubmissions.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      note: "Using in-memory storage. Contact submissions will be lost on server restart. Configure Firebase for persistent storage.",
    });
  } catch (error) {
    console.error("❌ Submission retrieval error:", error.message);
    res.status(500).json({
      error: "Failed to retrieve contact submissions",
      message: error.message,
    });
  }
});

/**
 * Get Single Contact Submission (Admin Only)
 * GET /api/contact/submissions/:id
 */
app.get("/api/contact/submissions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Try Firebase first
    if (firebaseInitialized) {
      try {
        const db = admin.firestore();
        const doc = await db.collection("contactSubmissions").doc(id).get();

        if (!doc.exists) {
          return res.status(404).json({
            error: "Submission not found",
            id,
          });
        }

        return res.json({
          success: true,
          submission: doc.data(),
        });
      } catch (firebaseError) {
        console.error("Firebase retrieval error:", firebaseError.message);
        // Fall back to in-memory storage
      }
    }

    // Search in-memory
    const submission = contactSubmissions.find((s) => s.id === id);

    if (!submission) {
      return res.status(404).json({
        error: "Submission not found",
        id,
      });
    }

    res.json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("❌ Submission retrieval error:", error.message);
    res.status(500).json({
      error: "Failed to retrieve submission",
      message: error.message,
    });
  }
});

/**
 * Mark Contact Submission as Read (Admin Only)
 * PATCH /api/contact/submissions/:id/read
 */
app.patch("/api/contact/submissions/:id/read", async (req, res) => {
  const { id } = req.params;

  try {
    // Try Firebase first
    if (firebaseInitialized) {
      try {
        const db = admin.firestore();
        await db.collection("contactSubmissions").doc(id).update({
          read: true,
          readAt: new Date().toISOString(),
        });

        const doc = await db.collection("contactSubmissions").doc(id).get();
        return res.json({
          success: true,
          submission: doc.data(),
        });
      } catch (firebaseError) {
        console.error("Firebase update error:", firebaseError.message);
        // Fall back to in-memory storage
      }
    }

    // Update in-memory
    const submission = contactSubmissions.find((s) => s.id === id);

    if (!submission) {
      return res.status(404).json({
        error: "Submission not found",
        id,
      });
    }

    submission.read = true;
    submission.readAt = new Date().toISOString();

    res.json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("❌ Submission update error:", error.message);
    res.status(500).json({
      error: "Failed to update submission",
      message: error.message,
    });
  }
});

/**
 * Delete Contact Submission (Admin Only)
 * DELETE /api/contact/submissions/:id
 */
app.delete("/api/contact/submissions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Try Firebase first
    if (firebaseInitialized) {
      try {
        const db = admin.firestore();
        await db.collection("contactSubmissions").doc(id).delete();

        return res.json({
          success: true,
          message: "Submission deleted successfully",
          id,
        });
      } catch (firebaseError) {
        console.error("Firebase deletion error:", firebaseError.message);
        // Fall back to in-memory storage
      }
    }

    // Delete from in-memory
    const index = contactSubmissions.findIndex((s) => s.id === id);

    if (index === -1) {
      return res.status(404).json({
        error: "Submission not found",
        id,
      });
    }

    contactSubmissions.splice(index, 1);

    res.json({
      success: true,
      message: "Submission deleted successfully",
      id,
    });
  } catch (error) {
    console.error("❌ Submission deletion error:", error.message);
    res.status(500).json({
      error: "Failed to delete submission",
      message: error.message,
    });
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal: closing HTTP server");
  process.exit(0);
});
