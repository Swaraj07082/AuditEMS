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
  User,
  MoreVertical,
  Grid3X3,
  List,
  Filter,
  Flag,
  MessageSquare,
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
import AuthCheck from "./authcheck";
import { useSession, signOut } from "next-auth/react";
import { PDF } from "../types/pdf";
import { ThemeToggle } from "./theme-toggle"; // Import the ThemeToggle component

export default function PDFDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [samplePDFs, setsamplePDFS] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPDFs = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/getpdfs");

        if (!res.ok) {
          throw new Error(`Failed to fetch PDFs: ${res.status}`);
        }

        const data = await res.json();

        // Debug: Log the actual response to understand the structure
        console.log("API Response:", data);
        console.log("Type of response:", typeof data);
        console.log("Is array:", Array.isArray(data));

        // Handle different possible response formats
        let pdfsArray: PDF[] = [];

        if (Array.isArray(data)) {
          // Direct array response
          pdfsArray = data;
        } else if (data && typeof data === "object") {
          // Check for common response wrapper patterns
          if (Array.isArray(data.pdfs)) {
            pdfsArray = data.pdfs;
          } else if (Array.isArray(data.data)) {
            pdfsArray = data.data;
          } else if (Array.isArray(data.results)) {
            pdfsArray = data.results;
          } else if (Array.isArray(data.files)) {
            pdfsArray = data.files;
          } else {
            // If it's an object but not a wrapper, log it for debugging
            console.error("Unexpected API response structure:", data);
            throw new Error(
              `Unexpected API response format. Expected array or object with pdfs/data/results/files property. Got: ${JSON.stringify(
                data
              )}`
            );
          }
        } else {
          throw new Error(
            `Invalid data format received from API. Expected array or object, got: ${typeof data}`
          );
        }

        // Validate PDF objects have required properties
        const validatedPDFs = pdfsArray.filter((pdf: PDF) => {
          const isValid =
            pdf &&
            typeof pdf.id !== "undefined" &&
            typeof pdf.filename === "string" &&
            typeof pdf.status === "string";

          if (!isValid) {
            console.warn("Invalid PDF object:", pdf);
          }

          return isValid;
        });

        console.log("Validated PDFs:", validatedPDFs);
        setsamplePDFS(validatedPDFs);
      } catch (error) {
        console.error("Failed to fetch PDFs:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch PDFs"
        );
        setsamplePDFS([]); // Ensure it's always an array
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchPDFs();
    }
  }, [status]);

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <FileText className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-medium">Error loading PDFs</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Filter PDFs based on search and filters
  const filteredPDFs = Array.isArray(samplePDFs)
    ? samplePDFs.filter((pdf) => {
        if (
          !pdf ||
          typeof pdf.filename !== "string" ||
          typeof pdf.status !== "string"
        ) {
          return false;
        }

        const matchesSearch = pdf.filename
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" ||
          pdf.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      })
    : [];

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

  const handleDelete = async (pdf: PDF) => {
    if (window.confirm(`Are you sure you want to delete "${pdf.filename}"?`)) {
      try {
        const response = await fetch("/api/deletepdfs", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: pdf.id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Failed to delete PDF: ${response.status}`
          );
        }

        // Remove from local state after successful deletion
        setsamplePDFS((prevPDFs) => prevPDFs.filter((p) => p.id !== pdf.id));

        console.log(`Successfully deleted ${pdf.filename}`);
      } catch (error) {
        console.error("Delete error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to delete PDF"
        );
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const viewDocument = (pdfid: string) => {
    router.push(`/dashboard/${pdfid}`);
  };

  if (status === "authenticated") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                PDF Dashboard
              </h1>
              {session?.user?.name && (
                <p className="text-gray-600 dark:text-gray-300">
                  Welcome, {session.user.name}
                </p>
              )}
            </div>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-12 w-12 p-0 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <User  className="h-6 w-6" />
                  <span className="sr-only">User  menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin")}>
                  Admin Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Logout
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <ThemeToggle /> {/* Add the ThemeToggle here */}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 mb-8">
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
                  {samplePDFs.filter((pdf) => pdf.status === "VERIFIED").length}
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
                  {samplePDFs.filter((pdf) => pdf.status === "PENDING").length}
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

              {(searchTerm || statusFilter !== "all") && (
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
          {(searchTerm || statusFilter !== "all") && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900 dark:text-white">
                          {pdf.filename}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Uploaded {formatDate(pdf.uploadedAt)}</span>
                          </span>
                          {pdf.lastFlagged && (
                            <span className="flex items-center space-x-1 text-orange-600">
                              <Flag className="w-3 h-3" />
                              <span>
                                Last flagged {formatDate(pdf.lastFlagged)}
                              </span>
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(pdf.status)}>
                      {pdf.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Flag className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium">
                          {pdf.flagCount}{" "}
                          {pdf.flagCount === 1 ? "Flag" : "Flags"}
                        </span>
                        {pdf.flagCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {pdf.flagCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {pdf.commentCount}{" "}
                          {pdf.commentCount === 1 ? "Comment" : "Comments"}
                        </span>

                        {pdf.commentCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {pdf.commentCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-x-2">
                      <Button>Download</Button>

                      <Button
                        onClick={() => viewDocument(pdf.id)}
                        className="flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Document</span>
                      </Button>
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No PDFs found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchTerm || statusFilter !== " all"
                  ? "Try adjusting your search or filters"
                  : "Upload your first PDF to get started"}
              </p>
              {(searchTerm || statusFilter !== "all") && (
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