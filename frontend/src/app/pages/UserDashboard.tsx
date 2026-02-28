import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { KPICard } from '../components/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Mail, Upload, CheckCircle2, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { StatusBadge } from '../components/StatusBadge';

export const UserDashboard = () => {
  const { user, verificationHistory } = useApp();

  const validCount = verificationHistory.filter(v => v.status === 'valid').length;
  const invalidCount = verificationHistory.filter(v => v.status === 'invalid').length;
  const riskyCount = verificationHistory.filter(v => v.status === 'risky').length;

  const pieData = [
    { name: 'Valid', value: validCount, color: '#10B981' },
    { name: 'Invalid', value: invalidCount, color: '#EF4444' },
    { name: 'Risky', value: riskyCount, color: '#F59E0B' },
  ];

  const trendData = [
    { date: 'Mon', verifications: 45 },
    { date: 'Tue', verifications: 52 },
    { date: 'Wed', verifications: 38 },
    { date: 'Thu', verifications: 65 },
    { date: 'Fri', verifications: 58 },
    { date: 'Sat', verifications: 30 },
    { date: 'Sun', verifications: 25 },
  ];

  const quotaPercentage = user ? (user.usedQuota / user.monthlyQuota) * 100 : 0;

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-hidden max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div data-aos="fade-down">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1E3A8A]">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 text-sm sm:text-base">Here's your email verification overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" data-aos="fade-up">
        <KPICard
          title="Current Plan"
          value={user?.plan.charAt(0).toUpperCase() + user?.plan.slice(1) || 'Free'}
          icon={TrendingUp}
          subtitle="Active subscription"
          color="blue"
        />
        <KPICard
          title="Monthly Quota"
          value={`${user ? user.monthlyQuota - user.usedQuota : 0}`}
          icon={Upload}
          subtitle={`${user?.usedQuota || 0} / ${user?.monthlyQuota || 0} used`}
          color="green"
        />
        <KPICard
          title="Total Verified"
          value={verificationHistory.length}
          icon={CheckCircle2}
          subtitle="All time emails"
          color="blue"
        />
        <KPICard
          title="Valid Emails"
          value={validCount}
          icon={Mail}
          subtitle={`${verificationHistory.length > 0 ? ((validCount / verificationHistory.length) * 100).toFixed(0) : 0}% success rate`}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-aos="fade-up" data-aos-delay="200">
        {/* Verification Trend */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Weekly Verification Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="verifications" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  dot={{ fill: '#2563EB', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-aos="fade-up" data-aos-delay="300">
        <Link 
          to="/dashboard/verify" 
          className="group relative overflow-hidden bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] hover:border-[#2563EB] shadow-sm hover:shadow-xl transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Mail className="w-24 h-24 text-[#2563EB]" />
          </div>
          <div className="relative z-10 flex flex-col h-full gap-4">
            <div className="w-12 h-12 bg-blue-50 text-[#2563EB] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1E3A8A] mb-1">Verify Single Email</h3>
              <p className="text-gray-500 text-sm">Real-time deep technical analysis of any email address.</p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-[#2563EB] font-bold text-sm">
              Start verifying <TrendingUp className="w-4 h-4 ml-2" />
            </div>
          </div>
        </Link>

        <Link 
          to="/dashboard/bulk" 
          className="group relative overflow-hidden bg-[#1E3A8A] p-6 sm:p-8 rounded-2xl border border-blue-900 shadow-xl hover:shadow-2xl transition-all duration-300 text-white"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Upload className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10 flex flex-col h-full gap-4">
            <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1 text-white">Upload Bulk List</h3>
              <p className="text-blue-200 text-sm">Clean thousands of emails at once with high-speed processing.</p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-blue-200 font-bold text-sm">
              Clean your list <TrendingUp className="w-4 h-4 ml-2" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="border-[#E5E7EB]" data-aos="fade-up" data-aos-delay="400">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Verifications</CardTitle>
            <Link to="/dashboard/history">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {verificationHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No verifications yet. Start by verifying your first email!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {verificationHistory.slice(0, 5).map((verification, idx) => (
                <div 
                  key={verification.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white border border-[#F1F5F9] hover:border-[#E2E8F0] hover:shadow-md transition-all gap-3 sm:gap-4"
                  data-aos="fade-left"
                  data-aos-delay={idx * 50}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-900 truncate">{verification.email}</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start gap-4 ml-11 sm:ml-0">
                    <span className="text-sm text-gray-500 font-medium">
                      {verification.timestamp.toLocaleDateString()}
                    </span>
                    <StatusBadge status={verification.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
