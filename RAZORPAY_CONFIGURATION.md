# Razorpay Payment Gateway Setup Guide

This guide explains how to configure Razorpay to fix the 503 "Payment service unavailable" error.

## Problem

The backend returns 503 error because Razorpay credentials are not configured:

```
Error: Payment service unavailable
Message: Razorpay is not configured
```

## Root Cause

Environment variables `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are not set in the backend.

## Solution

### Step 1: Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up or log in
3. Complete KYC verification
4. Navigate to **Settings** → **API Keys**

### Step 2: Copy Your API Keys

1. In API Keys section, you'll see:
   - **Key ID** (public key)
   - **Key Secret** (private key, treat like password)
2. Click "Generate Key Pair" if none exist

### Step 3: Configure Environment Variables

#### For Local Development

Create or update `.env` in the `backend/` folder:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# Other existing variables...
PORT=3004
NODE_ENV=development
```

**Important:** Never commit `.env` to git. Add it to `.gitignore`:

```gitignore
.env
.env.local
*.env
```

#### For Production (Railway/Vercel)

1. **Railway Dashboard:**
   - Go to your Railway project
   - **Variables** tab
   - Add:
     - `RAZORPAY_KEY_ID`: Your production key ID
     - `RAZORPAY_KEY_SECRET`: Your production key secret
   - Click "Deploy"

2. **Vercel Dashboard:**
   - Go to your project
   - **Settings** → **Environment Variables**
   - Add:
     - `RAZORPAY_KEY_ID`
     - `RAZORPAY_KEY_SECRET`
   - Redeploy

### Step 4: Test the Connection

Once configured, try creating an order:

```bash
# From the project root
cd backend

# Start the server
npm run dev  # or npm start

# In another terminal, test the endpoint:
curl -X POST http://localhost:3004/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Business",
    "amount": 999,
    "userEmail": "test@example.com",
    "userId": "test-user-123"
  }'
```

Expected response:

```json
{
  "success": true,
  "orderId": "order_xxxxxxxxxxxx",
  "amount": 999,
  "currency": "INR"
}
```

### Step 5: Verify in Frontend

1. Restart the frontend: `npm run dev` in `frontend/` folder
2. Go to pricing page and try purchasing a plan
3. You should see the Razorpay payment modal (no more 503 error)

## Troubleshooting

| Issue                               | Solution                                           |
| ----------------------------------- | -------------------------------------------------- |
| Still getting 503 after adding keys | Restart backend server and frontend                |
| "Invalid key ID"                    | Copy the exact key from dashboard, no extra spaces |
| Payment gateway timeout             | Razorpay server issue - try again in 5 minutes     |
| Testing mode payments fail          | Make sure you're using TEST keys, not LIVE keys    |

## Testing Razorpay

For testing without real money:

1. Use **Test Keys** from Razorpay Dashboard (Key ID starts with `rzp_test_`)
2. Use test card numbers:
   - **Success:** 4111 1111 1111 1111
   - **Failure:** 4444 4444 4444 4444
3. Any future date for expiry
4. Any 3 digits for CVV

## Security Best Practices

- ✅ Never commit keys to Git (use `.gitignore`)
- ✅ Use different keys for test and production
- ✅ Rotate keys periodically
- ✅ Use environment variables, never hardcode
- ✅ In production, always use HTTPS
- ✅ Keep key secret private and secure

## Payment Feature Status

After configuration, the following features work:

- ✅ Create payment orders
- ✅ Process payments through Razorpay gateway
- ✅ Verify payments
- ✅ Update user quota/plan after payment
- ✅ Store payment history in Firestore

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Test Keys](https://razorpay.com/docs/payments/payment-gateway/test-credentials/)
- Backend implementation: [backend/src/payment/razorpay.ts](backend/src/payment/razorpay.ts)
- Backend API endpoint: [backend/server.js](backend/server.js#L184)
