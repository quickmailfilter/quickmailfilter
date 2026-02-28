/**
 * Advanced email pattern and format validation
 * Detects suspicious patterns, format issues, and common typos
 */
export const validateEmailPattern = (email: string): {
  valid: boolean
  score: number
  issues: string[]
  warnings: string[]
} => {
  const issues: string[] = []
  const warnings: string[] = []
  let score = 100

  const [localPart, domain] = email.split('@')

  // Local part validations
  if (localPart) {
    // Too long
    if (localPart.length > 64) {
      issues.push('Local part exceeds 64 characters')
      score -= 20
    }

    // Starts or ends with dot
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      issues.push('Local part starts or ends with a dot')
      score -= 15
    }

    // Consecutive dots
    if (localPart.includes('..')) {
      issues.push('Local part contains consecutive dots')
      score -= 15
    }

    // Only numbers
    if (/^\d+$/.test(localPart)) {
      warnings.push('Local part contains only numbers - potentially suspicious')
      score -= 5
    }

    // Suspicious keywords
    const suspiciousKeywords = ['admin', 'root', 'test', 'temp', 'fake', 'spam', 'noreply', 'no-reply', 'bounce']
    if (suspiciousKeywords.some(keyword => localPart.toLowerCase().includes(keyword))) {
      warnings.push('Local part contains suspicious keyword')
      score -= 10
    }

    // Too many special characters
    const specialCharCount = (localPart.match(/[!#$%&'*+\-/=?^_`{|}~]/g) || []).length
    if (specialCharCount > 3) {
      warnings.push('Local part contains many special characters')
      score -= 5
    }

    // Good patterns
    if (/^[a-z0-9]+\.[a-z0-9]+$/.test(localPart)) {
      score += 5 // First.Last pattern is good
    }

    if (/^[a-z0-9_-]+$/.test(localPart)) {
      score += 3 // Simple alphanumeric pattern
    }
  }

  // Domain validations
  if (domain) {
    // Domain too long
    if (domain.length > 255) {
      issues.push('Domain exceeds 255 characters')
      score -= 20
    }

    // Invalid characters in domain
    if (!/^[a-z0-9.-]+$/.test(domain.toLowerCase())) {
      issues.push('Domain contains invalid characters')
      score -= 20
    }

    // Subdomain issues
    const parts = domain.split('.')
    if (parts.some(part => part.length === 0)) {
      issues.push('Domain contains empty parts')
      score -= 15
    }

    if (parts.some(part => part.startsWith('-') || part.endsWith('-'))) {
      issues.push('Domain parts start or end with hyphen')
      score -= 15
    }

    // Single letter parts (suspicious)
    if (parts.some(part => part.length === 1)) {
      warnings.push('Domain contains single-letter parts')
      score -= 5
    }

    // Too many subdomains (suspicious)
    if (parts.length > 4) {
      warnings.push('Domain has many subdomains')
      score -= 5
    }

    // Known good domains get bonus
    const knownGoodDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com']
    if (knownGoodDomains.includes(domain.toLowerCase())) {
      score += 5
    }
  }

  // Overall format check using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    issues.push('Email does not match standard format')
    score -= 20
  }

  // Normalize score
  score = Math.max(0, Math.min(100, score))

  return {
    valid: issues.length === 0,
    score,
    issues,
    warnings
  }
}
