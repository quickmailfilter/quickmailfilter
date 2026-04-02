import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Search, UserCog, Ban, Crown, CheckCircle2, Zap } from "lucide-react";

export const AdminUsersPage = () => {
  const { allUsers, adminUpdateUser, resetQuota, pricingPlans } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Get active plans for display
  const activePlans = useMemo(
    () => pricingPlans.filter((p) => p.active),
    [pricingPlans],
  );

  // Helper function to get the actual plan status (checking if plan exists)
  const getUserPlanStatus = (plan: string | null | undefined) => {
    if (!plan || plan === "free") return "free";
    // Check if this plan exists in active plans
    const planExists = activePlans.some((p) => p.name === plan);
    return planExists ? plan : "free";
  };

  // Calculate plan distribution for stats
  const planStats = useMemo(() => {
    const stats: Record<string, number> = { free: 0 };
    activePlans.forEach((plan) => {
      stats[plan.id] = 0;
    });

    allUsers.forEach((user) => {
      const actualPlan = getUserPlanStatus(user.plan);
      if (actualPlan === "free") {
        stats["free"]++;
      } else {
        // Find the plan by name and increment its count
        const plan = activePlans.find((p) => p.name === actualPlan);
        if (plan) {
          stats[plan.id] = (stats[plan.id] || 0) + 1;
        }
      }
    });

    return stats;
  }, [allUsers, activePlans]);

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (planFilter === "all") return matchesSearch;
    if (planFilter === "free") {
      const actualPlan = getUserPlanStatus(user.plan);
      return matchesSearch && actualPlan === "free";
    }

    const plan = activePlans.find((p) => p.id === planFilter);
    const actualPlan = getUserPlanStatus(user.plan);
    return matchesSearch && actualPlan === plan?.name;
  });

  const handleUpgradePlan = async (userId: string, newPlanId: string) => {
    let planName = "free";
    let planDisplay = "Free";

    if (newPlanId !== "free") {
      const plan = activePlans.find((p) => p.id === newPlanId);
      if (!plan) return;
      planName = plan.name;
      planDisplay = plan.name;
    }

    if (
      !window.confirm(
        `Are you sure you want to change this user's plan to ${planDisplay}?`,
      )
    ) {
      return;
    }
    setActionLoading(true);
    await adminUpdateUser(userId, { plan: planName });
    setActionLoading(false);
  };

  const handleToggleDisable = async (
    userId: string,
    currentlyDisabled: boolean,
  ) => {
    const action = currentlyDisabled ? "enable" : "disable";
    if (!window.confirm(`Are you sure you want to ${action} this account?`)) {
      return;
    }
    setActionLoading(true);
    await adminUpdateUser(userId, { disabled: !currentlyDisabled });
    setActionLoading(false);
  };

  const handleResetQuota = async (userId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to reset this user's monthly quota?",
      )
    ) {
      return;
    }
    setActionLoading(true);
    await resetQuota(userId);
    setActionLoading(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1E3A8A]">
          User Management
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage user accounts and permissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {allUsers.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-gray-500">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-1">
              {planStats["free"] || 0}
            </div>
            <div className="text-sm text-muted-foreground">Free Plan</div>
          </CardContent>
        </Card>

        {activePlans.slice(0, 2).map((plan, idx) => (
          <Card
            key={plan.id}
            className={`border-[#E5E7EB] border-l-4 ${
              idx === 0 ? "border-l-blue-500" : "border-l-[#1E3A8A]"
            }`}
          >
            <CardContent className="p-6 text-center">
              <div
                className={`text-3xl font-bold mb-1 ${
                  idx === 0 ? "text-blue-600" : "text-[#1E3A8A]"
                }`}
              >
                {planStats[plan.id] || 0}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {plan.name}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                {activePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-[#E5E7EB]">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="rounded-lg border border-[#E5E7EB] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/30">
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-accent/20">
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            getUserPlanStatus(user.plan) === "free"
                              ? "border-gray-300 text-gray-700"
                              : "border-blue-300 text-blue-700 bg-blue-50"
                          }
                        >
                          {getUserPlanStatus(user.plan) === "free"
                            ? "Free"
                            : getUserPlanStatus(user.plan)
                                .charAt(0)
                                .toUpperCase() +
                              getUserPlanStatus(user.plan).slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.usedQuota} / {user.monthlyQuota}
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-[#2563EB]"
                              style={{
                                width: `${(user.usedQuota / user.monthlyQuota) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.disabled
                              ? "bg-red-100 text-red-700 border-none"
                              : ""
                          }
                          variant={
                            user.role === "admin" ? "default" : "outline"
                          }
                        >
                          {user.role === "admin" && (
                            <Crown className="w-3 h-3 mr-1" />
                          )}
                          {user.disabled
                            ? "Disabled"
                            : user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <UserCog className="w-4 h-4 mr-1" />
                              Manage
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
                              <DialogTitle className="text-xl">
                                Manage User: {user.name}
                              </DialogTitle>
                              <DialogDescription className="text-sm">
                                {user.email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pb-6">
                              {/* Account Info Section */}
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200">
                                <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                                  {user.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-900 text-sm truncate">
                                    {user.name}
                                  </div>
                                  <div className="text-xs text-gray-600 truncate">
                                    {user.email}
                                  </div>
                                </div>
                                <Badge
                                  className={`flex-shrink-0 text-xs ${
                                    user.disabled
                                      ? "bg-red-100 text-red-700 border-none"
                                      : "bg-green-100 text-green-700 border-none"
                                  }`}
                                >
                                  {user.disabled ? "Inactive" : "Active"}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                  <Crown className="w-3 h-3 text-blue-500" />
                                  Current Plan
                                </h4>
                                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/70 space-y-1.5 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-xs">
                                      Plan:
                                    </span>
                                    <Badge className="bg-blue-600 text-white text-xs">
                                      {getUserPlanStatus(user.plan) === "free"
                                        ? "Free"
                                        : getUserPlanStatus(user.plan)
                                            .charAt(0)
                                            .toUpperCase() +
                                          getUserPlanStatus(user.plan).slice(1)}
                                    </Badge>
                                  </div>
                                  {user.monthlyQuota > 0 && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-600 text-xs">
                                        Quota:
                                      </span>
                                      <span className="font-semibold text-[#1E3A8A]">
                                        {user.monthlyQuota}
                                      </span>
                                    </div>
                                  )}
                                  {user.dailyCredits &&
                                    user.dailyCredits > 0 && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-600 text-xs">
                                          Daily:
                                        </span>
                                        <span className="font-semibold text-blue-600 flex items-center gap-1">
                                          <Zap className="w-2.5 h-2.5" />
                                          {user.dailyCredits}
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                  <Crown className="w-3 h-3 text-blue-500" />
                                  Change Plan
                                </h4>
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-gray-700">
                                    Select New Plan
                                  </label>
                                  <Select
                                    value={selectedPlanId || ""}
                                    onValueChange={setSelectedPlanId}
                                  >
                                    <SelectTrigger className="w-full h-9 text-sm">
                                      <SelectValue placeholder="Choose a plan..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64 overflow-y-auto bg-white border border-gray-200 shadow-lg">
                                      <SelectItem
                                        value="free"
                                        className="text-sm"
                                      >
                                        📍 Free Plan
                                      </SelectItem>
                                      {activePlans.map((plan) => (
                                        <SelectItem
                                          key={plan.id}
                                          value={plan.id}
                                          className="text-sm"
                                        >
                                          {plan.planType === "subscription"
                                            ? "📅"
                                            : "💳"}{" "}
                                          {plan.name} - ₹{plan.price}
                                          {plan.dailyCredits &&
                                            ` (${plan.dailyCredits}/day)`}
                                          {plan.creditAmount &&
                                            ` (${plan.creditAmount})`}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {selectedPlanId &&
                                  selectedPlanId !== "free" && (
                                    <div className="p-2.5 rounded-md border border-green-200 bg-green-50/60 space-y-1 max-h-40 overflow-y-auto">
                                      {activePlans
                                        .filter((p) => p.id === selectedPlanId)
                                        .map((plan) => (
                                          <div
                                            key={plan.id}
                                            className="space-y-1 text-xs"
                                          >
                                            <div className="font-semibold text-gray-900">
                                              {plan.name}
                                            </div>
                                            <div className="flex items-center justify-between">
                                              <span className="text-gray-600">
                                                Quota:
                                              </span>
                                              <span className="font-semibold text-green-600">
                                                {plan.quota}
                                              </span>
                                            </div>
                                            {plan.dailyCredits && (
                                              <div className="flex items-center justify-between">
                                                <span className="text-gray-600">
                                                  Daily:
                                                </span>
                                                <span className="font-semibold text-green-600 flex items-center gap-0.5">
                                                  <Zap className="w-2.5 h-2.5" />
                                                  {plan.dailyCredits}
                                                </span>
                                              </div>
                                            )}
                                            {plan.creditAmount && (
                                              <div className="flex items-center justify-between">
                                                <span className="text-gray-600">
                                                  One-Time:
                                                </span>
                                                <span className="font-semibold text-green-600">
                                                  {plan.creditAmount}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                    </div>
                                  )}

                                <Button
                                  size="sm"
                                  className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-sm h-9"
                                  disabled={
                                    actionLoading ||
                                    !selectedPlanId ||
                                    (selectedPlanId === "free" &&
                                      (!user.plan || user.plan === "free"))
                                  }
                                  onClick={() => {
                                    if (selectedPlanId === "free") {
                                      handleUpgradePlan(user.id, "free");
                                    } else if (selectedPlanId) {
                                      handleUpgradePlan(
                                        user.id,
                                        selectedPlanId,
                                      );
                                    }
                                    setSelectedPlanId(null);
                                  }}
                                >
                                  Update Plan
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                  <UserCog className="w-3 h-3 text-blue-500" />
                                  Quota Management
                                </h4>
                                <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <span className="text-gray-600">
                                      Usage this month
                                    </span>
                                    <span className="font-semibold text-[#1E3A8A]">
                                      {user.usedQuota} / {user.monthlyQuota}
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-gray-300 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-600"
                                      style={{
                                        width: `${(user.usedQuota / user.monthlyQuota) * 100}%`,
                                      }}
                                    />
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 h-8 text-xs"
                                    disabled={actionLoading}
                                    onClick={() => handleResetQuota(user.id)}
                                  >
                                    Reset Monthly Quota
                                  </Button>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-gray-200 flex gap-2">
                                <Button
                                  variant={
                                    user.disabled ? "outline" : "destructive"
                                  }
                                  className={`flex-1 h-9 text-sm ${
                                    user.disabled
                                      ? "border-green-200 text-green-700 hover:bg-green-50"
                                      : "bg-red-600 hover:bg-red-700 text-white"
                                  }`}
                                  disabled={actionLoading}
                                  onClick={() =>
                                    handleToggleDisable(
                                      user.id,
                                      !!user.disabled,
                                    )
                                  }
                                >
                                  {user.disabled ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                      Enable
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="w-3.5 h-3.5 mr-1.5" />
                                      Disable
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
