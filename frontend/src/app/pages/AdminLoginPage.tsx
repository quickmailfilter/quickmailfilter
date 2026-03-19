import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Lock, Mail, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password, true); // isAdmin = true
      if (success) {
        navigate("/admin");
      }
    } catch (error) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/icons/logo.jpeg"
              alt="QuickMailFilter"
              className="w-12 h-12 rounded-lg object-cover shadow-sm"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Secure access for administrators</p>
        </div>

        {/* Card */}
        <Card className="border border-gray-200 shadow-lg">
          <CardContent className="pt-8">
            <Alert className="mb-6 bg-blue-50 border border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900">
                This is a restricted admin area. All access attempts are logged
                and monitored.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-900"
                >
                  Admin Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="pl-10 border border-gray-300 bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-900"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="pl-10 border border-gray-300 bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-lg"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#2563EB] hover:bg-[#1E40AF] h-11 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all text-white"
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">
                Don't have an admin account?
              </p>
              <Link
                to="/admin/signup"
                className="block w-full px-4 py-2.5 border-2 border-[#2563EB] text-[#2563EB] rounded-lg hover:bg-blue-50 transition-colors font-medium text-center text-sm"
              >
                Create Admin Account
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-block text-gray-600 hover:text-[#2563EB] transition-colors font-medium text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
