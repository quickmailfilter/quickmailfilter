import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { AlertTriangle, CheckCircle2, Clock, Eye } from "lucide-react";

export const UserReportsPage = () => {
  const { user, allReports } = useApp();

  // Get reports about the current user
  const userReports = useMemo(() => {
    if (!user) return [];
    return allReports
      .filter((report) => report.reportedUserId === user.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [allReports, user]);

  const reportStats = useMemo(() => {
    return {
      total: userReports.length,
      open: userReports.filter((r) => r.status === "open").length,
      investigating: userReports.filter((r) => r.status === "investigating")
        .length,
      closed: userReports.filter((r) => r.status === "closed").length,
    };
  }, [userReports]);

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
          Account Reports
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          View reports made about your account and their status
        </p>
      </div>

      {reportStats.total === 0 ? (
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Reports
            </h3>
            <p className="text-gray-600">
              Great! There are no reports against your account.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
            <Card className="border-[#E5E7EB]">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {reportStats.total}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Reports
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {reportStats.open}
                </div>
                <div className="text-sm text-muted-foreground">Open</div>
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {reportStats.investigating}
                </div>
                <div className="text-sm text-muted-foreground">
                  Investigating
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {reportStats.closed}
                </div>
                <div className="text-sm text-muted-foreground">Closed</div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Table */}
          <Card className="border-[#E5E7EB]">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Reports ({userReports.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              <div className="rounded-lg border border-[#E5E7EB] overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-accent/30">
                      <TableHead>Reason</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userReports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-accent/20">
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
                        <TableCell className="text-sm text-muted-foreground">
                          {report.reportedByName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {report.createdAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-full max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Report Details</DialogTitle>
                                <DialogDescription>
                                  Details about this report against your account
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                {/* Report Info */}
                                <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/70 space-y-2 text-sm">
                                  <h4 className="font-semibold text-gray-900">
                                    Report Information
                                  </h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">
                                      Reason:
                                    </span>
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
                                      Status:
                                    </span>
                                    <Badge
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
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">
                                      Reported By:
                                    </span>
                                    <span className="text-xs">
                                      {report.reportedByName}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Date:</span>
                                    <span className="text-xs">
                                      {report.createdAt.toLocaleString()}
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

                                {/* Resolution */}
                                {report.resolvedAt && (
                                  <div className="p-3 rounded-lg border border-green-200 bg-green-50/70 space-y-2">
                                    <h4 className="font-semibold text-gray-900 text-sm">
                                      Resolution
                                    </h4>
                                    <div className="text-sm text-gray-600">
                                      <p>
                                        <strong>Resolved:</strong>{" "}
                                        {report.resolvedAt.toLocaleString()}
                                      </p>
                                      {report.resolution && (
                                        <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                                          {report.resolution}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {report.status === "open" && (
                                  <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/70">
                                    <p className="text-sm text-orange-800">
                                      <strong>Note:</strong> This report is
                                      currently under review. We will notify you
                                      when there is an update.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
