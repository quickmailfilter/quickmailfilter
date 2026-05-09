import dns from 'dns'

// Set custom DNS servers if provided in environment
const customServers = process.env.DNS_SERVERS?.split(',') || ['8.8.8.8', '8.8.4.4']
try {
  dns.setServers(customServers)
  console.log(`🔧 [DNS] Using DNS servers: ${customServers.join(', ')}`)
} catch (e) {
  console.warn('⚠️ [DNS] Could not set custom DNS servers, using system defaults')
}

export const getMx = async (domain: string): Promise<dns.MxRecord[]> => {
  const resolveOnce = (): Promise<dns.MxRecord[]> =>
    new Promise(r => {
      // Set a timeout for DNS resolution
      const timeout = setTimeout(() => {
        console.warn(`⚠️ [DNS] Timeout resolving MX for ${domain}`)
        r([] as dns.MxRecord[])
      }, 8000) // Increased timeout for slower connections

      dns.resolveMx(domain, (err, addresses) => {
        clearTimeout(timeout)
        if (err) {
          console.warn(`⚠️ [DNS] Error resolving MX for ${domain}: ${err.message}`)
          return r([] as dns.MxRecord[])
        }
        if (!addresses || addresses.length === 0) {
          console.warn(`⚠️ [DNS] No addresses returned for ${domain}`)
          return r([] as dns.MxRecord[])
        }
        r(addresses)
      })
    })

  // Retry to reduce false negatives from transient DNS/network errors.
  for (let attempt = 1; attempt <= 3; attempt++) {
    const records = await resolveOnce()
    if (records.length > 0) {
      return records
    }
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 300 * attempt))
    }
  }

  return [] as dns.MxRecord[]
}

export const getBestMx = async (domain: string): Promise<dns.MxRecord | undefined> => {
  const addresses = await getMx(domain)
  if (!addresses || addresses.length === 0) {
    return undefined
  }

  let bestIndex = 0

  for (let i = 0; i < addresses.length; i++) {
    if (addresses[i].priority < addresses[bestIndex].priority) {
      bestIndex = i
    }
  }

  return addresses[bestIndex]
}
