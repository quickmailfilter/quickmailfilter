# Firestore Composite Indexes Setup

This document explains how to create the required composite indexes in Firebase Firestore to fix the "The query requires an index" errors.

## Issue

The following collections need composite indexes for the `where` + `orderBy` queries:

1. **verifications** - Query by `userId` ordered by `timestamp`
2. **bulkUploads** - Query by `userId` ordered by `uploadedAt`
3. **payments** - Query by `userId` ordered by `paymentDate`

## Automatic Setup (Recommended)

### Option 1: Using Firebase Console (Easiest)

The errors in the console include direct links to create the indexes:

1. **For Verifications Index:**
   - Visit: https://console.firebase.google.com/v1/r/project/quick-mailfilter/firestore/indexes?create_composite=ClZwcm9qZWN0cy9xdWljay1tYWlsZmlsdGVyL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy92ZXJpZmljYXRpb25zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCXRpbWVzdGFtcBACGgwKCF9fbmFtZV9fEAI
   - Click "Create Index"

2. **For Bulk Uploads Index:**
   - Visit: https://console.firebase.google.com/v1/r/project/quick-mailfilter/firestore/indexes?create_composite=ClRwcm9qZWN0cy9xdWljay1tYWlsZmlsdGVyL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9idWxrVXBsb2Fkcy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoOCgp1cGxvYWRlZEF0EAIaDAoIX19uYW1lX18QAg
   - Click "Create Index"

3. **For Payments Index:**
   - Visit: https://console.firebase.google.com/v1/r/project/quick-mailfilter/firestore/indexes?create_composite=ClFwcm9qZWN0cy9xdWljay1tYWlsZmlsdGVyL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9wYXltZW50cy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoPCgtwYXltZW50RGF0ZRACGgwKCF9fbmFtZV9fEAI
   - Click "Create Index"

### Option 2: Manual Index Creation

If the links don't work, create indexes manually:

1. Go to [Firebase Console](https://console.firebase.google.com) → quick-mailfilter project
2. Navigate to **Firestore Database** → **Indexes** tab
3. Click **Create Index** and add these three composite indexes:

#### Index 1: Verifications

- **Collection ID:** `verifications`
- **Fields (in order):**
  - `userId` (Ascending)
  - `timestamp` (Descending)

#### Index 2: Bulk Uploads

- **Collection ID:** `bulkUploads`
- **Fields (in order):**
  - `userId` (Ascending)
  - `uploadedAt` (Descending)

#### Index 3: Payments

- **Collection ID:** `payments`
- **Fields (in order):**
  - `userId` (Ascending)
  - `paymentDate` (Descending)

## Verification

After creating the indexes:

1. Each index should show status **"Enabled"** in the Firebase Console
2. The browser console errors should be resolved
3. The queries in AppContext should work correctly

## Troubleshooting

- **Index still building?** Firestore indexes can take 5-15 minutes to build. Wait a few minutes and refresh the page.
- **Wrong order of fields?** The fields must be in the exact order specified above.
- **Still getting errors?** Clear browser cache (Ctrl+Shift+Delete) and reload the page.

## Related Code

The queries using these indexes are in [frontend/src/app/context/AppContext.tsx](frontend/src/app/context/AppContext.tsx):

- Line ~320: `loadVerificationHistory()` - uses verifications index
- Line ~360: `loadBulkUploads()` - uses bulkUploads index
- Line ~395: `loadPayments()` - uses payments index
