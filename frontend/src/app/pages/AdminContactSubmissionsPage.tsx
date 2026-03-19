import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Search, Mail, Trash2, Eye, Check, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
  readAt?: string;
  status: string;
}

export const AdminContactSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] =
    useState<ContactSubmission | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSubmissions();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSubmissions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "contactSubmissions"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          name: docData.name,
          email: docData.email,
          phone: docData.phone,
          subject: docData.subject,
          message: docData.message,
          createdAt:
            docData.createdAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          read: docData.read || false,
          readAt: docData.readAt,
          status: docData.status || "new",
        } as ContactSubmission;
      });
      setSubmissions(data);
    } catch (error: any) {
      console.error("Failed to fetch submissions:", error);
      toast.error("Failed to load contact submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (submissionId: string) => {
    try {
      await updateDoc(doc(db, "contactSubmissions", submissionId), {
        read: true,
        readAt: new Date().toISOString(),
      });

      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, read: true } : s)),
      );
      toast.success("Submission marked as read");
    } catch (error: any) {
      console.error("Failed to mark as read:", error);
      toast.error("Failed to update submission");
    }
  };

  const handleDelete = async (submissionId: string) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "contactSubmissions", submissionId));

      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      setShowDeleteConfirm(null);
      toast.success("Submission deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete submission:", error);
      toast.error("Failed to delete submission");
    } finally {
      setDeleting(false);
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && !submission.read) ||
      (statusFilter === "read" && submission.read);

    return matchesSearch && matchesStatus;
  });

  const unreadCount = submissions.filter((s) => !s.read).length;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Mail className="w-6 h-6 text-[#2563EB]" />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">
            Contact Submissions
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage and respond to customer contact forms
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {submissions.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Messages</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-amber-500">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-1">
              <div className="text-3xl font-bold text-amber-600">
                {unreadCount}
              </div>
              {unreadCount > 0 && (
                <div className="ml-2 w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">Unread Messages</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-green-500">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {submissions.filter((s) => s.read).length}
            </div>
            <div className="text-sm text-muted-foreground">Read Messages</div>
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
                placeholder="Search by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus-visible:border-[#2563EB]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:outline-none focus:border-[#2563EB]"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            <Button
              onClick={fetchSubmissions}
              disabled={loading}
              variant="outline"
              className="border-gray-300"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card className="border-[#E5E7EB] overflow-hidden">
        <CardContent className="p-0">
          {loading && submissions.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No contact submissions found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <TableRow>
                    <TableHead className="font-semibold">From</TableHead>
                    <TableHead className="font-semibold">Subject</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow
                      key={submission.id}
                      className={`border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors ${
                        !submission.read ? "bg-blue-50" : ""
                      }`}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {submission.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {submission.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-700 truncate max-w-xs">
                          {submission.subject}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {submission.read ? (
                            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Read
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Unread
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* View Button */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  if (!submission.read) {
                                    handleMarkAsRead(submission.id);
                                  }
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-white">
                              <DialogHeader>
                                <DialogTitle>
                                  Contact Message Details
                                </DialogTitle>
                                <DialogDescription>
                                  Submitted{" "}
                                  {new Date(
                                    selectedSubmission?.createdAt || "",
                                  ).toLocaleString()}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedSubmission && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-semibold text-gray-600">
                                        Name
                                      </label>
                                      <p className="text-gray-900 mt-1">
                                        {selectedSubmission.name}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold text-gray-600">
                                        Email
                                      </label>
                                      <p className="text-gray-900 mt-1">
                                        <a
                                          href={`mailto:${selectedSubmission.email}`}
                                          className="text-[#2563EB] hover:underline"
                                        >
                                          {selectedSubmission.email}
                                        </a>
                                      </p>
                                    </div>
                                    {selectedSubmission.phone && (
                                      <div>
                                        <label className="text-sm font-semibold text-gray-600">
                                          Phone
                                        </label>
                                        <p className="text-gray-900 mt-1">
                                          {selectedSubmission.phone}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="text-sm font-semibold text-gray-600">
                                      Subject
                                    </label>
                                    <p className="text-gray-900 mt-1">
                                      {selectedSubmission.subject}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-semibold text-gray-600">
                                      Message
                                    </label>
                                    <div className="bg-gray-50 rounded-md p-4 mt-1 border border-gray-200 max-h-96 overflow-y-auto">
                                      <p className="text-gray-700 whitespace-pre-wrap">
                                        {selectedSubmission.message}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {/* Delete Button */}
                          {showDeleteConfirm === submission.id ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(submission.id)}
                                disabled={deleting}
                              >
                                {deleting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Confirm"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(null)}
                                disabled={deleting}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() =>
                                setShowDeleteConfirm(submission.id)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Count */}
      {filteredSubmissions.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Showing {filteredSubmissions.length} of {submissions.length}{" "}
          submissions
        </div>
      )}
    </div>
  );
};
