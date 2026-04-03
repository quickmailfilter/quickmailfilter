# Hostinger VPS Deployment Guide - Email Validator

## Problem: 502 Bad Gateway on Email Validation

When a user tries to validate an email, they get a 502 error. This means the frontend is working, but the backend API isn't responding.

---

## Step 1: SSH into Your Hostinger VPS

```bash
ssh root@YOUR_VPS_IP
# or if using a non-root user:
ssh username@YOUR_VPS_IP
```

---

## Step 2: Clone/Upload Your Project

If you haven't uploaded the code yet:

```bash
cd /var/www
git clone YOUR_REPO_URL email-validator
# OR upload via SFTP/File Manager
```

---

## Step 3: Install Backend Dependencies & Build

```bash
cd /var/www/email-validator/backend

# Install npm dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Verify the dist folder was created
ls -la dist/
```

**Important**: If `dist/` folder doesn't exist, the compilation failed. Check for TypeScript errors.

---

## Step 4: Set Up Environment Variables

Create `.env` file in the backend directory:

```bash
cat > /var/www/email-validator/backend/.env << EOF
NODE_ENV=production
PORT=3004
CORS_ORIGIN=https://quickmailfilter.com

# Firebase Config (if using Firebase)
FIREBASE_PROJECT_ID=quick-mailfilter
FIREBASE_PRIVATE_KEY="YOUR_PRIVATE_KEY_HERE"
FIREBASE_CLIENT_EMAIL=YOUR_EMAIL@appspot.gserviceaccount.com

# Razorpay (if using payments)
RAZORPAY_KEY_ID=YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
EOF
```

---

## Step 5: Test Backend Locally on VPS

```bash
cd /var/www/email-validator/backend

# Start the server
NODE_ENV=production npm start

# You should see:
# 🚀 Server running on port: 3004
```

Keep this running and test in another SSH window:

```bash
curl http://localhost:3004/api/health
# Should return: {"status":"ok","server":"email-validator-saas",...}
```

If this works, stop the server (Ctrl+C) and go to Step 6.

---

## Step 6: Set Up Nginx Reverse Proxy

### Install Nginx (if not installed):

```bash
apt update
apt install -y nginx
```

### Create Nginx Configuration

```bash
cat > /etc/nginx/sites-available/quickmailfilter.com << 'EOF'
upstream backend_api {
    server localhost:3004;
}

server {
    listen 80;
    listen [::]:80;
    server_name quickmailfilter.com www.quickmailfilter.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name quickmailfilter.com www.quickmailfilter.com;

    # SSL Certificate (make sure these paths are correct for your certificate)
    ssl_certificate /etc/ssl/certs/YOUR_CERT.crt;
    ssl_certificate_key /etc/ssl/private/YOUR_KEY.key;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend assets (React build)
    root /var/www/email-validator/frontend/dist;
    index index.html;

    # API endpoints - proxy to backend on port 3004
    location /api/ {
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - redirect all non-file requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
```

### Enable the Configuration

```bash
# Create symlink
ln -s /etc/nginx/sites-available/quickmailfilter.com /etc/nginx/sites-enabled/

# Test syntax
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## Step 7: Run Backend as a Service (PM2)

Using PM2 to keep Node.js running permanently:

```bash
# Install PM2 globally
npm install -g pm2

# Start the backend
cd /var/www/email-validator/backend
pm2 start npm --name "email-validator-api" -- start

# Make it auto-start on reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs email-validator-api
```

---

## Step 8: Build & Deploy Frontend

```bash
cd /var/www/email-validator/frontend

# Install dependencies
npm install

# Build for production
npm run build

# The build output will be in 'dist/' folder
# Nginx is already configured to serve this
```

---

## Step 9: Test the API

Open your browser and test:

```
https://quickmailfilter.com/api/health
```

Should return JSON with status "ok".

---

## Troubleshooting 502 Errors

### Check if Backend is Running

```bash
ps aux | grep "node"
pm2 status
```

### Check Backend Logs

```bash
pm2 logs email-validator-api
```

### Check Nginx Logs

```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Check Port 3004 Availability

```bash
netstat -tlnp | grep 3004
# or
ss -tlnp | grep 3004
```

### Restart Services

```bash
# Restart Nginx
systemctl restart nginx

# Restart PM2 app
pm2 restart email-validator-api

# Check Nginx status
systemctl status nginx
```

### Test API Directly on VPS

```bash
curl -X POST http://localhost:3004/api/validate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## SSL Certificate Setup (Let's Encrypt)

If you don't have an SSL certificate yet:

```bash
apt install -y certbot python3-certbot-nginx

certbot certonly --nginx -d quickmailfilter.com -d www.quickmailfilter.com

# Update the Nginx config paths to:
# /etc/letsencrypt/live/quickmailfilter.com/fullchain.pem
# /etc/letsencrypt/live/quickmailfilter.com/privkey.pem
```

---

## Important Environment Variables

Create `.env` in both backend and frontend:

**Backend (`backend/.env`):**

```
NODE_ENV=production
PORT=3004
CORS_ORIGIN=https://quickmailfilter.com
```

**Frontend (`.env` in root or configure in `vite.config.ts`):**

```
VITE_API_URL=https://quickmailfilter.com
```

---

## Final Checklist

- [ ] SSH into VPS - `ssh root@YOUR_IP`
- [ ] Backend dependencies installed - `cd backend && npm install`
- [ ] Backend built - `npm run build` (check `dist/` exists)
- [ ] Backend tested locally - `curl http://localhost:3004/api/health`
- [ ] Backend running with PM2 - `pm2 status`
- [ ] Nginx configured - `/etc/nginx/sites-available/quickmailfilter.com`
- [ ] Nginx reloaded - `systemctl reload nginx`
- [ ] Frontend built - `npm run build` in frontend folder
- [ ] Frontend served by Nginx - `root /var/www/.../frontend/dist;`
- [ ] SSL certificate set up - or Let's Encrypt configured
- [ ] Test API - `curl https://quickmailfilter.com/api/health`
- [ ] Test validation - use browser and validate an email

---

## Quick Deployment Script

Save this as `deploy.sh` and run it:

```bash
#!/bin/bash
set -e

cd /var/www/email-validator

# Backend
cd backend
npm install
npm run build
pm2 restart email-validator-api || pm2 start npm --name "email-validator-api" -- start

# Frontend
cd ../frontend
npm install
npm run build

# Reload Nginx
systemctl reload nginx

echo "✅ Deployment complete!"
echo "Test: curl https://quickmailfilter.com/api/health"
```

Make it executable: `chmod +x deploy.sh`
