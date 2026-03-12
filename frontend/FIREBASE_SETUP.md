# Firebase Setup Guide

## 1. Firestore Security Rules

Go to **Firebase Console → Firestore → Rules** and paste the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection: user can read/write their own doc; admin can read all
    match /users/{userId} {
      allow read: if request.auth != null &&
        (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && request.auth.uid == userId;
      // Allow admin to update any user doc
      allow update: if request.auth != null && isAdmin();
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

    // Payments: user can read their own; only server/admin can write
    match /payments/{docId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow write: if request.auth != null; // tighten this when adding payment gateway
    }

    // Pricing Plans: anyone can read (public); only admins can write
    match /plans/{docId} {
      allow read: if true; // Public - anyone can view pricing
      allow create, update, delete: if request.auth != null && isAdmin();
    }

    // Helper function
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
             get(/databases/$(database)/documents/admin/$(request.auth.uid)).data.email != null;
    }
  }
}
```

## 2. Firestore Indexes

Go to **Firebase Console → Firestore → Indexes** and create the following composite indexes:

| Collection    | Field 1 | Order | Field 2     | Order |
| ------------- | ------- | ----- | ----------- | ----- |
| verifications | userId  | ASC   | timestamp   | DESC  |
| bulkUploads   | userId  | ASC   | uploadedAt  | DESC  |
| payments      | userId  | ASC   | paymentDate | DESC  |

Alternatively, deploy the provided `firestore.indexes.json`.

## 3. Firebase Authentication

Go to **Firebase Console → Authentication → Sign-in method** and enable:

- ✅ **Email/Password**
- ✅ **Google** (add your domain to authorized domains)

## 4. Create Admin User

Once a user registers via the app, follow these steps to make them an admin:

### Step-by-Step:

1. **Sign up a user** in the app at `/signup` (e.g., `admin@example.com`)
   - This automatically creates a user document in Firestore under `users/{userId}` with `role: "user"`

2. **Go to Firebase Console:**
   - Visit https://console.firebase.google.com
   - Select your **quick-mailfilter** project

3. **Navigate to Firestore Database:**
   - Click **Firestore Database** in the left sidebar

4. **Find the users collection:**
   - In the **Data** tab, you'll see collections on the left
   - Click on **users** to expand it

5. **Open the user document:**
   - Find the user you just created (the email will be visible)
   - Click to open the document

6. **Edit the role field:**
   - You'll see the user's fields: `name`, `email`, `plan`, `monthlyQuota`, `usedQuota`, `createdAt`, `role`
   - Click on the `role` field (it currently says `"user"`)
   - Change it to `"admin"` and click **Update**

7. **Verify in the app:**
   - Log out from the app
   - Log back in as that user
   - You should now see the **Admin** section in the dashboard
   - Navigate to `/admin` to access Admin Dashboard, User Management, System Logs, etc.

### Complete Admin User Document Example:

```json
{
  "createdAt": "Timestamp (Mar 6, 2026 at 10:30:00 AM UTC)",
  "email": "admin@example.com",
  "monthlyQuota": 1000,
  "name": "Admin User",
  "plan": "free",
  "role": "admin",
  "usedQuota": 0,
  "disabled": false
}
```

### Multiple Admins:

Repeat steps 1-6 for each additional admin you want to create. Each admin can:

- View all users, verifications, and payments
- Upgrade/downgrade any user's plan
- Reset any user's quota
- Disable/enable accounts

## 5. Authorized Domains

Go to **Firebase Console → Authentication → Settings → Authorized domains** and add:

- `localhost`
- `quickmailfilter.com` (your production domain)

## 6. Firestore Collections Created Automatically

The app will create these collections automatically:

- `users` — user profiles, plan, quota
- `verifications` — per-email verification results
- `bulkUploads` — bulk upload jobs and results
- `payments` — plan upgrade payment records
