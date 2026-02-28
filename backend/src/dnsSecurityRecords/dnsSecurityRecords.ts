/**
 * Check SPF, DKIM, and DMARC records for domain
 */

import dns from 'dns'
import { promisify } from 'util'

const resolveTxt = promisify(dns.resolveTxt)

interface DKIMRecord {
  exists: boolean
  record?: string
}

interface SPFRecord {
  exists: boolean
  record?: string
  valid: boolean
}

interface DMARCRecord {
  exists: boolean
  record?: string
  policy?: string
}

interface DNSSecurityRecords {
  spf: SPFRecord
  dkim: DKIMRecord
  dmarc: DMARCRecord
}

/**
 * Check SPF record
 */
export const checkSPF = async (domain: string): Promise<SPFRecord> => {
  try {
    const records = await resolveTxt(domain)
    const spfRecord = records.find((record: string[]) =>
      record.join('').startsWith('v=spf1')
    )

    if (spfRecord) {
      return {
        exists: true,
        record: spfRecord.join(''),
        valid: true
      }
    }

    return { exists: false, valid: false }
  } catch {
    return { exists: false, valid: false }
  }
}

/**
 * Check DKIM record (using default selector)
 */
export const checkDKIM = async (domain: string, selector: string = 'default'): Promise<DKIMRecord> => {
  try {
    const dkimDomain = `${selector}._domainkey.${domain}`
    const records = await resolveTxt(dkimDomain)

    if (records && records.length > 0) {
      return {
        exists: true,
        record: records.map((r: string[]) => r.join('')).join('')
      }
    }

    return { exists: false }
  } catch {
    return { exists: false }
  }
}

/**
 * Check DMARC record
 */
export const checkDMARC = async (domain: string): Promise<DMARCRecord> => {
  try {
    const dmarcDomain = `_dmarc.${domain}`
    const records = await resolveTxt(dmarcDomain)

    if (records && records.length > 0) {
      const record = records.map((r: string[]) => r.join('')).join('')
      
      // Extract policy
      const policyMatch = record.match(/p=(\w+)/)
      const policy = policyMatch ? policyMatch[1] : undefined

      return {
        exists: true,
        record,
        policy
      }
    }

    return { exists: false }
  } catch {
    return { exists: false }
  }
}

/**
 * Check all DNS security records
 */
export const checkDNSSecurityRecords = async (domain: string): Promise<DNSSecurityRecords> => {
  const [spf, dmarc] = await Promise.all([
    checkSPF(domain),
    checkDMARC(domain)
  ])

  // Try multiple common DKIM selectors
  const commonSelectors = ['default', 'selector1', 'selector2', 'google', 'mail', '_domainkey']
  let dkim = { exists: false }

  for (const selector of commonSelectors) {
    const result = await checkDKIM(domain, selector)
    if (result.exists) {
      dkim = result
      break
    }
  }

  return {
    spf,
    dkim,
    dmarc
  }
}

/**
 * Get security score based on DNS records (0-100)
 */
export const getDomainSecurityScore = (records: DNSSecurityRecords): number => {
  let score = 0

  // SPF: 30 points
  if (records.spf.exists && records.spf.valid) {
    score += 30
  } else if (records.spf.exists) {
    score += 15
  }

  // DKIM: 35 points
  if (records.dkim.exists) {
    score += 35
  }

  // DMARC: 35 points
  if (records.dmarc.exists) {
    score += 30
    // Extra points for strict DMARC policy
    if (records.dmarc.policy === 'reject') {
      score += 5
    } else if (records.dmarc.policy === 'quarantine') {
      score += 2
    }
  }

  return Math.min(100, score)
}
