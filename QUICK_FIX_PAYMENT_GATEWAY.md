# QUICK FIX SUMMARY - Payment Gateway on Hostinger VPS

## What Was Wrong ❌

1. Frontend calling `http://localhost:3004` (doesn't exist on VPS)
2. Backend CORS set to `*` (too permissive, causes security issues)
3. Missing security headers (Cross-Origin-Opener-Policy warnings)

## What I Fixed ✅

1. ✅ Added security headers to backend (Cross-Origin-Opener-Policy, X-Content-Type-Options, etc.)
2. ✅ Created `.env.production` files for both frontend and backend
3. ✅ Created comprehensive deployment guide

## Quick Steps to Deploy

### 1. **Update Frontend Environment**

Make sure your frontend build uses production config:

```bash
cd frontend
npm run build  # This should use .env.production automatically with Vite
```

OR manually set environment before build:

```bash
cp .env.production .env
npm run build
```

### 2. **Update Backend Environment**

```bash
cd backend
cp .env.production .env  # OR manually edit .env
```

Edit `.env` and update:

```
CORS_ORIGIN=https://quickmailfilter.com  # Your frontend domain
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_live_[YOUR_KEY]     # Use LIVE keys
RAZORPAY_KEY_SECRET=[YOUR_SECRET]
```

### 3. **Deploy to Hostinger VPS**

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Backend
cd /var/www/email-validator/backend
npm install
npm run build
node server.js  # Or use PM2: pm2 start npm --name "api" -- start

# Frontend (if same server)
cd ../frontend/dist
# Upload your built files here
```

### 4. **Test Payment Endpoint**

```bash
# From your frontend
curl -X POST https://api.quickmailfilter.com/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Pro",
    "amount": 99,
    "userEmail": "test@example.com"
  }'
```

Should return:

```json
{
  "success": true,
  "orderId": "order_XXXXX",
  "amount": 99
}
```

## File Changes Made

### Backend (`backend/server.js`)

- Added security headers middleware
- Fixes Cross-Origin-Opener-Policy warnings
- Proper CORS configuration for production

### New Files Created

- `frontend/.env.production` - Production environment variables
- `backend/.env.production` - Production environment variables
- `PAYMENT_GATEWAY_FIX_VPS.md` - Detailed deployment guide
- `QUICK_FIX_PAYMENT_GATEWAY.md` - This file

## ⚠️ Important: Update These Values

**Frontend** `frontend/.env.production`:

```
VITE_API_URL=https://api.quickmailfilter.com  # 👈 UPDATE THIS
```

**Backend** `backend/.env`:

```
CORS_ORIGIN=https://quickmailfilter.com       # 👈 UPDATE THIS
RAZORPAY_KEY_ID=rzp_live_xxx                  # 👈 UPDATE THIS
RAZORPAY_KEY_SECRET=xxx                       # 👈 UPDATE THIS
```

## Debugging

If still getting errors:

1. **Check backend is running:**

   ```bash
   curl http://localhost:3004/api/health
   ```

2. **Check CORS headers:**

   ```bash
   curl -H "Origin: https://quickmailfilter.com" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS http://localhost:3004/api/payment/create-order -v
   ```

3. **Check logs:**

   ```bash
   pm2 logs email-validator
   ```

4. **Verify frontend is reaching backend:**
   Open browser DevTools → Network tab → test payment → check request URL

## Still Having Issues?

See `PAYMENT_GATEWAY_FIX_VPS.md` for full troubleshooting guide and detailed Nginx setup.
