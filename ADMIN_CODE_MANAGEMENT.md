# Admin Code Management

## Quick Reference

### Current Admin Registration Code

```
ADMIN_SECRET_2026
```

**Location**: `frontend/src/app/context/AppContext.tsx` (line ~482)

**Current Status**: ✅ Active

---

## How to Update Admin Code

### Step 1: Locate the Code

**File**: `frontend/src/app/context/AppContext.tsx`

**Find**: Search for `ADMIN_REGISTRATION_CODE` in `signupAdmin` function

**Current Implementation**:

```typescript
// Inside signupAdmin function
const ADMIN_REGISTRATION_CODE = "ADMIN_SECRET_2026";

if (adminCode.trim() !== ADMIN_REGISTRATION_CODE) {
  toast.error("Invalid admin registration code");
  return false;
}
```

### Step 2: Change the Code

Replace the code value:

```typescript
const ADMIN_REGISTRATION_CODE = "YOUR_NEW_CODE_HERE";
```

### Step 3: Save and Rebuild

1. Save the file
2. Run: `npm run dev` (frontend rebuilds automatically)
3. Clear browser cache (Ctrl+Shift+Delete)

### Step 4: Test

1. Try signing up with old code → Should fail
2. Try signing up with new code → Should succeed

---

## Code Rotation Schedule

### Recommended

| Frequency   | Reason                    |
| ----------- | ------------------------- |
| Monthly     | Regular security rotation |
| Quarterly   | Minimum recommended       |
| Immediately | After employee departure  |
| Immediately | If code is compromised    |

### Example Schedule

- January: `ADMIN_JAN_2026`
- February: `ADMIN_FEB_2026`
- March: `ADMIN_MAR_2026`

---

## Environment Variable Setup (Production)

### Add to `.env` Files

**File**: `frontend/.env`

```
VITE_ADMIN_REGISTRATION_CODE=YOUR_SECRET_CODE_HERE
```

**File**: `frontend/.env.production`

```
VITE_ADMIN_REGISTRATION_CODE=YOUR_PRODUCTION_SECRET_CODE
```

### Update AppContext.tsx

```typescript
const ADMIN_REGISTRATION_CODE =
  import.meta.env.VITE_ADMIN_REGISTRATION_CODE || "default_fallback";
```

### Benefits

✅ Code not hardcoded in source  
✅ Different codes per environment  
✅ Easy to change without rebuilding  
✅ Secure in production deployment

---

## Admin Code Auditing

### Who Has Access?

| Role        | Has Code?             |
| ----------- | --------------------- |
| Founder/CEO | Yes                   |
| Co-founder  | Yes                   |
| Admin       | No (shouldn't know)   |
| Developers  | Yes (during dev only) |
| Users       | No                    |

### Audit Trail

Track admin registrations:

```javascript
// Add to Firestore when admin signs up
{
  "adminEmail": "admin@example.com",
  "createdAt": timestamp,
  "createdBy": "founder@example.com", // Who approved
  "approvalCode": "ADMIN_JAN_2026",   // Which code was used
}
```

---

## Multiple Admin Codes (Advanced)

### Different Codes for Different Admins

**File**: `frontend/src/app/context/AppContext.tsx`

```typescript
const ADMIN_CODES = {
  primary: "ADMIN_SECRET_2026",
  secondary: "ADMIN_BACKUP_CODE",
  support: "ADMIN_SUPPORT_2026",
};

if (!Object.values(ADMIN_CODES).includes(adminCode.trim())) {
  toast.error("Invalid admin registration code");
  return false;
}
```

### Track Which Code Was Used

```typescript
signupAdmin = async (name, email, password, adminCode) => {
  const usedCode = Object.entries(ADMIN_CODES).find(
    ([_, code]) => code === adminCode.trim(),
  )?.[0];

  // Save to Firestore
  await setDoc(adminRef, {
    // ... other fields
    adminCodeUsed: usedCode, // "primary", "secondary", or "support"
  });
};
```

---

## Security Considerations

### DON'T DO THIS

❌ Use simple codes like `admin`, `password`, `123456`  
❌ Share code via email or unencrypted channels  
❌ Use same code across environments  
❌ Hardcode code in public repositories  
❌ Keep codes in git history

### DO THIS

✅ Use strong, random codes (12+ characters)  
✅ Share via secure channels (LastPass, 1Password, etc.)  
✅ Different code per environment  
✅ Store in environment variables  
✅ Rotate codes regularly  
✅ Keep audit trail of registrations  
✅ Require code in production only

---

## Code Examples

### Strong Admin Codes

```
Admin_Validator_2026_Secret
VerySecure123AdminCode456
EmailValidation_Admin_Code789
Legendary_Admin_SaaS_Secret2026
```

### Weak Admin Codes (DON'T USE)

```
admin
password
123456
Admin@123
test
```

---

## Emergency Procedures

### Code Compromised?

1. **Immediately** update code in AppContext
2. **Notify all admins** of code change
3. **Check Firestore** for unauthorized admin accounts
4. **Delete** any suspicious admin accounts
5. **Change password** of affected admin accounts
6. **Review logs** for unauthorized access

### Lost Access?

1. Firebase Admin SDK: Create admin account directly
2. Firestore Console: Add admin document manually
3. Backend endpoint: Create admin via `/api/admin/create` (if enabled)

### Need Backup Admin?

1. Keep one hard-copy code in safe
2. Share different code with co-founder
3. Use backend verification as backup

---

## Compliance & Audit

### Documentation Needed

- [ ] Code change log (who, when, why)
- [ ] Admin registration log (who, when, which code)
- [ ] Access logs (admin login/logout times)
- [ ] Sensitive action logs (user deletions, quota resets)

### Compliance Questions

- How often is code rotated? → Monthly
- Who has access to code? → 2-3 key people
- Is code stored securely? → Environment variables
- Is access logged? → Yes, in Firestore
- Can old codes be revoked? → Yes, update in AppContext

---

## Testing Codes

### For Development

```
DEV_ADMIN_CODE_TEST_123
```

### For Staging

```
STAGING_ADMIN_CODE_2026
```

### For Production

```
[KEEP SECURE - NOT SHARED]
```

---

## Monitoring

### Alert If

- Multiple failed signup attempts (5+)
- Signup attempt with wrong code
- New admin account created (notify founder)
- Admin account deleted (notify founder)

### Setup Alerts

1. Firebase Functions: Monitor `admin` collection writes
2. Firestore: Create composite index for admin creation date
3. Email alert: New admin created

---

## Support Contact

For admin code issues:

1. Contact founder/CEO
2. Verify identity
3. Provide admin email
4. Receive new temporary code

---

**Last Updated**: March 8, 2026  
**Version**: 1.0  
**Status**: Active
