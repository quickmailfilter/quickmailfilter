import net from 'net'
import { OutputFormat, createOutput } from '../output/output'

const log = (...args: unknown[]) => {
  if (process.env.DEBUG === 'true') {
    console.log(...args)
  }
}

// SMTP response codes and their meanings
const SMTP_CODES = {
  // Success codes
  220: 'ready',
  250: 'ok',
  251: 'forward',
  
  // Definite failure - mailbox doesn't exist
  550: 'mailbox_not_found',
  551: 'user_not_local',
  552: 'mailbox_full',
  553: 'invalid_mailbox',
  
  // Temporary failures - DON'T mark as invalid
  421: 'service_unavailable',
  450: 'mailbox_busy',
  451: 'local_error',
  452: 'insufficient_storage',
  
  // Policy blocks - DON'T mark as invalid (server blocking verification)
  554: 'transaction_failed',
  
  // Command errors
  500: 'syntax_error',
  501: 'argument_error',
  502: 'not_implemented',
  503: 'bad_sequence',
  504: 'parameter_not_implemented'
}

// Known enterprise mail protection services that block SMTP verification
const BLOCKING_SERVICES = [
  'mimecast.com',
  'protection.outlook.com',
  'pphosted.com',
  'proofpoint.com',
  'messagelabs.com',
  'google.com',
  'googlemail.com',
  'barracuda',
  'spamexperts',
  'mailcontrol',
  'reflexion',
  'symantec',
  'fireeye'
]

interface SMTPResult {
  valid: boolean
  reason: string
  smtpCode?: number
  smtpMessage?: string
  catchAll?: boolean
  blocked?: boolean
  accept_all?: boolean
  validators?: any
}

const extractCode = (msg: string): number | null => {
  const match = msg.match(/^(\d{3})/)
  if (match) return parseInt(match[1], 10)
  return null
}

const isBlockingService = (exchange: string): boolean => {
  const lowerExchange = exchange.toLowerCase()
  return BLOCKING_SERVICES.some(service => lowerExchange.includes(service))
}

export { isBlockingService }

export const checkSMTP = async (sender: string, recipient: string, exchange: string): Promise<SMTPResult> => {
  const timeout = 1000 * 10 // 10 seconds (reduced for consistency)
  const isKnownBlocker = isBlockingService(exchange)
  
  return new Promise(r => {
    let receivedData = false
    let closed = false
    let lastResponse = ''
    let lastCode: number | null = null
    let responsesReceived: number[] = []
    
    const socket = net.createConnection(25, exchange)
    socket.setEncoding('ascii')
    socket.setTimeout(timeout)
    
    const finish = (result: SMTPResult) => {
      closed = true
      if (socket.writable && !socket.destroyed) {
        try {
          socket.write(`QUIT\r\n`)
        } catch (e) {}
        socket.end()
        socket.destroy()
      }
      r(result)
    }
    
    socket.on('error', (error: any) => {
      log('SMTP error:', error.message)
      if (!closed) {
        // Connection errors = can't verify
        finish({
          valid: false,
          reason: 'smtp_error',
          blocked: true,
          smtpMessage: `Connection failed: ${error.message}`
        })
      }
    })
    
    socket.on('close', () => {
      if (!closed) {
        // Connection closed without response
        finish({
          valid: false,
          reason: 'smtp_error',
          blocked: true,
          smtpMessage: 'No response from server'
        })
      }
    })
    
    socket.on('timeout', () => {
      log('SMTP timeout')
      if (!closed) {
        // Timeout = server didn't respond
        finish({
          valid: false,
          reason: 'smtp_error',
          blocked: true,
          smtpMessage: 'Server did not respond in time'
        })
      }
    })
    
    const commands = [
      `EHLO validator.local\r\n`,
      `MAIL FROM:<${sender}>\r\n`,
      `RCPT TO:<${recipient}>\r\n`
    ]
    let cmdIndex = 0
    
    const sendNext = () => {
      if (cmdIndex < commands.length) {
        if (socket.writable) {
          log('Sending:', commands[cmdIndex].trim())
          socket.write(commands[cmdIndex++])
        }
      } else {
        // All commands sent successfully - email is VALID
        finish({
          valid: true,
          reason: 'accepted_email',
          smtpCode: lastCode || 250,
          smtpMessage: 'Mailbox exists'
        })
      }
    }
    
    socket.on('connect', () => {
      log('Connected to', exchange)
      
      socket.on('data', (data: string) => {
        receivedData = true
        lastResponse = data.toString()
        lastCode = extractCode(lastResponse)
        
        log('SMTP Response:', lastResponse.trim())
        
        if (!lastCode) {
          sendNext()
          return
        }
        
        // Success codes - continue
        if (lastCode === 220 || lastCode === 250 || lastCode === 251) {
          sendNext()
          return
        }
        
        // EHLO not supported, try HELO
        if (lastCode === 502 && cmdIndex === 1) {
          commands[0] = `HELO validator.local\r\n`
          cmdIndex = 0
          sendNext()
          return
        }
        
        // Definite failures - mailbox doesn't exist
        if (lastCode === 550 || lastCode === 551 || lastCode === 553) {
          finish({
            valid: false,
            reason: 'mailbox_not_found',
            smtpCode: lastCode,
            smtpMessage: 'Mailbox does not exist'
          })
          return
        }
        
        // Temporary failures (421/450/451/452) = can't verify
        if (lastCode === 421 || lastCode === 450 || lastCode === 451 || lastCode === 452) {
          finish({
            valid: false,
            reason: 'smtp_error',
            blocked: true,
            smtpCode: lastCode,
            smtpMessage: 'Server temporarily rejected - unable to verify'
          })
          return
        }
        
        // 554 - Transaction failed = can't verify
        if (lastCode === 554) {
          finish({
            valid: false,
            reason: 'smtp_error',
            blocked: true,
            smtpCode: 554,
            smtpMessage: 'Server rejected the email'
          })
          return
        }
        
        // 552 - Mailbox full (exists but full = valid)
        if (lastCode === 552) {
          finish({
            valid: true,
            reason: 'mailbox_full',
            smtpCode: 552,
            smtpMessage: 'Mailbox full but exists'
          })
          return
        }
        
        // Any other unknown code = can't verify
        finish({
          valid: false,
          reason: 'smtp_error',
          blocked: true,
          smtpCode: lastCode,
          smtpMessage: `Unknown response: ${lastResponse.trim()}`
        })
      })
    })
  })
}

// Catch-all detection (separate function)
export const checkCatchAll = async (sender: string, domain: string, exchange: string): Promise<boolean> => {
  const fakeEmail = `nonexistent_test_${Date.now()}_${Math.random().toString(36).substring(7)}@${domain}`
  
  return new Promise(resolve => {
    const timeout = 1000 * 10
    let closed = false
    
    const socket = net.createConnection(25, exchange)
    socket.setEncoding('ascii')
    socket.setTimeout(timeout)
    
    const finish = (isCatchAll: boolean) => {
      closed = true
      if (socket.writable && !socket.destroyed) {
        try { socket.write(`QUIT\r\n`) } catch (e) {}
        socket.end()
        socket.destroy()
      }
      resolve(isCatchAll)
    }
    
    socket.on('error', () => finish(false))
    socket.on('timeout', () => finish(false))
    socket.on('close', () => { if (!closed) finish(false) })
    
    const commands = [
      `EHLO validator.local\r\n`,
      `MAIL FROM:<${sender}>\r\n`,
      `RCPT TO:<${fakeEmail}>\r\n`
    ]
    let cmdIndex = 0
    
    socket.on('connect', () => {
      socket.on('data', (data: string) => {
        const code = extractCode(data.toString())
        
        if (code === 220 || code === 250 || code === 251) {
          if (cmdIndex < commands.length) {
            socket.write(commands[cmdIndex++])
          } else {
            // Fake email accepted = catch-all domain
            finish(true)
          }
        } else if (code === 550 || code === 551 || code === 553) {
          // Fake email rejected = NOT catch-all
          finish(false)
        } else {
          // Unknown - assume not catch-all
          finish(false)
        }
      })
    })
  })
}
