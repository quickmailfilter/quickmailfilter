import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { ShieldCheck, Mail, Lock, User, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, signInWithGoogle } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

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
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-amber-500';
    if (passwordStrength <= 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains number or special character', met: /[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    if (passwordStrength < 50) {
      toast.error('Please choose a stronger password');
      return;
    }

    setLoading(true);

    try {
      const success = await signup(name, email, password);
      if (success) {
        navigate('/dashboard');
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
        <Link to="/" className="flex items-center gap-2 justify-center mb-8" data-aos="zoom-in" data-aos-delay="200">
          <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-[#1E3A8A]">VerifyMail</span>
        </Link>

        <Card className="border-[#E5E7EB] shadow-xl overflow-hidden">
          <CardHeader className="text-center pb-4" data-aos="fade-down" data-aos-delay="400">
            <CardTitle className="text-2xl font-bold text-gray-900">Create Your Account</CardTitle>
            <p className="text-gray-600 mt-2">Start verifying emails for free</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2" data-aos="fade-right" data-aos-delay="500">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2" data-aos="fade-right" data-aos-delay="600">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2" data-aos="fade-right" data-aos-delay="700">
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
                      <span className={`font-medium ${
                        passwordStrength <= 25 ? 'text-red-600' :
                        passwordStrength <= 50 ? 'text-amber-600' :
                        passwordStrength <= 75 ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
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
                        <div key={index} className="flex items-center gap-2 text-xs">
                          {req.met ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300" />
                          )}
                          <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-2" data-aos="fade-up" data-aos-delay="800">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-[#2563EB] hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-[#2563EB] hover:underline">
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
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>

              {/* OAuth Divider */}
              <div className="relative" data-aos="fade-up" data-aos-delay="1000">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E7EB]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <Button
                type="button"
                variant="outline"
                className="w-full border-[#E5E7EB] hover:bg-gray-50 !text-[#2563EB]"
                size="lg"
                onClick={async () => {
                  try {
                    const success = await signInWithGoogle();
                    if (success) {
                      toast.success('Signed up with Google!');
                      navigate('/dashboard');
                    }
                  } catch (error) {
                    toast.error('Google sign-up failed');
                  }
                }}
                data-aos="fade-up"
                data-aos-delay="1100"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center text-sm text-gray-600" data-aos="fade-up" data-aos-delay="1200">
              Already have an account?{' '}
              <Link to="/login" className="text-[#2563EB] hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="mt-4 border-green-200 bg-green-50" data-aos="fade-up" data-aos-delay="1300">
          <CardContent className="p-4">
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>1,000 free email verifications</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Upgrade or cancel anytime</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
