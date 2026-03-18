/**
 * Payment-related TypeScript types and interfaces
 */

export interface PaymentPlan {
  id: string;
  name: "Free Trial" | "Business" | "Enterprise";
  price: number; // Price in INR
  currency: string;
  description: string;
  quota: number; // Monthly email verifications
  features: string[];
  popular?: boolean;
  active: boolean;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  planName: string;
  amount: number;
  currency: string;
  orderId: string;
  paymentId: string;
  signature: string;
  status: "pending" | "captured" | "failed" | "refunded";
  method?: string; // card, upi, netbanking, wallet
  email: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface CreateOrderRequest {
  planName: string;
  amount: number;
  userEmail: string;
  userId?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  valid: boolean;
  message: string;
  transactionId?: string;
  planName?: string;
  error?: string;
}

export interface PaymentCallback {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Storage schema for transactions (can be adapted for Firebase, MongoDB, etc.)
export const paymentTransactionSchema = {
  id: "",
  userId: "",
  planName: "",
  amount: 0,
  currency: "INR",
  orderId: "",
  paymentId: "",
  signature: "",
  status: "pending" as const,
  method: "",
  email: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  metadata: {},
};

// Built-in payment plans
export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: "plan-free",
    name: "Free Trial",
    price: 0,
    currency: "INR",
    description: "Perfect for testing our service",
    quota: 50,
    features: [
      "50 monthly verifications",
      "Format validation",
      "Domain & MX checks",
      "Disposable detection",
    ],
    popular: false,
    active: true,
  },
  {
    id: "plan-business",
    name: "Business",
    price: 4099,
    currency: "INR",
    description: "For growing businesses",
    quota: 50000,
    features: [
      "50,000 monthly verifications",
      "Bulk list cleaning",
      "Advanced filtering",
      "Priority support",
      "API access",
      "Custom integrations",
    ],
    popular: true,
    active: true,
  },
  {
    id: "plan-enterprise",
    name: "Enterprise",
    price: 16599,
    currency: "INR",
    description: "For large organizations",
    quota: 150000,
    features: [
      "150,000 monthly verifications",
      "24/7 premium support",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated account manager",
      "Advanced reporting",
    ],
    popular: false,
    active: true,
  },
];
