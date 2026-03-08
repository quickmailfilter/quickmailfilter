# Pricing Plans Management Guide

## Overview

The admin settings page now supports two types of pricing plans:

1. **Subscription Plans** (Daily/Monthly)
2. **One-Time Plans** (Pay as you go)

---

## Adding Pricing Plans

Navigate to **Admin Dashboard** → **Admin Settings** → **Pricing Plans (Dynamic)**

### Plan Type Selector

Choose the plan type before filling in details:

- **Subscription (Daily Credits)**: Monthly recurring charges with daily credit allocation
- **One-Time (Pay as you go)**: One-time purchases with fixed credit amounts

---

## Subscription Plans (Daily Credits / Monthly)

For monthly plans that give users a daily credit allowance.

### Example Plan 1: 500 Credits/Day

**Form Fields:**

- **Plan Type**: Subscription (Daily Credits)
- **Plan Name**: `500 credits / day - 15000 / month`
- **Daily Credits**: `500`
- **Price**: `2000` (INR per month)
- **Description**: `500 credits per day, 15,000 credits per month. Perfect for daily users`
- **Mark as Popular**: ✓ (if you want to highlight it)

**System Auto-Calculates:**

- **Monthly Quota**: 15,000 (500 × 30 days)

---

### Example Plan 2: 1k Credits/Day

**Form Fields:**

- **Plan Type**: Subscription (Daily Credits)
- **Plan Name**: `1k credits / day - 30000 / month`
- **Daily Credits**: `1000`
- **Price**: `4000` (INR per month)
- **Description**: `1,000 credits per day, 30,000 credits per month. Great for growing teams`
- **Mark as Popular**: ✗

**System Auto-Calculates:**

- **Monthly Quota**: 30,000 (1,000 × 30 days)

---

### Example Plan 3: 2k Credits/Day

**Form Fields:**

- **Plan Type**: Subscription (Daily Credits)
- **Plan Name**: `2k credits / day - 60000 / month`
- **Daily Credits**: `2000`
- **Price**: `6000` (INR per month)
- **Description**: `2,000 credits per day, 60,000 credits per month`

**System Auto-Calculates:**

- **Monthly Quota**: 60,000 (2,000 × 30 days)

---

### Example Plan 4: 3k Credits/Day

**Form Fields:**

- **Plan Type**: Subscription (Daily Credits)
- **Plan Name**: `3k credits / day - 90000 / month`
- **Daily Credits**: `3000`
- **Price**: `8000` (INR per month)
- **Description**: `3,000 credits per day, 90,000 credits per month`

**System Auto-Calculates:**

- **Monthly Quota**: 90,000 (3,000 × 30 days)

---

### Example Plan 5: 5k Credits/Day

**Form Fields:**

- **Plan Type**: Subscription (Daily Credits)
- **Plan Name**: `5k credits / day - 150000 / month`
- **Daily Credits**: `5000`
- **Price**: `11000` (INR per month)
- **Description**: `5,000 credits per day, 150,000 credits per month. Enterprise level`
- **Mark as Popular**: ✓ (if best seller)

**System Auto-Calculates:**

- **Monthly Quota**: 150,000 (5,000 × 30 days)

---

## One-Time Plans (Pay as you go)

For one-time purchases without recurring charges.

### Example Plan 1: 500 Credits

**Form Fields:**

- **Plan Type**: One-Time (Pay as you go)
- **Plan Name**: `500 Email Verifications`
- **Credit Amount**: `500`
- **Price**: `300` (INR, one-time)
- **Description**: `500 email verifications, pay once, use anytime`

**System Auto-Calculates:**

- **Quota**: 500 (equal to credit amount)

---

### Example Plan 2: 1k Credits

**Form Fields:**

- **Plan Type**: One-Time (Pay as you go)
- **Plan Name**: `1,000 Email Verifications`
- **Credit Amount**: `1000`
- **Price**: `600` (INR, one-time)
- **Description**: `1,000 email verifications`

**System Auto-Calculates:**

- **Quota**: 1,000

---

### Example Plan 3: 2.5k Credits

**Form Fields:**

- **Plan Type**: One-Time (Pay as you go)
- **Plan Name**: `2,500 Email Verifications`
- **Credit Amount**: `2500`
- **Price**: `1500` (INR, one-time)
- **Description**: `2,500 email verifications`

**System Auto-Calculates:**

- **Quota**: 2,500

---

### Example Plan 4: 5k Credits

**Form Fields:**

- **Plan Type**: One-Time (Pay as you go)
- **Plan Name**: `5,000 Email Verifications`
- **Credit Amount**: `5000`
- **Price**: `3000` (INR, one-time)
- **Description**: `5,000 email verifications`
- **Mark as Popular**: ✓

**System Auto-Calculates:**

- **Quota**: 5,000

---

### Example Plan 5: 10k Credits

**Form Fields:**

- **Plan Type**: One-Time (Pay as you go)
- **Plan Name**: `10,000 Email Verifications`
- **Credit Amount**: `10000`
- **Price**: `5200` (INR, one-time)
- **Description**: `10,000 email verifications. Best value!`

**System Auto-Calculates:**

- **Quota**: 10,000

---

## Complete Plan Setup (All 10 Plans)

To recreate the full pricing structure with all plans:

### Subscription Plans (Add in this order)

| Name              | Daily Credits | Price (INR) | Monthly Quota |
| ----------------- | ------------- | ----------- | ------------- |
| 500 credits/day   | 500           | 2,000       | 15,000        |
| 1k credits/day    | 1,000         | 4,000       | 30,000        |
| 2k credits/day    | 2,000         | 6,000       | 60,000        |
| 3k credits/day    | 3,000         | 8,000       | 90,000        |
| 5k credits/day ⭐ | 5,000         | 11,000      | 150,000       |

### One-Time Plans (Add in this order)

| Name                | Credits | Price (INR) |
| ------------------- | ------- | ----------- |
| 500 Verifications   | 500     | 300         |
| 1k Verifications    | 1,000   | 600         |
| 2.5k Verifications  | 2,500   | 1,500       |
| 5k Verifications ⭐ | 5,000   | 3,000       |
| 10k Verifications   | 10,000  | 5,200       |

⭐ = Recommended to mark as "Popular"

---

## How Plans Display on Frontend

### For Subscription Plans

```
500 credits / day - 15000 / month
₹2,000/month
500 daily credits
```

### For One-Time Plans

```
1,000 Email Verifications
₹600
1,000 total credits
```

---

## Important Notes

✅ **What Auto-Calculates:**

- For subscriptions: Monthly quota = Daily credits × 30
- For one-time: Total quota = Credit amount

✅ **Best Practices:**

- Mark 1-2 plans as "Popular" to highlight recommendations
- Use clear, descriptive names showing the benefit
- One-time plans should have lower per-unit cost for bulk purchases
- Subscription plans should offer better value per month

⚠️ **Required Fields:**

- Plan Name (required)
- Price (required)
- Quota (auto-calculated, cannot edit)
- Daily Credits or Credit Amount (depends on plan type)

---

## Managing Existing Plans

### View Plans

All created plans appear in the left panel showing:

- Plan name and type (Monthly/One-Time)
- Daily credits or credit amount
- Monthly quota or total credits
- Price in INR

### Delete Plans

Click the **Delete** (trash) button on any plan card

### Edit Plans

Click the **Edit** button to modify existing plans (uses Firestore Dashboard for direct editing)

---

## Firestore Collection Structure

Plans are stored in the `plans` collection with this structure:

```json
{
  "id": "auto-generated",
  "name": "500 credits / day",
  "price": 2000,
  "currency": "INR",
  "quota": 15000,
  "description": "500 credits per day",
  "features": ["Email Verification", "Bulk Support"],
  "popular": false,
  "active": true,
  "planType": "subscription",
  "dailyCredits": 500,
  "billingPeriod": "monthly",
  "createdAt": "2026-03-08T..."
}
```

---

## Testing Plans

1. Add a few test plans in admin settings
2. Go to the Pricing page
3. Verify plans display correctly
4. Try purchasing a plan to test the payment flow
5. Check Firestore `plans` collection to verify data

---

## Next Steps

After creating pricing plans:

1. ✅ Set up payment gateway (already done with Razorpay)
2. ✅ Configure plans on admin dashboard
3. ✅ Test payment flow with different plan types
4. Test quota application after purchase
5. Set up invoice generation
6. Configure email notifications for purchases

---

**Last Updated**: March 8, 2026  
**Status**: ✅ Ready to use
