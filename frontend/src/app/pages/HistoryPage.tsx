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
import { StatusBadge } from "../components/StatusBadge";
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
  Search,
  Download,
  Mail,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowUpDown,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

export const HistoryPage = () => {
  const { verificationHistory } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "status" | "confidence">(
    "date",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [itemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredHistory = useMemo(() => {
    return verificationHistory.filter((item) => {
      const matchesSearch = item.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const itemDate = new Date(item.timestamp);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === "today") {
          matchesDate = itemDate.toDateString() === today.toDateString();
        } else if (dateFilter === "week") {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = itemDate >= weekAgo;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(today);
          monthAgo.setDate(monthAgo.getDate() - 30);
          matchesDate = itemDate >= monthAgo;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [verificationHistory, searchTerm, statusFilter, dateFilter]);

  const sortedHistory = useMemo(() => {
    let sorted = [...filteredHistory];

    if (sortBy === "date") {
      sorted.sort((a, b) => {
        const timeA = a.timestamp.getTime();
        const timeB = b.timestamp.getTime();
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      });
    } else if (sortBy === "status") {
      sorted.sort((a, b) => {
        const statusOrder = { valid: 1, "catch-all": 2, risky: 3, invalid: 4 };
        const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 0;
        const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 0;
        return sortOrder === "asc" ? aOrder - bOrder : bOrder - aOrder;
      });
    } else if (sortBy === "confidence") {
      sorted.sort((a, b) => {
        return sortOrder === "asc"
          ? a.confidence - b.confidence
          : b.confidence - a.confidence;
      });
    }

    return sorted;
  }, [filteredHistory, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedHistory.slice(startIndex, endIndex);
  }, [sortedHistory, currentPage, itemsPerPage]);

  const handleExport = () => {
    const csv = [
      ["Email", "Status", "Confidence", "Reason", "Date"],
      ...filteredHistory.map((item) => [
        item.email,
        item.status,
        item.confidence,
        item.reason || "",
        item.timestamp.toLocaleString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verification-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("History exported successfully!");
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard");
  };

  const handleDownloadReport = (item: any) => {
    // Create a detailed verification report
    const report = {
      email: item.email,
      status: item.status,
      confidence: item.confidence,
      reason: item.reason || "No issues detected",
      formatValid: item.formatValid,
      domainExists: item.domainExists,
      mxRecordFound: item.mxRecordFound,
      disposable: item.disposable,
      roleBased: item.roleBased,
      catchAll: item.catchAll,
      verifiedAt: item.timestamp.toLocaleString(),
      reportGeneratedAt: new Date().toLocaleString(),
    };

    // Create JSON report
    const jsonReport = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonReport], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verification-report-${item.email}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully!");
  };

  const toggleSort = (column: "date" | "status" | "confidence") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Mail className="w-6 h-6" />
              </div>
              Verification History
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Track and manage all your email verification activities
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              className="bg-white text-[#2563EB] hover:bg-blue-50 shadow-md w-full sm:w-auto font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Total Verifications
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {verificationHistory.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valid */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Valid</p>
                <p className="text-3xl font-bold text-green-600">
                  {
                    verificationHistory.filter((v) => v.status === "valid")
                      .length
                  }
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invalid */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium mb-1">Invalid</p>
                <p className="text-3xl font-bold text-red-600">
                  {
                    verificationHistory.filter((v) => v.status === "invalid")
                      .length
                  }
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Catch-All */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">
                  Catch-All
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {
                    verificationHistory.filter((v) => v.status === "catch-all")
                      .length
                  }
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risky */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium mb-1">Risky</p>
                <p className="text-3xl font-bold text-amber-600">
                  {
                    verificationHistory.filter((v) => v.status === "risky")
                      .length
                  }
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <Input
                placeholder="Search by email address..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                autoComplete="off"
                spellCheck="false"
                className="pl-10 h-10 bg-white border-gray-300 focus-visible:border-[#2563EB]"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">
                  Status
                </label>
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="bg-white h-10 border-gray-300 focus-visible:border-[#2563EB]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="valid">Valid</SelectItem>
                    <SelectItem value="catch-all">Catch-All</SelectItem>
                    <SelectItem value="invalid">Invalid</SelectItem>
                    <SelectItem value="risky">Risky</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">
                  Date Range
                </label>
                <Select
                  value={dateFilter}
                  onValueChange={(val) => {
                    setDateFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="bg-white h-10 border-gray-300 focus-visible:border-[#2563EB]">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">
                  Sort By
                </label>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(val) => {
                    const [newSortBy, newSortOrder] = val.split("-") as [
                      typeof sortBy,
                      typeof sortOrder,
                    ];
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="bg-white h-10 border-gray-300 focus-visible:border-[#2563EB]">
                    <SelectValue placeholder="Sort results" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="confidence-desc">
                      Highest Confidence
                    </SelectItem>
                    <SelectItem value="confidence-asc">
                      Lowest Confidence
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Info */}
            <div className="text-sm text-gray-600 flex items-center gap-2 pt-2">
              <Filter className="w-4 h-4" />
              <span>
                Showing <strong>{paginatedHistory.length}</strong> of{" "}
                <strong>{filteredHistory.length}</strong> results
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-gray-900">
              Recent Activity
            </CardTitle>
            <span className="text-xs font-semibold text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
              {filteredHistory.length}{" "}
              {filteredHistory.length === 1 ? "result" : "results"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="bg-gray-100 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-700 font-medium mb-2">
                {verificationHistory.length === 0
                  ? "No verifications yet"
                  : "No results match your filters"}
              </p>
              <p className="text-gray-500 text-sm">
                {verificationHistory.length === 0
                  ? "Start verifying emails to build your history"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                      <TableHead
                        className="font-bold text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                        onClick={() => toggleSort("date")}
                      >
                        <div className="flex items-center gap-2">
                          Date
                          {sortBy === "date" && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-gray-700">
                        Email Address
                      </TableHead>
                      <TableHead
                        className="font-bold text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                        onClick={() => toggleSort("status")}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {sortBy === "status" && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-bold text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                        onClick={() => toggleSort("confidence")}
                      >
                        <div className="flex items-center gap-2">
                          Confidence
                          {sortBy === "confidence" && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-gray-700">
                        Reason
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedHistory.map((item) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-blue-50/50 border-b border-gray-100 transition-colors"
                      >
                        <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {item.timestamp.toLocaleDateString()}
                            </span>
                            <span className="text-gray-500">
                              {item.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 truncate">
                          {item.email}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-24">
                              <div
                                className={`h-full rounded-full ${
                                  item.confidence >= 80
                                    ? "bg-green-500"
                                    : item.confidence >= 50
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${item.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                              {item.confidence}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-xs">
                          <span className="truncate block" title={item.reason}>
                            {item.reason || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleCopyEmail(item.email)}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
                              title="Copy email"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadReport(item)}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors text-gray-600 hover:text-green-600"
                              title="Download report"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <span className="text-sm text-gray-600">
                    Page <strong>{currentPage}</strong> of{" "}
                    <strong>{totalPages}</strong>
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="h-9"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="h-9"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
