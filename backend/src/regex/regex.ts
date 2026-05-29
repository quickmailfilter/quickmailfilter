const MAX_EMAIL_LENGTH = 254
const MAX_LOCAL_PART_LENGTH = 64
const MAX_DOMAIN_LENGTH = 253
const MAX_DOMAIN_LABEL_LENGTH = 63
const LOCAL_PART_REGEX = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/i
const DOMAIN_LABEL_REGEX = /^[A-Z0-9-]+$/i
const TLD_REGEX = /^[A-Z]{2,}$/i

export const normalizeEmail = (email: string): string =>
  (email || '').trim().toLowerCase()

export const getEmailFormatError = (emailInput: string): string | undefined => {
  const email = normalizeEmail(emailInput)

  if (email.length === 0) {
    return 'Email not provided'
  }

  if (/\s/.test(email)) {
    return 'Email cannot contain spaces'
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return 'Email exceeds maximum length'
  }

  const split = email.split('@')
  if (split.length !== 2) {
    return 'Email must contain exactly one "@".'
  }

  const [localPart, domain] = split
  if (!localPart || !domain) {
    return 'Email must include both local and domain parts'
  }

  if (localPart.length > MAX_LOCAL_PART_LENGTH) {
    return 'Local part exceeds 64 characters'
  }

  if (
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..')
  ) {
    return 'Local part cannot start, end, or contain consecutive dots'
  }

  if (!LOCAL_PART_REGEX.test(localPart)) {
    return 'Local part contains invalid characters'
  }

  if (domain.length > MAX_DOMAIN_LENGTH) {
    return 'Domain exceeds 253 characters'
  }

  const labels = domain.split('.')
  if (labels.length < 2) {
    return 'Must contain a "." after the "@".'
  }

  if (labels.some(label => label.length === 0)) {
    return 'Domain contains empty parts'
  }

  const invalidLabel = labels.find(
    label =>
      label.length > MAX_DOMAIN_LABEL_LENGTH ||
      label.startsWith('-') ||
      label.endsWith('-') ||
      !DOMAIN_LABEL_REGEX.test(label),
  )

  if (invalidLabel) {
    return 'Domain contains invalid characters'
  }

  const tld = labels[labels.length - 1]
  if (!TLD_REGEX.test(tld)) {
    return 'Domain must end with a valid extension'
  }
}

export const isEmail = (email: string): string | undefined => {
  return getEmailFormatError(email)
}
