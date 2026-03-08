import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  );
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const signature = searchParams.get("signature");

  useEffect(() => {
    if (orderId && paymentId && signature) {
      verifyPayment();
    } else if (!orderId) {
      setStatus("failed");
      setError("Missing payment information. Please try again.");
    }
  }, [orderId, paymentId, signature]);

  const verifyPayment = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3004"}/api/payment/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            paymentId,
            signature,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setStatus("failed");
        setError(data.error || "Payment verification failed");
        return;
      }

      setPaymentData(data);
      setStatus("success");
    } catch (err: any) {
      setStatus("failed");
      setError(err.message || "Failed to verify payment");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {status === "loading" && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-lg font-semibold text-gray-900">
                Verifying Payment
              </p>
              <p className="text-gray-600 mt-2">
                Please wait while we confirm your transaction...
              </p>
            </CardContent>
          </Card>
        )}

        {status === "success" && paymentData && (
          <>
            <Card className="border-green-200 bg-green-50 mb-6">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
                <p className="text-2xl font-bold text-gray-900">
                  Payment Successful!
                </p>
                <p className="text-gray-600 mt-2 text-center">
                  Welcome to {paymentData.transactionData?.planName}
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="font-semibold text-gray-900">
                      {paymentData.transactionData?.planName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="font-semibold text-gray-900">
                      ₹{paymentData.amount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {paymentData.method || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment ID</p>
                    <p className="font-mono text-xs text-gray-900">
                      {paymentData.paymentId}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    A confirmation email has been sent to{" "}
                    <span className="font-semibold">
                      {paymentData.transactionData?.userEmail}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={() => navigate("/pricing")}
                variant="outline"
                className="w-full h-12"
              >
                View All Plans
              </Button>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <Card className="border-red-200 bg-red-50 mb-6">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <XCircle className="w-16 h-16 text-red-600 mb-4" />
                <p className="text-2xl font-bold text-gray-900">
                  Payment Failed
                </p>
                <p className="text-gray-600 mt-2 text-center">{error}</p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/pricing")}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="w-full h-12"
              >
                Back to Dashboard
              </Button>
            </div>

            <p className="text-sm text-center text-gray-600 mt-6">
              If you believe this is an error, please{" "}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 hover:underline"
              >
                contact support
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
