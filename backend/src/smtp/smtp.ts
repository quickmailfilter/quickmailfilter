import net from "net";
import { OutputFormat, createOutput } from "../output/output";

const log = (...args: unknown[]) => {
  if (process.env.DEBUG === "true") {
    console.log(...args);
  }
};

// SMTP response codes and their meanings
const SMTP_CODES = {
  // Success codes
  220: "ready",
  250: "ok",
  251: "forward",

  // Definite failure - mailbox doesn't exist
  550: "mailbox_not_found",
  551: "user_not_local",
  552: "mailbox_full",
  553: "invalid_mailbox",

  // Temporary failures - DON'T mark as invalid
  421: "service_unavailable",
  450: "mailbox_busy",
  451: "local_error",
  452: "insufficient_storage",

  // Policy blocks - DON'T mark as invalid (server blocking verification)
  554: "transaction_failed",

  // Command errors
  500: "syntax_error",
  501: "argument_error",
  502: "not_implemented",
  503: "bad_sequence",
  504: "parameter_not_implemented",
};

// TRUE CATCH-ALL GATEWAYS: These services accept ALL mail at SMTP relay level
// and filter internally. Even with a working port-25 connection you CANNOT verify
// individual mailbox existence — the RCPT TO will always return 250.
// Industry standard (ZeroBounce, NeverBounce, Hunter.io) classifies domains
// using these gateways as "catch-all".
const CATCH_ALL_GATEWAYS = [
  "mail.protection.outlook.com", // Microsoft 365
  "pphosted.com", // Proofpoint
  "mimecast.com", // Mimecast
  "messagelabs.com", // Symantec/Broadcom MessageLabs
  "mailcontrol.com", // Forcepoint MailControl
  "iphmx.com", // Cisco IronPort hosted
  "hydramail.net", // Trend Micro IMSVA hosted
  "reflexion.net", // Reflexion Networks
  "spamexperts.com", // SpamExperts
];

// SMTP RATE-LIMITERS / BLOCKERS: These services block external SMTP probing
// but do NOT catch-all — they will reject 550 for non-existent mailboxes
// when probed from whitelisted IPs. Since we cannot connect (port 25 outbound
// blocked on cloud hosting), we fall back to domain/DNS signal scoring.
const SMTP_BLOCKERS = [
  "google.com",
  "googlemail.com",
  "barracuda",
  "barracudanetworks.com",
  "sophos",
  "fireeye",
  "trendmicro",
  "cisco",
  "ironport",
  "forcepoint",
  "symantec",
  "spamexperts",
  "reflexion",
];

// isCatchAllGateway: true = domain uses a gateway that accepts all mail at relay
// level; individual mailbox existence cannot be verified regardless of SMTP access.
export const isCatchAllGateway = (exchange: string): boolean => {
  const lowerExchange = exchange.toLowerCase();
  return CATCH_ALL_GATEWAYS.some((gateway) => lowerExchange.includes(gateway));
};

// isBlockingService: true = enterprise service known to block external SMTP probing.
// Combines both catch-all gateways and SMTP-rate-limiters.
export const isBlockingService = (exchange: string): boolean => {
  const lowerExchange = exchange.toLowerCase();
  return (
    CATCH_ALL_GATEWAYS.some((g) => lowerExchange.includes(g)) ||
    SMTP_BLOCKERS.some((g) => lowerExchange.includes(g))
  );
};

interface SMTPResult {
  valid: boolean;
  reason: string;
  smtpCode?: number;
  smtpMessage?: string;
  catchAll?: boolean;
  blocked?: boolean;
  portRefused?: boolean; // true = port was outright refused (ECONNREFUSED) — try next port
  accept_all?: boolean;
  validators?: any;
  definitive?: boolean; // true = SMTP gave a definitive answer (don't fall back to multi-factor)
}

const extractCode = (msg: string): number | null => {
  const match = msg.match(/^(\d{3})/);
  if (match) return parseInt(match[1], 10);
  return null;
};

const hasAnyToken = (message: string, tokens: string[]): boolean => {
  const lower = message.toLowerCase();
  return tokens.some((token) => lower.includes(token));
};

// (isBlockingService and isCatchAllGateway are exported above)

export const checkSMTP = async (
  sender: string,
  recipient: string,
  exchange: string,
  port: number = 25,
): Promise<SMTPResult> => {
  const timeout = 1000 * 12; // 12 seconds
  // Use a realistic EHLO hostname. Generic hostnames like "validator.local" are
  // immediately flagged and dropped by enterprise spam filters, triggering the
  // SMTP-blocked fallback even for reachable servers.
  const ehloHostname =
    process.env.SMTP_EHLO_HOSTNAME ||
    (sender.includes("@") ? sender.split("@")[1] : "mail.quickmailfilter.com");

  return new Promise((r) => {
    let receivedData = false;
    let closed = false;
    let lastResponse = "";
    let lastCode: number | null = null;
    let responsesReceived: number[] = [];

    const socket = net.createConnection(port, exchange);
    socket.setEncoding("ascii");
    socket.setTimeout(timeout);

    const finish = (result: SMTPResult) => {
      closed = true;
      if (socket.writable && !socket.destroyed) {
        try {
          socket.write(`QUIT\r\n`);
        } catch (e) {}
        socket.end();
        socket.destroy();
      }
      r(result);
    };

    socket.on("error", (error: any) => {
      log("SMTP error:", error.message);
      if (!closed) {
        if (error.code === "ECONNREFUSED") {
          // Port is outright refused — not a server rejection, just port closed.
          // Caller can retry on an alternative port.
          finish({
            valid: false,
            reason: "port_refused",
            blocked: true,
            portRefused: true,
            smtpMessage: `Port ${port} connection refused on ${exchange}`,
          });
        } else {
          // All other connection errors (ETIMEDOUT, EHOSTUNREACH, etc.)
          finish({
            valid: false,
            reason: "smtp_error",
            blocked: true,
            smtpMessage: `Connection failed: ${error.message}`,
          });
        }
      }
    });

    socket.on("close", () => {
      if (!closed) {
        // Connection closed without response
        finish({
          valid: false,
          reason: "smtp_error",
          blocked: true,
          smtpMessage: "No response from server",
        });
      }
    });

    socket.on("timeout", () => {
      log("SMTP timeout");
      if (!closed) {
        // Timeout = server didn't respond
        finish({
          valid: false,
          reason: "smtp_error",
          blocked: true,
          smtpMessage: "Server did not respond in time",
        });
      }
    });

    const commands = [
      `EHLO ${ehloHostname}\r\n`,
      `MAIL FROM:<${sender}>\r\n`,
      `RCPT TO:<${recipient}>\r\n`,
    ];
    let cmdIndex = 0;

    const sendNext = () => {
      if (cmdIndex < commands.length) {
        if (socket.writable) {
          log("Sending:", commands[cmdIndex].trim());
          socket.write(commands[cmdIndex++]);
        }
      } else {
        // All commands sent successfully - email is VALID
        finish({
          valid: true,
          reason: "accepted_email",
          smtpCode: lastCode || 250,
          smtpMessage: "Mailbox exists",
        });
      }
    };

    socket.on("connect", () => {
      log("Connected to", exchange);

      socket.on("data", (data: string) => {
        receivedData = true;
        lastResponse = data.toString();
        lastCode = extractCode(lastResponse);

        log("SMTP Response:", lastResponse.trim());

        if (!lastCode) {
          sendNext();
          return;
        }

        // Success codes - continue
        if (lastCode === 220 || lastCode === 250 || lastCode === 251) {
          sendNext();
          return;
        }

        // EHLO not supported, try HELO
        if (lastCode === 502 && cmdIndex === 1) {
          commands[0] = `HELO ${ehloHostname}\r\n`;
          cmdIndex = 0;
          sendNext();
          return;
        }

        // Definite failures - mailbox doesn't exist
        if (lastCode === 550 || lastCode === 551 || lastCode === 553) {
          const response = lastResponse.trim().toLowerCase();
          const mailboxMissingTokens = [
            "user unknown",
            "unknown user",
            "no such user",
            "no such recipient",
            "mailbox unavailable",
            "mailbox not found",
            "recipient not found",
            "unknown mailbox",
            "recipient address rejected",
            "invalid recipient",
          ];
          const policyOrSecurityTokens = [
            "access denied",
            "policy",
            "blocked",
            "not permitted",
            "relay access denied",
            "authentication required",
            "spam",
            "blacklist",
            "5.7.",
            "security",
            "rate limit",
          ];

          const looksLikeMailboxMissing = hasAnyToken(
            response,
            mailboxMissingTokens,
          );
          const looksLikePolicyBlock = hasAnyToken(response, policyOrSecurityTokens);

          // Only trust as definitive when the server message clearly indicates
          // unknown/invalid recipient. Otherwise treat as probe-blocked.
          if (looksLikeMailboxMissing && !looksLikePolicyBlock) {
            finish({
              valid: false,
              reason: "mailbox_not_found",
              smtpCode: lastCode,
              smtpMessage: lastResponse.trim(),
              definitive: true, // safe to trust as mailbox non-existent
            });
            return;
          }

          finish({
            valid: false,
            reason: "smtp_error",
            smtpCode: lastCode,
            smtpMessage: lastResponse.trim(),
            blocked: true,
            definitive: false,
          });
          return;
        }

        // Temporary failures (421/450/451/452) = can't verify
        if (
          lastCode === 421 ||
          lastCode === 450 ||
          lastCode === 451 ||
          lastCode === 452
        ) {
          finish({
            valid: false,
            reason: "smtp_error",
            blocked: true,
            smtpCode: lastCode,
            smtpMessage: "Server temporarily rejected - unable to verify",
          });
          return;
        }

        // 554 - Transaction failed = can't verify
        if (lastCode === 554) {
          finish({
            valid: false,
            reason: "smtp_error",
            blocked: true,
            smtpCode: 554,
            smtpMessage: "Server rejected the email",
          });
          return;
        }

        // 552 - Mailbox full (exists but full = valid)
        if (lastCode === 552) {
          finish({
            valid: true,
            reason: "mailbox_full",
            smtpCode: 552,
            smtpMessage: "Mailbox full but exists",
          });
          return;
        }

        // Any other unknown code = can't verify
        finish({
          valid: false,
          reason: "smtp_error",
          blocked: true,
          smtpCode: lastCode,
          smtpMessage: `Unknown response: ${lastResponse.trim()}`,
        });
      });
    });
  });
};

// Catch-all detection (separate function)
export const checkCatchAll = async (
  sender: string,
  domain: string,
  exchange: string,
): Promise<boolean> => {
  const fakeEmail = `nonexistent_test_${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}@${domain}`;

  const ehloHostname =
    process.env.SMTP_EHLO_HOSTNAME ||
    (sender.includes("@") ? sender.split("@")[1] : "mail.quickmailfilter.com");

  return new Promise((resolve) => {
    const timeout = 1000 * 12;
    let closed = false;

    const socket = net.createConnection(25, exchange);
    socket.setEncoding("ascii");
    socket.setTimeout(timeout);

    const finish = (isCatchAll: boolean) => {
      closed = true;
      if (socket.writable && !socket.destroyed) {
        try {
          socket.write(`QUIT\r\n`);
        } catch (e) {}
        socket.end();
        socket.destroy();
      }
      resolve(isCatchAll);
    };

    socket.on("error", () => finish(false));
    socket.on("timeout", () => finish(false));
    socket.on("close", () => {
      if (!closed) finish(false);
    });

    const commands = [
      `EHLO ${ehloHostname}\r\n`,
      `MAIL FROM:<${sender}>\r\n`,
      `RCPT TO:<${fakeEmail}>\r\n`,
    ];
    let cmdIndex = 0;

    socket.on("connect", () => {
      socket.on("data", (data: string) => {
        const code = extractCode(data.toString());

        if (code === 220 || code === 250 || code === 251) {
          if (cmdIndex < commands.length) {
            socket.write(commands[cmdIndex++]);
          } else {
            // Fake email accepted = catch-all domain
            finish(true);
          }
        } else if (code === 550 || code === 551 || code === 553) {
          // Fake email rejected = NOT catch-all
          finish(false);
        } else {
          // Unknown - assume not catch-all
          finish(false);
        }
      });
    });
  });
};
