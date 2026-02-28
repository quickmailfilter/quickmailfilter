# Email Validator Backend API Documentation

## Overview

The Email Validator Backend is a robust API service that performs comprehensive email validation using multiple verification methods including regex validation, typo detection, disposable email checks, DNS record verification, and SMTP validation.

## Getting Started

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Running the Server

**Development Mode:**
```bash
npm run watch-ts    # Watch TypeScript compilation
npm run watch-node  # Watch server changes
```

**Production Mode:**
```bash
NODE_ENV=production npm start
```

### Server Output

When the server starts, it displays:
```
╔════════════════════════════════════════╗
║   Email Validator API Backend          ║
╚════════════════════════════════════════╝

🚀 Server running on port: 3004
🌍 Environment: development
⏰ Started at: 2026-02-11T...

📍 Health Check:
   GET http://localhost:3004/api/health

📧 Email Validation:
   POST http://localhost:3004/api/validate
   Body: { "email": "user@example.com" }

📨 Bulk Validation:
   POST http://localhost:3004/api/validate-bulk
   Body: { "emails": ["user1@example.com", "user2@example.com"] }
```

## API Endpoints

### 1. Health Check

**Endpoint:** `GET /api/health`

**Description:** Returns the health status of the API server.

**Response:**
```json
{
  "status": "ok",
  "server": "email-validator-saas",
  "environment": "development",
  "timestamp": "2026-02-11T12:34:56.789Z"
}
```

---

### 2. Single Email Validation

**Endpoint:** `POST /api/validate`

**Description:** Validates a single email address with comprehensive checks.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "email": "user@example.com",
  "is_valid": true,
  "is_risky": false,
  "is_disposable": false,
  "is_role": false,
  "user": "user",
  "domain": "example.com",
  "disposable": false,
  "role": false,
  "free": false,
  "accept_all": false,
  "mx_record": "mail.example.com",
  "mx_domain": "example.com",
  "provider": null,
  "spf": true,
  "dkim": true,
  "dmarc": true,
  "security_score": 95,
  "smtpVerified": true,
  "smtpBlocked": false,
  "breached": false,
  "breachCount": 0,
  "domain_reputation": 85,
  "pattern_score": 100,
  "typo": false
}
```

**Response Fields:**

- `email` - The email address being validated
- `is_valid` - Boolean indicating if the email is valid
- `is_risky` - Boolean indicating if the email is risky
- `is_disposable` - Boolean indicating if the email uses a disposable service
- `is_role` - Boolean indicating if the email is a role-based email (admin@, support@, etc.)
- `user` - The local part of the email (before @)
- `domain` - The domain part of the email (after @)
- `mx_record` - The MX record for the domain
- `mx_domain` - The domain of the MX record
- `provider` - Email service provider (if applicable)
- `spf` - Boolean indicating if SPF record exists
- `dkim` - Boolean indicating if DKIM record exists
- `dmarc` - Boolean indicating if DMARC record exists
- `security_score` - Overall security score (0-100)
- `smtpVerified` - Boolean indicating if SMTP verification succeeded
- `smtpBlocked` - Boolean indicating if SMTP was blocked
- `breached` - Boolean indicating if email was found in known breaches
- `breachCount` - Number of breaches the email was found in
- `domain_reputation` - Domain reputation score (0-100)
- `pattern_score` - Email pattern validation score (0-100)
- `typo` - Boolean indicating if a typo was detected in the domain

**Error Response:**
```json
{
  "error": "Validation failed",
  "message": "Error details..."
}
```

---

### 3. Bulk Email Validation

**Endpoint:** `POST /api/validate-bulk`

**Description:** Validates multiple email addresses in a single request.

**Request Body:**
```json
{
  "emails": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ]
}
```

**Constraints:**
- Maximum 1000 emails per request
- Minimum 1 email required

**Response:**
```json
{
  "total": 3,
  "results": [
    {
      "email": "user1@example.com",
      "is_valid": true,
      "user": "user1",
      "domain": "example.com",
      ...
    },
    {
      "email": "user2@example.com",
      "is_valid": false,
      "error": "Invalid domain"
      ...
    },
    {
      "email": "user3@example.com",
      "is_valid": true,
      ...
    }
  ]
}
```

**Error Responses:**

Invalid array:
```json
{
  "error": "Invalid emails array"
}
```

Too many emails:
```json
{
  "error": "Maximum 1000 emails per request"
}
```

---

## Validation Checks

The backend performs the following validation checks on each email:

### 1. **Regex Validation**
   - Validates email format according to RFC standards
   - Checks for valid special characters
   - Ensures proper structure

### 2. **Typo Detection**
   - Detects common typos in domain names
   - Recognizes misspellings of popular email providers
   - Suggests corrections

### 3. **Disposable Email Detection**
   - Checks against database of disposable/temporary email services
   - Extra disposable check from multiple sources
   - Identifies throwaway email addresses

### 4. **Role Detection**
   - Identifies role-based emails (admin@, support@, hello@, etc.)
   - Flags emails that are unlikely to be monitored
   - Returns role type (admin, support, etc.)

### 5. **Free Email Detection**
   - Identifies free email providers (Gmail, Outlook, Yahoo, etc.)
   - Returns provider name if applicable

### 6. **DNS Validation**
   - Checks for valid MX records
   - Verifies SPF records
   - Verifies DKIM records
   - Verifies DMARC records
   - Calculates security score based on DNS records

### 7. **SMTP Verification**
   - Connects to mail server to verify email existence
   - Checks for catch-all domains
   - Detects blocking services
   - Returns delivery verification status

### 8. **Advanced Checks**
   - Domain reputation scoring
   - Email pattern validation
   - Breach detection (checks if email found in known breaches)
   - Security posture analysis

---

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3004
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=*

# API Keys and Services (if needed)
SMTP_TIMEOUT=10000
DNS_TIMEOUT=5000

# Feature Flags
VALIDATE_REGEX=true
VALIDATE_TYPO=true
VALIDATE_DISPOSABLE=true
VALIDATE_MX=true
VALIDATE_SMTP=true
```

---

## Usage Examples

### cURL Examples

**Single Email Validation:**
```bash
curl -X POST http://localhost:3004/api/validate \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

**Bulk Email Validation:**
```bash
curl -X POST http://localhost:3004/api/validate-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "emails": [
      "user1@example.com",
      "user2@example.com"
    ]
  }'
```

**Health Check:**
```bash
curl http://localhost:3004/api/health
```

### JavaScript/Fetch Examples

**Single Email:**
```javascript
fetch('http://localhost:3004/api/validate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'user@example.com'})
})
.then(res => res.json())
.then(data => console.log(data))
```

**Bulk Emails:**
```javascript
fetch('http://localhost:3004/api/validate-bulk', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    emails: ['user1@example.com', 'user2@example.com']
  })
})
.then(res => res.json())
.then(data => console.log(data))
```

---

## Error Handling

All errors return appropriate HTTP status codes:

- `400` - Bad Request (invalid parameters)
- `404` - Not Found (invalid endpoint)
- `500` - Internal Server Error (validation failure)

Error response format:
```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "path": "/api/endpoint"
}
```

---

## Performance Considerations

- Single email validation: ~500ms - 2s (depending on SMTP)
- Bulk validation: Processes up to 1000 emails in parallel
- Results are cached where applicable
- SMTP verification can be disabled for faster responses

---

## Development

### Running Tests

```bash
npm test                # Run tests once
npm run watch-test      # Run tests in watch mode
```

### Linting

```bash
npm run lint            # Lint and fix code
```

### Debugging

```bash
npm run debug           # Start debug mode
npm run run-debug       # Run with inspector
```

---

## Deployment

### Vercel

The backend includes `vercel.json` configuration:
```json
{
  "version": 2,
  "builds": [{"src": "server.js", "use": "@vercel/node"}],
  "routes": [{"src": "/(.*)", "dest": "/server.js"}],
  "env": {"NODE_ENV": "production"}
}
```

### Railway

The backend includes `railway.json` configuration for Railway.app deployment.

### Docker

To containerize the backend:

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3004
CMD ["npm", "start"]
```

---

## Support

For issues, feature requests, or questions, please check the main repository documentation or create an issue.

---

## License

MIT License - See LICENSE file for details

