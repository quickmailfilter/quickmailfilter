# Razorpay Payment API Endpoints Documentation

## Base URL

```
http://localhost:3004/api/payment
```

## Authentication

All endpoints use HTTP Basic Auth with Razorpay credentials (server-side only).
Frontend communicates with backend via standard HTTP POST/GET requests.

---

## Endpoints

### 1. Create Payment Order

**Endpoint:** `POST /api/payment/create-order`

**Description:** Creates a Razorpay order for a plan upgrade.

**Request Body:**

```json
{
  "planName": "Business",
  "amount": 4099,
  "userEmail": "user@example.com",
  "userId": "optional-user-id"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "orderId": "order_NqN3vxLJB5b6R3",
  "amount": 4099,
  "currency": "INR",
  "keyId": "rzp_live_SOkJKAbYYVzjN0"
}
```

**Response (Error - 400/500):**

```json
{
  "error": "Failed to create payment order",
  "message": "Razorpay API error description"
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3004/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Business",
    "amount": 4099,
    "userEmail": "user@example.com"
  }'
```

---

### 2. Verify Payment

**Endpoint:** `POST /api/payment/verify`

**Description:** Verifies payment signature and status. Call this after Razorpay checkout is complete.

**Request Body:**

```json
{
  "orderId": "order_NqN3vxLJB5b6R3",
  "paymentId": "pay_NqN3vxLJB5b6R3",
  "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "valid": true,
  "message": "Payment verified successfully",
  "paymentId": "pay_NqN3vxLJB5b6R3",
  "orderId": "order_NqN3vxLJB5b6R3",
  "amount": 40.99,
  "method": "card",
  "transactionData": {
    "orderId": "order_NqN3vxLJB5b6R3",
    "planName": "Business",
    "amount": 4099,
    "userEmail": "user@example.com",
    "status": "captured"
  }
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "valid": false,
  "error": "Payment signature verification failed"
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3004/api/payment/verify \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order_NqN3vxLJB5b6R3",
    "paymentId": "pay_NqN3vxLJB5b6R3",
    "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
  }'
```

---

### 3. Get Payment Status

**Endpoint:** `GET /api/payment/status/:orderId`

**Description:** Retrieves the current status of a specific order/payment.

**URL Parameters:**

- `orderId` (required): The Razorpay order ID

**Response (Success - 200):**

```json
{
  "orderId": "order_NqN3vxLJB5b6R3",
  "planName": "Business",
  "amount": 4099,
  "userEmail": "user@example.com",
  "userId": null,
  "status": "captured",
  "method": "card",
  "createdAt": "2026-03-08T10:30:00.000Z",
  "updatedAt": "2026-03-08T10:30:15.000Z"
}
```

**Response (Error - 404):**

```json
{
  "error": "Order not found",
  "orderId": "order_NqN3vxLJB5b6R3"
}
```

**Example cURL:**

```bash
curl -X GET http://localhost:3004/api/payment/status/order_NqN3vxLJB5b6R3
```

---

### 4. Get Pricing Plans

**Endpoint:** `GET /api/payment/plans`

**Description:** Retrieves all available pricing plans.

**Response (Success - 200):**

```json
{
  "success": true,
  "plans": [
    {
      "id": "plan-free",
      "name": "Free Trial",
      "price": 0,
      "currency": "INR",
      "description": "Perfect for testing our service",
      "quota": 50,
      "features": [
        "50 monthly verifications",
        "Format validation",
        "Domain & MX checks",
        "Disposable detection"
      ],
      "popular": false,
      "active": true
    },
    {
      "id": "plan-business",
      "name": "Business",
      "price": 4099,
      "currency": "INR",
      "description": "For growing businesses",
      "quota": 50000,
      "features": [
        "50,000 monthly verifications",
        "Bulk list cleaning",
        "Advanced filtering",
        "Priority support",
        "API access",
        "Custom integrations"
      ],
      "popular": true,
      "active": true
    },
    {
      "id": "plan-enterprise",
      "name": "Enterprise",
      "price": 16599,
      "currency": "INR",
      "description": "For large organizations",
      "quota": 150000,
      "features": [
        "150,000 monthly verifications",
        "24/7 premium support",
        "Custom integrations",
        "SLA guarantee",
        "Dedicated account manager",
        "Advanced reporting"
      ],
      "popular": false,
      "active": true
    }
  ]
}
```

**Example cURL:**

```bash
curl -X GET http://localhost:3004/api/payment/plans
```

---

## HTTP Status Codes

| Code | Meaning             | Description                         |
| ---- | ------------------- | ----------------------------------- |
| 200  | OK                  | Request successful                  |
| 400  | Bad Request         | Missing or invalid parameters       |
| 404  | Not Found           | Resource not found (order, payment) |
| 500  | Server Error        | Internal server error - check logs  |
| 503  | Service Unavailable | Razorpay not configured             |

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error type",
  "message": "Human-readable error description",
  "details": "Additional technical details (if available)"
}
```

Common error scenarios:

### Missing Configuration

```json
{
  "error": "Payment service unavailable",
  "message": "Razorpay is not configured"
}
```

### Invalid Parameters

```json
{
  "error": "Missing required fields",
  "required": ["planName", "amount", "userEmail"]
}
```

### Signature Verification Failed

```json
{
  "error": "Payment signature verification failed",
  "valid": false
}
```

### Order Not Found

```json
{
  "error": "Order not found",
  "orderId": "order_invalid123"
}
```

---

## Request/Response Examples

### Complete Payment Flow

#### 1. User clicks "Upgrade" button

Frontend sends: POST /api/payment/create-order

```bash
curl -X POST http://localhost:3004/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Business",
    "amount": 4099,
    "userEmail": "john@example.com",
    "userId": "user-5684"
  }'
```

**Response:**

```json
{
  "success": true,
  "orderId": "order_NqN3vxLJB5b6R3",
  "amount": 4099,
  "currency": "INR",
  "keyId": "rzp_live_SOkJKAbYYVzjN0"
}
```

#### 2. Razorpay checkout completes

Frontend receives payment callback with:

- `razorpay_order_id`
- `razorpay_payment_id`
- `razorpay_signature`

#### 3. Frontend verifies payment

Frontend sends: POST /api/payment/verify

```bash
curl -X POST http://localhost:3004/api/payment/verify \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order_NqN3vxLJB5b6R3",
    "paymentId": "pay_NqN3vxLJB5b6R3",
    "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
  }'
```

**Response:**

```json
{
  "success": true,
  "valid": true,
  "message": "Payment verified successfully",
  "orderId": "order_NqN3vxLJB5b6R3",
  "amount": 4099,
  "transactionData": {...}
}
```

#### 4. Frontend updates user plan

- Redirect to dashboard or success page
- Update user context with new plan
- Show confirmation message

---

## Rate Limiting (Recommended)

For production, implement rate limiting:

```javascript
// Example: Max 10 payment creation requests per minute per IP
const createOrderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many payment creation requests'
});

app.post('/api/payment/create-order', createOrderLimiter, ...);
```

---

## Security Headers

Requests should include standard security headers:

```
Content-Type: application/json
Authorization: (handled server-side)
X-Requested-With: XMLHttpRequest
```

---

## Testing Checklist

- [ ] Create order endpoint works
- [ ] Verify payment with valid signature
- [ ] Verify payment with invalid signature fails
- [ ] Get payment status for valid order
- [ ] Get payment status for invalid order fails
- [ ] Get pricing plans list
- [ ] Error handling for missing parameters
- [ ] Error handling when Razorpay not configured
- [ ] Test with test credentials
- [ ] Test with live credentials

---

## Debugging Tips

### Enable verbose logging in backend:

```javascript
// In server.js
console.log("Request:", req.body);
console.log("Signature comparison:", expectedSig, "===", signature);
```

### Check Razorpay dashboard:

1. Navigate to https://dashboard.razorpay.com
2. Go to Transactions
3. Filter by date/amount
4. Click order to see details

### Test with Postman:

1. Import collection from examples above
2. Set environment variables for URLs
3. Test each endpoint sequentially
4. Check response times and error codes

---

**API Version:** 1.0  
**Last Updated:** March 2026  
**Status:** ✅ Production Ready
