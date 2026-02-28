import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { User, Lock, CreditCard, Key, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../components/ui/alert';

export const UserSettingsPage = () => {
  const { user } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const quotaPercentage = user ? (user.usedQuota / user.monthlyQuota) * 100 : 0;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1E3A8A]">Account Settings</h1>
        <p className="text-gray-600 text-sm sm:text-base">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex overflow-x-auto sm:grid w-full sm:grid-cols-4 no-scrollbar bg-gray-100/50 p-1 rounded-xl">
          <TabsTrigger value="profile" className="flex-1 min-w-[100px] sm:min-w-0">
            <User className="w-4 h-4 mr-2" />
            <span className="truncate">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 min-w-[100px] sm:min-w-0">
            <Lock className="w-4 h-4 mr-2" />
            <span className="truncate">Security</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex-1 min-w-[130px] sm:min-w-0">
            <CreditCard className="w-4 h-4 mr-2" />
            <span className="truncate text-xs sm:text-sm">Usage & Plan</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex-1 min-w-[100px] sm:min-w-0">
            <Key className="w-4 h-4 mr-2" />
            <span className="truncate">API</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Active
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Member since {user?.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Button type="submit" className="bg-[#2563EB] hover:bg-[#1E3A8A]">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Keep your account secure with a strong password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <Button type="submit" className="bg-[#2563EB] hover:bg-[#1E3A8A]">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card className="border-[#E5E7EB]">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription and usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-100 gap-4">
                <div>
                  <div className="text-lg font-bold text-[#1E3A8A] capitalize">
                    {user?.plan} Plan
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {user?.monthlyQuota.toLocaleString()} verifications per month
                  </div>
                </div>
                <Button variant="outline" className="border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all">
                  Upgrade Plan
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Monthly Usage</span>
                  <span className="font-bold text-[#1E3A8A]">
                    {user?.usedQuota.toLocaleString()} / {user?.monthlyQuota.toLocaleString()} ({quotaPercentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={quotaPercentage} className="h-3" />
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  {user ? (user.monthlyQuota - user.usedQuota).toLocaleString() : 0} verifications remaining this month
                </p>
              </div>

              {quotaPercentage >= 80 && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 font-medium">
                    You're using {quotaPercentage.toFixed(0)}% of your monthly quota. 
                    Consider upgrading to avoid interruptions.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB]">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-10">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-gray-400 opacity-50" />
                </div>
                <p className="text-gray-500 mb-6 font-medium">No payment method on file</p>
                <Button variant="outline" className="border-gray-200 hover:bg-gray-50 transition-all">
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card className="border-[#E5E7EB]">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>API Access</CardTitle>
              <CardDescription>Manage your API keys and integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-700 text-sm italic uppercase tracking-wider">Secret API Key</span>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Active</Badge>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input value="vfm_••••••••••••••••••••1234" readOnly className="font-mono text-sm bg-white border-gray-200" />
                  <Button variant="outline" size="sm" className="shrink-0 border-gray-200">Copy Key</Button>
                </div>
                <p className="text-xs text-gray-400 mt-3 font-medium">
                  Last used: Never
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1 border-gray-200 h-11">Regenerate Key</Button>
                <Button variant="outline" className="flex-1 border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-100 h-11">Revoke Access</Button>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h4 className="font-bold text-[#1E3A8A] mb-2 uppercase text-xs tracking-widest">Documentation</h4>
                <p className="text-sm text-gray-500 mb-4 font-medium leading-relaxed">
                  Learn how to integrate VerifyMail API into your applications with our comprehensive guides.
                </p>
                <Button variant="outline" className="w-full sm:w-auto border-[#2563EB] text-[#2563EB]">View API Docs</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50/20">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-red-700 font-bold">Danger Zone</CardTitle>
          <CardDescription className="text-red-600/70">Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="font-bold text-red-800 mb-1">Delete Account</div>
              <div className="text-sm text-red-600/80 font-medium">
                Permanently delete your account and all associated verification data. This action cannot be undone.
              </div>
            </div>
            <Button variant="destructive" className="w-full sm:w-auto shadow-lg shadow-red-200">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
