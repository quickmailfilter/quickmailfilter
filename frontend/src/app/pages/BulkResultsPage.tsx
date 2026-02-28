import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
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
import { Download, FileText, Search, PieChart } from 'lucide-react';
import { toast } from 'sonner';

export const BulkResultsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bulkUploads } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const upload = bulkUploads.find(u => u.id === id);
  const results = upload?.results || [];

  const filteredResults = results.filter(result => {
    const matchesSearch = result.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || result.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!upload) {
    return (
      <div className="p-8 text-center mt-20">
        <h2 className="text-xl font-bold mb-4">Results Not Found</h2>
        <Button onClick={() => navigate('/dashboard/bulk')}>Back to Bulk Upload</Button>
      </div>
    );
  }

  const handleDownloadCSV = () => {
    // Mock CSV download
    const csv = [
      ['Email', 'Status', 'Confidence', 'Reason'],
      ...filteredResults.map(r => [r.email, r.status, r.confidence, r.reason])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'verified-emails.csv';
    a.click();
    toast.success('CSV downloaded successfully!');
  };

  const handleDownloadValidOnly = () => {
    const validEmails = filteredResults
      .filter(r => r.status === 'valid')
      .map(r => r.email)
      .join('\n');

    const blob = new Blob([validEmails], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'valid-emails.txt';
    a.click();
    toast.success('Valid emails downloaded!');
  };

  const validCount = results.filter(r => r.status === 'valid').length;
  const invalidCount = results.filter(r => r.status === 'invalid').length;
  const riskyCount = results.filter(r => r.status === 'risky').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">Verification Results</h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Complete analysis of {results.length} email addresses
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/bulk')} className="w-full sm:w-auto">
          New Upload
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{upload.totalEmails}</div>
            <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">Total</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-green-500">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{upload.validCount}</div>
            <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">Valid ({upload.totalEmails > 0 ? ((upload.validCount/upload.totalEmails)*100).toFixed(0) : 0}%)</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-red-500">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">{upload.invalidCount}</div>
            <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">Invalid ({upload.totalEmails > 0 ? ((upload.invalidCount/upload.totalEmails)*100).toFixed(0) : 0}%)</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-amber-500">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">{upload.riskyCount}</div>
            <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">Risky ({upload.totalEmails > 0 ? ((upload.riskyCount/upload.totalEmails)*100).toFixed(0) : 0}%)</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleDownloadValidOnly} className="bg-green-600 hover:bg-green-700 font-semibold shadow-md">
          <Download className="w-4 h-4 mr-2" />
          Download Valid Only
        </Button>
        <Button onClick={handleDownloadCSV} variant="outline" className="border-blue-200 hover:bg-blue-50">
          <FileText className="w-4 h-4 mr-2" />
          Export Full (CSV)
        </Button>
        <Button variant="outline" className="hidden sm:flex">
          <PieChart className="w-4 h-4 mr-2" />
          PDF Summary
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-[#E5E7EB] shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="invalid">Invalid</SelectItem>
                <SelectItem value="risky">Risky</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="border-[#E5E7EB] shadow-md overflow-hidden">
        <CardHeader className="bg-[#1E3A8A] border-b border-blue-900/10">
          <CardTitle className="text-white">Detailed Results ({filteredResults.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="py-4">Email Address</TableHead>
                  <TableHead className="py-4">Status</TableHead>
                  <TableHead className="py-4">Confidence</TableHead>
                  <TableHead className="py-4">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.id} className="hover:bg-blue-50/20 transition-colors border-b last:border-0">
                      <TableCell className="font-medium break-all min-w-[150px] py-4 px-6">{result.email}</TableCell>
                      <TableCell className="py-4 px-6">
                        <StatusBadge status={result.status} />
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2563EB]"
                              style={{ width: `${result.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-500 w-8">
                            {result.confidence}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-400 italic py-4 px-6">
                        {result.reason}
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
