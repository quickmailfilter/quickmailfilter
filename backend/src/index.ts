import { isEmail } from "./regex/regex";
import { checkTypo } from "./typo/typo";
import { getBestMx } from "./dns/dns";
import {
  checkSMTP,
  checkCatchAll,
  isBlockingService,
  isCatchAllGateway,
} from "./smtp/smtp";
import { checkDisposable } from "./disposable/disposable";
import { getOptions, ValidatorOptions } from "./options/options";
import { OutputFormat, createOutput } from "./output/output";
import { isRoleEmail, getRoleType } from "./roleDetection/roleDetection";
import {
  isFreeEmail,
  getProviderName,
} from "./freeEmailDetection/freeEmailDetection";
import { checkDNSSecurityRecords } from "./dnsSecurityRecords/dnsSecurityRecords";
import { checkBreachStatus } from "./breachDetection/breachDetection";
import { checkDomainReputation } from "./domainReputation/domainReputation";
import { validateEmailPattern } from "./emailPatternValidation/emailPatternValidation";
import { checkExtraDisposableSources } from "./extraDisposableCheck/extraDisposableCheck";
import "./types";

/**
 * WORLD-CLASS EMAIL VALIDATOR SCORING ENGINE
 * Sophisticated multi-factor validation algorithm
 * Highly effective even when SMTP is blocked or unavailable
 */
function calculateDeliverabilityScore(data: any): number {
  let score = 0;
  const maxScore = 100;

  // ===== CRITICAL DISQUALIFIERS (return early if true) =====
  // Disposable emails are always invalid - these are temporary addresses
  if (data.disposable) return 0;

  // Very high confidence typos (>90%) = extremely risky
  if (data.typo && data.typo_confidence > 0.9) return 8;

  // Email compromised in 10+ breaches across critical databases
  if (data.breached && data.breachCount > 10) return 15;

  // ===== FOUNDATION: EMAIL PATTERN QUALITY (25 POINTS) =====
  // A well-formatted email is the cornerstone of deliverability
  if (data.pattern_score && data.pattern_score < 20) {
    return 10; // Severely malformed
  }
  if (data.pattern_score) {
    // More lenient scoring: 65+ pattern = almost full points
    let patternScore = Math.floor((data.pattern_score / 100) * 25);
    if (data.pattern_score > 85) patternScore = 25; // Perfect pattern
    if (data.pattern_score > 75) patternScore = 23; // Excellent pattern
    if (data.pattern_score > 65) patternScore = 21; // Good pattern
    score += patternScore;
  }

  // ===== MX RECORD VALIDATION (30 POINTS) =====
  // Valid MX record = domain actively receives email
  if (data.mx_record && data.mx_domain) {
    score += 30; // Definitive: domain has mail servers
  } else if (!data.mx_checked) {
    // MX wasn't checked (shouldn't happen) - still give benefit
    score += 15;
  } else {
    // MX lookup failed - could be temporary DNS issue or invalid domain
    // Don't disqualify completely - score will determine validity
    score += 8; // Small baseline for other signals
  }

  // ===== DNS SECURITY RECORDS (25 POINTS) =====
  // SPF, DKIM, DMARC = strong authentication and anti-spoofing measures
  // These are GOLD for no-SMTP validation
  const dnsCount =
    (data.spf ? 1 : 0) + (data.dkim ? 1 : 0) + (data.dmarc ? 1 : 0);

  if (dnsCount === 3) {
    // All three records present = bank-level email security
    score += 25;
  } else if (dnsCount === 2) {
    // Two records = very strong (most enterprise domains)
    score += 18;
  } else if (dnsCount === 1) {
    // One record = basic security (still good)
    score += 10;
  } else {
    // No DNS records = weaker but not invalid
    // Free providers like Gmail may not have DMARC
    if (data.free) {
      score += 5; // Free providers inherently trusted
    } else {
      score += 2; // Corporate domain without DNS records is concerning
    }
  }

  // ===== DOMAIN TYPE CLASSIFICATION (15 POINTS) =====
  if (!data.free && !data.disposable) {
    // Corporate/Business domain = legitimate organization
    score += 12;
    // Extra bonus if they have strong security infrastructure
    if (dnsCount >= 2) score += 3;
  } else if (data.free && !data.disposable) {
    // Known free email providers (Gmail, Outlook, Yahoo, etc)
    // These have excellent infrastructure and reputation
    score += 10;
    // Free providers usually have all DNS records
    if (dnsCount >= 2) score += 2;
  }

  // ===== DOMAIN REPUTATION SCORING (20 POINTS) =====
  // Reputation helps identify compromised/phishing domains
  if (data.domain_reputation > 80) {
    score += 20; // Pristine reputation
  } else if (data.domain_reputation > 70) {
    score += 18; // Excellent reputation
  } else if (data.domain_reputation > 60) {
    score += 14; // Good reputation
  } else if (data.domain_reputation > 50) {
    score += 10; // Neutral/acceptable reputation
  } else if (data.domain_reputation > 40) {
    score += 5; // Below average but not terrible
  } else if (data.domain_reputation < 25) {
    score -= 15; // Suspicious domain
  } else {
    score += 0; // Critical: very low reputation
  }

  // ===== ROLE-BASED EMAIL PENALTY (-5 POINTS) =====
  // Role emails (admin@, support@, info@) are less common in real use
  // But they're VALID and used by organizations
  if (data.role) {
    score -= 5; // Slight penalty, not disqualifying
  }

  // ===== CATCH-ALL/ACCEPT-ALL PENALTY (-8 POINTS) =====
  // Accept-all domains accept ANY email, increasing bounce risk
  if (data.accept_all) {
    score -= 8;
  }

  // ===== BREACH HISTORY (-0 to -10 POINTS) =====
  // Emails in data breaches might be compromised/monitored
  if (data.breached) {
    if (data.breachCount <= 2) {
      score -= 5; // Minor incident
    } else if (data.breachCount <= 5) {
      score -= 8; // Multiple incidents
    } else {
      score -= 10; // Many incidents (but not auto-disqualify)
    }
  } else {
    // Not in any known breach database = positive signal
    score += 3;
  }

  // ===== SMTP VERIFICATION RESULT (15 POINTS MAX) =====
  // Only if SMTP was actually attempted and succeeded
  if (data.smtpVerified && !data.smtpBlocked) {
    score += 15; // SMTP confirmed delivery = highest confidence for that signal
  } else if (data.smtpBlocked) {
    // Server blocked verification - this is NORMAL for enterprise
    // SMTP blockage does NOT mean the email is invalid
    // Give bonus for strong alternative signals
    if (dnsCount >= 2 && data.pattern_score > 75) {
      score += 8; // Strong alternative signals present
    } else if (data.mx_record) {
      score += 4; // At least MX record exists
    } else {
      score += 0; // Neutral - no confirmation but not proven invalid
    }
  } else if (data.smtp_error) {
    // SMTP error (timeout, connection refused, etc)
    // This is temporary - don't penalize harshly
    if (data.mx_record && data.pattern_score > 75) {
      score += 2; // Small credit for other signals
    } else {
      score += 0; // Neutral
    }
  }

  // ===== TYPO DETECTION INTELLIGENCE =====
  // Typo confidence gradient (not binary)
  if (data.typo) {
    if (data.typo_confidence > 0.9) {
      score -= 15; // Very high confidence typo
    } else if (data.typo_confidence > 0.75) {
      score -= 10; // High confidence typo
    } else if (data.typo_confidence > 0.6) {
      score -= 5; // Medium confidence typo
    } else if (data.typo_confidence > 0.4) {
      score -= 2; // Low confidence typo (could be legitimate)
    }
    // Very low confidence typo doesn't penalize
  }

  // ===== CONFIDENCE BONUS WHEN MULTIPLE STRONG SIGNALS =====
  // When SMTP is unavailable/blocked, strong alternative signals = high confidence
  if (!data.smtpVerified && data.mx_record) {
    // Multiple strong signals without SMTP
    const strongSignals = [
      dnsCount >= 2, // Multiple DNS records
      data.pattern_score > 80, // Excellent pattern
      data.domain_reputation > 60, // Good reputation
      !data.free && !data.disposable, // Corporate domain
    ].filter(Boolean).length;

    if (strongSignals >= 3) {
      score += 10; // Multi-factor validation bonus
    } else if (strongSignals >= 2) {
      score += 5; // Dual-factor validation bonus
    }
  }

  // ===== ENSURE VALID RANGE =====
  // CRITICAL: Without actual SMTP verification we cannot guarantee a mailbox exists.
  // Cap confidence at 82 when SMTP was not completed successfully.
  // This prevents false 100% scores from DNS signals alone.
  if (!data.smtpVerified) {
    score = Math.min(score, 82);
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Determine verification method with intelligent SMTP blockage handling
 * Returns precise information about how the email was validated
 */
function determineVerificationMethod(
  data: any,
  smtpUnavailable: boolean,
): { verified_via: string; confidence: string } {
  // SMTP verification was successful - definitive
  if (data.smtpVerified && !data.smtpBlocked) {
    return { verified_via: "smtp", confidence: "high" };
  }

  // Count confidence signals
  const dnsScore =
    (data.spf ? 1 : 0) + (data.dkim ? 1 : 0) + (data.dmarc ? 1 : 0);
  const patternGood = data.pattern_score > 80;
  const patternDecent = data.pattern_score > 70;
  const reputationExcellent = data.domain_reputation > 75;
  const reputationGood = data.domain_reputation > 60;
  const hasMX = !!data.mx_record;
  const isEnterprise = !data.free && !data.disposable;

  // SMTP was blocked or unavailable - evaluate alternative validation
  if (smtpUnavailable || data.smtpBlocked) {
    // Score-based multi-factor validation
    if (data.security_score >= 80) {
      // Excellent score with strong alternative signals
      if (dnsScore === 3 && hasMX && patternGood && reputationExcellent) {
        return {
          verified_via: "organization_dns_validated",
          confidence: "high",
        };
      } else if (isEnterprise && dnsScore >= 2 && hasMX && patternGood) {
        return {
          verified_via: "enterprise_domain_validated",
          confidence: "high",
        };
      } else {
        return { verified_via: "multi_factor_validation", confidence: "high" };
      }
    } else if (data.security_score >= 65) {
      // Good score - reasonable confidence in alternative signals
      if (dnsScore >= 2 && hasMX) {
        return { verified_via: "dns_security_validated", confidence: "medium" };
      } else if (hasMX && patternGood && reputationGood) {
        return { verified_via: "mx_pattern_reputation", confidence: "medium" };
      } else {
        return {
          verified_via: "multi_factor_validation",
          confidence: "medium",
        };
      }
    } else if (data.security_score >= 50) {
      // Moderate score - low to medium confidence
      if (hasMX && patternDecent) {
        return { verified_via: "mx_record_validated", confidence: "low" };
      } else {
        return { verified_via: "pattern_analysis", confidence: "low" };
      }
    } else {
      // Below threshold - insufficient signals
      return { verified_via: "insufficient_signals", confidence: "low" };
    }
  }

  // Fallback for edge cases
  if (hasMX && patternGood) {
    return { verified_via: "mx_record_validated", confidence: "medium" };
  } else if (patternGood && data.domain_reputation > 50) {
    return { verified_via: "pattern_analysis", confidence: "low" };
  }

  return { verified_via: "incomplete_validation", confidence: "low" };
}

export async function validate(
  emailOrOptions: string | ValidatorOptions,
): Promise<OutputFormat> {
  const options = getOptions(emailOrOptions);
  const email = options.email.trim().toLowerCase();
  // Generate unique ID for this validation to track logs
  const validationId = `${email}-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  console.log(`\n🔍 [VALIDATION START] ID:${validationId} Email: ${email}`);
  console.log(`📋 [${validationId}] Options:`, {
    validateRegex: options.validateRegex,
    validateTypo: options.validateTypo,
    validateDisposable: options.validateDisposable,
    validateMx: options.validateMx,
    validateSMTP: options.validateSMTP,
  });

  // Parse email parts
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) {
    console.log("❌ [REGEX] No @ symbol found");
    return createOutput("regex", 'Email does not contain "@".', {});
  }

  const localPart = email.substring(0, atIndex);
  const domain = email.substring(atIndex + 1);
  console.log("📧 Parsed - Local:", localPart, "| Domain:", domain);

  // Initialize enriched data with defaults
  const enrichedData: any = {
    user: localPart,
    domain: domain,
    disposable: false,
    role: false,
    roleType: null,
    free: false,
    accept_all: false,
    mx_record: "",
    mx_domain: "",
    provider: null,
    spf: false,
    dkim: false,
    dmarc: false,
    security_score: 0,
    domainStatus: "unknown",
    smtpVerified: false,
    smtpBlocked: false,
    // New verification fields
    breached: false,
    breachCount: 0,
    breaches: [],
    domain_reputation: 50,
    domain_reputation_details: [],
    pattern_score: 100,
    pattern_issues: [],
    pattern_warnings: [],
    // Verification method tracking
    verified_via: "pattern",
    verification_confidence: "low",
    smtp_skipped_reason: null,
  };

  // Step 1: Regex validation
  if (options.validateRegex) {
    const regexResponse = isEmail(email);
    if (regexResponse) {
      return createOutput("regex", regexResponse, {});
    }
  }

  // Step 2: Role detection (non-blocking, just info)
  enrichedData.role = isRoleEmail(email);
  enrichedData.roleType = getRoleType(email);

  // Step 3: Free email detection
  enrichedData.free = isFreeEmail(domain);
  enrichedData.provider = getProviderName(domain);

  // Step 3.5: Enhanced email pattern validation (NEW)
  const patternValidation = validateEmailPattern(email);
  enrichedData.pattern_score = patternValidation.score;
  enrichedData.pattern_issues = patternValidation.issues;
  enrichedData.pattern_warnings = patternValidation.warnings;
  console.log(
    "✅ [PATTERN VALIDATION] Score:",
    patternValidation.score,
    "| Issues:",
    patternValidation.issues.length,
    "| Warnings:",
    patternValidation.warnings.length,
  );

  if (!patternValidation.valid) {
    console.log("❌ [PATTERN] Email has format issues");
    return createOutput(
      "pattern",
      "Email format issues detected",
      enrichedData,
    );
  }

  // Step 3.6: Extra disposable check using open APIs (NEW)
  try {
    console.log("🔄 [EXTRA DISPOSABLE CHECK] Checking via open APIs...");
    const extraDisposableCheck = await checkExtraDisposableSources(domain);
    console.log("✅ [DISPOSABLE] Result:", {
      isDisposable: extraDisposableCheck.isDisposable,
      source: extraDisposableCheck.source,
      confidence: extraDisposableCheck.confidence,
    });
    if (extraDisposableCheck.isDisposable) {
      console.log("❌ [DISPOSABLE] Domain is disposable");
      enrichedData.disposable = true;
      return createOutput(
        "disposable",
        `Disposable domain detected via ${extraDisposableCheck.source}`,
        enrichedData,
      );
    }
  } catch (e) {
    console.log("⚠️ [DISPOSABLE] Check failed, continuing...");
    // Continue if check fails
  }

  // Step 3.7: Domain reputation check (NEW)
  try {
    console.log("🔄 [DOMAIN REPUTATION] Checking domain reputation...");
    const domainRepCheck = await checkDomainReputation(domain);
    console.log(
      "✅ [DOMAIN REP] Score:",
      domainRepCheck.reputation_score,
      "| Suspicious:",
      domainRepCheck.is_suspicious,
    );

    if (domainRepCheck.is_suspicious && domainRepCheck.reputation_score < 40) {
      console.log("❌ [DOMAIN REP] Domain reputation too low");
      return createOutput(
        "domain_reputation",
        "Domain reputation is too low",
        enrichedData,
      );
    }
    enrichedData.domain_reputation = domainRepCheck.reputation_score;
    enrichedData.domain_reputation_details = domainRepCheck.details;
  } catch (e) {
    console.log("⚠️ [DOMAIN REP] Check failed, continuing...");
    // Continue if check fails
  }

  // Step 4: Typo detection (non-blocking for scoring)
  if (options.validateTypo) {
    try {
      const typoCheck = await checkTypo(
        email,
        options.additionalTopLevelDomains,
      );
      if (typoCheck) {
        // Typo detected - will affect scoring
        console.log("⚠️ [TYPO] Detected:", typoCheck);
        enrichedData.typo = true;
        // checkTypo returns message like "Likely typo, suggested email: ..."
        // Try to extract confidence level (would be 75% or 0%)
        enrichedData.typo_confidence = 0.75; // Default to medium confidence
        const suggestionEmail = typoCheck.split("suggested email: ")[1];
        enrichedData.suggestions = suggestionEmail ? [suggestionEmail] : [];
        // DON'T return early - let scoring handle it
      } else {
        enrichedData.typo = false;
        enrichedData.typo_confidence = 0;
      }
    } catch (e) {
      console.log("⚠️ [TYPO] Check failed, continuing...");
      enrichedData.typo = false;
      enrichedData.typo_confidence = 0;
    }
  }

  // Step 5: Disposable email check
  if (options.validateDisposable) {
    console.log("🔄 [DISPOSABLE] Checking built-in disposable list...");
    const disposableResponse = await checkDisposable(domain);
    if (disposableResponse) {
      console.log("❌ [DISPOSABLE] Found in disposable list");
      enrichedData.disposable = true;
      return createOutput("disposable", disposableResponse, {});
    }
    console.log("✅ [DISPOSABLE] Not in built-in list");
    enrichedData.disposable = false;
  }

  // Step 6: MX record check (with intelligent fallback)
  if (options.validateMx) {
    console.log("🔄 [MX RECORD] Checking MX records...");
    const mx = await getBestMx(domain);
    if (!mx) {
      console.log(
        "⚠️ [MX] No MX record found - will use alternative validation signals",
      );
      enrichedData.mx_record = "";
      enrichedData.mx_domain = "";
      enrichedData.mx_checked = true;
      enrichedData.smtpVerified = false;
      enrichedData.smtpBlocked = true;
      enrichedData.smtp_skipped_reason = "No MX record found";

      // DNS security records are domain-based — check them even without MX
      try {
        console.log("🔄 [DNS SECURITY] Checking SPF, DKIM, DMARC (no MX)...");
        const securityRecords = await checkDNSSecurityRecords(domain);
        enrichedData.spf =
          securityRecords.spf.exists && securityRecords.spf.valid;
        enrichedData.dkim = securityRecords.dkim.exists;
        enrichedData.dmarc = securityRecords.dmarc.exists;
        console.log(
          "✅ [DNS SECURITY] SPF:",
          enrichedData.spf,
          "| DKIM:",
          enrichedData.dkim,
          "| DMARC:",
          enrichedData.dmarc,
        );
      } catch (err) {
        console.log("⚠️ [DNS SECURITY] Check failed");
        enrichedData.spf = false;
        enrichedData.dkim = false;
        enrichedData.dmarc = false;
      }

      // Calculate score using full scoring engine (it already handles missing MX)
      enrichedData.security_score = calculateDeliverabilityScore(enrichedData);

      // Stricter threshold when no MX: need strong alternative signals
      // If free provider domain somehow has no MX, be lenient (DNS outage)
      const noMxThreshold = enrichedData.free ? 40 : 55;
      const isValid = enrichedData.security_score >= noMxThreshold;

      enrichedData.domainStatus = enrichedData.disposable
        ? "disposable"
        : enrichedData.security_score < 70
        ? "risky"
        : enrichedData.free
        ? "free"
        : "corporate";

      const verificationInfo = determineVerificationMethod(enrichedData, true);
      enrichedData.verified_via = verificationInfo.verified_via;
      enrichedData.verification_confidence = verificationInfo.confidence;

      console.log(
        `📊 [NO-MX VALIDATION] Score: ${enrichedData.security_score}/${noMxThreshold} | Valid: ${isValid}`,
      );

      if (!isValid) {
        return createOutput(
          "mx",
          `No MX record found and insufficient alternative signals (Score: ${enrichedData.security_score}/100)`,
          enrichedData,
        );
      }

      return {
        valid: true,
        isValid: true,
        ...enrichedData,
        validators: {
          regex: { valid: true },
          typo: {
            valid: !enrichedData.typo || enrichedData.typo_confidence <= 0.9,
          },
          disposable: { valid: !enrichedData.disposable },
          mx: {
            valid: false,
            reason: "No MX record — validated via alternative DNS signals",
          },
          smtp: {
            valid: false,
            reason: "Skipped — no MX record",
            skipped_reason: enrichedData.smtp_skipped_reason,
          },
          pattern: { valid: enrichedData.pattern_score > 70 },
          domain_reputation: { valid: enrichedData.domain_reputation > 40 },
        },
      };
    } else {
      console.log("✅ [MX] Found:", mx.exchange);
      enrichedData.mx_record = mx.exchange;
      enrichedData.mx_checked = true;

      // Extract the main domain from MX record
      const mxParts = mx.exchange.split(".");
      if (mxParts.length >= 2) {
        enrichedData.mx_domain = mxParts.slice(-2).join(".");
      } else {
        enrichedData.mx_domain = mx.exchange;
      }

      // Step 7: DNS Security Records check (only if MX exists)
      try {
        console.log("🔄 [DNS SECURITY] Checking SPF, DKIM, DMARC...");
        const securityRecords = await checkDNSSecurityRecords(domain);
        enrichedData.spf =
          securityRecords.spf.exists && securityRecords.spf.valid;
        enrichedData.dkim = securityRecords.dkim.exists;
        enrichedData.dmarc = securityRecords.dmarc.exists;
        console.log(
          "✅ [DNS SECURITY] SPF:",
          enrichedData.spf,
          "| DKIM:",
          enrichedData.dkim,
          "| DMARC:",
          enrichedData.dmarc,
        );
      } catch (err) {
        console.log("⚠️ [DNS SECURITY] Check failed");
        enrichedData.spf = false;
        enrichedData.dkim = false;
        enrichedData.dmarc = false;
      }

      // Step 8: Classify the MX server type
      const isMailProtected = isBlockingService(mx.exchange);
      const isCatchAllMX = isCatchAllGateway(mx.exchange);

      if (isCatchAllMX) {
        // TRUE CATCH-ALL GATEWAY (O365, Proofpoint, Mimecast, etc.)
        // These services accept ALL mail at the SMTP relay level and route/filter
        // internally. Regardless of whether we can connect on port 25, the RCPT TO
        // response will always be 250 — making individual mailbox verification
        // impossible. Industry standard is to classify these as "catch-all".
        console.log(
          "🔵 [CATCH-ALL GATEWAY]",
          mx.exchange,
          "— accepts all mail at relay level. Marking as catch-all without SMTP attempt.",
        );
        enrichedData.accept_all = true;
        enrichedData.smtpBlocked = true;
        enrichedData.smtpVerified = false;
        enrichedData.smtp_skipped_reason = `Catch-all relay gateway: ${mx.exchange} accepts all addresses at SMTP level`;
      } else if (isMailProtected) {
        console.log(
          "🛡️  [SMTP BLOCKER]",
          mx.exchange,
          "— blocks external probing. SMTP attempted but will likely fail.",
        );
      }

      // Step 9: SMTP verification — skip entirely for known catch-all gateways
      // Skip SMTP on Railway (port 25 is blocked)
      const isOnRailway =
        process.env.RAILWAY_ENVIRONMENT_NAME ||
        process.env.RAILWAY_PUBLIC_DOMAIN;
      if (options.validateSMTP && !isOnRailway && !isCatchAllMX) {
        console.log("🔄 [SMTP] Starting SMTP verification on port 25...");
        let smtpResult = await checkSMTP(
          options.sender,
          email,
          mx.exchange,
          25,
        );

        // If port 25 was outright refused (ECONNREFUSED), try port 587 as fallback.
        // Some networks block port 25 outbound but allow port 587.
        if (smtpResult.portRefused) {
          console.log("⚠️  [SMTP] Port 25 refused — retrying on port 587...");
          smtpResult = await checkSMTP(options.sender, email, mx.exchange, 587);
        }

        // Extract SMTP-specific data
        enrichedData.smtpVerified = smtpResult.valid && !smtpResult.blocked;
        enrichedData.smtpBlocked = smtpResult.blocked || false;
        enrichedData.accept_all = smtpResult.accept_all || false;
        console.log(
          "✅ [SMTP] Valid:",
          smtpResult.valid,
          "| Blocked:",
          smtpResult.blocked,
          "| Reason:",
          smtpResult.reason,
        );

        // Note: enterprise mail gateways (Mimecast, Proofpoint, O365) block SMTP
        // verification probes — this does NOT mean the domain is catch-all.
        // Catch-all specifically means the server accepts ANY address including fake
        // ones. These are different concepts. Fall through to multi-factor scoring.
        if (smtpResult.blocked && isMailProtected) {
          enrichedData.smtp_skipped_reason = `Enterprise mail gateway (${mx.exchange}) blocks SMTP verification — validated via domain signals`;
          console.log(
            "🛡️  [SMTP] Enterprise gateway blocked probe — using multi-factor domain validation",
          );
        }

        // Check for catch-all if SMTP passed and not blocked
        if (smtpResult.valid && !enrichedData.smtpBlocked) {
          try {
            console.log("🔄 [CATCH-ALL] Checking if catch-all domain...");
            const isCatchAll = await checkCatchAll(
              options.sender,
              domain,
              mx.exchange,
            );
            enrichedData.accept_all = isCatchAll;
            console.log("✅ [CATCH-ALL] Result:", isCatchAll);
          } catch (e) {
            console.log("⚠️ [CATCH-ALL] Check failed");
            // Catch-all check failed, leave as false
          }
        }

        // Return result based on SMTP validation
        if (!smtpResult.valid) {
          // Check if this is a DEFINITIVE failure (mailbox doesn't exist)
          if (smtpResult.definitive) {
            // SMTP gave us a definitive answer - MUST reject the email
            // Don't fall back to multi-factor validation
            console.log(
              "❌ [SMTP DEFINITIVE] Mailbox does not exist - REJECTING email (not using multi-factor fallback)",
            );
            enrichedData.smtpVerified = false;
            enrichedData.smtpBlocked = false; // This is NOT a block, it's a hard reject
            enrichedData.smtp_error = smtpResult.reason;
            enrichedData.security_score = 0; // Score is 0 - email is definitely invalid
            enrichedData.domainStatus = "invalid";

            return createOutput(
              "smtp",
              "Mailbox does not exist (SMTP verification)",
              enrichedData,
            );
          }

          // SMTP failed but not definitively (blocked, timeout, etc) - fall through to multi-factor
          // SMTP FAILED - but don't return early!
          // Set flags and fall through to multi-factor validation
          console.log(
            "⚠️  [SMTP] Failed with reason:",
            smtpResult.reason,
            "| Using multi-factor validation",
          );
          enrichedData.smtpVerified = false;
          enrichedData.smtpBlocked = smtpResult.blocked || false;
          enrichedData.smtp_error = smtpResult.reason;

          // For breach check, try to see if email is compromised
          try {
            console.log("🔄 [BREACH CHECK] Checking HaveIBeenPwned API...");
            const breachStatus = await checkBreachStatus(email);
            enrichedData.breached = breachStatus.breached;
            enrichedData.breachCount = breachStatus.breachCount;
            enrichedData.breaches = breachStatus.breaches;
            console.log("✅ [BREACH] Status:", {
              breached: breachStatus.breached,
              count: breachStatus.breachCount,
            });

            // Only fail on severe compromise
            if (breachStatus.compromised && breachStatus.breachCount > 10) {
              console.log(
                "❌ [BREACH] Email found in",
                breachStatus.breachCount,
                "breach(es) - REJECTING",
              );
              enrichedData.domainStatus = "compromised";
              enrichedData.security_score = 0;
              return createOutput(
                "breach",
                `Email found in ${breachStatus.breachCount} critical data breach(es)`,
                enrichedData,
              );
            }
          } catch (e) {
            console.log("⚠️ [BREACH] Check failed, continuing...");
          }

          // DON'T RETURN - fall through to multi-factor validation!
        } else {
          // SMTP PASSED - email confirmed valid
          try {
            console.log("🔄 [BREACH CHECK] Checking HaveIBeenPwned API...");
            const breachStatus = await checkBreachStatus(email);
            enrichedData.breached = breachStatus.breached;
            enrichedData.breachCount = breachStatus.breachCount;
            enrichedData.breaches = breachStatus.breaches;
            console.log("✅ [BREACH] Status:", {
              breached: breachStatus.breached,
              count: breachStatus.breachCount,
            });

            if (breachStatus.compromised) {
              console.log(
                "❌ [BREACH] Email found in",
                breachStatus.breachCount,
                "breach(es)",
              );
              enrichedData.domainStatus = "compromised";
              enrichedData.security_score = 0;
              return createOutput(
                "breach",
                `Email found in ${breachStatus.breachCount} known data breach(es)`,
                enrichedData,
              );
            }
          } catch (e) {
            console.log("⚠️ [BREACH] Check failed or rate limited");
            // Breach check failed, continue
          }

          // SMTP passed successfully
          enrichedData.domainStatus = enrichedData.disposable
            ? "disposable"
            : enrichedData.free
            ? "free"
            : "corporate";
          enrichedData.security_score =
            calculateDeliverabilityScore(enrichedData);
          enrichedData.verified_via = "smtp";
          enrichedData.verification_confidence = "high";
          console.log(
            "✅ [VALIDATION SUCCESS] Final Score:",
            enrichedData.security_score,
            "| Status:",
            enrichedData.domainStatus,
            "| Verified via: SMTP",
          );
          return {
            valid: true,
            ...enrichedData,
            validators: {
              regex: { valid: true },
              typo: { valid: true },
              disposable: { valid: true },
              mx: { valid: true },
              smtp: { valid: true },
              pattern: { valid: patternValidation.valid },
              domain_reputation: { valid: enrichedData.domain_reputation > 40 },
              breach_check: { valid: !enrichedData.breached },
            },
          };
        }
      } else if ((isOnRailway && options.validateSMTP) || isCatchAllMX) {
        // SMTP skipped: either Railway blocks port 25, or domain is a catch-all gateway.
        // catch-all gateways already have accept_all=true set above.
        if (isOnRailway) {
          console.log(
            "⚠️ [SMTP] Skipped on Railway (port 25 blocked) - using DNS/MX validation only",
          );
          enrichedData.smtpVerified = false;
          enrichedData.smtpBlocked = true;
          enrichedData.smtp_skipped_reason =
            "Port 25 blocked on Railway platform";
        } else {
          console.log(
            "🔵 [SMTP] Skipped — catch-all gateway already classified",
          );
        }

        // For Railway and blocked SMTP: Perform breach check for valid patterns
        try {
          console.log(
            "🔄 [BREACH CHECK] Checking HaveIBeenPwned API (SMTP blocked)...",
          );
          const breachStatus = await checkBreachStatus(email);
          enrichedData.breached = breachStatus.breached;
          enrichedData.breachCount = breachStatus.breachCount;
          enrichedData.breaches = breachStatus.breaches;
          console.log("✅ [BREACH] Status:", {
            breached: breachStatus.breached,
            count: breachStatus.breachCount,
          });

          if (breachStatus.compromised) {
            console.log(
              "❌ [BREACH] Email found in",
              breachStatus.breachCount,
              "breach(es)",
            );
            enrichedData.domainStatus = "compromised";
            enrichedData.security_score = 0;
            return createOutput(
              "breach",
              `Email found in ${breachStatus.breachCount} known data breach(es)`,
              enrichedData,
            );
          }
        } catch (e) {
          console.log(
            "⚠️ [BREACH] Check failed or rate limited (SMTP blocked scenario)",
          );
        }
      }

      // === VALIDATION PATH WITHOUT SMTP ===
      // When SMTP is not available, use strong combination of DNS + Pattern + Reputation

      // Calculate security score using the improved algorithm
      enrichedData.security_score = calculateDeliverabilityScore(enrichedData);

      // Determine validity based on INTELLIGENT threshold
      // When SMTP is available: higher bar (60+)
      // When SMTP is blocked: trust other signals more (45+)
      // Pattern alone: moderate bar (55+)
      let scoreThreshold = 50;

      if (enrichedData.smtpBlocked || enrichedData.smtp_skipped_reason) {
        // SMTP was blocked/unavailable - be more lenient
        // Strong non-SMTP signals = credible validation
        scoreThreshold = 45;

        // Extra leniency if we have multiple strong signals
        if (enrichedData.mx_record && enrichedData.pattern_score > 75) {
          scoreThreshold = 40; // MX + good pattern + no SMTP = likely valid
        }
      }

      // If we have excellent alternative signals, lower threshold further
      const dnsSecurityCount =
        (enrichedData.spf ? 1 : 0) +
        (enrichedData.dkim ? 1 : 0) +
        (enrichedData.dmarc ? 1 : 0);
      if (dnsSecurityCount >= 2 && enrichedData.mx_record) {
        scoreThreshold = Math.min(scoreThreshold, 35);
      }

      const isValid = enrichedData.security_score >= scoreThreshold;

      // Determine confidence level based on score
      let confidenceLevel: "high" | "medium" | "low" = "low";
      if (enrichedData.security_score >= 85) {
        confidenceLevel = "high";
      } else if (enrichedData.security_score >= 65) {
        confidenceLevel = "medium";
      } else if (enrichedData.security_score >= 40) {
        confidenceLevel = "low";
      }

      // Determine fail reason if not valid
      let failReason: string | null = null;
      if (!isValid) {
        if (enrichedData.disposable) {
          failReason = "Disposable email detected";
        } else if (enrichedData.typo && enrichedData.typo_confidence > 0.9) {
          failReason = `Likely typo detected (${(
            enrichedData.typo_confidence * 100
          ).toFixed(0)}% confidence)`;
        } else if (enrichedData.pattern_score < 25) {
          failReason = "Invalid email format";
        } else if (enrichedData.breached && enrichedData.breachCount > 8) {
          failReason = `Email found in ${enrichedData.breachCount} data breaches`;
        } else {
          // Don't reject if score is just slightly below threshold
          if (enrichedData.security_score >= scoreThreshold - 5) {
            // Score is close to passing - might be worth accepting
            failReason = null;
            // Don't fail, we'll mark as valid with low confidence
          } else {
            failReason = `Insufficient validation signals (Score: ${enrichedData.security_score}/100)`;
          }
        }
      }

      if (failReason && enrichedData.security_score < scoreThreshold - 10) {
        console.log(
          `❌ [VALIDATION FAILED] Score: ${enrichedData.security_score}/100 - Reason: ${failReason}`,
        );
      } else if (isValid || enrichedData.security_score >= scoreThreshold - 5) {
        console.log(
          `✅ [VALIDATION PASSED] Score: ${enrichedData.security_score}/100 - Confidence: ${confidenceLevel}`,
        );
      }

      // Determine domain status
      if (enrichedData.disposable) {
        enrichedData.domainStatus = "disposable";
      } else if (
        enrichedData.security_score < 70 &&
        !enrichedData.smtpVerified
      ) {
        // Medium confidence without SMTP confirmation → risky
        enrichedData.domainStatus = "risky";
      } else if (enrichedData.free) {
        enrichedData.domainStatus = "free";
      } else {
        enrichedData.domainStatus = "corporate";
      }

      // Determine verification method - this is CRUCIAL for transparency
      const verificationInfo = determineVerificationMethod(
        enrichedData,
        enrichedData.smtpBlocked || enrichedData.smtp_skipped_reason !== null,
      );
      enrichedData.verified_via = verificationInfo.verified_via;
      enrichedData.verification_confidence = verificationInfo.confidence;

      console.log(
        `📊 [FINAL VALIDATION] Score: ${
          enrichedData.security_score
        }/${scoreThreshold} | Valid: ${
          isValid || enrichedData.security_score >= scoreThreshold - 5
        } | Method: ${
          enrichedData.verified_via
        } | Confidence: ${confidenceLevel}`,
      );

      // Return result based on final validity decision
      // NOTE: Score-based validation is valid even when SMTP is blocked
      const finalValid =
        isValid || enrichedData.security_score >= scoreThreshold - 5;

      if (
        !finalValid &&
        failReason &&
        enrichedData.security_score < scoreThreshold - 10
      ) {
        return createOutput("smtp", failReason, enrichedData);
      }

      return {
        valid: finalValid,
        isValid: finalValid,
        ...enrichedData,
        validators: {
          regex: { valid: true },
          typo: {
            valid: !enrichedData.typo || enrichedData.typo_confidence <= 0.9,
          },
          disposable: { valid: !enrichedData.disposable },
          mx: {
            valid: !!enrichedData.mx_record || enrichedData.security_score > 35,
          },
          smtp: {
            valid:
              enrichedData.smtpVerified ||
              enrichedData.security_score > scoreThreshold,
            reason: enrichedData.smtpVerified
              ? "Verified via SMTP"
              : "Using multi-factor validation (DNS/Pattern/Reputation)",
            skipped_reason: enrichedData.smtp_skipped_reason,
          },
          pattern: { valid: enrichedData.pattern_score > 70 },
          domain_reputation: { valid: enrichedData.domain_reputation > 40 },
          breach_check: {
            valid: !enrichedData.breached || enrichedData.breachCount <= 2,
          },
        },
      };
    }
  }

  // Reached only if validateMx option is false — validate via pattern only
  enrichedData.security_score = calculateDeliverabilityScore(enrichedData);
  const patternOnlyValid = enrichedData.security_score >= 60;
  return {
    valid: patternOnlyValid,
    isValid: patternOnlyValid,
    ...enrichedData,
    validators: {
      regex: { valid: true },
      typo: {
        valid: !enrichedData.typo || enrichedData.typo_confidence <= 0.9,
      },
      disposable: { valid: !enrichedData.disposable },
      mx: { valid: false, reason: "MX validation skipped" },
      smtp: { valid: false, reason: "SMTP validation skipped" },
      pattern: { valid: enrichedData.pattern_score > 70 },
      domain_reputation: { valid: enrichedData.domain_reputation > 40 },
    },
  };
}

export default validate;
