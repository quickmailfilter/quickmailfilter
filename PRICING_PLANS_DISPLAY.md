# Displaying Firebase Pricing Plans on Frontend

## ✅ How It Works

### 1. **Global Plan Fetching** (AppContext.tsx)

- Plans are fetched globally from Firebase Firestore on app load
- Works for both authenticated AND unauthenticated users
- Real-time listener updates `pricingPlans` state whenever plans change in Firebase

```javascript
// Listen to pricing plans globally (no auth required)
useEffect(() => {
  const q = query(collection(db, "plans"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const plansArray: PricingPlan[] = [];
    querySnapshot.forEach((doc) => {
      plansArray.push({ id: doc.id, ...doc.data() } as PricingPlan);
    });
    setPricingPlans(plansArray);
  });
  return () => unsubscribe();
}, []);
```

### 2. **Pricing Page Display** (PricingPage.tsx)

- Uses Firebase plans if available: `pricingPlans.length > 0`
- Falls back to static plans if no Firebase plans exist
- Displays with full feature set: pricing, quota, features, popular badge

### 3. **Security Rules Updated**

- Plans are now **publicly readable** (anyone can see pricing)
- Only **admins can create/update/delete** plans
- This allows the pricing page to display plans to non-logged-in users

## 🎯 How to View Plans

### For Logged-Out Users:

1. Go to http://localhost:5173/pricing (or your production domain)
2. See all Firebase pricing plans displayed
3. Click "Start Trial" or "Upgrade" to purchase

### For Logged-In Users:

1. Go to http://localhost:5173/pricing
2. See all Firebase pricing plans
3. Current plan shows as "Current Plan" button
4. Can upgrade to other plans

### For Admins:

1. Go to http://localhost:5173/admin/settings
2. Click "Pricing Plans (Dynamic)" tab
3. See all created plans from Firebase
4. Add new plans or delete existing ones
5. Changes appear on pricing page in real-time

## 📊 Plan Data Flow

```
Firebase Firestore (plans collection)
         ↓
AppContext (pricingPlans state)
         ↓
PricingPage Component
         ↓
Customer sees plans
```

## 🔄 Real-Time Updates

When an admin creates/updates/deletes a plan:

1. Plan is saved to Firebase
2. Real-time listener in AppContext detects change
3. `pricingPlans` state updates
4. PricingPage automatically re-renders
5. All users see the updated pricing instantly

## 📋 Plans Added via Quick-Add

The following 10 plans can be added via the "Quick Add" buttons in Admin Settings:

### Daily Allowance Plans (Monthly Subscription)

- ✅ Starter Saver (500 credits/day, ₹2,000)
- ✅ Pro Daily (1,000 credits/day, ₹4,000)
- ✅ Business Daily (2,000 credits/day, ₹6,000)
- ✅ Enterprise Daily (3,000 credits/day, ₹8,000)
- ✅ Elite Daily (5,000 credits/day, ₹11,000)

### On-Demand Top-ups (Pay As You Go)

- ✅ Mini Pack (500 credits, ₹300)
- ✅ Basic Pack (1,000 credits, ₹600)
- ✅ Standard Pack (2,500 credits, ₹1,500)
- ✅ Value Pack (5,000 credits, ₹3,000)
- ✅ Bulk Pack (10,000 credits, ₹5,200)

## 🚀 Quick Steps to Get Plans Showing

1. **Update Firestore Security Rules:**
   - Go to Firebase Console
   - Firestore Database → Rules
   - Replace with new rules (plans are now publicly readable)
   - Publish rules

2. **Add Plans via Admin:**
   - Go to http://localhost:5173/admin/settings
   - Click "Pricing Plans (Dynamic)" tab
   - Click any "Quick Add" button to add preset plans
   - Or use "Add New Plan (Manual)" to create custom plans

3. **View on Pricing Page:**
   - Go to http://localhost:5173/pricing
   - Plans from Firebase appear automatically
   - No additional configuration needed

## ✅ Checklist

- [ ] Updated Firestore Security Rules (plans now public)
- [ ] Added at least one pricing plan via Admin Settings
- [ ] Refreshed pricing page
- [ ] Confirmed plans display

## 🔒 Security

- ✅ Plans are public (anyone can read pricing)
- ✅ Only admins can create/update/delete
- ✅ No authentication required to view pricing
- ✅ Payment processing still requires login

## 🆘 Troubleshooting

**Plans not showing on pricing page?**

1. Check browser console for errors
2. Go to Firebase Console → Firestore → data
3. Verify "plans" collection has documents
4. Hard refresh page (Ctrl+Shift+R)
5. Check that security rules were published

**Still seeing static fallback plans?**

1. Admin may not have added any plans yet
2. Security rules might still require authentication
3. Clear browser cache and refresh
4. Check Firestore in Firebase Console

**Changes not appearing immediately?**

1. Wait 5-10 seconds (real-time listener propagates)
2. Manually refresh page (Ctrl+R)
3. Check browser DevTools console for errors
