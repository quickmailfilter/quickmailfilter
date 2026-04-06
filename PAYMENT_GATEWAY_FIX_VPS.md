# Payment Gateway Fix - Hostinger VPS Deployment Guide

## Problem Summary

The payment gateway was failing after VPS deployment because:

1. Frontend was calling `localhost:3004` (doesn't exist on VPS)
2. CORS was set to `*` (too permissive)
3. Missing security headers causing Cross-Origin-Opener-Policy warnings

## Solution Overview

### Step 1: Update Frontend Configuration for Production

Your frontend needs to know where to find the backend API. Update `frontend/vite.config.ts` to use environment-specific URLs:

```bash
# For development (local):
VITE_API_URL=http://localhost:3004

# For Hostinger production:
VITE_API_URL=https://api.quickmailfilter.com
# OR if backend is on same domain with Nginx proxy:
VITE_API_URL=https://quickmailfilter.com/api
```

### Step 2: Update Backend Configuration

**Create backend/.env for production:**

```bash
PORT=3004
NODE_ENV=production
CORS_ORIGIN=https://quickmailfilter.com
RAZORPAY_KEY_ID=rzp_live_[YOUR_LIVE_KEY]
RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET
```

### Step 3: Deploy Backend to Hostinger VPS

```bash
# 1. SSH into VPS
ssh root@YOUR_VPS_IP

# 2. Navigate to backend folder (assuming you have the code uploaded)
cd /var/www/email-validator/backend

# 3. Install dependencies
npm install

# 4. Build TypeScript
npm run build

# 5. Copy production .env
cp .env.production .env

# 6. Test locally on VPS
npm start
# Should see: 🚀 Server running on port: 3004

# Test from another SSH window:
curl http://localhost:3004/api/health
```

### Step 4: Set Up Nginx Reverse Proxy (if using same domain)

If you want to access backend at `quickmailfilter.com/api` instead of `api.quickmailfilter.com`, configure Nginx:

```nginx
# In your Nginx config (e.g., /etc/nginx/sites-available/quickmailfilter)
server {
    listen 443 ssl http2;
    server_name quickmailfilter.com;

    # Frontend (Vite/React static files)
    root /var/www/email-validator/frontend/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # SSL certificate (using Let's Encrypt/Certbot)
    ssl_certificate /etc/letsencrypt/live/quickmailfilter.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/quickmailfilter.com/privkey.pem;
}
```

### Step 5: Deploy Frontend to Hostinger VPS

```bash
# On your local machine or VPS:
cd frontend

# Build for production
npm run build

# Upload to VPS:
scp -r dist/* root@YOUR_VPS_IP:/var/www/email-validator/frontend/dist/
# OR on VPS:
npm run build
```

### Step 6: Run Backend with PM2 (for persistence)

```bash
# On VPS, install PM2
npm install -g pm2

# Start backend with PM2
cd /var/www/email-validator/backend
pm2 start npm --name "email-validator" -- start

# Configure to restart on reboot
pm2 startup
pm2 save
```

### Step 7: Verify Payment Gateway

1. **Test health endpoint:**

```bash
curl -H "Origin: https://quickmailfilter.com" \
  http://localhost:3004/api/health
```

2. **Test payment endpoint:**

```bash
curl -X POST http://localhost:3004/api/payment/create-order \
  -H "Content-Type: application/json" \
  -H "Origin: https://quickmailfilter.com" \
  -d '{
    "planName": "Pro",
    "amount": 99,
    "userEmail": "test@example.com",
    "userId": "user123"
  }'
```

Expected response:

```json
{
  "success": true,
  "orderId": "order_XXXXX",
  "amount": 99,
  "currency": "INR"
}
```

### Troubleshooting Checklist

| Issue                                                  | Solution                                                                                 |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| "Failed to load resource: net::ERR_CONNECTION_REFUSED" | Backend not running or unreachable. Check: `ssh root@VPS_IP && pm2 status`               |
| "status of 400"                                        | Missing fields in payment request. Check request body: `planName`, `amount`, `userEmail` |
| "Cross-Origin-Opener-Policy would block"               | Fixed - backend now includes proper security headers                                     |
| CORS errors                                            | Verify `CORS_ORIGIN` in backend .env matches your frontend domain                        |
| "Cannot find module" on VPS                            | Run `npm install` and `npm run build` in backend/                                        |

## Important Environment Variables

### Frontend (.env.production)

```bash
VITE_API_URL=https://YOUR_API_DOMAIN:PORT/api  # Update this!
VITE_RAZORPAY_ENABLED=true
```

### Backend (.env)

```bash
NODE_ENV=production
CORS_ORIGIN=https://YOUR_FRONTEND_DOMAIN
RAZORPAY_KEY_ID=rzp_live_xxx  # Use LIVE keys in production!
RAZORPAY_KEY_SECRET=xxx
```

## Quick Fix Commands

```bash
# SSH into Hostinger VPS
ssh root@YOUR_VPS_IP

# Check backend status
pm2 status
pm2 logs email-validator

# Restart backend after config changes
pm2 restart email-validator

# Rebuild frontend and deploy
cd /var/www/email-validator
cd backend && npm run build
cd ../frontend && npm run build
```

## Next Steps

1. Update `CORS_ORIGIN` in backend .env to your frontend domain
2. Update `VITE_API_URL` in frontend .env.production to your backend URL
3. Deploy both frontend and backend to Hostinger VPS
4. Test payment endpoint as shown above
5. Monitor logs: `pm2 logs email-validator`

---

**Questions?** Check your VPS provider's documentation for:

- How to set custom domains
- How to configure SSL/TLS certificates
- How to access VPS file manager or SSH
