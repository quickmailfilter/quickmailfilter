import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { toast } from "sonner";
import {
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validCode, setValidCode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const oobCode = searchParams.get("oobCode");

  // Verify the reset code
  useEffect(() => {
    const verifyResetCode = async () => {
      if (!oobCode) {
        toast.error("Invalid reset link");
        setVerifying(false);
        return;
      }

      try {
        // Verify the code is valid
        await verifyPasswordResetCode(auth, oobCode);
        setValidCode(true);
      } catch (error: any) {
        const msg =
          error.code === "auth/expired-action-code"
            ? "This password reset link has expired. Please request a new one."
            : error.code === "auth/invalid-action-code"
              ? "This password reset link is invalid. Please request a new one."
              : error.message || "Failed to verify reset link";
        toast.error(msg);
        setValidCode(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyResetCode();
  }, [oobCode]);

  const validatePasswords = () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return false;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswords() || !oobCode) {
      return;
    }

    setLoading(true);
    try {
      // Use Firebase's confirmPasswordReset
      await confirmPasswordReset(auth, oobCode, newPassword);
      setResetSuccess(true);
      toast.success("Password reset successfully!");
    } catch (error: any) {
      const msg =
        error.code === "auth/expired-action-code"
          ? "This password reset link has expired. Please request a new one."
          : error.code === "auth/invalid-action-code"
            ? "This password reset link is invalid. Please request a new one."
            : error.code === "auth/weak-password"
              ? "Password is too weak. Please use a stronger password."
              : error.message || "Failed to reset password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Loading state while verifying code
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-[#E5E7EB] shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 font-medium">
              Verifying your reset link...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid code state
  if (!validCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-[#E5E7EB] shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Invalid or Expired Link</CardTitle>
            <CardDescription>
              This password reset link is no longer valid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Please request a new password reset link from the login page.
            </p>
            <Link to="/forgot-password">
              <Button className="w-full bg-[#2563EB] hover:bg-[#1E3A8A]">
                Request New Reset Link
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-[#E5E7EB] shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">
              Password Reset Successfully
            </CardTitle>
            <CardDescription>
              Your password has been changed. You can now log in with your new
              password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/login">
              <Button className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] h-11">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form state
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
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle
            className="text-2xl text-center"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Create New Password
          </CardTitle>
          <CardDescription
            className="text-center"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            Enter a strong password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div
              className="space-y-2"
              data-aos="fade-right"
              data-aos-delay="500"
            >
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                  minLength={6}
                  className="border-[#E5E7EB] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                At least 6 characters recommended
              </p>
            </div>

            {/* Confirm Password */}
            <div
              className="space-y-2"
              data-aos="fade-right"
              data-aos-delay="600"
            >
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                  minLength={6}
                  className="border-[#E5E7EB] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && newPassword && (
              <div
                className={`p-2 rounded text-sm flex items-center gap-2 ${
                  newPassword === confirmPassword
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {newPassword === confirmPassword ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {newPassword === confirmPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] mt-6 h-11"
              disabled={
                loading ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
            >
              {loading ? "Resetting password..." : "Reset Password"}
            </Button>

            <Link to="/login">
              <Button variant="ghost" className="w-full" disabled={loading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
