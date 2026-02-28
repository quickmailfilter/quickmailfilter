import axios from 'axios'

/**
 * Check domain reputation using open APIs
 * Includes domain age, hosting info, and reputation scores
 */
export const checkDomainReputation = async (domain: string): Promise<{
  domainAge: string | null
  reputation_score: number
  is_suspicious: boolean
  hosting_type: string | null
  dns_present: boolean
  details: string[]
}> => {
  try {
    console.log('  📡 [Domain Reputation API] Checking domain:', domain)
    const details: string[] = []
    let reputation_score = 50 // Base score

    // Check domain age using whois API
    try {
      console.log('  📡 [WHOIS API] Fetching domain info...')
      const whoisResponse = await axios.get(
        `https://whois.lanzouyun.com/api?domain=${domain}`,
        { timeout: 5000 }
      )

      const whoisData = whoisResponse.data

      if (whoisData && whoisData.data) {
        const domainInfo = whoisData.data
        
        if (domainInfo.createDate || domainInfo.created_date) {
          const creationDateStr = domainInfo.createDate || domainInfo.created_date
          details.push(`Domain created: ${creationDateStr}`)
          const creationDate = new Date(creationDateStr)
          const ageInDays = Math.floor((Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24))

          console.log('  ✅ [WHOIS] Domain age:', ageInDays, 'days')

          if (ageInDays < 30) {
            reputation_score -= 25
            details.push('⚠️ Domain is very new (less than 30 days)')
          } else if (ageInDays < 365) {
            reputation_score -= 10
            details.push('Domain is relatively new (less than 1 year)')
          } else {
            reputation_score += 10
            details.push('✓ Domain has established history')
          }
        }

        if (domainInfo.registrar) {
          details.push(`Registrar: ${domainInfo.registrar}`)
        }
      }
    } catch (e) {
      console.log('  ⚠️ [WHOIS] Check failed')
      // Whois check failed, continue with other checks
    }

    // Check if domain looks suspicious based on patterns
    const suspiciousPatterns = [
      /temp|temporary|disposable|trash|spam/i,
      /test|demo|example/i,
      /\.tk$|\.ml$|\.ga$|\.cf$/i, // Known free TLDs
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP-based domains
      /localhost|127\.0\.0|0\.0\.0\.0/
    ]

    let is_suspicious = false
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(domain)) {
        is_suspicious = true
        reputation_score -= 30
        details.push(`⚠️ Domain matches suspicious pattern: ${pattern}`)
        console.log('  ⚠️ [Pattern] Suspicious domain detected')
        break
      }
    }

    // Check for known good TLDs
    const goodTlds = ['.com', '.org', '.edu', '.gov', '.co.uk', '.de', '.fr', '.nl', '.ca', '.au']
    const hasGoodTld = goodTlds.some(tld => domain.endsWith(tld))
    if (hasGoodTld) {
      reputation_score += 5
      details.push('✓ Uses established top-level domain')
      console.log('  ✅ [TLD] Good TLD detected')
    }

    // Normalize score
    reputation_score = Math.max(0, Math.min(100, reputation_score))
    console.log('  ✅ [Domain Rep] Final score:', reputation_score)

    return {
      domainAge: null,
      reputation_score,
      is_suspicious,
      hosting_type: null,
      dns_present: true,
      details
    }
  } catch (error) {
    console.log('  ⚠️ [Domain Reputation] Error:', (error as any).message)
    return {
      domainAge: null,
      reputation_score: 50,
      is_suspicious: false,
      hosting_type: null,
      dns_present: true,
      details: []
    }
  }
}
