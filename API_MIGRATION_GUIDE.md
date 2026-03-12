# Email Validator API - Migration Guide

## What Changed

Your email validator backend is now **SMTP-independent** and provides better validation when SMTP is blocked.

---

## New Response Fields

### `verified_via` (NEW)

Shows which validation method confirmed the result.

```
"verified_via": "smtp" | "dns_security" | "mx_record" | "combined" | "pattern"
```

| Method         | Meaning                                   | Reliability      |
| -------------- | ----------------------------------------- | ---------------- |
| `smtp`         | Directly verified via SMTP (traditional)  | ⭐⭐⭐ Very High |
| `dns_security` | All DNS records present + MX              | ⭐⭐⭐ Very High |
| `combined`     | Multiple signals (DNS+Pattern+Reputation) | ⭐⭐ High        |
| `mx_record`    | MX record present                         | ⭐ Medium        |
| `pattern`      | Pattern validation only                   | ⭐ Low           |

---

### `verification_confidence` (NEW)

How confident the system is in the validation result.

```
"verification_confidence": "high" | "medium" | "low"
```

| Level    | Meaning                               | When                                     |
| -------- | ------------------------------------- | ---------------------------------------- |
| `high`   | Validated via SMTP or all DNS records | Gmail, Outlook, strong corporate domains |
| `medium` | Multiple positive signals             | 2+ DNS records + good reputation         |
| `low`    | Limited signals but appears valid     | MX only, or partial DNS records          |

---

### `smtp_skipped_reason` (NEW)

Why SMTP validation was skipped (if applicable).

```
"smtp_skipped_reason": "Port 25 blocked on Railway platform" | null
```

- `null` = SMTP was attempted or not requested
- String value = reason SMTP was skipped (informational)

---

## Example API Responses

### Response 1: Corporate Email (SMTP Available)

```json
{
  "valid": true,
  "email": "john.doe@techcorp.com",
  "security_score": 92,
  "verified_via": "smtp",
  "verification_confidence": "high",
  "smtpVerified": true,
  "mx_record": "aspmx.l.google.com",
  "spf": true,
  "dkim": true,
  "dmarc": true,
  "pattern_score": 92,
  "domain_reputation": 85,
  "free": false,
  "corporate": true,
  "disposable": false,
  "role": false,
  "validators": {
    "regex": { "valid": true },
    "pattern": { "valid": true },
    "mx": { "valid": true },
    "smtp": { "valid": true }
  }
}
```

**Why high confidence?**

- ✅ SMTP verified directly
- ✅ All DNS records present (SPF, DKIM, DMARC)
- ✅ Good domain reputation
- ✅ Good pattern score

---

### Response 2: Corporate Email (SMTP Blocked - Railway)

```json
{
  "valid": true,
  "email": "jane@enterprise.com",
  "security_score": 89,
  "verified_via": "dns_security",
  "verification_confidence": "high",
  "smtpBlocked": true,
  "smtp_skipped_reason": "Port 25 blocked on Railway platform",
  "mx_record": "outlook.com",
  "spf": true,
  "dkim": true,
  "dmarc": true,
  "pattern_score": 91,
  "domain_reputation": 80,
  "free": false,
  "corporate": true,
  "disposable": false
}
```

**Why still high confidence (without SMTP)?**

- ✅ All DNS records present (strong indicator)
- ✅ Known enterprise provider (Outlook)
- ✅ Good domain reputation
- ✅ Valid email pattern
- ✅ MX record found

**This is THE KEY IMPROVEMENT** — Email validates without SMTP!

---

### Response 3: Free Email Provider (Gmail)

```json
{
  "valid": true,
  "email": "user@gmail.com",
  "security_score": 87,
  "verified_via": "combined",
  "verification_confidence": "medium",
  "smtpVerified": false,
  "smtpBlocked": false,
  "mx_record": "gmail-smtp-in.l.google.com",
  "spf": true,
  "dkim": true,
  "dmarc": true,
  "pattern_score": 88,
  "domain_reputation": 95,
  "free": true,
  "provider": "Gmail",
  "disposable": false
}
```

**Note:** Free email providers always have strong DNS records and reputation, so validation is reliable even without SMTP.

---

### Response 4: Small Business (Partial DNS)

```json
{
  "valid": true,
  "email": "contact@smallbiz.com",
  "security_score": 72,
  "verified_via": "combined",
  "verification_confidence": "medium",
  "smtpBlocked": true,
  "smtp_skipped_reason": "Blocking service detected",
  "mx_record": "mail.smallbiz.com",
  "spf": true,
  "dkim": false,
  "dmarc": false,
  "pattern_score": 86,
  "domain_reputation": 60,
  "corporate": true
}
```

**Medium confidence because:**

- ✅ MX record present
- ✅ SPF configured
- ⚠️ Missing DKIM/DMARC
- ⚠️ Lower reputation score

---

### Response 5: Low Confidence (MX Only)

```json
{
  "valid": true,
  "email": "random@littleknown.io",
  "security_score": 63,
  "verified_via": "mx_record",
  "verification_confidence": "low",
  "mx_record": "mail.littleknown.io",
  "spf": false,
  "dkim": false,
  "dmarc": false,
  "pattern_score": 75,
  "domain_reputation": 45,
  "corporate": true,
  "disposable": false
}
```

**Low confidence because:**

- ✅ MX record found
- ⚠️ No DNS security records
- ⚠️ Unknown/low reputation domain
- ⚠️ Pattern could be better

---

## Migration Steps

### Step 1: Accept New Fields (Recommended)

Your code should continue working, but now you get extra info:

```javascript
// Frontend example
const result = await validateEmail("user@example.com");

if (result.valid) {
  console.log("Email is valid");
  console.log("Verified via:", result.verified_via); // NEW
  console.log("Confidence:", result.verification_confidence); // NEW
}
```

### Step 2: Use Verification Confidence (Optional)

Display confidence to users:

```javascript
if (result.valid) {
  const confidenceEmoji = {
    high: "✅",
    medium: "⚠️",
    low: "❓",
  }[result.verification_confidence];

  console.log(
    `${confidenceEmoji} Email validated (${result.verification_confidence} confidence)`,
  );
}
```

### Step 3: Handle SMTP Skipped Reason (Optional)

Inform users why SMTP wasn't used:

```javascript
if (result.valid && result.smtp_skipped_reason) {
  console.log("Note:", result.smtp_skipped_reason);
}
```

---

## Backward Compatibility

✅ **Good news:** You don't need to change anything!

- `valid` field still works exactly the same
- `security_score` still 0-100
- All old fields still present
- New fields are purely informational

### Old code still works:

```javascript
// This still works perfectly
const { valid, security_score } = await validateEmail("test@example.com");
if (valid) {
  console.log("Email is valid!");
}
```

---

## FAQ

### Q: Why is SMTP not being tested?

**A:** SMTP is skipped for these reasons:

- Deployed on **Railway** (port 25 blocked)
- Detected **blocking service** (Mimecast, O365, Gmail, etc.)
- Environment **explicitly disabled** SMTP validation
- Instead: System uses DNS security records + pattern + reputation

### Q: Is the email still valid without SMTP?

**A:** Yes! When:

- ✅ MX record present
- ✅ DNS records look good (SPF/DKIM/DMARC)
- ✅ Pattern is legitimate
- ✅ Domain has decent reputation

### Q: What if score is lower than expected?

**A:** The new algorithm is more accurate:

- More weight on DNS (40% vs 25%)
- Less weight on SMTP (8% vs 10%)
- More realistic penalty for accept-all domains (-8 vs -15)
- More realistic role email penalty (-5 vs -8)

### Q: Should I display the score to users?

**A:** Recommend using **confidence level** instead:

- `high` → Show ✅ "Email looks good"
- `medium` → Show ⚠️ "Email is likely valid"
- `low` → Show ❓ "Unable to fully verify"

### Q: What about my API clients?

**A:** No changes required:

- New fields are optional
- Old fields still present
- API response is backward compatible

---

## Testing

### Test Corporate Email (Gmail Workspace)

```
Email: john@yourcompany.com
Expected: verified_via="dns_security", confidence="high"
Why: Gmail always has SPF/DKIM/DMARC
```

### Test Free Email

```
Email: testuser@gmail.com
Expected: verified_via="combined", confidence="medium"
Why: Known provider, strong reputation
```

### Test Small Business

```
Email: info@smallbiz.com
Expected: verified_via="combined", confidence="medium"
Why: MX + some DNS security signals
```

### Test Railway Deployment

```
Deploy to: Railway platform
Check: SMTP skipped, validation still works
Expected: verified_via="dns_security" with high confidence
```

---

## Summary

Your email validator is now:

- ✅ **SMTP-independent** - Works when SMTP blocked
- ✅ **More accurate** - Multi-signal validation
- ✅ **Transparent** - Shows validation method
- ✅ **Confident** - Indicates confidence level
- ✅ **Backward compatible** - Old code still works

**Key Benefit:** Reliable email validation even on restricted networks (Railway, containers, etc).
