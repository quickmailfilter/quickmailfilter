import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import {
  Save,
  Lock,
  Shield,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Star,
} from "lucide-react";
import { useApp, PricingPlan } from "../context/AppContext";

export const AdminSettingsPage = () => {
  const { pricingPlans, addPricingPlan, updatePricingPlan, deletePricingPlan } =
    useApp();
  const [activeTab, setActiveTab] = useState<"general" | "pricing">("general");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState<Omit<PricingPlan, "id">>({
    name: "",
    price: 0,
    currency: "INR",
    quota: 0,
    description: "",
    features: [],
    popular: false,
    active: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
          <p className="text-gray-600">
            Configure system-wide settings and pricing plans
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-md transition-all ${
              activeTab === "general"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            General Settings
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-2 rounded-md transition-all ${
              activeTab === "pricing"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pricing Plans (Dynamic)
          </button>
        </div>
      </div>

      {activeTab === "general" ? (
        <>
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
                  <Label htmlFor="siteName" className="block mb-2 font-medium">
                    Site Name
                  </Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleChange("siteName", e.target.value)}
                    placeholder="Enter site name"
                  />
                </div>
                <div>
                  <Label htmlFor="siteEmail" className="block mb-2 font-medium">
                    Site Email
                  </Label>
                  <Input
                    id="siteEmail"
                    type="email"
                    value={settings.siteEmail}
                    onChange={(e) => handleChange("siteEmail", e.target.value)}
                    placeholder="enter@email.com"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="apiRateLimit"
                  className="block mb-2 font-medium"
                >
                  API Rate Limit (requests/hour)
                </Label>
                <Input
                  id="apiRateLimit"
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={(e) =>
                    handleChange("apiRateLimit", parseInt(e.target.value))
                  }
                  placeholder="1000"
                />
              </div>

              <div>
                <Label
                  htmlFor="dataRetention"
                  className="block mb-2 font-medium"
                >
                  Data Retention (days)
                </Label>
                <Input
                  id="dataRetention"
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) =>
                    handleChange("dataRetentionDays", parseInt(e.target.value))
                  }
                  placeholder="90"
                />
              </div>

              <div>
                <Label htmlFor="maxFileSize" className="block mb-2 font-medium">
                  Max File Size (MB)
                </Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) =>
                    handleChange("maxFileSize", parseInt(e.target.value))
                  }
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
                  <p className="text-sm text-gray-600 mt-1">
                    Disable access for all non-admin users
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(value) =>
                    handleChange("maintenanceMode", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
                <div>
                  <Label className="font-medium">
                    Email Verification Required
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Require users to verify their email
                  </p>
                </div>
                <Switch
                  checked={settings.emailVerificationRequired}
                  onCheckedChange={(value) =>
                    handleChange("emailVerificationRequired", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
                <div>
                  <Label className="font-medium">
                    Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Enable 2FA for admin accounts
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorEnabled}
                  onCheckedChange={(value) =>
                    handleChange("twoFactorEnabled", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
                <div>
                  <Label className="font-medium">Allow Bulk Upload</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Allow users to upload bulk email files
                  </p>
                </div>
                <Switch
                  checked={settings.allowBulkUpload}
                  onCheckedChange={(value) =>
                    handleChange("allowBulkUpload", value)
                  }
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
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          {/* Plan Manager */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* List Plans */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Current Pricing Plans ({pricingPlans.length})
              </h2>
              <div className="grid gap-4">
                {pricingPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className="border-[#E5E7EB] hover:border-blue-200 transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{plan.name}</h3>
                            {plan.popular && (
                              <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase font-bold">
                                <Star className="w-2.5 h-2.5 fill-blue-600" />{" "}
                                Popular
                              </span>
                            )}
                            {!plan.active && (
                              <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase font-bold text-white">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {plan.description}
                          </p>
                          <div className="mt-4 flex gap-6">
                            <div>
                              <p className="text-xs text-gray-400 uppercase font-bold">
                                Price
                              </p>
                              <p className="font-mono">
                                {plan.currency} {plan.price}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 uppercase font-bold">
                                Quota
                              </p>
                              <p className="font-mono">
                                {plan.quota.toLocaleString()} Emails
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {plan.features.map((f, i) => (
                              <span
                                key={i}
                                className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> {f}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this plan?",
                                )
                              )
                                deletePricingPlan(plan.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast.info(
                                "Feature coming soon: Use the Firestore dashboard to edit existing plans directly for now.",
                              );
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {pricingPlans.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-400">
                      No dynamic plans found. Add your first plan to get
                      started.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Add Plan Form */}
            <div className="space-y-4">
              <Card className="border-[#E5E7EB] sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Add New Plan</CardTitle>
                  <CardDescription>
                    Creates a new subscription option for users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs uppercase font-bold text-gray-400">
                      Plan Name
                    </Label>
                    <Input
                      value={newPlan.name}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, name: e.target.value })
                      }
                      placeholder="e.g. Pro Plan"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase font-bold text-gray-400">
                        Price (INR)
                      </Label>
                      <Input
                        type="number"
                        value={newPlan.price}
                        onChange={(e) =>
                          setNewPlan({
                            ...newPlan,
                            price: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase font-bold text-gray-400">
                        Quota
                      </Label>
                      <Input
                        type="number"
                        value={newPlan.quota}
                        onChange={(e) =>
                          setNewPlan({
                            ...newPlan,
                            quota: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs uppercase font-bold text-gray-400">
                      Description
                    </Label>
                    <Textarea
                      value={newPlan.description}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, description: e.target.value })
                      }
                      placeholder="Short summary of the plan"
                      className="resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Mark as Popular
                    </Label>
                    <Switch
                      checked={newPlan.popular}
                      onCheckedChange={(v) =>
                        setNewPlan({ ...newPlan, popular: v })
                      }
                    />
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={async () => {
                        if (!newPlan.name || !newPlan.quota)
                          return toast.error("Name and Quota are required");
                        // Add some default features if empty
                        const planToSave = {
                          ...newPlan,
                          features: newPlan.features.length
                            ? newPlan.features
                            : [
                                "Email Verification",
                                "Bulk Support",
                                "24/7 Priority Support",
                              ],
                        };
                        const success = await addPricingPlan(planToSave);
                        if (success) {
                          setNewPlan({
                            name: "",
                            price: 0,
                            currency: "INR",
                            quota: 0,
                            description: "",
                            features: [],
                            popular: false,
                            active: true,
                          });
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
