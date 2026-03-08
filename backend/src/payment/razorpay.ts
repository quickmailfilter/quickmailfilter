import axios from "axios";
import * as crypto from "crypto";

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id?: string;
  invoice_id?: string;
  international: boolean;
  method: string;
  created_at: number;
}

interface PaymentVerification {
  valid: boolean;
  payment?: RazorpayPayment;
  error?: string;
}

class RazorpayService {
  private keyId: string;
  private keySecret: string;
  private baseURL: string = "https://api.razorpay.com/v1";

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!this.keyId || !this.keySecret) {
      console.warn(
        "⚠️  Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.",
      );
    }
  }

  /**
   * Create a new order in Razorpay
   * @param amount Amount in smallest currency unit (paise for INR)
   * @param planName Plan name for receipt reference
   * @param userEmail User email address
   */
  async createOrder(
    amount: number,
    planName: string,
    userEmail: string,
  ): Promise<RazorpayOrder> {
    try {
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString(
        "base64",
      );
      const receipt = `order-${Date.now()}-${planName}`;

      const response = await axios.post(
        `${this.baseURL}/orders`,
        {
          amount: amount * 100, // Convert to paise
          currency: "INR",
          receipt,
          notes: {
            plan_name: planName,
            user_email: userEmail,
            created_at: new Date().toISOString(),
          },
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      console.log(
        `✅ Razorpay order created: ${response.data.id} for plan: ${planName}`,
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Failed to create Razorpay order:",
        error.response?.data || error.message,
      );
      throw new Error(`Failed to create payment order: ${error.message}`);
    }
  }

  /**
   * Verify payment signature after payment completion
   * @param orderId Razorpay order ID
   * @param paymentId Razorpay payment ID
   * @param signature Payment signature from frontend
   */
  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
  ): Promise<PaymentVerification> {
    try {
      // Verify signature
      const body = orderId + "|" + paymentId;
      const expectedSignature = crypto
        .createHmac("sha256", this.keySecret)
        .update(body)
        .digest("hex");

      const signatureMatch = expectedSignature === signature;

      if (!signatureMatch) {
        console.error("❌ Payment signature verification failed");
        return {
          valid: false,
          error: "Payment signature verification failed",
        };
      }

      // Fetch payment details from Razorpay
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString(
        "base64",
      );
      const response = await axios.get(
        `${this.baseURL}/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
          timeout: 30000,
        },
      );

      const payment = response.data;

      // Verify payment status
      if (payment.status !== "captured") {
        console.error("❌ Payment not captured:", payment.id);
        return {
          valid: false,
          error: `Payment status is ${payment.status}, not captured`,
          payment,
        };
      }

      console.log(`✅ Payment verified successfully: ${paymentId}`);
      return {
        valid: true,
        payment,
      };
    } catch (error: any) {
      console.error("❌ Payment verification error:", error.message);
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Get payment details from Razorpay
   */
  async getPayment(paymentId: string): Promise<RazorpayPayment> {
    try {
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString(
        "base64",
      );
      const response = await axios.get(
        `${this.baseURL}/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
          timeout: 30000,
        },
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ Failed to fetch payment details:", error.message);
      throw error;
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString(
        "base64",
      );
      const payload: any = {};

      if (amount) {
        payload.amount = amount * 100; // Convert to paise
      }

      const response = await axios.post(
        `${this.baseURL}/payments/${paymentId}/refund`,
        payload,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      console.log(`✅ Refund processed for payment: ${paymentId}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Refund failed:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<any> {
    try {
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString(
        "base64",
      );
      const response = await axios.get(`${this.baseURL}/orders/${orderId}`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        timeout: 30000,
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ Failed to fetch order:", error.message);
      throw error;
    }
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    return !!this.keyId && !!this.keySecret;
  }

  /**
   * Get public key (safe to expose to frontend)
   */
  getPublicKey(): string {
    return this.keyId;
  }
}

export const razorpayService = new RazorpayService();
export default razorpayService;
