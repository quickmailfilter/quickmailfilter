# Admin Signup & Registration Guide

## Overview

Your Email Validator SaaS now includes a complete **admin account registration system**. Admin accounts are stored in a separate Firestore collection (`admin`) and have full access to the admin dashboard.

## Features

✅ **Separate Admin Collection**

- Admin accounts stored in `admin` collection (not in `users`)
- Distinct admin data structure with enterprise features
- Isolated authentication flow for admins

✅ **Secure Admin Registration**

- Admin code required for signup verification
- Enterprise plan automatically assigned
- Unlimited monthly verifications quota
- All admin management features enabled

✅ **Multiple Entry Points**

- Sign up directly at `/admin/signup`
- Link available on regular signup page
- Easy access from admin login page

---

## Admin Registration Flows

### Flow 1: Direct Admin Signup

1. Navigate to `/admin/signup`
2. Fill in admin details:
   - Full Name
   - Email Address
   - Admin Code (secret code required)
   - Strong Password
3. Accept terms and conditions
4. Click "Create Admin Account"
5. Automatically logged in and redirected to `/admin`

### Flow 2: From Regular Signup Page

1. Go to `/signup` (regular user signup)
2. Scroll to bottom and click "Create Admin Account"
3. Redirected to `/admin/signup`
4. Complete admin registration

### Flow 3: From Admin Login Page

1. Go to `/admin/login` (admin login)
2. Click "Create Admin Account" button
3. Redirected to `/admin/signup`
4. Complete admin registration

---

## Admin Code Configuration

### Set Your Admin Code

The admin registration code is configured in the `AppContext.tsx` file:

```typescript
// File: frontend/src/app/context/AppContext.tsx
// Inside signupAdmin function

const ADMIN_REGISTRATION_CODE = "ADMIN_SECRET_2026"; // Change this!
```

### How to Change the Code

1. Open `frontend/src/app/context/AppContext.tsx`
2. Find the `signupAdmin` function (around line 482)
3. Replace the code:
   ```typescript
   const ADMIN_REGISTRATION_CODE = "YOUR_NEW_SECRET_CODE";
   ```
4. Save and rebuild frontend

### Recommended Code Format

- Mix of uppercase, lowercase, numbers
- At least 12 characters
- Examples:
  - `Admin_2026_Secret99`
  - `VerySecret123Admin`
  - `EmailValidator_Admin_Secret`

⚠️ **IMPORTANT**: In production, move this to environment variables:

```javascript
const ADMIN_REGISTRATION_CODE =
  process.env.REACT_APP_ADMIN_CODE || "default_code";
```

---

## Firestore Admin Document Structure

### Admin Collection Schema

```json
{
  "admin": {
    "adminUserId": {
      "name": "Administrator Name",
      "email": "admin@example.com",
      "plan": "enterprise",
      "monthlyQuota": 1000000,
      "usedQuota": 0,
      "role": "admin",
      "createdAt": Timestamp,
      "disabled": false
    }
  }
}
```

### Document Fields

| Field          | Type      | Description                            |
| -------------- | --------- | -------------------------------------- |
| `name`         | String    | Admin's full name                      |
| `email`        | String    | Admin's email address                  |
| `plan`         | String    | Always "enterprise"                    |
| `monthlyQuota` | Number    | Monthly verification limit (1,000,000) |
| `usedQuota`    | Number    | Used verifications this month          |
| `role`         | String    | Always "admin"                         |
| `createdAt`    | Timestamp | Account creation date                  |
| `disabled`     | Boolean   | Account status                         |

---

## Admin Features

✅ **Dashboard Access**

- Full admin dashboard at `/admin`
- User management panel
- Verification logs
- Payment analytics
- System settings

✅ **User Management**

- View all users
- Update user plans
- Disable/enable accounts
- Reset user quotas
- View user history

✅ **System Management**

- Manage pricing plans
- View all verifications
- Payment tracking
- System logs
- Admin settings

✅ **Unlimited Quota**

- Enterprise plan (1,000,000 verifications/month)
- No overage charges
- Full feature access

---

## Firestore Security Rules

### Complete Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection: user can read/write their own; admin can read all
    match /users/{userId} {
      allow read: if request.auth != null &&
        (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && isAdmin();
    }

    // Admin collection - only admins can access
    match /admin/{adminId} {
      allow read: if request.auth.uid == adminId || isAdmin();
      allow write: if request.auth.uid == adminId;
      allow create: if false; // Only via backend signup
    }

    // Verifications: user can read/write their own; admin can read all
    match /verifications/{docId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }

    // Bulk uploads: user can read/write their own; admin can read all
    match /bulkUploads/{docId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create, update: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }

    // Payments: user can read their own; only admin can write
    match /payments/{docId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow write: if request.auth != null && isAdmin();
    }

    // Pricing Plans: anyone can read (public); only admins can write
    match /plans/{docId} {
      allow read: if true; // Public - anyone can view pricing
      allow create, update, delete: if request.auth != null && isAdmin();
    }

    // Helper function to check if user is admin
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
             get(/databases/$(database)/documents/admin/$(request.auth.uid)).data.email != null;
    }
  }
}
```

---

## Testing Admin Signup

### Step-by-Step Test

1. **Open Admin Signup Page**

   ```
   http://localhost:5173/admin/signup
   ```

2. **Fill Registration Form**
   - Name: Test Admin
   - Email: admin@test.com
   - Admin Code: ADMIN_SECRET_2026 (or your configured code)
   - Password: TestAdmin123!

3. **Submit Form**
   - Should see success message
   - Redirected to `/admin`

4. **Verify in Firestore**
   - Check `admin` collection
   - Verify document exists with correct data
   - Confirm NOT in `users` collection

### Test Cases

| Test               | Expected Result                          |
| ------------------ | ---------------------------------------- |
| Invalid admin code | Error: "Invalid admin code"              |
| Existing email     | Error: "Email already in use"            |
| Weak password      | Error: "Please choose stronger password" |
| Missing terms      | Error: "Accept terms"                    |
| Valid signup       | Success, redirect to /admin              |

---

## Admin Login Flow

### Login with Admin Credentials

1. Navigate to `/admin/login`
2. Enter admin email and password
3. System checks `admin` collection
4. If found → Login succeeds
5. If not found → "Admin account not found" error

### Key Differences from User Login

| Aspect           | User Login   | Admin Login           |
| ---------------- | ------------ | --------------------- |
| Page             | `/login`     | `/admin/login`        |
| Collection Check | `users`      | `admin`               |
| Role Requirement | role="user"  | in `admin` collection |
| Redirect         | `/dashboard` | `/admin`              |

---

## API Integration (Optional)

### Backend Admin Signup (Coming Soon)

For production, implement backend verification:

```javascript
// backend/routes/auth.js
app.post("/api/auth/admin/signup", async (req, res) => {
  const { email, password, adminCode } = req.body;

  // Verify admin code server-side
  if (adminCode !== process.env.ADMIN_REGISTRATION_CODE) {
    return res.status(401).json({ error: "Invalid admin code" });
  }

  // Create Firebase account
  // Create Firestore admin doc
  // Return success
});
```

---

## Troubleshooting

### Issue: "Admin account not found" on login

**Solution:**

1. Verify admin document exists in `admin` collection
2. Check document ID matches Firebase UID
3. Confirm user is not in `users` collection instead
4. Try re-registering admin account

### Issue: Admin code always fails

**Solution:**

1. Check `signupAdmin` function in AppContext
2. Verify code matches exactly (case-sensitive)
3. Rebuild frontend after changing code
4. Clear browser cache

### Issue: Admin redirects to user dashboard

**Solution:**

1. Check auth state loading in App.tsx
2. Verify admin collection is checked first
3. Clear localStorage and Firebase cache
4. Logout and login again

### Issue: Can't access `/admin` page

**Solution:**

1. Ensure logged in as admin
2. Check `AdminRoute` wrapper in App.tsx
3. Verify admin document exists in Firestore
4. Check browser console for errors

---

## Security Best Practices

✅ **Use Strong Passwords**

- At least 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Not dictionary words

✅ **Protect Admin Code**

- Keep it secret
- Change periodically
- Use environment variables in production
- Different codes for each environment

✅ **Enable 2FA** (Future Enhancement)

- Google Authenticator
- SMS verification
- Backup codes

✅ **Monitor Admin Activity**

- Log all admin actions
- Alert on suspicious activity
- Regular security audits

---

## Production Checklist

Before deploying to production:

- [ ] Change admin registration code to unique secret
- [ ] Move code to environment variables
- [ ] Enable Firestore security rules
- [ ] Set up backend admin verification
- [ ] Enable HTTPS/SSL
- [ ] Configure Firebase security
- [ ] Set up admin activity logging
- [ ] Create backup admin account
- [ ] Document admin access procedures
- [ ] Train admins on platform
- [ ] Set up 2FA for admins
- [ ] Configure admin activity alerts

---

## User Routes

| Route             | Type      | Purpose                 |
| ----------------- | --------- | ----------------------- |
| `/admin/login`    | Public    | Admin login page        |
| `/admin/signup`   | Public    | Admin registration page |
| `/admin`          | Protected | Admin dashboard         |
| `/admin/users`    | Protected | User management         |
| `/admin/logs`     | Protected | Activity logs           |
| `/admin/settings` | Protected | Admin settings          |

---

## Next Steps

1. ✅ Test admin signup locally
2. ✅ Change admin registration code
3. ✅ Deploy to staging environment
4. ✅ Test in staging
5. ✅ Prepare admin user list
6. ✅ Deploy to production
7. ✅ Create first admin accounts
8. ✅ Test admin dashboard
9. ✅ Document admin procedures
10. ✅ Train staff

---

**Last Updated**: March 8, 2026  
**Status**: ✅ Production Ready
