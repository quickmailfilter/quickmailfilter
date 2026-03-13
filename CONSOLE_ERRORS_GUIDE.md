# Console Errors - Complete Resolution Guide

This document provides solutions for all console errors you might encounter.

## Quick Reference

| Error                                        | Cause                                        | Solution                                                     |
| -------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| **404 - Failed to load resource**            | API endpoint not found or server not running | See "404 Errors" below                                       |
| **503 - Service Unavailable**                | Razorpay not configured                      | See [RAZORPAY_CONFIGURATION.md](RAZORPAY_CONFIGURATION.md)   |
| **FirebaseError: requires an index**         | Firestore composite index missing            | See [FIRESTORE_INDEXES_SETUP.md](FIRESTORE_INDEXES_SETUP.md) |
| **Google login error: popup-closed-by-user** | User closed login popup                      | Not an error - now silently handled                          |
| **Network request failed**                   | Backend server not running                   | See "Backend Not Running" below                              |

---

## Error: 404 - Failed to load resource

### What it means

The browser tried to fetch a resource (API endpoint, static file, etc.) but the server responded with 404 (Not Found).

### Common causes

1. **Backend server not running**
   - Solution: Start backend with `npm run dev` in `backend/` folder
2. **Wrong API URL in frontend**
   - Check `frontend/src/app/context/AppContext.tsx` line ~208
   - For local dev: should be `http://localhost:3004`
   - For production: should be `https://quickmailfilter.com`

3. **Frontend trying to access static files that don't exist**
   - Check browser console for exact URL
   - Verify the asset exists in `frontend/public/` folder

### Debug steps

1. Open DevTools: Press `F12`
2. Go to **Network** tab
3. Look for the 404 error request
4. Check the URL in the request
5. Verify the endpoint exists in backend

Example responses that cause 404:

- Backend endpoint doesn't exist → Add the endpoint to `backend/server.js`
- Static file missing → Add the file to `frontend/public/`
- Wrong hostname → Check [firebaseConfig.ts](frontend/src/config/firebaseConfig.ts)

---

## Error: 503 - Service Unavailable

### What it means

The server received your request but is temporarily unable to handle it.

### For Payment API

If `/api/payment/create-order` returns 503:

1. **Razorpay not configured** (most common)
   - Follow: [RAZORPAY_CONFIGURATION.md](RAZORPAY_CONFIGURATION.md)
   - Add environment variables to `backend/.env`
   - Restart backend server

2. **Backend not started**
   - Run: `npm run dev` in `backend/`
   - Wait for "Server running on port 3004" message

3. **Razorpay server issue**
   - Check [Razorpay Status](https://status.razorpay.com)
   - Try again in 5 minutes

### For Validation API

If `/api/validate` returns 503:

- Backend not running → `npm run dev` in `backend/`
- Backend not built → `npm run build` in `backend/`

---

## Error: Firestore requires an index

### What it means

You're querying Firestore with `where` + `orderBy`, but this requires a composite index that hasn't been created.

### Affected collections

1. **verifications** → Query by userId, ordered by timestamp
2. **bulkUploads** → Query by userId, ordered by uploadedAt
3. **payments** → Query by userId, ordered by paymentDate

### Solution

Follow the setup guide: [FIRESTORE_INDEXES_SETUP.md](FIRESTORE_INDEXES_SETUP.md)

The error message includes direct Firebase Console links to create each index.

### Timeline

- Error appears immediately when querying
- Clicking the provided link takes you to index creation in Firebase Console
- Index creation takes 5-15 minutes
- Page refresh after creation should resolve the error

---

## Error: Google login: popup-closed-by-user

### What it means

User started Google login but closed the popup before completing it.

### Status

✅ **FIXED** - No longer shows toast notification. Only logs to debug console.

This is normal user behavior (they decided not to login) and is now handled gracefully.

---

## Error: Network request failed

### What it means

Connection between frontend and backend is broken.

### Debug steps

1. **Verify backend is running**

   ```bash
   cd backend
   npm run dev
   ```

   Look for: `✅ Server running on port 3004`

2. **Check backend is accessible**

   ```bash
   curl http://localhost:3004/api/health
   ```

   Should return: `{"status":"ok",...}`

3. **For production, check CORS**
   - In `backend/server.js` line ~42
   - Verify `CORS_ORIGIN` includes your frontend URL

4. **Check network connection**
   - Are you on VPN or behind proxy?
   - Try disabling VPN
   - Check firewall isn't blocking port 3004

---

## Error: API_URL mismatch

### What it happens

Frontend uses wrong API URL, resulting in CORS or 404 errors.

### Check current API URL

In `frontend/src/app/context/AppContext.tsx` around line 208:

```typescript
const VALIDATOR_API_URL =
  typeof window !== "undefined" &&
  window.location.hostname === "quickmailfilter.com"
    ? "https://quickmailfilter.com"
    : "http://localhost:3004";
```

### Explanation

- **Local development**: Uses `http://localhost:3004`
- **Production (quickmailfilter.com)**: Uses `https://quickmailfilter.com`

To test/deploy elsewhere, update this logic.

---

## Error: Firebase authentication failed

### Common issues

1. **Firebase config wrong**
   - Check `frontend/src/config/firebaseConfig.ts`
   - Verify all values match [Firebase Console](https://console.firebase.google.com/project/quick-mailfilter)

2. **CORS blocking auth**
   - This is only an issue locally
   - Clear browser cache: `Ctrl+Shift+Delete`
   - Try different browser or incognito mode

3. **Firebase project disabled**
   - Go to Firebase Console
   - Check project is active (not archived)

---

## Debugging Commands

### Test backend health

```bash
curl http://localhost:3004/api/health
```

### Test email validation endpoint

```bash
curl -X POST http://localhost:3004/api/validate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### View backend logs

```bash
cd backend
npm run dev 2>&1 | tee server.log
```

### Check built backend files

```bash
ls -la backend/dist/
```

### Test Razorpay configuration

```bash
cd backend
echo $RAZORPAY_KEY_ID    # Should print your key (make sure .env is loaded)
```

---

## Monitoring Console for Errors

### Good practice

1. **Keep DevTools open** during testing
2. **Check Network tab** for failed requests
3. **Check Console tab** for JavaScript errors
4. **Look for patterns** before each major error
5. **Record screenshots** of errors for troubleshooting

### Error categories

- 🔴 **Critical** (app breaks): Red X in Network tab
- 🟡 **Warning** (features don't work): Yellow warning
- 🔵 **Info** (expected behavior): Blue info
- ⚪ **Debug** (development only): Gray text (requires verbose logging)

---

## Getting Help

If you encounter an error not listed here:

1. **Screenshot the error** with full console visible
2. **Note the exact URL** from Network tab
3. **Check browser version** (F12 → Application tab)
4. **Try different browser** to isolate issue
5. **Clear cache** if errors are intermittent
6. **Check backend logs** for corresponding error

---

## Configuration Files Quick Reference

| File                                                                           | Purpose                       |
| ------------------------------------------------------------------------------ | ----------------------------- |
| [FIRESTORE_INDEXES_SETUP.md](FIRESTORE_INDEXES_SETUP.md)                       | Firestore index setup         |
| [RAZORPAY_CONFIGURATION.md](RAZORPAY_CONFIGURATION.md)                         | Payment gateway setup         |
| [frontend/src/config/firebaseConfig.ts](frontend/src/config/firebaseConfig.ts) | Frontend Firebase config      |
| [backend/.env](backend/.env)                                                   | Backend environment variables |
| [backend/server.js](backend/server.js)                                         | Backend API endpoints         |
| [frontend/src/config/axiosConfig.ts](frontend/src/config/axiosConfig.ts)       | API error handling            |

---

## Version Information

- **Firebase SDK**: v9+ (Modular)
- **Razorpay**: v2 API
- **Node.js**: v16+
- **React**: v18+
- **TypeScript**: v5+

For more details on each component, see the individual setup guides.
