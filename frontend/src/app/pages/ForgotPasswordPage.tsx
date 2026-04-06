import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader,
} from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { toast } from "sonner";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: false,
      });

      setSubmitted(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      let errorMsg = "Failed to send reset email";

      if (error.code === "auth/user-not-found") {
        errorMsg =
          "No account found with this email address. Please check and try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMsg = "Invalid email address format";
      } else if (error.code === "auth/too-many-requests") {
        errorMsg =
          "Too many reset requests. Please try again later or contact support.";
      } else if (error.message) {
        errorMsg = error.message;
      }

      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-white to-blue-50 flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md border-[#E5E7EB] shadow-xl overflow-hidden"
        data-aos="zoom-in"
      >
        <CardHeader className="space-y-2">
          <div
            className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-xl flex items-center justify-center mx-auto mb-4"
            data-aos="bounce-in"
            data-aos-delay="200"
          >
            <Mail className="w-6 h-6 text-white" />
          </div>
          <CardTitle
            className="text-2xl text-center"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Reset Password
          </CardTitle>
          <CardDescription
            className="text-center"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            {submitted
              ? "Check your email for reset instructions"
              : "Enter your email address and we'll send you a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div
                className="space-y-2"
                data-aos="fade-right"
                data-aos-delay="500"
              >
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                  disabled={loading}
                  required
                  className="border-[#E5E7EB] border-gray-300 focus-visible:border-[#2563EB]"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                  data-aos="fade-up"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> The reset link will expire in 1 hour.
                  If the email doesn't arrive, check your spam folder or try
                  again.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] text-white font-medium h-10"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>

              {/* Back to Login */}
              <Link to="/login">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                data-aos="zoom-in"
              >
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>

              <div className="space-y-2" data-aos="fade-up">
                <p className="text-gray-900 font-semibold">
                  Reset link sent successfully!
                </p>
                <p className="text-gray-600 text-sm">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>

              {/* Steps to follow */}
              <div className="space-y-2 text-left bg-gray-50 p-4 rounded-lg text-sm">
                <p className="font-semibold text-gray-900">Next steps:</p>
                <ol className="space-y-1 text-gray-600 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Click the password reset link</li>
                  <li>Create a new strong password</li>
                  <li>You'll be able to login immediately</li>
                </ol>
              </div>

              {/* Resend and Back buttons */}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                  }}
                >
                  Didn't receive email? Try again
                </Button>
                <Link to="/login">
                  <Button className="w-full bg-[#2563EB] hover:bg-[#1E3A8A]">
                    Return to Login
                  </Button>
                </Link>
              </div>

              {/* Spam folder warning */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Tip:</strong> If you don't see the email, please check
                  your spam or junk folder
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
