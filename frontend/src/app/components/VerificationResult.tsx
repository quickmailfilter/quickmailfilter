import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Mail, Globe, Server, Shield, Search, Activity, Users } from 'lucide-react';
import { EmailVerification } from '../context/AppContext';
import { StatusBadge } from './StatusBadge';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

interface VerificationResultProps {
  result: EmailVerification;
}

export const VerificationResult: React.FC<VerificationResultProps> = ({ result }) => {
  return (
    <Card className="p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-hidden border-2 border-[#2563EB]/10 shadow-xl shadow-blue-500/5 hover:border-blue-500/30 transition-all duration-500">
      {/* Email and Status Badge */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/30 transition-all duration-500"></div>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-3xl flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-all duration-500">
            <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center">
            {result.status === 'valid' ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" /> : <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />}
          </div>
        </div>
        
        <div className="space-y-3 w-full max-w-lg mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] tracking-tight break-all">
            {result.email}
          </h2>
          <div className="flex justify-center gap-3">
            <StatusBadge status={result.status} />
            <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-200">
              verified real-time
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Confidence Card */}
        <div className="relative overflow-hidden group p-5 rounded-2xl bg-[#F8FAFC] border border-gray-200/60 hover:border-blue-300 transition-all duration-500">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield className="w-16 h-16 text-blue-600" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Confidence Level</span>
              <span className={`text-2xl font-black ${result.confidence > 80 ? 'text-green-600' : result.confidence > 50 ? 'text-blue-600' : 'text-red-600'}`}>
                {result.confidence}%
              </span>
            </div>
            <Progress 
              value={result.confidence} 
              className={`h-3 bg-gray-200/50 ${result.confidence > 80 ? 'fill-green-500' : result.confidence > 50 ? 'fill-blue-500' : 'fill-red-500'}`} 
            />
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Proprietary AI score based on 24 check points including SMTP handshake and reputation data.
            </p>
          </div>
        </div>

        {/* Insight Card */}
        <div className="p-5 rounded-2xl bg-[#1E3A8A] text-white/90 shadow-lg shadow-blue-900/10">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-blue-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Quick Insight</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed font-medium">
            {result.status === 'valid' 
              ? 'Excellent! This inbox is active and ready to receive mail. Zero bounce risk detected.'
              : result.status === 'risky'
              ? 'Warning: This address might be a catch-all or has recent reputation fluctuations.'
              : 'Attention: This address is dead or malformed. Sending will hurt your reputation.'}
          </p>
        </div>
      </div>

      {/* Verification Matrix */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Detailed Analysis Matrix</h4>
          <div className="h-[1px] flex-1 mx-4 bg-gray-100"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <CheckItem icon={Mail} label="Syntax Check" status={result.formatValid} />
          <CheckItem icon={Globe} label="MX Records" status={result.mxRecordFound} />
          <CheckItem icon={Server} label="SMTP Auth" status={result.domainExists} />
          <CheckItem icon={Shield} label="Spam Trap" status={!result.disposable} />
          <CheckItem icon={Users} label="Commercial" status={!result.roleBased} />
          <CheckItem icon={AlertCircle} label="Catch-all" status={!result.catchAll} />
        </div>
      </div>

      {/* Intelligence Feed */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 flex items-start gap-3">
        <div className="mt-1 p-1 bg-amber-100 rounded-lg">
          <Activity className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest mb-1">Raw System Logic</p>
          <p className="text-sm text-amber-900 font-semibold leading-relaxed">
            "{result.reason}"
          </p>
        </div>
      </div>
    </Card>
  );
};

interface CheckItemProps {
  icon: React.ElementType;
  label: string;
  status: boolean;
}

const CheckItem: React.FC<CheckItemProps> = ({ icon: Icon, label, status }) => (
  <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-lg ${status ? 'bg-green-50' : 'bg-red-50'}`}>
        <Icon className={`w-3.5 h-3.5 ${status ? 'text-green-600' : 'text-red-600'}`} />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    {status ? (
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      </div>
    ) : (
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100">
        <XCircle className="w-4 h-4 text-red-600" />
      </div>
    )}
  </div>
);
