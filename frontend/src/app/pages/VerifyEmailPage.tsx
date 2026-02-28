import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { EmailInput } from '../components/EmailInput';
import { VerificationResult } from '../components/VerificationResult';
import { EmailVerification } from '../context/AppContext';
import { toast } from 'sonner';

export const VerifyEmailPage = () => {
  const { verifyEmail, user } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailVerification | null>(null);

  const handleVerify = async (email: string) => {
    if (!user) {
      toast.error('Please log in to verify emails');
      return;
    }

    if (user.usedQuota >= user.monthlyQuota) {
      toast.error('Monthly quota exceeded! Please upgrade your plan.');
      return;
    }

    setLoading(true);
    try {
      const verification = await verifyEmail(email);
      setResult(verification);
      toast.success('Email verified successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1E3A8A]">Single Email Verification</h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Verify individual email addresses in real-time with technical insights.
        </p>
      </div>

      {/* Verification Input */}
      <Card className="border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="bg-[#F8FAFC] px-6 py-3 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider">Verification Tool</h3>
        </div>
        <CardContent className="p-6">
          <EmailInput onVerify={handleVerify} loading={loading} />
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 px-1">
            <div className="h-1 w-6 bg-[#2563EB] rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Full Report</h2>
          </div>
          <VerificationResult result={result} />
        </div>
      )}

      {/* Info */}
      {!result && (
        <Card className="border-[#E5E7EB] bg-blue-50/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2 text-[#1E3A8A]">How it works</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Format validation checks email syntax</li>
              <li>• Domain verification ensures the domain exists</li>
              <li>• MX record lookup confirms mail server configuration</li>
              <li>• Disposable email detection filters temporary addresses</li>
              <li>• Role-based detection identifies generic mailboxes</li>
              <li>• Catch-all detection flags risky domains</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
