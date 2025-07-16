"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  AlertTriangle,
  TrendingDown,
  ClipboardList,
  Target,
  Loader2,
  MessageSquare,
  Edit3,
  FlagTriangleRight,
  HelpCircle,
  AlertCircleIcon,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Send,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  DocumentReview,
  type Flag,
  FlagReview,
  FlagStatus,
  FlagType,
  type PDF,
  Priority,
  ReviewComment,
} from "@/app/types/pdf";
import { useSession } from "next-auth/react";
import type { JSX } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { stat } from "fs";
import { FlagReviewStatus } from "@prisma/client";

// Demo flags for testing
const DEMO_FLAGS = [
  {
    id: "flag_1",
    text: "Total Assets: $2,500,000",
    comment:
      "This figure seems inconsistent with the previous quarter's report. Need verification of asset valuation methods.",
    type: FlagType.FLAG,
    priority: Priority.HIGH,
    section: "originalData",
    startIndex: 150,
    endIndex: 175,
    createdAt: new Date("2024-01-15T10:30:00Z"),
    updatedAt: new Date("2024-01-15T10:30:00Z"),
    resolvedAt: null,
  },
  {
    id: "flag_2",
    text: "significant discrepancies",
    comment:
      "What specific discrepancies were identified? This needs more detailed explanation.",
    type: FlagType.QUESTION,
    priority: Priority.MEDIUM,
    section: "summary",
    startIndex: 45,
    endIndex: 68,
    createdAt: new Date("2024-01-15T11:15:00Z"),
    updatedAt: new Date("2024-01-15T11:15:00Z"),
    resolvedAt: null,
  },
  {
    id: "flag_3",
    text: "Cash and Cash Equivalents",
    comment:
      "The cash position appears unusually high. Recommend reviewing bank reconciliations.",
    type: FlagType.COMMENT,
    priority: Priority.LOW,
    section: "originalData",
    startIndex: 200,
    endIndex: 225,
    createdAt: new Date("2024-01-15T14:20:00Z"),
    updatedAt: new Date("2024-01-15T14:20:00Z"),
    resolvedAt: null,
  },
  {
    id: "flag_4",
    text: "immediate attention required",
    comment:
      "CRITICAL: This indicates potential fraud or major accounting errors. Escalate immediately!",
    type: FlagType.CRITICAL,
    priority: Priority.CRITICAL,
    section: "analysis",
    startIndex: 120,
    endIndex: 147,
    createdAt: new Date("2024-01-15T16:45:00Z"),
    updatedAt: new Date("2024-01-15T16:45:00Z"),
    resolvedAt: null,
  },
  {
    id: "flag_5",
    text: "implement stronger internal controls",
    comment:
      "Good recommendation, but we should specify which controls exactly.",
    type: FlagType.COMMENT,
    priority: Priority.MEDIUM,
    section: "recommendations",
    startIndex: 80,
    endIndex: 115,
    createdAt: new Date("2024-01-15T17:30:00Z"),
    updatedAt: new Date("2024-01-15T17:30:00Z"),
    resolvedAt: null,
  },
];

// Demo audit data
const DEMO_AUDIT_DATA = {
  id: "demo_pdf_123",
  filename: "Q4_2023_Financial_Audit.pdf",
  text: `Financial Statement Analysis Report
  
Company: ABC Corporation
Balance Sheet as of December 31, 2023

ASSETS
Current Assets:
Cash and Cash Equivalents: $450,000
Accounts Receivable: $320,000
Inventory: $180,000
Prepaid Expenses: $50,000
Total Current Assets: $1,000,000

Non-Current Assets:
Property, Plant & Equipment: $1,200,000
Intangible Assets: $300,000
Total Assets: $2,500,000

LIABILITIES
Current Liabilities: $400,000
Long-term Debt: $800,000
Total Liabilities: $1,200,000

EQUITY
Share Capital: $800,000
Retained Earnings: $500,000
Total Equity: $1,300,000`,

  summary: `This audit report reveals significant discrepancies in the financial statements of ABC Corporation for Q4 2023. The analysis indicates several areas requiring management attention, including asset valuation inconsistencies and cash flow irregularities. Key findings suggest potential internal control weaknesses that need immediate remediation.`,

  rag_analysis: `**Detailed Financial Analysis**

The comprehensive review of ABC Corporation's financial statements has identified multiple areas of concern that require immediate attention from management and the board of directors.

**Asset Valuation Concerns:**
- Property valuations appear inflated compared to market conditions
- Inventory turnover ratios suggest potential obsolescence issues
- Accounts receivable aging analysis reveals collection concerns

**Cash Flow Analysis:**
- Operating cash flows don't align with reported net income
- Unusual cash transactions in the final quarter require investigation
- Bank reconciliations show unexplained variances

**Internal Control Assessment:**
- Segregation of duties appears inadequate in several departments
- Authorization procedures for large transactions need strengthening
- Monthly reconciliation processes require improvement`,

  recommendations: `**Audit Recommendations**

**Recommendation 1: Asset Management**
* Task: Conduct comprehensive asset revaluation
* Objective: Ensure accurate financial reporting and compliance

**Recommendation 2: Internal Controls**
* Task: Implement stronger internal controls across all financial processes
* Objective: Prevent future discrepancies and ensure regulatory compliance

**Recommendation 3: Cash Management**
* Task: Establish daily cash monitoring procedures
* Objective: Improve cash flow visibility and control

**Recommendation 4: Staff Training**
* Task: Provide comprehensive training on financial procedures
* Objective: Reduce human error and improve process efficiency`,

  inconsistencies: [
    "Asset values don't match supporting documentation",
    "Cash balances show unexplained fluctuations",
    "Revenue recognition timing appears inconsistent",
    "Expense classifications need review and correction",
  ],

  userId: "auditor_user_123",
  uploadedAt: new Date("2024-01-15T09:00:00Z"),
  updatedAt: new Date("2024-01-15T18:00:00Z"),
};

export default function ReviewerPage() {
  const { data: session, status } = useSession();
  // const { toast } = useToast();
  const [flags, setFlags] = useState<Flag[]>([]); // Using demo flags
  const [auditData, setAuditData] = useState<PDF | null>(); // Using demo data
  const [loading, setLoading] = useState(false); // Set to false since we're using demo data
  const [error, setError] = useState<string | null>(null);
  // const [reviewComments, setReviewComments] = useState<ReviewComment[]>([]);
  const [flagReviews, setFlagReviews] = useState<FlagReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [documentReview, setDocumentReview] = useState<DocumentReview | null>(
    null
  );

  // Review states
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [showFlagReviewDialog, setShowFlagReviewDialog] = useState(false);
  const [flagReviewComment, setFlagReviewComment] = useState("");
  const [flagReviewStatus, setFlagReviewStatus] = useState<FlagReviewStatus>(
    FlagReviewStatus.APPROVED
  );
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Overall document review
  const [showDocumentReviewDialog, setShowDocumentReviewDialog] =
    useState(false);
  const [documentReviewComment, setDocumentReviewComment] = useState("");
  const [documentReviewStatus, setDocumentReviewStatus] = useState<
    "APPROVED" | "REJECTED" | "NEEDS_REVISION"
  >("APPROVED");
  const [isSubmittingDocumentReview, setIsSubmittingDocumentReview] =
    useState(false);

  const params = useParams();
  const pdfId = params.pdfid as string;

  const originalDataRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reviewers/assigned-pdfs/${pdfId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch audit data");
        }

        const data = await response.json();
        setAuditData(data);

        const flagres = await fetch(`/api/getreviewerflags/${pdfId}`);
        if (!flagres.ok) {
          const err = await flagres.json();
          throw new Error(err.error || "Failed to fetch flags");
        }

        const flagData = await flagres.json();

        setFlags(
          flagData.flags.map((flag: any) => ({
            ...flag,
            createdAt: new Date(flag.createdAt),
            updatedAt: new Date(flag.updatedAt),
            resolvedAt: flag.resolvedAt ? new Date(flag.resolvedAt) : null,
          }))
        );

        await loadFlagReviews();
        await loadDocumentReview();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (pdfId) {
      fetchAuditData();
    }
  }, [pdfId]);

  const loadDocumentReview = async () => {
    try {
      const response = await fetch(`/api/document-reviews?pdfId=${pdfId}`);

      if (!response.ok) {
        throw new Error("Failed to load document review");
      }

      const data = await response.json();

      if (data.success && data.review) {
        setDocumentReview({
          ...data.review,
          createdAt: new Date(data.review.createdAt),
        });
        // Pre-populate the form with existing review
        setDocumentReviewComment(data.review.comment);
        setDocumentReviewStatus(data.review.status);
      }
    } catch (error) {
      console.error("Error loading document review:", error);
      // Don't show error toast for missing reviews (first time)
    }
  };

  const loadFlagReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await fetch(`/api/flag-reviews?pdfId=${pdfId}`);

      if (!response.ok) {
        throw new Error("Failed to load flag reviews");
      }

      const data = await response.json();

      if (data.success) {
        setFlagReviews(
          data.reviews.map((review: any) => ({
            ...review,
            createdAt: new Date(review.createdAt),
          }))
        );
      }
    } catch (error) {
      console.error("Error loading flag reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load existing reviews",
        variant: "destructive",
      });
    } finally {
      setLoadingReviews(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  //  const getFlagStatusIcon = (status: FlagStatus) => {
  //    switch (status) {
  //      case FlagStatus.ACTIVE:
  //        return <AlertTriangle className="w-3 h-3" />;
  //      case FlagStatus.RESOLVED:
  //        return <CheckCircle2 className="w-3 h-3" />;
  //      case FlagStatus.DISMISSED:
  //        return <XCircle className="w-3 h-3" />;
  //      case FlagStatus.IN_REVIEW:
  //        return <Eye className="w-3 h-3" />;
  //      default:
  //        return <Clock className="w-3 h-3" />;
  //    }
  //  };

  // Show loading while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-lg text-gray-600">
                  Loading session...
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card>
            <CardContent className="py-16">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Access Denied:</strong> You must be logged in to
                  access this page.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

  const getFlagTypeIcon = (type: FlagType) => {
    switch (type) {
      case FlagType.FLAG:
        return <FlagTriangleRight className="w-3 h-3" />;
      case FlagType.COMMENT:
        return <MessageSquare className="w-3 h-3" />;
      case FlagType.QUESTION:
        return <HelpCircle className="w-3 h-3" />;
      case FlagType.CRITICAL:
        return <AlertCircleIcon className="w-3 h-3" />;
      default:
        return <FlagTriangleRight className="w-3 h-3" />;
    }
  };

  const getFlagTypeColor = (type: FlagType) => {
    switch (type) {
      case FlagType.FLAG:
        return "bg-red-100 border-red-400 text-red-900";
      case FlagType.COMMENT:
        return "bg-blue-100 border-blue-400 text-blue-900";
      case FlagType.QUESTION:
        return "bg-purple-100 border-purple-400 text-purple-900";
      case FlagType.CRITICAL:
        return "bg-orange-100 border-orange-400 text-orange-900";
      default:
        return "bg-gray-100 border-gray-400 text-gray-900";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return "bg-green-100 text-green-800";
      case Priority.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case Priority.HIGH:
        return "bg-orange-100 text-orange-800";
      case Priority.CRITICAL:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "needs_clarification":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReviewStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-3 h-3" />;
      case "rejected":
        return <XCircle className="w-3 h-3" />;
      case "needs_clarification":
        return <Clock className="w-3 h-3" />;
      default:
        return <Eye className="w-3 h-3" />;
    }
  };

  const handleFlagReview = async () => {
    if (!selectedFlag || !flagReviewComment.trim()) return;

    setIsSubmittingReview(true);

    try {
      const response = await fetch("/api/flag-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flagId: selectedFlag.id,
          status: flagReviewStatus,
          reviewComment: flagReviewComment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }
      const data = await response.json();
      if (data.success) {
        const newReview: FlagReview = {
          ...data.review,
          createdAt: new Date(data.review.createdAt),
        };

        setFlagReviews((prev) => {
          const existingIndex = prev.findIndex(
            (r) => r.flagId === selectedFlag.id
          );
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = newReview;
            return updated;
          }
          return [...prev, newReview];
        });

        toast({
          title: "Flag Review Submitted",
          description: `Flag has been ${flagReviewStatus.replace("_", " ")}.`,
        });

        setShowFlagReviewDialog(false);
        setFlagReviewComment("");
        setSelectedFlag(null);
        setFlagReviewStatus(FlagReviewStatus.APPROVED);
      }
    } catch {
      console.error("Error submitting flag review:", error);
      toast({
        title: "Review Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit flag review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // try {
  //   const newReview: FlagReview = {
  //     id: `review_${Date.now()}`,
  //     flagId: selectedFlag.id,
  //     reviewerId: session?.user?.id || "demo_reviewer",
  //     status: flagReviewStatus,
  //     comment: flagReviewComment,
  //     createdAt: new Date(),
  //   };

  // Update or add the review
  //   setFlagReviews((prev) => {
  //     const existingIndex = prev.findIndex(
  //       (r) => r.flagId === selectedFlag.id
  //     );
  //     if (existingIndex >= 0) {
  //       const updated = [...prev];
  //       updated[existingIndex] = newReview;
  //       return updated;
  //     }
  //     return [...prev, newReview];
  //   });

  //   toast({
  //     title: "Flag Review Submitted",
  //     description: `Flag has been ${flagReviewStatus.replace("_", " ")}.`,
  //   });

  //   setShowFlagReviewDialog(false);
  //   setFlagReviewComment("");
  //   setSelectedFlag(null);
  //   setFlagReviewStatus("approved");
  // } catch (error) {
  //   toast({
  //     title: "Review Failed",
  //     description: "Failed to submit flag review. Please try again.",
  //     variant: "destructive",
  //   });
  // } finally {
  //   setIsSubmittingReview(false);
  // }
  // };

  const handleDocumentReview = async () => {
    if (!documentReviewComment.trim()) return;

    setIsSubmittingDocumentReview(true);

    try {
      console.log(pdfId, documentReviewStatus, documentReviewComment);
      const response = await fetch(`/api/document-reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfId: pdfId,
          status: documentReviewStatus,
          comment: documentReviewComment,
        }),
      });

      console.log(response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit document review");
      }

      const data = await response.json();

      if (data.success) {
        const newDocumentReview: DocumentReview = {
          ...data.review,
          createdAt: new Date(data.review.createdAt),
        };

        setDocumentReview(newDocumentReview);

        toast({
          title: "Document Review Submitted",
          description: `Document has been ${documentReviewStatus.replace(
            "_",
            " "
          )}.`,
        });

        setShowDocumentReviewDialog(false);
      }
    } catch (error) {
      console.error("Error submitting document review:", error);
      toast({
        title: "Review Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit document review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingDocumentReview(false);
    }
  };

  const openDocumentReviewDialog = () => {
    if (documentReview) {
      setDocumentReviewComment(documentReview.comment);
      setDocumentReviewStatus(documentReview.status);
    }
    setShowDocumentReviewDialog(true);
  };

  const openFlagReview = (flag: Flag) => {
    setSelectedFlag(flag);
    const existingReview = flagReviews.find((r) => r.flagId === flag.id);
    if (existingReview) {
      setFlagReviewComment(existingReview.comment);
      setFlagReviewStatus(existingReview.status);
    } else {
      setFlagReviewComment("");
      setFlagReviewStatus(FlagReviewStatus.APPROVED);
    }
    setShowFlagReviewDialog(true);
  };

  const renderTextWithFlags = (text: string, section: string) => {
    const sectionFlags = flags
      .filter((flag) => flag.section === section)
      .sort((a, b) => a.startIndex - b.startIndex);

    if (sectionFlags.length === 0) {
      return text;
    }

    let lastIndex = 0;
    const elements: JSX.Element[] = [];

    sectionFlags.forEach((flag, index) => {
      if (flag.startIndex > lastIndex) {
        elements.push(
          <span key={`text_${section}_${index}`}>
            {text.slice(lastIndex, flag.startIndex)}
          </span>
        );
      }

      const flagReview = flagReviews.find((r) => r.flagId === flag.id);
      // const reviewStatus = flagReview?.status;
      // const flagStatus = flag.status.toLowerCase();
      elements.push(
        <TooltipProvider key={flag.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`relative inline-block ${getFlagTypeColor(
                  flag.type
                )} px-1 rounded cursor-pointer border-b-2 ${
                  flag.status === FlagStatus.ACTIVE
                    ? "border-green-500"
                    : flag.status === FlagStatus.DISMISSED
                    ? "border-red-500"
                    : flag.status === FlagStatus.IN_REVIEW
                    ? "border-yellow-500"
                    : "border-gray-400"
                } hover:opacity-80 transition-opacity`}
                onClick={() => openFlagReview(flag)}
              >
                {flag.text}
                {flag.status != FlagStatus.ACTIVE && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-current opacity-75"></span>
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {getFlagTypeIcon(flag.type)}
                  <span className="font-medium">{flag.type}</span>
                  <Badge
                    className={getPriorityColor(flag.priority)}
                    variant="outline"
                  >
                    {flag.priority}
                  </Badge>
                </div>
                <p className="text-sm">
                  <strong>Auditor's Comment:</strong> {flag.comment}
                </p>
                {flagReview && (
                  <div className="border-t pt-2">
                    <div className="flex items-center space-x-1 mb-1">
                      {getReviewStatusIcon(flagReview.status)}
                      <span className="text-xs font-medium">
                        Your Review:{" "}
                        {flagReview.status.toLowerCase().replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs">{flagReview.comment}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Click to review this flag
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      lastIndex = flag.endIndex;
    });

    if (lastIndex < text.length) {
      elements.push(
        <span key={`text_${section}_end`}>{text.slice(lastIndex)}</span>
      );
    }

    return elements;
  };

  const getFlagCountsByStatus = () => {
    if (!flagReviews || !flags) {
      return {
        total: 0,
        reviewed: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        needsClarification: 0,
      };
    }

    const reviewed = flagReviews.length;
    const approved = flagReviews.filter(
      (r) => FlagReviewStatus.APPROVED
    ).length;
    const rejected = flagReviews.filter(
      (r) => FlagReviewStatus.REJECTED
    ).length;
    const needsClarification = flagReviews.filter(
      (r) => FlagReviewStatus.NEEDS_CLARIFICATION
    ).length;

    return {
      total: flags.length,
      reviewed,
      pending: flags.length - reviewed,
      approved,
      rejected,
      needsClarification,
    };
  };

  const flagStats = getFlagCountsByStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-lg text-gray-600">
                  Loading audit report...
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card>
            <CardContent className="py-16">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!auditData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No audit data found
                </h3>
                <p className="text-gray-600">
                  The requested audit report could not be found.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getInconsistenciesList = (inconsistencies: string) => {
    if (!inconsistencies) return [];
    try {
      const parsed = JSON.parse(inconsistencies);
      return Array.isArray(parsed)
        ? parsed.filter((item) => typeof item === "string")
        : [];
    } catch (error) {
      console.error("Error parsing inconsistencies JSON:", error);
      return [];
    }
  };

  const inconsistenciesList = getInconsistenciesList(
    auditData?.inconsistencies
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Review Audit Report
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {auditData.filename}
                  </CardDescription>
                  {session?.user && (
                    <p className="text-sm text-gray-500 mt-1">
                      Reviewer: {session.user.name || session.user.email}
                    </p>
                  )}
                  <Badge variant="outline" className="mt-2">
                    Demo Mode - Using Sample Data
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Dialog
                  open={showDocumentReviewDialog}
                  onOpenChange={setShowDocumentReviewDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      className={
                        documentReview
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-purple-600 hover:bg-purple-700"
                      }
                      onClick={openDocumentReviewDialog}
                    >
                      <FileCheck className="w-4 h-4 mr-2" />
                      {documentReview
                        ? "Update Document Review"
                        : "Submit Document Review"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {documentReview ? "Update" : "Submit"} Document Review
                      </DialogTitle>
                      <DialogDescription>
                        Provide your overall review of this audit document.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Review Status
                        </label>
                        <Select
                          value={documentReviewStatus}
                          onValueChange={(value) =>
                            setDocumentReviewStatus(value as any)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="needs_revision">
                              Needs Revision
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Textarea
                        placeholder="Enter your review comments..."
                        value={documentReviewComment}
                        onChange={(e) =>
                          setDocumentReviewComment(e.target.value)
                        }
                        rows={4}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowDocumentReviewDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleDocumentReview}
                          disabled={
                            !documentReviewComment.trim() ||
                            isSubmittingDocumentReview
                          }
                        >
                          {isSubmittingDocumentReview ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              {documentReview ? "Update" : "Submit"} Review
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Document Review Status */}
            {documentReview && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Your Document Review
                  </span>
                  <Badge
                    className={getReviewStatusColor(documentReview.status)}
                  >
                    {documentReview.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-blue-800 text-sm">
                  {documentReview.comment}
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  Reviewed on {formatDate(documentReview.createdAt)} (Last
                  updated {formatDate(documentReview.updatedAt)})
                </p>
              </div>
            )}

            {/* Review Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {flagStats.total}
                </div>
                <div className="text-xs text-blue-800">Total Flags</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {flagStats.pending}
                </div>
                <div className="text-xs text-yellow-800">Pending Review</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {flagStats.approved}
                </div>
                <div className="text-xs text-green-800">Approved</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {flagStats.rejected}
                </div>
                <div className="text-xs text-red-800">Rejected</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {flagStats.needsClarification}
                </div>
                <div className="text-xs text-orange-800">
                  Needs Clarification
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {flagStats.reviewed}
                </div>
                <div className="text-xs text-purple-800">Reviewed</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Document Sections */}
        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Executive Summary</span>
              {flags.filter((f) => f.section === "summary").length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {flags.filter((f) => f.section === "summary").length} flags
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={summaryRef} className="prose max-w-none">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="text-gray-700 leading-relaxed">
                  {renderTextWithFlags(auditData.summary, "summary")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Original Document Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span>Original Balance Sheet Data</span>
              {flags.filter((f) => f.section === "originalData").length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {flags.filter((f) => f.section === "originalData").length}{" "}
                  flags
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={originalDataRef}
              className="bg-gray-50 p-4 rounded-lg font-mono text-sm"
            >
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {renderTextWithFlags(auditData.text, "originalData")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inconsistencies Found */}
        {inconsistenciesList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Inconsistencies Identified</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inconsistenciesList.map(
                (inconsistency: string, index: number) => (
                  <Alert key={index} className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Issue {index + 1}:</strong> {inconsistency}
                    </AlertDescription>
                  </Alert>
                )
              )}
            </CardContent>
          </Card>
        )}

        {/* Detailed Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-purple-600" />
              <span>Detailed Analysis</span>
              {flags.filter((f) => f.section === "analysis").length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {flags.filter((f) => f.section === "analysis").length} flags
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={analysisRef} className="prose max-w-none">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="text-gray-700 leading-relaxed">
                  {renderTextWithFlags(auditData.rag_analysis, "analysis")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-orange-600" />
              <span>Audit Recommendations</span>
              {flags.filter((f) => f.section === "recommendations").length >
                0 && (
                <Badge variant="outline" className="text-xs">
                  {flags.filter((f) => f.section === "recommendations").length}{" "}
                  flags
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={recommendationsRef} className="prose max-w-none">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="text-gray-700 leading-relaxed">
                  {renderTextWithFlags(
                    auditData.recommendations,
                    "recommendations"
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flags Review Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>Flag Reviews ({flags.length})</span>
            </CardTitle>
            <CardDescription>
              Review each flag individually and provide your assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {flags.map((flag) => {
              const review = flagReviews.find((r) => r.flagId === flag.id);
              return (
                <div
                  key={flag.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    flag.type === FlagType.FLAG
                      ? "border-red-400 bg-red-50"
                      : flag.type === FlagType.COMMENT
                      ? "border-blue-400 bg-blue-50"
                      : flag.type === FlagType.QUESTION
                      ? "border-purple-400 bg-purple-50"
                      : "border-orange-400 bg-orange-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge
                          variant={
                            flag.type === FlagType.FLAG ||
                            flag.type === FlagType.CRITICAL
                              ? "destructive"
                              : flag.type === FlagType.COMMENT
                              ? "secondary"
                              : "outline"
                          }
                          className="flex items-center space-x-1"
                        >
                          {getFlagTypeIcon(flag.type)}
                          <span>{flag.type}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {flag.section}
                        </Badge>
                        <Badge
                          className={`${getPriorityColor(
                            flag.priority
                          )} text-xs`}
                        >
                          {flag.priority}
                        </Badge>
                        {review && (
                          <Badge
                            className={`${getReviewStatusColor(
                              review.status
                            )} text-xs flex items-center space-x-1`}
                          >
                            {getReviewStatusIcon(review.status)}
                            <span>{review.status.replace("_", " ")}</span>
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 mb-1">
                        "{flag.text}"
                      </p>
                      <p className="text-gray-700 mb-2">
                        <strong>Auditor's Comment:</strong> {flag.comment}
                      </p>

                      {review && (
                        <div className="bg-white p-3 rounded border mt-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <Eye className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              Your Review:
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {review.comment}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Reviewed on {formatDate(review.createdAt)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {!review ? (
                        <Button
                          size="sm"
                          onClick={() => openFlagReview(flag)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review Flag
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openFlagReview(flag)}
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit Review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Flag Review Dialog */}
        <Dialog
          open={showFlagReviewDialog}
          onOpenChange={setShowFlagReviewDialog}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Flag</DialogTitle>
              <DialogDescription>
                Provide your assessment of this flag: "
                {selectedFlag?.text.slice(0, 100)}..."
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedFlag && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">{selectedFlag.type}</Badge>
                    <Badge variant="outline">{selectedFlag.section}</Badge>
                    <Badge className={getPriorityColor(selectedFlag.priority)}>
                      {selectedFlag.priority}
                    </Badge>
                  </div>
                  <p className="font-medium text-gray-900 mb-1">
                    "{selectedFlag.text}"
                  </p>
                  <p className="text-gray-700">
                    <strong>Auditor's Comment:</strong> {selectedFlag.comment}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Review Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={
                      flagReviewStatus === FlagReviewStatus.APPROVED
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setFlagReviewStatus(FlagReviewStatus.APPROVED)
                    }
                    className="flex items-center space-x-1"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Approve</span>
                  </Button>
                  <Button
                    variant={
                      FlagReviewStatus.REJECTED ? "destructive" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setFlagReviewStatus(FlagReviewStatus.REJECTED)
                    }
                    className="flex items-center space-x-1"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    <span>Reject</span>
                  </Button>
                  <Button
                    variant={
                      flagReviewStatus === FlagReviewStatus.NEEDS_CLARIFICATION
                        ? "secondary"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setFlagReviewStatus(FlagReviewStatus.NEEDS_CLARIFICATION)
                    }
                    className="flex items-center space-x-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Clarify</span>
                  </Button>
                </div>
              </div>

              <Textarea
                placeholder="Enter your review comments..."
                value={flagReviewComment}
                onChange={(e) => setFlagReviewComment(e.target.value)}
                rows={4}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFlagReviewDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFlagReview}
                  disabled={!flagReviewComment.trim() || isSubmittingReview}
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
