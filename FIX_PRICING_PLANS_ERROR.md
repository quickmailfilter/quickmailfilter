# Fix: Pricing Plans Error (400 Bad Request)

## 🔴 Problem

When trying to create a pricing plan, you get:

- **Error**: `Pricing plans updated: Array(0)`
- **Firestore Error**: `400 Bad Request` on Firestore listener

## 🔍 Root Cause

The Firestore Security Rules do **NOT** include access rules for the `plans` collection. By default, all access is denied, resulting in a 400 error.

## ✅ Solution

You need to update your Firestore Security Rules to allow access to the `plans` collection.

### Step 1: Go to Firebase Console

1. Visit https://console.firebase.google.com
2. Select your **quick-mailfilter** project
3. Navigate to **Firestore Database** → **Rules** tab

### Step 2: Replace Your Security Rules

Copy the complete security rules from below and paste them into the Firebase Console Rules editor:

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

    // 🆕 Pricing Plans: all authenticated users can read; only admins can write
    match /plans/{docId} {
      allow read: if request.auth != null;
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

### Step 3: Publish Rules

1. Click **Publish** button in Firebase Console
2. Wait for rules to deploy (usually ~1 minute)
3. Confirm the deployment is successful

### Step 4: Test the Fix

1. Go back to your Admin Settings page
2. Try creating a new pricing plan
3. The plan should now save successfully
4. You should see it appear in the "Current Pricing Plans" list

## 📋 What Changed?

### New Rule Added for Plans Collection:

```javascript
match /plans/{docId} {
  allow read: if request.auth != null;        // All authenticated users can read
  allow create, update, delete: if request.auth != null && isAdmin();  // Only admins can write
}
```

This allows:

- ✅ Any logged-in user to view pricing plans
- ✅ Only admins to create/update/delete pricing plans
- ❌ Anonymous users cannot access plans

### Updated Admin Check:

The `isAdmin()` function now checks both:

1. Users with `role == 'admin'` in the `users` collection
2. Any user in the `admin` collection (for admin-only accounts)

## 🔒 Security Notes

- Pricing plans are readable by all authenticated users (this is safe - they're public pricing info)
- Only admins can modify plans (protected by isAdmin() check)
- The isAdmin() function checks both user roles and admin collection
- This follows the principle of least privilege

## 📚 Documentation Updated

The following files have been updated with complete security rules:

- ✅ `frontend/FIREBASE_SETUP.md` - Full setup guide with plans collection
- ✅ `ADMIN_SIGNUP_GUIDE.md` - Complete security rules documentation

## ❓ Troubleshooting

**Still seeing 400 error?**

1. ✓ Wait 1-2 minutes after publishing rules
2. ✓ Clear browser cache and refresh
3. ✓ Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. ✓ Check browser DevTools (F12) to confirm no cache issues
5. ✓ Verify you're logged in as an admin account

**Can't see the admin section?**

1. Make sure your account has `role: 'admin'` in the `users` collection
2. Or exists in the `admin` collection
3. Log out and log back in for changes to take effect

**Rules rejecting writes?**

1. Verify you're logged in as admin
2. Check browser console for specific error message
3. Go to Firebase Console → Firestore → Rules playground to test rules
