import { isEmail } from './regex/regex'
import { checkTypo } from './typo/typo'
import { getBestMx } from './dns/dns'
import { checkSMTP, checkCatchAll, isBlockingService } from './smtp/smtp'
import { checkDisposable } from './disposable/disposable'
import { getOptions, ValidatorOptions } from './options/options'
import { OutputFormat, createOutput } from './output/output'
import { isRoleEmail, getRoleType } from './roleDetection/roleDetection'
import { isFreeEmail, getProviderName } from './freeEmailDetection/freeEmailDetection'
import { checkDNSSecurityRecords } from './dnsSecurityRecords/dnsSecurityRecords'
import { checkBreachStatus } from './breachDetection/breachDetection'
import { checkDomainReputation } from './domainReputation/domainReputation'
import { validateEmailPattern } from './emailPatternValidation/emailPatternValidation'
import { checkExtraDisposableSources } from './extraDisposableCheck/extraDisposableCheck'
import './types'

/**
 * Calculate deliverability score based on all factors
 * Score: 0-100 (higher = more likely deliverable)
 * Professional-grade scoring - works with or without SMTP
 */
function calculateDeliverabilityScore(data: any): number {
  let score = 0
  
  // CRITICAL CHECKS - Disqualifiers
  if (data.disposable) return 0 // Disposable emails always invalid
  if (data.typo) return 5 // Detected typo = very risky
  if (data.breached && data.breachCount > 5) return 10 // Multiple breaches = risky
  
  // Base score for having valid MX records (40 points)
  // This is the most important factor without SMTP
  if (data.mx_record && data.mx_domain) {
    score += 40
  } else {
    return 0 // No MX record = invalid
  }
  
  // Pattern quality scoring (15 points max) - Enhanced for SMTP-unavailable scenarios
  // High pattern score = legitimate looking email
  if (data.pattern_score) {
    const patternBonus = Math.floor((data.pattern_score / 100) * 15)
    score += patternBonus
  }
  
  // DNS Security (35 points total) - CRITICAL for no-SMTP validation
  // Boosted from 25 to 35 when SMTP is not available
  const dnsCount = (data.spf ? 1 : 0) + (data.dkim ? 1 : 0) + (data.dmarc ? 1 : 0)
  if (dnsCount === 3) {
    // Perfect DNS security score = +15 (all three records valid)
    score += 15
  } else if (dnsCount === 2) {
    // Two records present = +10
    score += 10
  } else if (dnsCount === 1) {
    // One record = +5
    score += 5
  }
  
  // Domain Type Scoring (20 points max)
  if (!data.free && !data.disposable) {
    // Corporate/Business domain = high trustworthiness
    score += 12
    // Extra bonus if corporation has strong DNS security
    if (dnsCount >= 2) score += 3
  } else if (data.free && !data.disposable) {
    // Known free email providers (Gmail, Outlook, etc) = trustworthy
    // These providers have strong security and reputation
    score += 8
    // Extra bonus if provider has all DNS records (usually they do)
    if (dnsCount >= 2) score += 2
  }
  
  // Role-based emails penalty (reduced from -8 to -5 for combined validation)
  if (data.role) {
    score -= 5 // Role emails are less common but not necessarily invalid
  }
  
  // Accept-all domains penalty (reduced from -15 to -8)
  if (data.accept_all) {
    score -= 8 // Accept-all domains are less reliable but not invalid
  }
  
  // SMTP verification result (8 points max - less critical now)
  if (data.smtpVerified) {
    score += 8
  } else if (data.smtpBlocked) {
    // Server blocked verification but passed other checks
    // Add +5 for strong non-SMTP signals
    score += 3
  }
  
  // Breach check bonus
  if (data.breached === false && !data.breachCount) {
    score += 3 // Not in any known breach
  }
  
  // Domain reputation scoring (15 points total)
  if (data.domain_reputation > 70) {
    score += 8 // Excellent reputation
  } else if (data.domain_reputation > 50) {
    score += 4 // Good reputation
  } else if (data.domain_reputation < 30) {
    score -= 8 // Poor reputation
  }
  
  // BONUS: Excellent security posture without SMTP
  // If domain has strong DNS records + good pattern + good reputation = extra confidence
  if (!data.free && !data.disposable && dnsCount === 3 && data.pattern_score > 80 && data.domain_reputation > 60) {
    score += 7 // Confidence bonus
  } else if ((data.free || !data.disposable) && dnsCount === 3 && data.pattern_score > 70) {
    score += 3 // Confidence bonus for free email providers with good signals
  }
  
  return Math.max(0, Math.min(100, score))
}

/**
 * Determine verification confidence and method
 * @param data Enriched email data with all validation results
 * @param smtpWasSkipped Whether SMTP validation was skipped/unavailable
 */
function determineVerificationMethod(data: any, smtpWasSkipped: boolean): { verified_via: string; confidence: string } {
  // If SMTP was successful, that's the definitive verification method
  if (data.smtpVerified && !smtpWasSkipped) {
    return { verified_via: 'smtp', confidence: 'high' }
  }
  
  // Count strong signals
  const dnsScore = (data.spf ? 1 : 0) + (data.dkim ? 1 : 0) + (data.dmarc ? 1 : 0)
  const patternGood = data.pattern_score > 80
  const patternDecent = data.pattern_score > 70
  const reputationExcellent = data.domain_reputation > 70
  const reputationGood = data.domain_reputation > 60
  const hasMX = !!data.mx_record
  
  // SMTP was blocked - evaluate alternative signals
  if (smtpWasSkipped) {
    // Best case: All DNS records + MX + good signals
    if (dnsScore === 3 && hasMX && reputationGood && patternGood) {
      return { verified_via: 'dns_security', confidence: 'high' }
    }
    // Good case: All DNS records + MX + decent signals
    if (dnsScore === 3 && hasMX) {
      return { verified_via: 'dns_security', confidence: 'medium' }
    }
    // Medium case: Multiple DNS + MX + good reputation
    if (dnsScore >= 2 && hasMX && reputationGood) {
      return { verified_via: 'combined', confidence: 'medium' }
    }
    // Medium case: MX + strong pattern + good reputation
    if (hasMX && patternGood && reputationGood) {
      return { verified_via: 'combined', confidence: 'medium' }
    }
    // Low case: MX present with some confidence
    if (hasMX && patternDecent) {
      return { verified_via: 'mx_record', confidence: 'low' }
    }
  }
  
  // Fallback: Pattern-only validation (least reliable)
  return { verified_via: 'pattern', confidence: 'low' }
}

export async function validate(emailOrOptions: string | ValidatorOptions): Promise<OutputFormat> {
  const options = getOptions(emailOrOptions)
  const email = options.email.trim().toLowerCase()
  // Generate unique ID for this validation to track logs
  const validationId = `${email}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  console.log(`\n🔍 [VALIDATION START] ID:${validationId} Email: ${email}`)
  console.log(`📋 [${validationId}] Options:`, { validateRegex: options.validateRegex, validateTypo: options.validateTypo, validateDisposable: options.validateDisposable, validateMx: options.validateMx, validateSMTP: options.validateSMTP })
  
  // Parse email parts
  const atIndex = email.lastIndexOf('@')
  if (atIndex === -1) {
    console.log('❌ [REGEX] No @ symbol found')
    return createOutput('regex', 'Email does not contain "@".', {})
  }

  const localPart = email.substring(0, atIndex)
  const domain = email.substring(atIndex + 1)
  console.log('📧 Parsed - Local:', localPart, '| Domain:', domain)

  // Initialize enriched data with defaults
  const enrichedData: any = {
    user: localPart,
    domain: domain,
    disposable: false,
    role: false,
    roleType: null,
    free: false,
    accept_all: false,
    mx_record: '',
    mx_domain: '',
    provider: null,
    spf: false,
    dkim: false,
    dmarc: false,
    security_score: 0,
    domainStatus: 'unknown',
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
    verified_via: 'pattern',
    verification_confidence: 'low',
    smtp_skipped_reason: null
  }

  // Step 1: Regex validation
  if (options.validateRegex) {
    const regexResponse = isEmail(email)
    if (regexResponse) {
      return createOutput('regex', regexResponse, {})
    }
  }

  // Step 2: Role detection (non-blocking, just info)
  enrichedData.role = isRoleEmail(email)
  enrichedData.roleType = getRoleType(email)

  // Step 3: Free email detection
  enrichedData.free = isFreeEmail(domain)
  enrichedData.provider = getProviderName(domain)

  // Step 3.5: Enhanced email pattern validation (NEW)
  const patternValidation = validateEmailPattern(email)
  enrichedData.pattern_score = patternValidation.score
  enrichedData.pattern_issues = patternValidation.issues
  enrichedData.pattern_warnings = patternValidation.warnings
  console.log('✅ [PATTERN VALIDATION] Score:', patternValidation.score, '| Issues:', patternValidation.issues.length, '| Warnings:', patternValidation.warnings.length)

  if (!patternValidation.valid) {
    console.log('❌ [PATTERN] Email has format issues')
    return createOutput('pattern', 'Email format issues detected', enrichedData)
  }

  // Step 3.6: Extra disposable check using open APIs (NEW)
  try {
    console.log('🔄 [EXTRA DISPOSABLE CHECK] Checking via open APIs...')
    const extraDisposableCheck = await checkExtraDisposableSources(domain)
    console.log('✅ [DISPOSABLE] Result:', { isDisposable: extraDisposableCheck.isDisposable, source: extraDisposableCheck.source, confidence: extraDisposableCheck.confidence })
    if (extraDisposableCheck.isDisposable) {
      console.log('❌ [DISPOSABLE] Domain is disposable')
      enrichedData.disposable = true
      return createOutput('disposable', `Disposable domain detected via ${extraDisposableCheck.source}`, enrichedData)
    }
  } catch (e) {
    console.log('⚠️ [DISPOSABLE] Check failed, continuing...')
    // Continue if check fails
  }

  // Step 3.7: Domain reputation check (NEW)
  try {
    console.log('🔄 [DOMAIN REPUTATION] Checking domain reputation...')
    const domainRepCheck = await checkDomainReputation(domain)
    console.log('✅ [DOMAIN REP] Score:', domainRepCheck.reputation_score, '| Suspicious:', domainRepCheck.is_suspicious)

    if (domainRepCheck.is_suspicious && domainRepCheck.reputation_score < 40) {
      console.log('❌ [DOMAIN REP] Domain reputation too low')
      return createOutput('domain_reputation', 'Domain reputation is too low', enrichedData)
    }
    enrichedData.domain_reputation = domainRepCheck.reputation_score
    enrichedData.domain_reputation_details = domainRepCheck.details
  } catch (e) {
    console.log('⚠️ [DOMAIN REP] Check failed, continuing...')
    // Continue if check fails
  }

  // Step 4: Typo detection
  if (options.validateTypo) {
    const typoResponse = await checkTypo(email, options.additionalTopLevelDomains)
    if (typoResponse) {
      return createOutput('typo', typoResponse, {})
    }
  }

  // Step 5: Disposable email check
  if (options.validateDisposable) {
    console.log('🔄 [DISPOSABLE] Checking built-in disposable list...')
    const disposableResponse = await checkDisposable(domain)
    if (disposableResponse) {
      console.log('❌ [DISPOSABLE] Found in disposable list')
      enrichedData.disposable = true
      return createOutput('disposable', disposableResponse, {})
    }
    console.log('✅ [DISPOSABLE] Not in built-in list')
    enrichedData.disposable = false
  }

  // Step 6: MX record check
  if (options.validateMx) {
    console.log('🔄 [MX RECORD] Checking MX records...')
    const mx = await getBestMx(domain)
    if (!mx) {
      console.log('❌ [MX] No MX record found')
      return createOutput('mx', 'MX record not found', {})
    }

    console.log('✅ [MX] Found:', mx.exchange)
    enrichedData.mx_record = mx.exchange
    
    // Extract the main domain from MX record
    const mxParts = mx.exchange.split('.')
    if (mxParts.length >= 2) {
      enrichedData.mx_domain = mxParts.slice(-2).join('.')
    } else {
      enrichedData.mx_domain = mx.exchange
    }

    // Step 7: DNS Security Records check
    try {
      console.log('🔄 [DNS SECURITY] Checking SPF, DKIM, DMARC...')
      const securityRecords = await checkDNSSecurityRecords(domain)
      enrichedData.spf = securityRecords.spf.exists && securityRecords.spf.valid
      enrichedData.dkim = securityRecords.dkim.exists
      enrichedData.dmarc = securityRecords.dmarc.exists
      console.log('✅ [DNS SECURITY] SPF:', enrichedData.spf, '| DKIM:', enrichedData.dkim, '| DMARC:', enrichedData.dmarc)
    } catch (err) {
      console.log('⚠️ [DNS SECURITY] Check failed')
      enrichedData.spf = false
      enrichedData.dkim = false
      enrichedData.dmarc = false
    }

    // Step 8: Check for mail protection services
    // These services intentionally block SMTP verification
    const isMailProtected = isBlockingService(mx.exchange)
    
    // Step 9: SMTP verification (optional, only for non-protected domains)
    // Skip SMTP on Railway (port 25 is blocked)
    const isOnRailway = process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PUBLIC_DOMAIN
    if (options.validateSMTP && !isOnRailway) {
      console.log('🔄 [SMTP] Starting SMTP verification...')
      const smtpResult = await checkSMTP(options.sender, email, mx.exchange)
      
      // Extract SMTP-specific data
      enrichedData.smtpVerified = smtpResult.valid && !smtpResult.blocked
      enrichedData.smtpBlocked = smtpResult.blocked || false
      enrichedData.accept_all = smtpResult.accept_all || false
      console.log('✅ [SMTP] Valid:', smtpResult.valid, '| Blocked:', smtpResult.blocked, '| Reason:', smtpResult.reason)
      
      // Check for catch-all if SMTP passed and not blocked
      if (smtpResult.valid && !enrichedData.smtpBlocked) {
        try {
          console.log('🔄 [CATCH-ALL] Checking if catch-all domain...')
          const isCatchAll = await checkCatchAll(options.sender, domain, mx.exchange)
          enrichedData.accept_all = isCatchAll
          console.log('✅ [CATCH-ALL] Result:', isCatchAll)
        } catch (e) {
          console.log('⚠️ [CATCH-ALL] Check failed')
          // Catch-all check failed, leave as false
        }
      }

      // Return result based on SMTP validation
      if (!smtpResult.valid) {
        // Definitively invalid email
        console.log('❌ [SMTP] Email validation failed')
        return createOutput('smtp', smtpResult.reason, enrichedData)
      } else {
        // SMTP passed - now check for breaches (NEW)
        try {
          console.log('🔄 [BREACH CHECK] Checking HaveIBeenPwned API...')
          const breachStatus = await checkBreachStatus(email)
          enrichedData.breached = breachStatus.breached
          enrichedData.breachCount = breachStatus.breachCount
          enrichedData.breaches = breachStatus.breaches
          console.log('✅ [BREACH] Status:', { breached: breachStatus.breached, count: breachStatus.breachCount })
          
          if (breachStatus.compromised) {
            console.log('❌ [BREACH] Email found in', breachStatus.breachCount, 'breach(es)')
            enrichedData.domainStatus = 'compromised'
            enrichedData.security_score = 0
            return createOutput('breach', `Email found in ${breachStatus.breachCount} known data breach(es)`, enrichedData)
          }
        } catch (e) {
          console.log('⚠️ [BREACH] Check failed or rate limited')
          // Breach check failed, continue
        }

        // SMTP passed successfully
        enrichedData.domainStatus = enrichedData.disposable ? 'disposable' : enrichedData.free ? 'free' : 'corporate'
        enrichedData.security_score = calculateDeliverabilityScore(enrichedData)
        enrichedData.verified_via = 'smtp'
        enrichedData.verification_confidence = 'high'
        console.log('✅ [VALIDATION SUCCESS] Final Score:', enrichedData.security_score, '| Status:', enrichedData.domainStatus, '| Verified via: SMTP')
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
            breach_check: { valid: !enrichedData.breached }
          }
        }
      }
    } else if (isOnRailway && options.validateSMTP) {
      // SMTP validation requested but skipped on Railway - use DNS/MX validation only
      console.log('⚠️ [SMTP] Skipped on Railway (port 25 blocked) - using DNS/MX validation only')
      enrichedData.smtpVerified = false
      enrichedData.smtpBlocked = true
      enrichedData.smtp_skipped_reason = 'Port 25 blocked on Railway platform'
      
      // For Railway and blocked SMTP: Perform breach check for valid patterns
      try {
        console.log('🔄 [BREACH CHECK] Checking HaveIBeenPwned API (SMTP blocked)...')
        const breachStatus = await checkBreachStatus(email)
        enrichedData.breached = breachStatus.breached
        enrichedData.breachCount = breachStatus.breachCount
        enrichedData.breaches = breachStatus.breaches
        console.log('✅ [BREACH] Status:', { breached: breachStatus.breached, count: breachStatus.breachCount })
        
        if (breachStatus.compromised) {
          console.log('❌ [BREACH] Email found in', breachStatus.breachCount, 'breach(es)')
          enrichedData.domainStatus = 'compromised'
          enrichedData.security_score = 0
          return createOutput('breach', `Email found in ${breachStatus.breachCount} known data breach(es)`, enrichedData)
        }
      } catch (e) {
        console.log('⚠️ [BREACH] Check failed or rate limited (SMTP blocked scenario)')
      }
    }

    // === VALIDATION PATH WITHOUT SMTP ===
    // When SMTP is not available, use strong combination of DNS + Pattern + Reputation
    
    // Determine if we should validate this without SMTP
    const dnsSecurityScore = (enrichedData.spf ? 1 : 0) + (enrichedData.dkim ? 1 : 0) + (enrichedData.dmarc ? 1 : 0)
    const hasStrongDNS = dnsSecurityScore >= 2
    const hasStrongPattern = enrichedData.pattern_score > 80
    const hasGoodReputation = enrichedData.domain_reputation > 60
    
    // Determine if this looks like a valid email based on non-SMTP signals
    let isValid = false
    let confidenceLevel: 'high' | 'medium' | 'low' = 'low'
    let failReason: string | null = null
    
    if (!enrichedData.mx_record) {
      // CRITICAL: No MX record = definitely invalid
      failReason = 'No MX record found for domain'
      console.log('❌ [NO-SMTP VALIDATION] No MX record - invalid email')
    } else if (hasStrongDNS) {
      // Strong DNS signals + MX = definitely valid email
      isValid = true
      confidenceLevel = 'high'
      console.log('✅ [NO-SMTP VALIDATION] Strong DNS signals detected - marking as valid')
    } else if (hasStrongPattern && hasGoodReputation) {
      // Strong pattern + good reputation + MX = likely valid
      isValid = true
      confidenceLevel = 'medium'
      console.log('✅ [NO-SMTP VALIDATION] Strong pattern + reputation signals - marking as valid')
    } else if (enrichedData.free && enrichedData.pattern_score > 70) {
      // Free email provider (Gmail/Outlook) with MX + good pattern = definitely valid
      isValid = true
      confidenceLevel = 'medium'
      console.log('✅ [NO-SMTP VALIDATION] Free email provider with valid signals - marking as valid')
    } else if (!enrichedData.role && enrichedData.pattern_score > 75) {
      // Not a role email, good pattern, and MX present = likely valid (low confidence)
      isValid = true
      confidenceLevel = 'low'
      console.log('⚠️ [NO-SMTP VALIDATION] MX record and good pattern found - low confidence')
    } else {
      // Insufficient signals to verify
      failReason = 'Insufficient validation signals without SMTP (no DNS records, weak pattern, or role-based)'
      console.log('❌ [NO-SMTP VALIDATION] Insufficient signals - cannot confirm validity')
    }
    
    // Determine domain status (no SMTP validation)
    if (enrichedData.disposable) {
      enrichedData.domainStatus = 'disposable'
    } else if (enrichedData.free) {
      enrichedData.domainStatus = 'free'
    } else {
      enrichedData.domainStatus = 'corporate'
    }
    
    enrichedData.security_score = calculateDeliverabilityScore(enrichedData)
    
    // Determine verification method
    const verificationInfo = determineVerificationMethod(enrichedData, !enrichedData.smtpVerified)
    enrichedData.verified_via = verificationInfo.verified_via
    enrichedData.verification_confidence = verificationInfo.confidence
    
    console.log('📊 [FINAL RESULT] Score:', enrichedData.security_score, '| Valid:', isValid, '| Verified via:', enrichedData.verified_via, '| Confidence:', enrichedData.verification_confidence)
    
    // Return consistent response with validators object
    if (!isValid && failReason) {
      return createOutput('smtp', failReason, enrichedData)
    }
    
    return {
      valid: true,
      ...enrichedData,
      validators: {
        regex: { valid: true },
        typo: { valid: true },
        disposable: { valid: true },
        mx: { valid: true },
        smtp: { valid: false, reason: 'Skipped - validation via DNS/Pattern' },
        pattern: { valid: enrichedData.pattern_score > 70 },
        domain_reputation: { valid: enrichedData.domain_reputation > 40 },
        breach_check: { valid: !enrichedData.breached }
      }
    }
  }

  // No MX validation or not requested - MX check is required
  // At this point, MX validation was requested but not performed
  // This should only happen if MX lookup failed
  return createOutput('mx', 'MX record lookup required but not performed', enrichedData)
}

export default validate
