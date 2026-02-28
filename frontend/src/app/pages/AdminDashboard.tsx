import React from 'react';
import { useApp } from '../context/AppContext';
import { KPICard } from '../components/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Mail, FileText, Activity, TrendingUp, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatusBadge } from '../components/StatusBadge';

export const AdminDashboard = () => {
  const { allUsers, allVerifications } = useApp();

  const totalVerifications = allVerifications.length;
  const validCount = allVerifications.filter(v => v.status === 'valid').length;
  const invalidCount = allVerifications.filter(v => v.status === 'invalid').length;
  const riskyCount = allVerifications.filter(v => v.status === 'risky').length;

  const dailyData = [
    { date: 'Mon', verifications: 234, users: 45 },
    { date: 'Tue', verifications: 289, users: 52 },
    { date: 'Wed', verifications: 256, users: 38 },
    { date: 'Thu', verifications: 312, users: 65 },
    { date: 'Fri', verifications: 298, users: 58 },
    { date: 'Sat', verifications: 178, users: 30 },
    { date: 'Sun', verifications: 145, users: 25 },
  ];

  const statusData = [
    { name: 'Valid', value: validCount, color: '#10B981' },
    { name: 'Invalid', value: invalidCount, color: '#EF4444' },
    { name: 'Risky', value: riskyCount, color: '#F59E0B' },
  ];

  const planDistribution = [
    { plan: 'Free', count: allUsers.filter(u => u.plan === 'free').length, color: '#6B7280' },
    { plan: 'Business', count: allUsers.filter(u => u.plan === 'business').length, color: '#2563EB' },
    { plan: 'Enterprise', count: allUsers.filter(u => u.plan === 'enterprise').length, color: '#1E3A8A' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1E3A8A]">Admin Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">System-wide analytics and monitoring</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard
          title="Total Users"
          value={allUsers.length}
          icon={Users}
          subtitle="Registered accounts"
          color="blue"
          trend={{ value: '+12% this month', positive: true }}
        />
        <KPICard
          title="Total Verifications"
          value={totalVerifications.toLocaleString()}
          icon={Mail}
          subtitle="All time emails"
          color="green"
          trend={{ value: '+8% this week', positive: true }}
        />
        <KPICard
          title="Success Rate"
          value={`${totalVerifications > 0 ? ((validCount / totalVerifications) * 100).toFixed(1) : 0}%`}
          icon={CheckCircle2}
          subtitle="Valid emails"
          color="green"
        />
        <KPICard
          title="System Health"
          value="99.9%"
          icon={Activity}
          subtitle="Uptime"
          color="blue"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Daily Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
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
                  name="Verifications"
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Verification Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>User Plan Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={planDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="plan" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Users */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-[#F1F5F9] bg-white hover:shadow-md transition-all gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 truncate">{user.name}</div>
                    <div className="text-sm text-gray-500 truncate">{user.email}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-1 ${
                      user.plan === 'enterprise' ? 'bg-blue-100 text-blue-700' : 
                      user.plan === 'business' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.plan}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">
                      {user.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {allUsers.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No users registered yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Verifications */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Recent Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allVerifications.slice(0, 5).map((verification) => (
                <div key={verification.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-[#F1F5F9] bg-white hover:shadow-md transition-all gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 truncate">{verification.email}</div>
                    <div className="text-xs text-gray-400 font-medium mt-1">
                      {verification.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={verification.status} />
                  </div>
                </div>
              ))}
              {allVerifications.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No verifications yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
