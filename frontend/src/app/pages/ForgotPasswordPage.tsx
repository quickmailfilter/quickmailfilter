import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock password reset
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[#E5E7EB] shadow-xl overflow-hidden" data-aos="zoom-in">
        <CardHeader className="space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-xl flex items-center justify-center mx-auto mb-4" data-aos="bounce-in" data-aos-delay="200">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl text-center" data-aos="fade-up" data-aos-delay="300">Reset Password</CardTitle>
          <CardDescription className="text-center" data-aos="fade-up" data-aos-delay="400">
            {submitted 
              ? "Check your email for reset instructions"
              : "Enter your email address and we'll send you a reset link"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2" data-aos="fade-right" data-aos-delay="500">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-[#E5E7EB]"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#2563EB] hover:bg-[#1E3A8A]"
                data-aos="fade-up"
                data-aos-delay="600"
              >
                Send Reset Link
              </Button>

              <div data-aos="fade-up" data-aos-delay="700">
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto" data-aos="zoom-in">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600" data-aos="fade-up">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <div data-aos="fade-up" data-aos-delay="200">
                <Link to="/login">
                  <Button className="bg-[#2563EB] hover:bg-[#1E3A8A]">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
