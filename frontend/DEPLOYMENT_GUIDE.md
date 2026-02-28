# Frontend-Backend Integration & Hosting Guide

## Current Architecture
- **Frontend**: React + Vite (port 5173)
- **Backend**: Express.js + TypeScript (port 3004)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Auth**: Firebase Authentication

---

## OPTION 1: Combine Frontend + Backend into Single Deployable (RECOMMENDED)

### Structure
```
Email Verification SaaS Platform/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   ├── public/
│   └── package.json
└── root package.json (monorepo)
```

### Implementation Steps

#### 1. Create Root Monorepo Package
Create new `package.json` at project root:

```json
{
  "name": "email-validator-saas",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "install-all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "start": "cd backend && npm start",
    "test": "npm run test:frontend && npm run test:backend"
  },
  "dependencies": {
    "concurrently": "^8.2.2"
  }
}
```

#### 2. Reorganize Project Structure
```bash
# Move current files
mv . frontend    # current vite app
mv email_validator backend
```

#### 3. Update Backend to Serve Frontend

```javascript
// backend/server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const axios = require('axios');
const validate = require('./dist/index.js').default;

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());

// Serve built frontend as static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// ... existing API routes ...

// Email validation endpoint
app.post('/api/validate', async (req, res) => {
  // existing validation logic
});

// Serve frontend for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 4. Update Frontend API Calls

Update `src/app/context/AppContext.tsx`:

```typescript
// Use relative path instead of absolute URL
const VALIDATOR_API_URL = import.meta.env.VITE_VALIDATOR_API_URL || '/api';

// API call already exists:
const response = await axios.post(`${VALIDATOR_API_URL}/validate`, {
  email: email.toLowerCase().trim(),
});
```

#### 5. Build Configuration

Update `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  // ... existing config ...
  build: {
    outDir: '../backend/public',  // Build frontend into backend public folder
    emptyOutDir: true,
  },
})
```

---

## OPTION 2: Separate Deployment (Alternative)

If you prefer keeping frontend and backend separate:

### Frontend Hosting Options

**Best for Frontend Only:**
- **Vercel** (easiest for Vite apps)
- **Netlify**
- **GitHub Pages**
- **AWS Amplify**

**Example: Deploy Frontend to Vercel**
1. Build: `npm run build`
2. Push to GitHub
3. Connect to Vercel
4. Set environment variable: `VITE_VALIDATOR_API_URL=https://your-backend.com/api`

### Backend Hosting with SMTP Support

---

## HOSTING PROVIDERS SUPPORTING SMTP

### ✅ **EXCELLENT SMTP Support**

#### **1. Railway (RECOMMENDED)**
- ✅ Outbound SMTP fully supported
- ✅ Database included
- ✅ Simple deployment
- ✅ $5 starter credit
- Configuration: Already have `railway.json`

**Deploy to Railway:**
```bash
cd backend
railway init
railway up
```

#### **2. Render**
- ✅ Full SMTP support
- ✅ Built-in databases
- ✅ Free tier available
- ✅ Auto-deploys from GitHub

**Deploy to Render:**
```bash
# Connect your GitHub repo
# Set environment variables in Render dashboard
# Railway auto-deploys on push
```

#### **3. Heroku Alternative: Koyeb**
- ✅ SMTP fully enabled
- ✅ Git-based deployment
- ✅ Affordable pricing

#### **4. AWS EC2/Lightsail**
- ✅ Complete SMTP control
- ✅ Most flexibility
- ✅ Higher learning curve
- Port 25, 587, 465 available

---

### ⚠️ **LIMITED or BLOCKED SMTP**

❌ **Vercel** - Blocks port 25, 587 (only serverless functions with external SMTP)
❌ **Netlify** - For static sites only
❌ **GitHub Pages** - For static sites only

---

## COMPARISON TABLE

| Provider | Frontend | Backend | SMTP | Cost | Setup |
|----------|----------|---------|------|------|-------|
| **Railway** | ✅ | ✅ | ✅ | $5-10/mo | Easy |
| **Render** | ✅ | ✅ | ✅ | Free-$5/mo | Easy |
| **Vercel + Render** | ✅✅ | ✅ | ✅ | $0-10/mo | Medium |
| **AWS EC2** | ✅ | ✅ | ✅ | $2-20/mo | Hard |
| **DigitalOcean** | ✅ | ✅ | ✅ | $4-6/mo | Medium |
| **Heroku** | ✅ | ✅ | ❌ | Discontinued | - |

---

## RECOMMENDED SETUP FOR YOUR PROJECT

### **All-in-One Deployment (Simplest)**
```
Railway
├── Frontend (Vite build)
└── Backend (Express + SMTP)
    └── Firebase (Auth + Database)
```

**Steps:**
1. Combine frontend + backend (Option 1)
2. Create `railway.json` at root
3. Deploy to Railway
4. Set environment variables:
   - `FIREBASE_API_KEY`
   - `FIREBASE_PROJECT_ID`
   - `NODE_ENV=production`
   - Any SMTP credentials if needed

---

## ENVIRONMENT VARIABLES

### Production (.env.production)
```env
# Firebase
FIREBASE_API_KEY=xxx
FIREBASE_PROJECT_ID=xxx
FIREBASE_AUTH_DOMAIN=xxx
FIREBASE_STORAGE_BUCKET=xxx

# Backend
NODE_ENV=production
PORT=3004

# Frontend (built into backend, no separate vars needed)
VITE_VALIDATOR_API_URL=/api
```

---

## SMTP CONFIGURATION

Your backend already uses free APIs (Disify) for validation.

**If you need actual SMTP verification:**

### Option A: Use free service (current setup)
- Disify API (no SMTP needed)
- Keep existing implementation

### Option B: Add SMTP capability
```javascript
// backend/server.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Test connection
transporter.verify((error, success) => {
  if (error) console.log('SMTP Error:', error);
  else console.log('SMTP Ready');
});
```

**Add to `.env`:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## DEPLOYMENT CHECKLIST

- [ ] Decide: Combined (Option 1) or Separate (Option 2)
- [ ] Update API URL in frontend
- [ ] Build frontend (if combined)
- [ ] Test locally: `npm run dev`
- [ ] Choose hosting provider (Railway recommended)
- [ ] Create `.env.production`
- [ ] Deploy and verify
- [ ] Test email validation endpoints
- [ ] Monitor logs

---

## QUICK START: RAILWAY DEPLOYMENT

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Create new project
railway init

# 4. Set env variables
railway variables FIREBASE_API_KEY=xxx

# 5. Deploy
railway up

# 6. View logs
railway logs
```

---

## LOCAL TESTING

```bash
# Terminal 1: Backend
cd email_validator
npm run dev

# Terminal 2: Frontend
npm run dev

# Frontend auto-proxies to localhost:3004 via Vite
```

---

## TROUBLESHOOTING

### CORS Issues
If frontend & backend separate, add to backend:
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### SMTP Not Working
- Check port: 25 (free), 587 (TLS), 465 (SSL)
- Verify credentials work locally first
- Check provider doesn't block SMTP
- Test with: `telnet smtp.gmail.com 587`

### Build Size Issues
- Tree-shake unused UI components
- Use `npm run build` and check dist/ size
- Consider code splitting

---

## NEXT STEPS

1. **Immediate**: Deploy current setup to Railway as-is
2. **Soon**: Combine frontend/backend for simpler deployment
3. **Optional**: Add real SMTP if free API doesn't meet needs
