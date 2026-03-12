/**
 * Test Scenarios - SMTP Independence Improvements
 *
 * This file demonstrates how the improved email validation works
 * when SMTP is blocked or unavailable.
 */

// Test Case 1: Corporate Email with Strong DNS (Gmail Workspace)
// Expected: HIGH confidence via DNS security
const testCase1 = {
  email: "john.doe@techcorp.com",
  scenario: "Corporate domain with Gmail Workspace",
  expectedValidation: {
    verified_via: "dns_security",
    verification_confidence: "high",
    scoreRange: "80-90",
  },
  signals: {
    mx_record: "aspmx.l.google.com", // MX present: +40
    spf: true, // SPF valid: +5 (or part of +15 for all 3)
    dkim: true, // DKIM: +5
    dmarc: true, // DMARC: +5
    pattern_score: 92, // Good pattern: +13-14
    domain_reputation: 75, // Good rep: +8
    corporate: true, // Corporate: +12
    free: false, // Not free provider
    disposable: false, // Not disposable
  },
  expectedScore: 92, // 40+15+14+12+8+3 = 92
};

// Test Case 2: Free Email Provider (Outlook.com)
// Expected: MEDIUM-HIGH confidence via combined signals
const testCase2 = {
  email: "jane.smith@outlook.com",
  scenario: "Known free provider - Outlook",
  expectedValidation: {
    verified_via: "combined",
    verification_confidence: "medium",
  },
  signals: {
    mx_record: "outlook-com.olc.protection.outlook.com",
    spf: true,
    dkim: true,
    dmarc: true,
    pattern_score: 88,
    domain_reputation: 85,
    corporate: false,
    free: true, // Free provider - knows good security
    provider: "Microsoft Outlook",
  },
  // Score: 40+15+13+8+2+8 = 86 (known provider bonus)
  expectedScore: 86,
};

// Test Case 3: Small Business (limited DNS)
// Expected: MEDIUM confidence - partial signals
const testCase3 = {
  email: "contact@smallbiz.company",
  scenario: "Small business with partial DNS records",
  expectedValidation: {
    verified_via: "combined",
    verification_confidence: "medium",
  },
  signals: {
    mx_record: "mail.smallbiz.company", // +40
    spf: true, // +5
    dkim: false, // Missing
    dmarc: false, // Missing
    pattern_score: 86, // +12-13
    domain_reputation: 60, // +4
    corporate: true,
    free: false,
    role: false,
  },
  // Score: 40+5+13+12+4 = 74
  expectedScore: 74,
};

// Test Case 4: Role-Based Email (reduced penalty)
// Expected: LOW-MEDIUM confidence - role email
const testCase4 = {
  email: "admin@company.com",
  scenario: "Role-based email address",
  expectedValidation: {
    verified_via: "combined",
    verification_confidence: "low",
  },
  signals: {
    mx_record: "mail.company.com",
    spf: true,
    dkim: true,
    dmarc: true,
    pattern_score: 85,
    domain_reputation: 70,
    role: true, // Role email: -5
    corporate: true,
  },
  // Score: 40+15+12+12+6-5 = 80 (but role penalty applies)
  expectedScore: 75,
};

// Test Case 5: Railway Deployment (SMTP Blocked)
// Expected: SMTP skipped, but validation continues
const testCase5 = {
  email: "user@enterprise.com",
  scenario: "Email validated on Railway (port 25 blocked)",
  expectedValidation: {
    verified_via: "dns_security",
    verification_confidence: "high",
    smtpBlocked: true,
    smtp_skipped_reason: "Port 25 blocked on Railway platform",
  },
  signals: {
    mx_record: "outlook.com",
    spf: true,
    dkim: true,
    dmarc: true,
    pattern_score: 90,
    domain_reputation: 80,
    corporate: true,
  },
  expectedScore: 89,
};

// Test Case 6: Low Confidence (MX only)
// Expected: PATTERN_ONLY - no DNS records found
const testCase6 = {
  email: "random@littleknown.io",
  scenario: "Domain with only MX record (no DNS security)",
  expectedValidation: {
    verified_via: "pattern",
    verification_confidence: "low",
  },
  signals: {
    mx_record: "mail.littleknown.io", // +40
    spf: false,
    dkim: false,
    dmarc: false,
    pattern_score: 75, // +11
    domain_reputation: 40, // 0
    corporate: true, // +12
  },
  // Score: 40+11+12 = 63 (lower confidence)
  expectedScore: 63,
};

// Test Case 7: Should Fail - Disposable Domain
// Expected: Valid=false, score=0
const testCase7 = {
  email: "random@tempmail.io",
  scenario: "Disposable/temporary email provider",
  expectedValidation: {
    valid: false,
    verified_via: null,
    verification_confidence: null,
  },
  signals: {
    disposable: true, // Automatic fail
  },
  expectedScore: 0,
};

// Test Case 8: Should Fail - Typo Detected
// Expected: Valid=false, score=5
const testCase8 = {
  email: "user@gmial.com", // Typo: gmial vs gmail
  scenario: "Domain with detected typo",
  expectedValidation: {
    valid: false,
    reason: "typo",
  },
  signals: {
    typo: true,
  },
  expectedScore: 5,
};

// Scoring Breakdown Summary
const scoringBreakdown = `
SCORING BREAKDOWN (0-100 scale)

Foundation:
├─ MX Record Present: +40 points (REQUIRED - no MX = invalid)
└─ Pattern Quality: 0-15 points (based on email format quality)

DNS Security Signals (0-35 points total):
├─ All 3 records (SPF+DKIM+DMARC): +15 points ⭐
├─ 2 records: +10 points
├─ 1 record: +5 points
└─ 0 records: 0 points

Domain Classification (0-20 points):
├─ Corporate domain:
│  ├─ Base: +12 points
│  └─ With 2+ DNS records bonus: +3 points
├─ Free provider (Gmail/Outlook/etc):
│  ├─ Base: +8 points
│  └─ With good security bonus: +2 points
└─ Unknown domain: +0 points

Penalties:
├─ Role-based email (admin@, support@, etc): -5 points
├─ Accept-all domain (accepts any address): -8 points
└─ Breach history (multiple compromises): Variable

Other Bonuses:
├─ Domain Reputation: 0-8 points
├─ SMTP Verified: +8 points (if available)
├─ Excellent security posture: +3-7 bonus points
└─ No known breaches: +3 points

CONFIDENCE LEVELS:

HIGH (90+):
- SMTP verified directly, OR
- All DNS records present + MX + good pattern

MEDIUM (70-89):
- 2+ DNS records + MX + good signals
- Known provider (Gmail/Outlook) + valid pattern
- Strong pattern + good reputation

LOW (50-69):
- MX record only
- Limited DNS signals
- Mixed positive/negative indicators

INVALID (<50):
- No MX record
- Disposable domain
- Typo detected
- Multiple breaches
- Domain reputation critical
`;

console.log(scoringBreakdown);

export {
  testCase1,
  testCase2,
  testCase3,
  testCase4,
  testCase5,
  testCase6,
  testCase7,
  testCase8,
};
