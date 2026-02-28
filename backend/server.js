/**
 * Email Validator Backend API Server
 * Provides email validation REST API endpoints
 * 
 * Usage:
 * 1. npm install
 * 2. npm run build
 * 3. npm start
 */

require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

// Import backend validators
let validate;
try {
  validate = require('./dist/index.js').default;
} catch (e) {
  console.warn('⚠️  Backend validator not built. Run: npm run build in backend/');
  validate = null;
}

const app = express();
const PORT = process.env.PORT || 3004;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ========== MIDDLEWARE ==========

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS - Allow API calls from authorized origins
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));



// ========== API ROUTES ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'email-validator-saas',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Email validation endpoint
app.post('/api/validate', async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Invalid email parameter' });
  }

  try {
    // Use built-in validator if available
    if (validate && typeof validate === 'function') {
      const result = await validate(email);
      // Return the consolidated result
      return res.json(result);
    }

    // Fallback: Use Disify API
    console.log('Using Disify API fallback for:', email);
    const disifyRes = await axios.get(`https://disify.com/api/email/${email}`, {
      timeout: 5000
    });

    res.json({
      valid: disifyRes.data.format && !disifyRes.data.disposable && disifyRes.data.dns,
      disposable: disifyRes.data.disposable,
      role: false,
      accept_all: false,
      security_score: disifyRes.data.dns ? 70 : 10,
      validators: {
        regex: { valid: disifyRes.data.format },
        mx: { valid: disifyRes.data.dns },
        disposable: { valid: !disifyRes.data.disposable }
      },
      reason: disifyRes.data.disposable ? 'disposable' : (!disifyRes.data.dns ? 'mx' : undefined)
    });
  } catch (error) {
    console.error('Validation error:', error.message);
    res.status(500).json({
      error: 'Validation failed',
      message: error.message
    });
  }
});

// Bulk validation endpoint
app.post('/api/validate-bulk', async (req, res) => {
  const { emails } = req.body;

  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'Invalid emails array' });
  }

  if (emails.length > 1000) {
    return res.status(400).json({ error: 'Maximum 1000 emails per request' });
  }

  try {
    const results = await Promise.all(
      emails.map(email => {
        if (validate && typeof validate === 'function') {
          return validate(email)
            .then(result => ({
              email,
              is_valid: result.isValid,
              ...result
            }))
            .catch(err => ({
              email,
              is_valid: false,
              error: err.message
            }));
        } else {
           // Fallback for bulk
           return axios.get(`https://disify.com/api/email/${email}`, { timeout: 2000 })
             .then(r => ({ email, is_valid: r.data.dns && !r.data.disposable }))
             .catch(() => ({ email, is_valid: false }));
        }
      })
    );

    res.json({
      total: emails.length,
      results
    });
  } catch (error) {
    console.error('Bulk validation error:', error);
    res.status(500).json({ error: 'Bulk validation failed' });
  }
});

// ========== DEFAULT 404 HANDLER ==========

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    message: 'This endpoint does not exist. Use /api/health or /api/validate'
  });
});

// ========== ERROR HANDLING ==========

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : undefined
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
process.on('SIGTERM', () => {
  console.log('SIGTERM signal: closing HTTP server');
  process.exit(0);
});
