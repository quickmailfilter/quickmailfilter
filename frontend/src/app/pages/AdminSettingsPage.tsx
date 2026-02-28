import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { Save, Lock, Mail, Shield } from 'lucide-react';

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'VerifyMail',
    siteEmail: 'admin@verifymail.com',
    maintenanceMode: false,
    apiRateLimit: 1000,
    emailVerificationRequired: true,
    twoFactorEnabled: false,
    dataRetentionDays: 90,
    maxFileSize: 10, // in MB
    allowBulkUpload: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
        <p className="text-gray-600">Configure system-wide settings and preferences</p>
      </div>

      {/* General Settings */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="siteName" className="block mb-2 font-medium">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                placeholder="Enter site name"
              />
            </div>
            <div>
              <Label htmlFor="siteEmail" className="block mb-2 font-medium">Site Email</Label>
              <Input
                id="siteEmail"
                type="email"
                value={settings.siteEmail}
                onChange={(e) => handleChange('siteEmail', e.target.value)}
                placeholder="enter@email.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="apiRateLimit" className="block mb-2 font-medium">API Rate Limit (requests/hour)</Label>
            <Input
              id="apiRateLimit"
              type="number"
              value={settings.apiRateLimit}
              onChange={(e) => handleChange('apiRateLimit', parseInt(e.target.value))}
              placeholder="1000"
            />
          </div>

          <div>
            <Label htmlFor="dataRetention" className="block mb-2 font-medium">Data Retention (days)</Label>
            <Input
              id="dataRetention"
              type="number"
              value={settings.dataRetentionDays}
              onChange={(e) => handleChange('dataRetentionDays', parseInt(e.target.value))}
              placeholder="90"
            />
          </div>

          <div>
            <Label htmlFor="maxFileSize" className="block mb-2 font-medium">Max File Size (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value))}
              placeholder="10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
            <div>
              <Label className="font-medium">Maintenance Mode</Label>
              <p className="text-sm text-gray-600 mt-1">Disable access for all non-admin users</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(value) => handleChange('maintenanceMode', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
            <div>
              <Label className="font-medium">Email Verification Required</Label>
              <p className="text-sm text-gray-600 mt-1">Require users to verify their email</p>
            </div>
            <Switch
              checked={settings.emailVerificationRequired}
              onCheckedChange={(value) => handleChange('emailVerificationRequired', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
            <div>
              <Label className="font-medium">Two-Factor Authentication</Label>
              <p className="text-sm text-gray-600 mt-1">Enable 2FA for admin accounts</p>
            </div>
            <Switch
              checked={settings.twoFactorEnabled}
              onCheckedChange={(value) => handleChange('twoFactorEnabled', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
            <div>
              <Label className="font-medium">Allow Bulk Upload</Label>
              <p className="text-sm text-gray-600 mt-1">Allow users to upload bulk email files</p>
            </div>
            <Switch
              checked={settings.allowBulkUpload}
              onCheckedChange={(value) => handleChange('allowBulkUpload', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#2563EB] hover:bg-[#1E3A8A] flex items-center gap-2"
          size="lg"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};
