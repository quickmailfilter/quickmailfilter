import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { toast } from "sonner";

export const AdminSignupPage = () => {
  const navigate = useNavigate();
  const { signupAdmin, user } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, navigate]);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const getStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-amber-500";
    if (passwordStrength <= 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    {
      label: "Contains number or special character",
      met: /[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminCode.trim()) {
      toast.error("Admin code is required");
      return;
    }

    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (passwordStrength < 50) {
      toast.error("Please choose a stronger password");
      return;
    }

    setLoading(true);

    try {
      const success = await signupAdmin(name, email, password, adminCode);
      if (success) {
        navigate("/admin");
      }
    } catch (error: any) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md" data-aos="fade-up">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 justify-center mb-8"
          data-aos="zoom-in"
          data-aos-delay="200"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-[#1E3A8A]">VerifyMail</span>
        </Link>

        <Card className="border-[#E5E7EB] shadow-xl overflow-hidden">
          <CardHeader
            className="text-center pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100"
            data-aos="fade-down"
            data-aos-delay="400"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6 text-[#2563EB]" />
              <CardTitle className="text-2xl font-bold text-[#1E3A8A]">
                Admin Registration
              </CardTitle>
            </div>
            <p className="text-gray-600 mt-2">
              Create administrator account for your platform
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Admin Code Notice */}
              <Alert
                className="bg-blue-50 border-blue-200"
                data-aos="fade-down"
              >
                <AlertCircle className="h-4 w-4 text-[#2563EB]" />
                <AlertDescription className="text-sm text-blue-800">
                  You need a valid admin code to create an administrator
                  account.
                </AlertDescription>
              </Alert>

              {/* Name */}
              <div
                className="space-y-2"
                data-aos="fade-right"
                data-aos-delay="500"
              >
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Administrator Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div
                className="space-y-2"
                data-aos="fade-right"
                data-aos-delay="600"
              >
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Admin Code */}
              <div
                className="space-y-2"
                data-aos="fade-right"
                data-aos-delay="650"
              >
                <Label htmlFor="adminCode">Admin Code</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="adminCode"
                    type="password"
                    placeholder="Enter admin registration code"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div
                className="space-y-2"
                data-aos="fade-right"
                data-aos-delay="700"
              >
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>

                {/* Password Strength */}
                {password && (
                  <div className="space-y-2" data-aos="fade-up">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Password strength:</span>
                      <span
                        className={`font-medium ${
                          passwordStrength <= 25
                            ? "text-red-600"
                            : passwordStrength <= 50
                              ? "text-amber-600"
                              : passwordStrength <= 75
                                ? "text-blue-600"
                                : "text-green-600"
                        }`}
                      >
                        {getStrengthLabel()}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>

                    {/* Password Requirements */}
                    <div className="space-y-1 pt-2">
                      {passwordRequirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs"
                        >
                          {req.met ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300" />
                          )}
                          <span
                            className={
                              req.met ? "text-green-600" : "text-gray-500"
                            }
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms & Conditions */}
              <div
                className="flex items-start gap-2"
                data-aos="fade-up"
                data-aos-delay="800"
              >
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setAcceptTerms(checked as boolean)
                  }
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-gray-600 cursor-pointer leading-relaxed"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-[#2563EB] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-[#2563EB] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#2563EB] hover:bg-[#1E3A8A]"
                size="lg"
                disabled={loading}
                data-aos="zoom-in"
                data-aos-delay="900"
              >
                {loading ? "Creating admin account..." : "Create Admin Account"}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-3 text-center">
              <p className="text-sm text-gray-600">
                Are you a regular user?{" "}
                <Link
                  to="/signup"
                  className="text-[#2563EB] hover:underline font-medium"
                >
                  Sign up here
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/admin/login"
                  className="text-[#2563EB] hover:underline font-medium"
                >
                  Admin login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
