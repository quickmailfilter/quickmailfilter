import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Search, UserCog, Ban, Crown } from 'lucide-react';
import { toast } from 'sonner';

export const AdminUsersPage = () => {
  const { allUsers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || user.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const handleUpgradePlan = (userId: string, newPlan: string) => {
    toast.success(`User plan upgraded to ${newPlan}`);
  };

  const handleDisableAccount = (userId: string) => {
    toast.success('User account disabled');
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1E3A8A]">User Management</h1>
        <p className="text-gray-600 text-sm sm:text-base">Manage user accounts and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">{allUsers.length}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-gray-500">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-1">
              {allUsers.filter(u => u.plan === 'free').length}
            </div>
            <div className="text-sm text-muted-foreground">Free Plan</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-blue-500">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {allUsers.filter(u => u.plan === 'business').length}
            </div>
            <div className="text-sm text-muted-foreground">Business Plan</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-[#1E3A8A]">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-[#1E3A8A] mb-1">
              {allUsers.filter(u => u.plan === 'enterprise').length}
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
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-accent/20">
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            user.plan === 'free' 
                              ? 'border-gray-300 text-gray-700'
                              : user.plan === 'business'
                              ? 'border-blue-300 text-blue-700 bg-blue-50'
                              : 'border-[#1E3A8A] text-[#1E3A8A] bg-blue-100'
                          }
                        >
                          {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.usedQuota} / {user.monthlyQuota}
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-[#2563EB]"
                              style={{ width: `${(user.usedQuota / user.monthlyQuota) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                          {user.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
                              <DialogTitle>Manage User: {user.name}</DialogTitle>
                              <DialogDescription>{user.email}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <h4 className="font-medium mb-2">Change Plan</h4>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUpgradePlan(user.id, 'free')}
                                  >
                                    Free
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUpgradePlan(user.id, 'business')}
                                  >
                                    Business
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUpgradePlan(user.id, 'enterprise')}
                                  >
                                    Enterprise
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Account Actions</h4>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDisableAccount(user.id)}
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Disable Account
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
