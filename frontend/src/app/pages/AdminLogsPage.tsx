import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { StatusBadge } from '../components/StatusBadge';
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
import { Search, Filter } from 'lucide-react';

export const AdminLogsPage = () => {
  const { allVerifications, allUsers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  const filteredLogs = allVerifications.filter(log => {
    const matchesSearch = log.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesUser = userFilter === 'all' || log.userId === userFilter;
    return matchesSearch && matchesStatus && matchesUser;
  });

  const getUserName = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1E3A8A]">System Logs</h1>
        <p className="text-gray-600 text-sm sm:text-base">Monitor all email verification activities</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {allVerifications.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Verifications</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-green-500">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {allVerifications.filter(v => v.status === 'valid').length}
            </div>
            <div className="text-sm text-muted-foreground">Valid</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-red-500">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">
              {allVerifications.filter(v => v.status === 'invalid').length}
            </div>
            <div className="text-sm text-muted-foreground">Invalid</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-amber-500">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-1">
              {allVerifications.filter(v => v.status === 'risky').length}
            </div>
            <div className="text-sm text-muted-foreground">Risky</div>
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
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="invalid">Invalid</SelectItem>
                  <SelectItem value="risky">Risky</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
              <Select value={userFilter} onValueChange={setUserFilter} >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {allUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border-[#E5E7EB]">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Verification Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="rounded-lg border border-[#E5E7EB] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/30">
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-accent/20">
                      <TableCell className="font-medium">{log.email}</TableCell>
                      <TableCell>
                        <StatusBadge status={log.status} />
                      </TableCell>
                      <TableCell className="text-sm">{getUserName(log.userId)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2563EB]"
                              style={{ width: `${log.confidence}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {log.confidence}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {log.reason}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {log.timestamp.toLocaleDateString()} {log.timestamp.toLocaleTimeString()}
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
