/**
 * Detects if an email is a role-based address
 * Role addresses are typically not assigned to individuals (admin@, support@, info@, etc.)
 */

const rolePatterns = [
  'admin',
  'root',
  'support',
  'help',
  'contact',
  'info',
  'noreply',
  'no-reply',
  'donotreply',
  'do-not-reply',
  'sales',
  'billing',
  'accounts',
  'service',
  'services',
  'team',
  'staff',
  'hr',
  'human',
  'resources',
  'hello',
  'feedback',
  'abuse',
  'security',
  'postmaster',
  'webmaster',
  'hostmaster',
  'mail',
  'mailer',
  'mailserver',
  'notification',
  'notify',
  'noreplyto',
  'newsletter',
  'news',
  'press',
  'legal',
  'compliance',
  'privacy',
  'dpo',
  'dataprivacy',
  'office',
  'operations',
  'customerservice',
  'customer',
  'orders',
  'accounting',
  'finance',
  'payments',
  'reservations',
  'bookings',
  'appointments',
  'marketing',
  'communications',
  'recruitment',
  'careers',
  'general',
  'main',
  'principal',
  'hello',
  'inquiry',
  'inquiries',
  'question',
  'questions',
  'request',
  'requests'
]

export const isRoleEmail = (email: string): boolean => {
  try {
    const [localPart] = email.toLowerCase().split('@')
    if (!localPart) return false
    
    // Check if local part matches any role pattern (exact or with numbers)
    return rolePatterns.some(role => {
      const regex = new RegExp(`^${role}\\d*$`)
      return regex.test(localPart)
    })
  } catch {
    return false
  }
}

export const getRoleType = (email: string): string | null => {
  try {
    const [localPart] = email.toLowerCase().split('@')
    if (!localPart) return null
    
    for (const role of rolePatterns) {
      const regex = new RegExp(`^${role}\\d*$`)
      if (regex.test(localPart)) {
        return role
      }
    }
    return null
  } catch {
    return null
  }
}
