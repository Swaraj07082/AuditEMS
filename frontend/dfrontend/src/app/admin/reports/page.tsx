"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Eye,
  Router,
  User,
  Check,
} from "lucide-react";
import { PDF, PdfWithUser, UserWithPdfCount } from "@/app/types/pdf";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [reports, setReports] = useState<PdfWithUser[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [reviewerSearchTerm, setReviewerSearchTerm] = useState("");
  const [reviewers, setReviewers] = useState<UserWithPdfCount[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kick off both fetches at the same time
        const [reviewersRes, reportsRes] = await Promise.all([
          fetch("/api/reviewers", {
            headers: { "Content-Type": "application/json" },
          }),
          fetch("/api/getallpdfs", {
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        // Parse JSON only for successful responses
        if (reviewersRes.ok) {
          const reviewersData = await reviewersRes.json();
          setReviewers(reviewersData);
        } else {
          console.error("Failed to load reviewers");
        }

        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setReports(reportsData);
        } else {
          console.error("Failed to load reports");
        }
      } catch (err) {
        console.error("Network error:", err);
      }
    };

    fetchData();
  }, []);

  const filteredReports = reports.filter(
    (report) =>
      report.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fixed: Use actual reviewers data instead of mockReviewers
  const filteredReviewers = reviewers.filter(
    (reviewer) =>
      reviewer.name.toLowerCase().includes(reviewerSearchTerm.toLowerCase()) ||
      reviewer.email.toLowerCase().includes(reviewerSearchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "default";
      case "Pending":
        return "secondary";
      case "Under Review":
        return "outline";
      case "Rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "secondary";
      case "Low":
        return "outline";
      default:
        return "secondary";
    }
  };

  function formatDate(date: string | Date | null | undefined) {
    if (!date) return "N/A";

    const parsedDate = typeof date === "string" ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) return "Invalid date";

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(parsedDate);
  }

  const router = useRouter();

  const handleDeletereport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      const res = await fetch(`/api/deletepdf/${reportId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Optimistically update UI
        setReports((prev) => prev.filter((u) => u.id !== reportId));
        toast({
          title: "Report Deleted",
          description: "The report has been successfully deleted.",
        });
      } else {
        console.error("Failed to delete report");
        toast({
          title: "Deletion Failed",
          description: "Failed to delete the report. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error deleting report:", err);
      toast({
        title: "Deletion Failed",
        description: "An error occurred while deleting the report.",
        variant: "destructive",
      });
    }
  };

  const handleAssignReviewer = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsAssignDialogOpen(true);
    setReviewerSearchTerm("");
  };

  const assignReviewer = async (reviewerId: string, reviewerName: string) => {
    try {
      const response = await fetch(`/api/reviewers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: selectedReportId,
          reviewerId: reviewerId,
        }),
      });

      if (response.ok) {
        // Update the reports state to reflect the assignment
        setReports((prev) =>
          prev.map((report) =>
            report.id === selectedReportId
              ? {
                  ...report,
                  reviewerId: reviewerId,
                  reviewerName: reviewerName,
                }
              : report
          )
        );

        toast({
          title: "Reviewer Assigned",
          description: `${reviewerName} has been assigned to review this report.`,
        });
      } else {
        toast({
          title: "Assignment Failed",
          description: "Failed to assign reviewer. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "An error occurred while assigning the reviewer.",
        variant: "destructive",
      });
    }

    setIsAssignDialogOpen(false);
    setSelectedReportId("");
  };

  // Helper function to get reviewer name by ID
  const getReviewerName = (reviewerId: string | null | undefined) => {
    if (!reviewerId) return "Unassigned";
    const reviewer = reviewers.find((r) => r.id === reviewerId);
    return reviewer ? reviewer.name : "Unknown Reviewer";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Manage and review audit reports</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Reports
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Management</CardTitle>
          <CardDescription>
            View and manage all audit reports in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>FlagCount</TableHead>
                <TableHead>uploadedAt</TableHead>
                <TableHead>updatedAt</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    {report.filename}
                  </TableCell>
                  <TableCell>{report.user.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.flagCount}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(report.uploadedAt)}</TableCell>
                  <TableCell>{formatDate(report.updatedAt)}</TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {getReviewerName(report.reviewerId)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            router.push(`/dashboard/${report.id}`);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Report
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleAssignReviewer(report.id)}
                        >
                          <User className="mr-2 h-4 w-4" />
                          {report.reviewerId ? "Reassign Reviewer" : "Assign Reviewer"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Change Status</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeletereport(report.id)}
                        >
                          Delete Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Reviewer Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Reviewer</DialogTitle>
            <DialogDescription>
              Search and select a reviewer for this report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reviewers..."
                value={reviewerSearchTerm}
                onChange={(e) => setReviewerSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredReviewers.map((reviewer) => (
                <div
                  key={reviewer.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => assignReviewer(reviewer.id, reviewer.name)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {reviewer.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {reviewer.email}
                    </p>
                  </div>
                  <Check className="h-4 w-4 text-gray-400" />
                </div>
              ))}
              {filteredReviewers.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No reviewers found
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}