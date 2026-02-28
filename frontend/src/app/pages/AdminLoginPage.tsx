import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ShieldCheck, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../components/ui/alert';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password, true); // isAdmin = true
      if (success) {
        navigate('/admin');
      }
    } catch (error) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[#E5E7EB] shadow-2xl">
        <CardHeader className="space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <CardTitle className="text-2xl text-center">Admin Access</CardTitle>
          <CardDescription className="text-center">
            Secure login for administrators only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Lock className="h-4 w-4 text-[#2563EB]" />
            <AlertDescription className="text-sm text-[#1E3A8A]">
              Demo credentials: <strong>admin@verifymail.com</strong> / <strong>admin123</strong>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@verifymail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 border-[#E5E7EB]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 border-[#E5E7EB]"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#2563EB] hover:bg-[#1E3A8A]"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Access Admin Panel'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
