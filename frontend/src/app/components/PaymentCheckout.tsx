import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "./ui/button";
import { AlertCircle, Loader2, CheckCircle2, X } from "lucide-react";

interface PaymentCheckoutProps {
  isOpen: boolean;
  planName: string;
  amount: number;
  userEmail: string;
  onSuccess?: (data: any) => void;
  onClose: () => void;
}

export const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  isOpen,
  planName,
  amount,
  userEmail,
  onSuccess,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"payment" | "processing" | "success">(
    "payment",
  );
  const { user } = useApp();

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setStep("payment");
    }
  }, [isOpen]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create order on backend
      const orderResponse = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3004"}/api/payment/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planName,
            amount,
            userEmail,
            userId: user?.id || null,
          }),
        },
      );

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.message || "Failed to create order");
      }

      const { orderId, keyId } = await orderResponse.json();

      // Step 2: Open Razorpay checkout
      const options = {
        key: keyId,
        amount: Math.round(amount * 100), // amount in paise
        currency: "INR",
        name: "Email Validator SaaS",
        description: `${planName} Plan`,
        order_id: orderId,
        handler: async (response: any) => {
          setStep("processing");
          await verifyPayment(response);
        },
        prefill: {
          email: userEmail,
          name: user?.name || "User",
        },
        notes: {
          plan_name: planName,
          user_id: user?.id || "guest",
        },
        theme: {
          color: "#2563EB",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", (err: any) => {
        setError(`Payment failed: ${err.description || "Unknown error"}`);
        setStep("payment");
        setLoading(false);
      });

      razorpay.open();
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentData: any) => {
    try {
      const verifyResponse = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3004"}/api/payment/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: paymentData.razorpay_order_id,
            paymentId: paymentData.razorpay_payment_id,
            signature: paymentData.razorpay_signature,
          }),
        },
      );

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || "Payment verification failed");
      }

      const result = await verifyResponse.json();

      // Success!
      setStep("success");
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(result);
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Payment verification failed");
      setStep("payment");
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: isOpen ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Complete Your Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === "payment" && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-lg font-bold text-gray-900">{planName}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-lg font-bold text-gray-900">
                  ₹{amount.toLocaleString()}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm font-medium text-gray-900">{userEmail}</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initiating Payment...
                  </>
                ) : (
                  "Pay with Razorpay"
                )}
              </Button>

              <p className="text-xs text-center text-gray-500">
                Secure payment powered by Razorpay
              </p>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">
                  Processing Payment
                </p>
                <p className="text-sm text-gray-600 mt-1">Please wait...</p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">
                  Payment Successful!
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Your plan has been upgraded. Closing...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
