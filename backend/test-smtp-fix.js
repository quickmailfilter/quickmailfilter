const validate = require("./dist/index.js").default;

async function testEmails() {
  console.log("Testing SMTP validation fix...\n");

  const testEmails = [
    "shaneelliott@agilent.com", // The problematic email - should be invalid
    "test@gmail.com", // Should be valid (if mailbox exists)
    "definitely.not.real.12345@company.com", // Should be invalid
  ];

  for (const email of testEmails) {
    console.log(`\n📧 Testing: ${email}`);
    console.log("=".repeat(50));

    try {
      const result = await validate({
        email,
        validateTypo: true,
        validateDisposable: true,
        validateMx: true,
        validateSMTP: true,
      });

      console.log(`Valid: ${result.valid}`);
      console.log(`IsValid: ${result.isValid}`);
      console.log(`Domain: ${result.domain}`);
      console.log(`SMTP Verified: ${result.smtpVerified}`);
      console.log(`SMTP Blocked: ${result.smtpBlocked}`);
      console.log(`Security Score: ${result.security_score}`);
      console.log(`Verified Via: ${result.verified_via}`);

      if (!result.valid) {
        console.log(`❌ INVALID: ${result.reason || "Check failed"}`);
      } else {
        console.log(`✅ VALID`);
      }
    } catch (error) {
      console.error(`Error testing ${email}:`, error.message);
    }
  }
}

testEmails().catch(console.error);
