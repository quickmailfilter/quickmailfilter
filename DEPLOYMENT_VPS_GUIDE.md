# QuickMailFilter VPS Deployment Guide

**Production Domain:** quickmailfilter.com  
**VPS IP:** 187.77.191.145  
**Server:** Ubuntu 24.04.4 LTS  
**Backend Port:** 3004  
**Node Version:** v20 LTS

---

## 📋 Table of Contents

1. [Quick Deployment (Updates)](#quick-deployment-updates)
2. [Current Infrastructure](#current-infrastructure)
3. [Build & Deployment Process](#build--deployment-process)
4. [PM2 Management](#pm2-management)
5. [Nginx Configuration](#nginx-configuration)
6. [SSL/HTTPS Setup](#sslhttps-setup)
7. [Monitoring & Logs](#monitoring--logs)
8. [Troubleshooting](#troubleshooting)
9. [Security Checklist](#security-checklist)
10. [Emergency Procedures](#emergency-procedures)

---

## 🚀 Quick Deployment (Updates)

### For Frontend & Backend Updates:

```bash
# SSH into VPS
ssh root@187.77.191.145

# Navigate to app
cd /var/www/quickmailfilter

# Pull latest changes
git pull origin main

# Install dependencies (if package.json changed)
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Build both
cd backend && npm run build && cd ..
cd frontend && npm run build && cd ..

# Restart backend
pm2 restart quickmailfilter-api

# Verify restart
pm2 list
pm2 logs quickmailfilter-api --lines 20
```

**Expected Output:**

- ✅ Backend online in pm2 list
- ✅ No errors in logs
- ✅ Frontend files updated: `ls -la frontend/dist/ | head -5`

---

## 🏗️ Current Infrastructure

### Directory Structure

```
/var/www/quickmailfilter/
├── backend/              # Node.js API server
│   ├── src/
│   ├── dist/            # Compiled TypeScript
│   ├── package.json
│   └── ecosystem.config.js
├── frontend/            # React + Vite frontend
│   ├── src/
│   ├── dist/           # Production build (served by Nginx)
│   ├── package.json
│   └── vite.config.ts
├── logs/               # PM2 logs
│   ├── api-out-0.log
│   └── api-error-0.log
└── ecosystem.config.js # PM2 cluster config
```

### Running Services

```
Service              Port    Status      Manager
─────────────────────────────────────────────────
Node.js Backend      3004    Running     PM2 (cluster mode, 2 instances)
Nginx Proxy          80/443  Running     Systemd
MongoDB              27017   [External]  [External]
```

### Domain Configuration

```
Domain:              quickmailfilter.com
DNS A Record:        187.77.191.145
SSL Certificate:     Let's Encrypt (auto-renewed)
Paths:
  - Backend API:     http://localhost:3004
  - Frontend HTML:   /var/www/quickmailfilter/frontend/dist/
  - Nginx Config:    /etc/nginx/sites-available/quickmailfilter
```

---

## 🔧 Build & Deployment Process

### Step 1: Pull Latest Code

```bash
cd /var/www/quickmailfilter
git fetch origin
git status
git pull origin main
```

### Step 2: Install Dependencies (if needed)

```bash
# Backend
cd backend
npm install
npm audit fix  # Optional: fix vulnerabilities
cd ..

# Frontend
cd frontend
npm install
npm audit fix  # Optional: fix vulnerabilities
cd ..
```

### Step 3: Build Both

```bash
# Backend (TypeScript → JavaScript)
cd backend
npm run build
# Output: backend/dist/
cd ..

# Frontend (React + Vite)
cd frontend
npm run build
# Output: frontend/dist/ (served by Nginx)
cd ..
```

**Potential Issues & Solutions:**

| Issue                          | Solution                                     |
| ------------------------------ | -------------------------------------------- |
| `terser not found`             | `npm install --save-dev terser`              |
| `Build failed: circular chunk` | Normal warning, doesn't affect functionality |
| `Missing packages`             | Run `npm install` again                      |
| `Compilation errors`           | Check your TypeScript/code changes           |

### Step 4: Restart Backend

```bash
# Graceful restart (handles in-flight requests)
pm2 restart quickmailfilter-api --wait-ready

# Force restart (immediate)
pm2 restart quickmailfilter-api

# Check status
pm2 list

# View logs (real-time)
pm2 logs quickmailfilter-api
```

### Step 5: Verify Deployment

```bash
# Test backend health
curl http://localhost:3004/api/health

# Test frontend load
curl -I https://quickmailfilter.com/

# Test API through Nginx
curl https://quickmailfilter.com/api/health
```

**Expected Responses:**

```json
Backend health:
{"status":"ok","server":"email-validator-saas","environment":"production","timestamp":"..."}

Frontend:
HTTP/2 200
Content-Type: text/html
```

---

## 🔄 PM2 Management

### Start/Stop/Restart Services

```bash
# Start backend (already running)
pm2 start ecosystem.config.js

# Stop backend
pm2 stop quickmailfilter-api

# Restart backend
pm2 restart quickmailfilter-api

# Delete from PM2
pm2 delete quickmailfilter-api

# Restarting all
pm2 restart all

# View all processes
pm2 list

# View detailed process info
pm2 info quickmailfilter-api
```

### Monitor Processes

```bash
# Watch in real-time
pm2 monit

# View logs (last 50 lines)
pm2 logs quickmailfilter-api --lines 50

# Follow logs (streaming)
pm2 logs quickmailfilter-api

# Clear logs
pm2 flush

# Save PM2 process list
pm2 save

# Resurrect saved processes
pm2 resurrect
```

### Clustering & Load Balancing

Current setup uses **cluster mode with 2 instances**:

```js
// ecosystem.config.js
{
  instances: 2,    // 2 Node processes
  exec_mode: 'cluster',
  // Nginx handles load balancing across instances
}
```

Monitor distribution:

```bash
pm2 list  # Shows all instances
ps aux | grep node  # Shows actual processes
```

---

## 🌐 Nginx Configuration

### Current Setup

**File:** `/etc/nginx/sites-available/quickmailfilter`

```nginx
# Backend upstream definition
upstream backend {
    server 127.0.0.1:3004;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name quickmailfilter.com www.quickmailfilter.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server (production)
server {
    listen 443 ssl http2;
    server_name quickmailfilter.com www.quickmailfilter.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/quickmailfilter.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/quickmailfilter.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Allow large file uploads
    client_max_body_size 50M;

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve frontend static files
    location / {
        root /var/www/quickmailfilter/frontend/dist;
        try_files $uri $uri/ /index.html;  # SPA routing
        expires 1y;  # Cache for 1 year
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/quickmailfilter/frontend/dist;
        expires 1y;  # Long cache for assets
    }
}
```

### Testing & Reloading Configuration

```bash
# Test syntax
sudo nginx -t
# Output: nginx: configuration file ... syntax is ok

# Reload without downtime
sudo systemctl reload nginx

# Restart (may cause brief downtime)
sudo systemctl restart nginx

# Check status
systemctl status nginx
```

### Troubleshooting Nginx

```bash
# Check if listening on ports
netstat -tlnp | grep nginx
# Output: 0.0.0.0:80 and 0.0.0.0:443

# View error log
tail -50 /var/log/nginx/error.log

# View access log
tail -50 /var/log/nginx/access.log

# Monitor in real-time
tail -f /var/log/nginx/access.log
```

---

## 🔒 SSL/HTTPS Setup

### Current SSL Status

```bash
# Check certificate details
sudo openssl x509 -in /etc/letsencrypt/live/quickmailfilter.com/fullchain.pem -noout -dates

# Expected output:
# notBefore=... (issuance date)
# notAfter=...  (expiration date)
```

### SSL Certificate Renewal

Let's Encrypt certificates auto-renew, but verify with:

```bash
# Check renewal timer
sudo systemctl status certbot.timer

# Manual renewal (if needed)
sudo certbot renew --dry-run  # Test

# Force renewal
sudo certbot renew --force-renewal

# View all certificates
sudo certbot certificates
```

### Adding New Subdomains to SSL

```bash
# Add subdomain to existing certificate
sudo certbot certonly --webroot \
  -w /var/www/quickmailfilter/frontend/dist \
  -d quickmailfilter.com \
  -d www.quickmailfilter.com \
  -d api.quickmailfilter.com  # New subdomain

# Update Nginx config with new domain
# Then reload: sudo systemctl reload nginx
```

### SSL Security Best Practices

```bash
# Test SSL configuration
curl -v https://quickmailfilter.com/

# Check SSL grade (external tool)
# Visit: https://www.ssllabs.com/ssltest/

# Strong ciphers (already configured)
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_protocols TLSv1.2 TLSv1.3;
```

---

## 📊 Monitoring & Logs

### Backend Logs

```bash
# PM2 logs (all)
pm2 logs quickmailfilter-api

# Last 100 lines
pm2 logs quickmailfilter-api --lines 100

# Only errors
pm2 logs quickmailfilter-api --err

# View raw log files
tail -100 /var/www/quickmailfilter/logs/api-out-0.log
tail -100 /var/www/quickmailfilter/logs/api-error-0.log
```

### System Monitoring

```bash
# CPU and Memory usage
pm2 monit

# Detailed process stats
ps aux | grep node

# System resources
free -h        # Memory
df -h          # Disk space
top -b -n 1    # Top processes

# Network connections
netstat -tlnp | grep node
netstat -tulnp | grep 3004
```

### Web Server Logs

```bash
# Nginx access log (all requests)
tail -100 /var/log/nginx/access.log

# Nginx error log (issues)
tail -100 /var/log/nginx/error.log

# Follow logs in real-time
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Key Metrics to Monitor

```
Metric              Command                           Normal Range
────────────────────────────────────────────────────────────────
Memory per process  pm2 list → Memory column         < 200MB each
CPU usage          pm2 monit or top                  < 50%
Uptime             pm2 list → Id column              Days/months
Disk usage         df -h | grep /var                < 80%
API response time  curl timing or nginx logs        < 500ms
Error rate         grep error logs                  < 0.1%
```

---

## 🐛 Troubleshooting

### Backend Not Starting

```bash
# Check if port 3004 is already in use
lsof -i :3004
sudo lsof -i :3004

# Kill process if stuck
kill -9 <PID>

# Try restarting
pm2 restart quickmailfilter-api

# Check logs
pm2 logs quickmailfilter-api --lines 50

# Check for disk space
df -h
```

### Frontend Not Updating

```bash
# Verify build exists
ls -la frontend/dist/

# Check file timestamp (should be recent)
ls -la frontend/dist/index.html

# Clear browser cache
# Method 1: Private/Incognito window
# Method 2: Ctrl+Shift+Delete → Clear all

# Force frontend rebuild
cd frontend
rm -rf dist node_modules
npm install
npm run build
cd ..

# Restart backend to serve new files
pm2 restart quickmailfilter-api
```

### API Returning 502 Bad Gateway

```bash
# This means Nginx can't reach backend

# Check if backend is running
pm2 list

# Check if port 3004 is listening
netstat -tlnp | grep 3004
lsof -i :3004

# Restart backend
pm2 restart quickmailfilter-api

# Check backend logs
pm2 logs quickmailfilter-api --lines 50

# Test backend directly
curl http://localhost:3004/api/health

# Reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate Issues

```bash
# Check certificate expiration
openssl s_client -connect quickmailfilter.com:443 </dev/null | grep dates

# Check certificate locations
ls -la /etc/letsencrypt/live/quickmailfilter.com/

# Test certificate
curl -v https://quickmailfilter.com/

# Force renewal if near expiration
sudo certbot renew --force-renewal

# Restart Nginx after renewal
sudo systemctl restart nginx
```

### High Memory Usage

```bash
# Check memory per process
ps aux | grep node

# Monitor in real-time
watch -n 1 'ps aux | grep node'

# PM2 monitoring
pm2 monit

# Restart backend (fresh memory)
pm2 restart quickmailfilter-api

# Check for memory leaks in logs
pm2 logs quickmailfilter-api | grep -i memory
```

### Database Connection Issues

```bash
# Check if MongoDB is accessible
mongo --eval "db.version()"

# Or for newer versions
mongosh --eval "db.version()"

# Check connection in backend logs
pm2 logs quickmailfilter-api | grep -i database

# Verify connection string in environment
grep MONGO /var/www/quickmailfilter/backend/.env

# Test connection manually
curl http://localhost:3004/api/health
```

---

## 🔐 Security Checklist

### System Hardening

- [ ] **SSH Key-based Auth Only**

  ```bash
  sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
  sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
  sudo systemctl restart sshd
  ```

- [ ] **Firewall Enabled**

  ```bash
  sudo ufw enable
  sudo ufw allow 22/tcp   # SSH
  sudo ufw allow 80/tcp   # HTTP
  sudo ufw allow 443/tcp  # HTTPS
  sudo ufw status
  ```

- [ ] **Fail2Ban Installed**
  ```bash
  sudo apt-get install fail2ban
  sudo systemctl enable fail2ban
  sudo systemctl start fail2ban
  ```

### Application Security

- [ ] **Environment Variables Protected**

  ```bash
  chmod 600 /var/www/quickmailfilter/backend/.env
  ```

- [ ] **Dependencies Updated**

  ```bash
  npm audit fix  # Fix vulnerabilities
  ```

- [ ] **SSL/TLS Hardened**

  ```
  Current config uses TLS 1.2+ only (good)
  Ciphers: HIGH:!aNULL:!MD5 (secure)
  ```

- [ ] **API Rate Limiting** (if configured)

  ```bash
  # Check backend for rate limit middleware
  grep -r "rateLimit\|rate.limit" backend/src/
  ```

- [ ] **CORS Properly Configured**
  ```bash
  # Check backend CORS settings
  grep -r "cors\|CORS" backend/src/
  ```

### Monitoring Security

- [ ] **Log Monitoring**

  ```bash
  # Watch for suspicious activity
  tail -f /var/log/nginx/access.log | grep -i error
  tail -f /var/log/nginx/error.log
  ```

- [ ] **Failed Login Attempts**

  ```bash
  grep "Failed password" /var/log/auth.log
  ```

- [ ] **SSL Certificate Monitoring**
  ```bash
  # Ensure auto-renewal is working
  sudo systemctl status certbot.timer
  ```

---

## 🚨 Emergency Procedures

### Rollback to Previous Version

```bash
# Check git history
git log --oneline -10

# Rollback to specific commit
git reset --hard <commit-hash>

# Rebuild
cd backend && npm run build && cd ..
cd frontend && npm run build && cd ..

# Restart
pm2 restart quickmailfilter-api
```

### Complete Service Restart

```bash
# Stop everything
pm2 stop all
sudo systemctl stop nginx

# Check services stopped
pm2 list
netstat -tlnp | grep :80
netstat -tlnp | grep :3004

# Start everything
sudo systemctl start nginx
pm2 start ecosystem.config.js

# Verify
pm2 list
systemctl status nginx
```

### Emergency Recover from Disk Full

```bash
# Check disk usage
df -h

# Clear PM2 logs (safe)
pm2 flush

# Clean npm cache (safe)
npm cache clean --force

# Remove old build artifacts
cd frontend && rm -rf dist node_modules && npm install && npm run build
cd ../backend && rm -rf dist node_modules && npm install && npm run build

# Restart
pm2 restart quickmailfilter-api
```

### Database Emergency

```bash
# If MongoDB is down, backend will fail
pm2 logs quickmailfilter-api | grep -i database

# Restart MongoDB (if self-hosted)
sudo systemctl restart mongodb

# For MongoDB Atlas, check:
# 1. Database status dashboard
# 2. Network access whitelist
# 3. Connection string in .env
```

---

## 📞 Support & Debugging

### Getting Help

1. **Check Logs First**

   ```bash
   pm2 logs quickmailfilter-api --lines 100
   tail -100 /var/log/nginx/error.log
   ```

2. **System Info**

   ```bash
   node --version
   npm --version
   nginx -v
   uname -a
   ```

3. **Quick Diagnostics**
   ```bash
   # All-in-one health check script
   echo "=== PM2 Status ===" && pm2 list && \
   echo "=== Backend Health ===" && curl http://localhost:3004/api/health && \
   echo "=== Nginx Status ===" && systemctl status nginx && \
   echo "=== Disk Usage ===" && df -h /
   ```

### Common Error Messages

| Error                                | Cause               | Fix                                 |
| ------------------------------------ | ------------------- | ----------------------------------- |
| `ENOENT: no such file or directory`  | Missing file/folder | Check build output, run build again |
| `EADDRINUSE: address already in use` | Port conflict       | Kill process: `lsof -i :3004`       |
| `502 Bad Gateway`                    | Backend unreachable | Restart backend, check logs         |
| `504 Gateway Timeout`                | Backend too slow    | Check performance, restart PM2      |
| `ERR_SSL_PROTOCOL_ERROR`             | SSL issue           | Check certificates, reload Nginx    |
| `ECONNREFUSED: Connection refused`   | Service not running | Restart service, check status       |

---

## 📅 Maintenance Schedule

### Daily

```bash
# Monitor from dashboard (PM2 Plus/similar)
pm2 monit
```

### Weekly

```bash
# Check logs for errors
pm2 logs quickmailfilter-api | grep -i error

# Verify disk space
df -h

# Check SSL certificate expiration
certbot certificates
```

### Monthly

```bash
# Update dependencies
cd backend && npm outdated && npm update
cd ../frontend && npm outdated && npm update

# Run audit
npm audit fix

# Rebuild and deploy
npm run build
pm2 restart all
```

### Quarterly

```bash
# Security updates
sudo apt-get update
sudo apt-get upgrade
sudo apt-get autoremove

# System restart (if needed)
sudo reboot

# Verify everything after reboot
pm2 list
systemctl status nginx
```

---

## 📝 Version History

| Date       | Version | Changes                                      |
| ---------- | ------- | -------------------------------------------- |
| 2026-03-20 | 1.0     | Initial deployment guide based on live setup |

**Last Updated:** March 20, 2026  
**Next Review:** 2026-04-20

---

## ✅ Quick Reference

```bash
# Deployment
git pull && cd backend && npm run build && cd ../frontend && npm run build && cd .. && pm2 restart quickmailfilter-api

# Monitoring
pm2 list && pm2 logs quickmailfilter-api --lines 50

# Troubleshooting
curl http://localhost:3004/api/health && curl -I https://quickmailfilter.com/

# Emergency restart
pm2 stop all && sudo systemctl stop nginx && pm2 start ecosystem.config.js && sudo systemctl start nginx

# SSL check
sudo openssl x509 -in /etc/letsencrypt/live/quickmailfilter.com/fullchain.pem -noout -dates

# Disk check
df -h && du -sh /var/www/quickmailfilter/*
```

---

**For Questions or Issues:** Check logs first, then review troubleshooting section. Most issues are resolved by restarting services or clearing cache.
