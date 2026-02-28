import { ElementType } from '../types'

const OrderedLevels = ['regex', 'typo', 'disposable', 'mx', 'smtp', 'pattern', 'domain_reputation', 'breach'] as const

export type SubOutputFormat = {
  valid: boolean
  reason?: string
}

type Level = ElementType<typeof OrderedLevels>

export interface GeneralOutputFormat extends SubOutputFormat {
  reason?: Level
  disposable?: boolean
  role?: boolean
  roleType?: string | null
  free?: boolean
  accept_all?: boolean
  user?: string
  domain?: string
  mx_record?: string
  mx_domain?: string
  provider?: string | null
  suggestions?: string[]
  spf?: boolean
  dkim?: boolean
  dmarc?: boolean
  security_score?: number
  domainStatus?: 'corporate' | 'free' | 'disposable' | 'suspicious' | 'invalid' | 'typo' | 'unknown' | 'risky' | 'compromised'
  smtpVerified?: boolean
  smtpBlocked?: boolean
  // New fields for additional verification
  breached?: boolean
  breachCount?: number
  breaches?: string[]
  domain_reputation?: number
  domain_reputation_details?: string[]
  pattern_score?: number
  pattern_issues?: string[]
  pattern_warnings?: string[]
}

export type OutputFormat = GeneralOutputFormat & {
  validators: {
    [K in Level]?: SubOutputFormat
  }
}

export const createOutput = (
  failLevel?: Level,
  failReason?: string,
  enrichedData?: Partial<GeneralOutputFormat>
): OutputFormat => {
  const out: OutputFormat = { valid: true, validators: {}, ...enrichedData }
  if (failLevel) {
    out.reason = failLevel
    out.valid = false
  }
  let valid = true
  for (let i = 0; i < OrderedLevels.length; i++) {
    const level = OrderedLevels[i]
    const levelOut: SubOutputFormat = { valid }
    if (level === failLevel) {
      valid = false
      levelOut.valid = false
      levelOut.reason = failReason
    }
    out.validators[level] = levelOut
  }
  return out
}
