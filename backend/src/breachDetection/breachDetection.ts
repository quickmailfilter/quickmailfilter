import axios from 'axios'

/**
 * Check if email has been found in known data breaches using HaveIBeenPwned API
 * Free API - no authentication required
 */
export const checkBreachStatus = async (email: string): Promise<{
  breached: boolean
  breachCount: number
  breaches: string[]
  compromised: boolean
}> => {
  try {
    console.log('  📡 [HaveIBeenPwned API] Querying for:', email)
    // HaveIBeenPwned API endpoint
    const response = await axios.get(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          'User-Agent': 'deep-email-validator'
        },
        timeout: 10000
      }
    )

    if (response.status === 200 && response.data && Array.isArray(response.data)) {
      const breaches = response.data.map((breach: any) => breach.Name || breach.name)
      console.log('  ⚠️ [HaveIBeenPwned API] Email found in', response.data.length, 'breach(es):', breaches)
      return {
        breached: true,
        breachCount: response.data.length,
        breaches: breaches,
        compromised: true
      }
    }

    console.log('  ✅ [HaveIBeenPwned API] Email not found in any breach')
    return {
      breached: false,
      breachCount: 0,
      breaches: [],
      compromised: false
    }
  } catch (error: any) {
    // 404 means email not found in breaches - which is good
    if (error.response?.status === 404) {
      console.log('  ✅ [HaveIBeenPwned API] 404 - Not in breaches')
      return {
        breached: false,
        breachCount: 0,
        breaches: [],
        compromised: false
      }
    }

    // Rate limited or service unavailable - return safe default
    if (error.response?.status === 429 || error.code === 'ECONNABORTED') {
      console.log('  ⚠️ [HaveIBeenPwned API] Rate limited or timeout')
      return {
        breached: false,
        breachCount: 0,
        breaches: [],
        compromised: false
      }
    }

    // Other errors - return safe default
    console.log('  ⚠️ [HaveIBeenPwned API] Error:', error.message)
    return {
      breached: false,
      breachCount: 0,
      breaches: [],
      compromised: false
    }
  }
}
