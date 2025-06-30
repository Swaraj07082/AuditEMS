"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  Upload,
  Download,
  Eye,
  Trash2,
  FileText,
  Calendar,
  HardDrive,
  // LogOut,
  MoreVertical,
  Grid3X3,
  List,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner"; // Optional: for better user feedback
import { stat } from "fs";
import AuthCheck from "./authcheck";

const samplePDFs = [
  {
    id: "1",
    name: "Annual Audit Report 2024.pdf",
    size: "2.4 MB",
    uploadDate: "2024-01-15",
    status: "verified",
    type: "Annual Report",
    url: "/placeholder.pdf",
  },
  {
    id: "2",
    name: "Financial Statement Q3.pdf",
    size: "1.8 MB",
    uploadDate: "2024-01-12",
    status: "pending",
    type: "Financial Statement",
    url: "/placeholder.pdf",
  },
  {
    id: "3",
    name: "Compliance Audit 2023.pdf",
    size: "3.2 MB",
    uploadDate: "2024-01-10",
    status: "verified",
    type: "Compliance Report",
    url: "/placeholder.pdf",
  },
  {
    id: "4",
    name: "Internal Controls Review.pdf",
    size: "1.5 MB",
    uploadDate: "2024-01-08",
    status: "failed",
    type: "Internal Audit",
    url: "/placeholder.pdf",
  },
  {
    id: "5",
    name: "Risk Assessment Report.pdf",
    size: "2.1 MB",
    uploadDate: "2024-01-05",
    status: "verified",
    type: "Risk Assessment",
    url: "/placeholder.pdf",
  },
  {
    id: "6",
    name: "Vendor Audit Summary.pdf",
    size: "900 KB",
    uploadDate: "2024-01-03",
    status: "pending",
    type: "Vendor Audit",
    url: "/placeholder.pdf",
  },
];

export default function PDFDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(false);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Filter PDFs based on search and filters
  const filteredPDFs = samplePDFs.filter((pdf) => {
    const matchesSearch = pdf.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || pdf.status === statusFilter;
    const matchesType = typeFilter === "all" || pdf.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculateTotalSize = () => {
    return samplePDFs
      .reduce((total, pdf) => {
        const size = parseFloat(pdf.size.replace(/[^\d.]/g, ""));
        const unit = pdf.size.includes("KB") ? 0.001 : 1;
        return total + size * unit;
      }, 0)
      .toFixed(1);
  };

  // Event handlers
  // const handleLogout = async () => {
  //   setIsLoading(true);
  //   try {
  //     await signOut({ callbackUrl: "/" });
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //     // toast.error("Failed to logout. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleDownload = async (pdf: (typeof samplePDFs)[0]) => {
    try {
      // Replace with actual download logic
      console.log(`Downloading ${pdf.name}`);
      // toast.success(`Starting download: ${pdf.name}`);

      // Simulate download
      const link = document.createElement("a");
      link.href = pdf.url;
      link.download = pdf.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      // toast.error("Failed to download file");
    }
  };

  const handleView = (pdf: (typeof samplePDFs)[0]) => {
    try {
      window.open(pdf.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("View error:", error);
      // toast.error("Failed to open file");
    }
  };

  const handleDelete = async (pdf: (typeof samplePDFs)[0]) => {
    if (window.confirm(`Are you sure you want to delete "${pdf.name}"?`)) {
      try {
        // Replace with actual delete API call
        console.log(`Deleting ${pdf.name}`);
        // toast.success(`Deleted: ${pdf.name}`);
      } catch (error) {
        console.error("Delete error:", error);
        // toast.error("Failed to delete file");
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  if (status == "authenticated") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">
                PDF Dashboard
              </h1>
              {session?.user?.name && (
                <p className="text-gray-600">Welcome, {session.user.name}</p>
              )}
            </div>
            {/* <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoading ? "Logging out..." : "Logout"}
          </Button> */}
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            Manage and access your uploaded audit reports
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total PDFs
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{samplePDFs.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified</CardTitle>
                <Badge className="bg-green-100 text-green-800">✓</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {samplePDFs.filter((pdf) => pdf.status === "verified").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Badge className="bg-yellow-100 text-yellow-800">⏳</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {samplePDFs.filter((pdf) => pdf.status === "pending").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Storage Used
                </CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {calculateTotalSize()} MB
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search PDFs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Annual Report">Annual Report</SelectItem>
                  <SelectItem value="Financial Statement">
                    Financial Statement
                  </SelectItem>
                  <SelectItem value="Compliance Report">
                    Compliance Report
                  </SelectItem>
                  <SelectItem value="Internal Audit">Internal Audit</SelectItem>
                  <SelectItem value="Risk Assessment">
                    Risk Assessment
                  </SelectItem>
                  <SelectItem value="Vendor Audit">Vendor Audit</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm ||
                statusFilter !== "all" ||
                typeFilter !== "all") && (
                <Button variant="outline" onClick={clearFilters} size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}

              <Separator orientation="vertical" className="h-8" />

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="flex items-center justify-center"
                onClick={() => router.push("/auditVerify")}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredPDFs.length} of {samplePDFs.length} PDFs
              </p>
            </div>
          )}

          {/* PDF Grid/List */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredPDFs.map((pdf) => (
              <Card key={pdf.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate" title={pdf.name}>
                        {pdf.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {pdf.type}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(pdf.status)}>
                      {pdf.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(pdf.uploadDate).toLocaleDateString()}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <HardDrive className="h-4 w-4 mr-2" />
                      {pdf.size}
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(pdf)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(pdf)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(pdf)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredPDFs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No PDFs found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload your first PDF to get started"}
              </p>
              {(searchTerm ||
                statusFilter !== "all" ||
                typeFilter !== "all") && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <>
        <AuthCheck />
      </>
    );
  }
}
