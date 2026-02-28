import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface EmailInputProps {
  onVerify: (email: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({ 
  onVerify, 
  loading = false,
  placeholder = "Enter email address to verify..." 
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    onVerify(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          placeholder={placeholder}
          className="pl-12 h-14 text-lg border-2 focus:border-primary"
          disabled={loading}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button 
        type="submit" 
        size="lg" 
        className="w-full h-14 text-lg"
        disabled={loading}
        style={{ background: 'var(--primary)' }}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify Email'
        )}
      </Button>
    </form>
  );
};
