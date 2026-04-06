import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Search, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export const AdminReportsPage = () => {
  const { allReports, updateReportStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [updateData, setUpdateData] = useState({
    status: "open",
    resolution: "",
  });

  // Get status counts
  const statusCounts = useMemo(() => {
    return {
      open: allReports.filter((r) => r.status === "open").length,
      investigating: allReports.filter((r) => r.status === "investigating")
        .length,
      closed: allReports.filter((r) => r.status === "closed").length,
    };
  }, [allReports]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return allReports.filter((report) => {
      const matchesSearch =
        report.reportedUserName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        report.reportedUserEmail
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        report.reason.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;
      const matchesSeverity =
        severityFilter === "all" || report.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [allReports, searchTerm, statusFilter, severityFilter]);

  const handleUpdateStatus = async () => {
    if (!selectedReportId) return;

    if (updateData.status === "closed" && !updateData.resolution.trim()) {
      toast.error("Please provide a resolution for closing the report");
      return;
    }

    setActionLoading(true);
    const success = await updateReportStatus(
      selectedReportId,
      updateData.status as any,
      updateData.resolution,
    );
    setActionLoading(false);

    if (success) {
      setSelectedReportId(null);
      setUpdateData({ status: "open", resolution: "" });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "investigating":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "closed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1E3A8A]">
          User Reports
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage and review reported user accounts
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">
              {statusCounts.open}
            </div>
            <div className="text-sm text-muted-foreground">Open Reports</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {statusCounts.investigating}
            </div>
            <div className="text-sm text-muted-foreground">Investigating</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {statusCounts.closed}
            </div>
            <div className="text-sm text-muted-foreground">Closed</div>
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
                placeholder="Search by user name, email or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="border-[#E5E7EB]">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="rounded-lg border border-[#E5E7EB] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/30">
                  <TableHead>Reported User</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-accent/20">
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {report.reportedUserName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {report.reportedUserEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {report.reason.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs ${getSeverityColor(report.severity)}`}
                        >
                          {report.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(report.status)}
                          <Badge
                            variant="outline"
                            className={`capitalize text-xs ${
                              report.status === "open"
                                ? "border-red-300 text-red-700 bg-red-50"
                                : report.status === "investigating"
                                  ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                                  : "border-green-300 text-green-700 bg-green-50"
                            }`}
                          >
                            {report.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {report.reportedByName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {report.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReportId(report.id);
                                setUpdateData({
                                  status: report.status,
                                  resolution: report.resolution || "",
                                });
                              }}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
                              <DialogTitle className="text-xl">
                                Report Details
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pb-6">
                              {/* Reported User Info */}
                              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/70 space-y-2 text-sm">
                                <h4 className="font-semibold text-gray-900">
                                  Reported User
                                </h4>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Name:</span>
                                  <span className="font-medium">
                                    {report.reportedUserName}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Email:</span>
                                  <span className="text-xs text-blue-600 truncate">
                                    {report.reportedUserEmail}
                                  </span>
                                </div>
                              </div>

                              {/* Report Details */}
                              <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/70 space-y-2 text-sm">
                                <h4 className="font-semibold text-gray-900">
                                  Report Information
                                </h4>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Reason:</span>
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    {report.reason.replace(/_/g, " ")}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">
                                    Severity:
                                  </span>
                                  <Badge
                                    className={`text-xs ${getSeverityColor(report.severity)}`}
                                  >
                                    {report.severity.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">
                                    Created:
                                  </span>
                                  <span className="text-xs">
                                    {report.createdAt.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">
                                    Reported By:
                                  </span>
                                  <span className="text-xs">
                                    {report.reportedByName}
                                  </span>
                                </div>
                              </div>

                              {/* Description */}
                              <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/70 space-y-2">
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  Description
                                </h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {report.description}
                                </p>
                              </div>

                              {/* Update Status */}
                              <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/70 space-y-3">
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  Update Status
                                </h4>
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-gray-700">
                                    Status
                                  </label>
                                  <Select
                                    value={updateData.status}
                                    onValueChange={(value) =>
                                      setUpdateData({
                                        ...updateData,
                                        status: value,
                                      })
                                    }
                                  >
                                    <SelectTrigger className="h-9 text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="open">Open</SelectItem>
                                      <SelectItem value="investigating">
                                        Investigating
                                      </SelectItem>
                                      <SelectItem value="closed">
                                        Closed
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {updateData.status === "closed" && (
                                  <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-700">
                                      Resolution
                                    </label>
                                    <textarea
                                      placeholder="Describe the action taken..."
                                      value={updateData.resolution}
                                      onChange={(e) =>
                                        setUpdateData({
                                          ...updateData,
                                          resolution: e.target.value,
                                        })
                                      }
                                      className="w-full min-h-24 px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                  </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedReportId(null)}
                                    disabled={actionLoading}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                                    onClick={handleUpdateStatus}
                                    disabled={actionLoading}
                                  >
                                    Update Status
                                  </Button>
                                </div>
                              </div>

                              {report.resolvedAt && (
                                <div className="p-3 rounded-lg border border-green-200 bg-green-50/70 space-y-2 text-sm">
                                  <h4 className="font-semibold text-gray-900">
                                    Resolution
                                  </h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">
                                      Resolved:
                                    </span>
                                    <span className="text-xs">
                                      {report.resolvedAt.toLocaleString()}
                                    </span>
                                  </div>
                                  {report.resolution && (
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                      {report.resolution}
                                    </p>
                                  )}
                                </div>
                              )}
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
