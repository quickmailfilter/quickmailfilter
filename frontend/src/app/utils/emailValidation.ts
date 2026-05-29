export interface EmailValidationResult {
  valid: boolean;
  normalized: string;
  error?: string;
}

const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_PART_LENGTH = 64;
const MAX_DOMAIN_LENGTH = 253;
const MAX_DOMAIN_LABEL_LENGTH = 63;
const LOCAL_PART_REGEX = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/i;
const DOMAIN_LABEL_REGEX = /^[A-Z0-9-]+$/i;
const TLD_REGEX = /^[A-Z]{2,}$/i;

export const normalizeEmailInput = (email: string) =>
  email.trim().toLowerCase();

export const validateEmailInput = (emailInput: string): EmailValidationResult => {
  const normalized = normalizeEmailInput(emailInput || "");

  if (!normalized) {
    return {
      valid: false,
      normalized,
      error: "Please enter an email address",
    };
  }

  if (/\s/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: "Email address cannot contain spaces",
    };
  }

  if (normalized.length > MAX_EMAIL_LENGTH) {
    return {
      valid: false,
      normalized,
      error: "Email address is too long",
    };
  }

  const parts = normalized.split("@");
  if (parts.length !== 2) {
    return {
      valid: false,
      normalized,
      error: 'Email address must contain exactly one "@" symbol',
    };
  }

  const [localPart, domain] = parts;
  if (!localPart || !domain) {
    return {
      valid: false,
      normalized,
      error: "Email address must include both a name and domain",
    };
  }

  if (localPart.length > MAX_LOCAL_PART_LENGTH) {
    return {
      valid: false,
      normalized,
      error: "Email name is too long",
    };
  }

  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..")
  ) {
    return {
      valid: false,
      normalized,
      error: "Email name cannot start, end, or contain consecutive dots",
    };
  }

  if (!LOCAL_PART_REGEX.test(localPart)) {
    return {
      valid: false,
      normalized,
      error: "Email name contains unsupported characters",
    };
  }

  if (domain.length > MAX_DOMAIN_LENGTH) {
    return {
      valid: false,
      normalized,
      error: "Email domain is too long",
    };
  }

  const labels = domain.split(".");
  if (labels.length < 2) {
    return {
      valid: false,
      normalized,
      error: 'Email domain must contain a "."',
    };
  }

  if (labels.some((label) => !label)) {
    return {
      valid: false,
      normalized,
      error: "Email domain cannot contain empty sections",
    };
  }

  const invalidLabel = labels.find(
    (label) =>
      label.length > MAX_DOMAIN_LABEL_LENGTH ||
      label.startsWith("-") ||
      label.endsWith("-") ||
      !DOMAIN_LABEL_REGEX.test(label),
  );

  if (invalidLabel) {
    return {
      valid: false,
      normalized,
      error:
        "Email domain can only use letters, numbers, hyphens, and valid dots",
    };
  }

  const tld = labels[labels.length - 1];
  if (!TLD_REGEX.test(tld)) {
    return {
      valid: false,
      normalized,
      error: "Email domain must end with a valid extension",
    };
  }

  return { valid: true, normalized };
};

export const isValidEmailInput = (email: string) =>
  validateEmailInput(email).valid;
