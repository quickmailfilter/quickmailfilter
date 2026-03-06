import React, { useState } from "react";
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
import { Search, UserCog, Ban, Crown, CheckCircle2 } from "lucide-react";

export const AdminUsersPage = () => {
  const { allUsers, adminUpdateUser, resetQuota } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === "all" || user.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const handleUpgradePlan = async (
    userId: string,
    newPlan: "free" | "business" | "enterprise",
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to change this user's plan to ${newPlan.toUpperCase()}?`,
      )
    ) {
      return;
    }
    setActionLoading(true);
    await adminUpdateUser(userId, { plan: newPlan });
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
              {allUsers.filter((u) => u.plan === "free").length}
            </div>
            <div className="text-sm text-muted-foreground">Free Plan</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-blue-500">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {allUsers.filter((u) => u.plan === "business").length}
            </div>
            <div className="text-sm text-muted-foreground">Business Plan</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-[#1E3A8A]">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-[#1E3A8A] mb-1">
              {allUsers.filter((u) => u.plan === "enterprise").length}
            </div>
            <div className="text-sm text-muted-foreground">Enterprise Plan</div>
          </CardContent>
        </Card>
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
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
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
                            user.plan === "free"
                              ? "border-gray-300 text-gray-700"
                              : user.plan === "business"
                                ? "border-blue-300 text-blue-700 bg-blue-50"
                                : "border-[#1E3A8A] text-[#1E3A8A] bg-blue-100"
                          }
                        >
                          {user.plan.charAt(0).toUpperCase() +
                            user.plan.slice(1)}
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <UserCog className="w-4 h-4 mr-1" />
                              Manage
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Manage User: {user.name}
                              </DialogTitle>
                              <DialogDescription>
                                {user.email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 pt-6">
                              {/* Account Info Section */}
                              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="w-12 h-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xl uppercase">
                                  {user.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-gray-900 truncate">
                                    {user.name}
                                  </div>
                                  <div className="text-sm text-gray-500 truncate">
                                    {user.email}
                                  </div>
                                </div>
                                <Badge
                                  className={
                                    user.disabled
                                      ? "bg-red-100 text-red-700 hover:bg-red-100 border-none px-3"
                                      : "bg-green-100 text-green-700 hover:bg-green-100 border-none px-3"
                                  }
                                >
                                  {user.disabled ? "Inactive" : "Active"}
                                </Badge>
                              </div>

                              <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                  <Crown className="w-4 h-4 text-blue-500" />
                                  Subscription Plan
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                  {(
                                    ["free", "business", "enterprise"] as const
                                  ).map((plan) => (
                                    <Button
                                      key={plan}
                                      size="sm"
                                      variant={
                                        user.plan === plan
                                          ? "default"
                                          : "outline"
                                      }
                                      className={
                                        user.plan === plan
                                          ? "bg-[#2563EB] hover:bg-[#1E3A8A]"
                                          : "border-gray-200"
                                      }
                                      disabled={actionLoading}
                                      onClick={() =>
                                        handleUpgradePlan(user.id, plan)
                                      }
                                    >
                                      {plan.charAt(0).toUpperCase() +
                                        plan.slice(1)}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                  <UserCog className="w-4 h-4 text-blue-500" />
                                  Quota Management
                                </h4>
                                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">
                                      Usage this month
                                    </span>
                                    <span className="font-bold text-[#1E3A8A]">
                                      {user.usedQuota} / {user.monthlyQuota}
                                    </span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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
                                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 h-10"
                                    disabled={actionLoading}
                                    onClick={() => handleResetQuota(user.id)}
                                  >
                                    Reset Monthly Quota
                                  </Button>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-gray-100 flex gap-3">
                                <Button
                                  variant={
                                    user.disabled ? "outline" : "destructive"
                                  }
                                  className={`flex-1 h-11 ${
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
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Enable Account
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="w-4 h-4 mr-2" />
                                      Disable Account
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
