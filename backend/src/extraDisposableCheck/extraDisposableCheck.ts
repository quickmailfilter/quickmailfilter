import axios from 'axios'

/**
 * Enhanced disposable email detection using multiple open sources
 */
export const checkExtraDisposableSources = async (domain: string): Promise<{
  isDisposable: boolean
  source: string | null
  confidence: number
}> => {
  try {
    console.log('  📡 [Kickbox API] Checking disposable status for:', domain)
    // Check against Kickbox disposable domains database
    try {
      const kickboxResponse = await axios.get(
        `https://open.kickbox.com/v1/disposable/${domain}`,
        { timeout: 5000 }
      )

      if (kickboxResponse.data && kickboxResponse.data.disposable) {
        console.log('  ⚠️ [Kickbox] Domain is disposable')
        return {
          isDisposable: true,
          source: 'Kickbox API',
          confidence: 95
        }
      }
      console.log('  ✅ [Kickbox] Domain is not disposable')
    } catch (e) {
      console.log('  ⚠️ [Kickbox] API check failed')
      // API failed, continue
    }

    // Check against commonly known disposable providers
    const disposableDomains = [
      // Temp mail services
      'tempmail.com', 'temp-mail.org', 'guerrillamail.com', '10minutemail.com',
      'mailinator.com', 'throwaway.email', 'maildrop.cc', 'temp-mail.io',
      'yopmail.com', 'fake-mail.com', 'tempemail.com', 'email.com.ar',
      'trashmail.com', 'mytrashmail.com', 'spambox.us', 'pokemail.net',
      'tempinbox.com', 'mail.tm', 'temp-mail.io', '10minutemail.info',
      'mailnesia.com', 'tempmail.me', 'maildrop.cc', 'vpopmail.com',
      'mintemail.com', 'temp-mail.org', 'fakeinbox.com', 'dispostable.com',
      'sharklasers.com', 'spam4.me', 'killmail.net', 'throwawaymail.com'
    ]

    if (disposableDomains.includes(domain.toLowerCase())) {
      console.log('  ⚠️ [Disposable List] Domain found in known list')
      return {
        isDisposable: true,
        source: 'Known disposable list',
        confidence: 100
      }
    }

    // Check for common temp email patterns
    if (/^(temp|test|fake|trash|spam|disposable|anonymous|mail)[0-9]*\.(com|net|org|io)/i.test(domain)) {
      console.log('  ⚠️ [Pattern Match] Disposable pattern detected')
      return {
        isDisposable: true,
        source: 'Pattern matching',
        confidence: 85
      }
    }

    console.log('  ✅ [Extra Disposable] Domain passed all checks')
    return {
      isDisposable: false,
      source: null,
      confidence: 0
    }
  } catch (error) {
    console.log('  ⚠️ [Extra Disposable] Error:', (error as any).message)
    return {
      isDisposable: false,
      source: null,
      confidence: 0
    }
  }
}
