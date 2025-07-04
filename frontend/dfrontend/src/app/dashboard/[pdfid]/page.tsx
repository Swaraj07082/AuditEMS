"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  TrendingDown,
  ClipboardList,
  Target,
  FileBarChart,
  Loader2,
  X,
  MessageSquare,
  Edit3,
  Plus,
  FlagTriangleRight,
  HelpCircle,
  AlertCircleIcon,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Flag, FlagStatus, FlagType, PDF, Priority } from "@/app/types/pdf";

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
import { resourceUsage } from "process";

export default function AuditReportPage() {
  const { data: session } = useSession();

  const [flags, setFlags] = useState<Flag[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [selectedRange, setSelectedRange] = useState<{
    start: number;
    end: number;
    section: string;
  } | null>(null);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagComment, setFlagComment] = useState("");
  const [flagType, setFlagType] = useState<FlagType>(FlagType.FLAG);
  const [flagPriority, setFlagPriority] = useState<Priority>(Priority.MEDIUM);

  const [editingFlag, setEditingFlag] = useState<Flag | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editComment, setEditComment] = useState("");
  const [editType, setEditType] = useState<FlagType>(FlagType.FLAG);
  const [editPriority, setEditPriority] = useState<Priority>(Priority.MEDIUM);
  const [editStatus, setEditStatus] = useState<FlagStatus>(FlagStatus.ACTIVE);
  const [isUpdatingFlag, setIsUpdatingFlag] = useState(false);

  const params = useParams();
  const pdfId = params.pdfid as string;

  const originalDataRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const [auditData, setAuditData] = useState<PDF | null>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreatingFlag, setIsCreatingFlag] = useState(false);

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/getpdfs/${pdfId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch audit data");
        }

        const data = await response.json();
        setAuditData(data.pdf);

        const flagres = await fetch(`/api/getflags/${pdfId}`);
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

  const getFlagStatusIcon = (status: FlagStatus) => {
    switch (status) {
      case FlagStatus.ACTIVE:
        return <AlertTriangle className="w-3 h-3" />;
      case FlagStatus.RESOLVED:
        return <CheckCircle2 className="w-3 h-3" />;
      case FlagStatus.DISMISSED:
        return <XCircle className="w-3 h-3" />;
      case FlagStatus.IN_REVIEW:
        return <Eye className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
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

  const handleTextSelection = (
    section: string,
    ref: React.RefObject<HTMLDivElement | null>
  ) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() && ref.current) {
      const range = selection.getRangeAt(0);
      const textContent = ref.current.textContent || "";

      const preSelectionRange = range.cloneRange();

      preSelectionRange.selectNodeContents(ref.current);

      preSelectionRange.setEnd(range.startContainer, range.startOffset);

      const start = preSelectionRange.toString().length;
      const end = start + selection.toString().length;

      setSelectedText(selection.toString());
      setSelectedRange({ start, end, section });
    }
  };

  const clearSelection = () => {
    setSelectedText("");
    setSelectedRange(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleFlag = async () => {
    if (!selectedText || !selectedRange) return;
    setIsCreatingFlag(true);
    // const newFlag: Flag = {
    //   id: `flag_${Date.now()}`,
    //   pdfId: pdfId,
    //   userId: session.user.id as string,
    //   text: selectedText,
    //   comment: flagComment,
    //   type: flagType,
    //   section: selectedRange.section,
    //   startIndex: selectedRange.start,
    //   endIndex: selectedRange.end,
    //   status: FlagStatus.ACTIVE,
    //   priority: flagPriority,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    //   resolvedAt: null,
    //   resolvedBy: null,
    // };

    try {
      const response = await fetch("/api/createflags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfId: pdfId,
          text: selectedText,
          comment: flagComment,
          type: flagType,
          section: selectedRange.section,
          startIndex: selectedRange.start,
          endIndex: selectedRange.end,
          status: FlagStatus.ACTIVE,
          priority: flagPriority,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create flag");
      }

      const { flag } = await response.json();

      const newFlag: Flag = {
        ...flag,
        createdAt: new Date(flag.createdAt),
        updatedAt: new Date(flag.updatedAt),
        resolvedAt: flag.resolvedAt ? new Date(flag.resolvedAt) : null,
      };

      setFlags([...flags, newFlag]);

      // setSelectedText("");
      // setSelectedRange(null);
      clearSelection();
      setFlagComment("");
      setShowFlagDialog(false);
      setFlagType(FlagType.FLAG);
      setFlagPriority(Priority.MEDIUM);
      // window.getSelection()?.removeAllRanges();

      console.log("Flag created successfully");
    } catch (error) {
      console.error("Error creating flag:", error);
      // Optional: Show error message to user
      alert("Failed to create flag. Please try again.");
    } finally {
      setIsCreatingFlag(false);
    }
  };

  const removeFlag = async (flagId: string) => {
    const originalFlags = [...flags];

    setFlags(flags.filter((flag) => flag.id !== flagId));

    try {
      const response = await fetch(`/api/deleteflags/${flagId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setFlags(originalFlags);
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete Flag");
      }

      console.log("Flag deleted successfully");
    } catch (error) {
      console.error("Error deleting flag:", error);
      alert("Failed to delete flag. Please try again.");
    }
  };

  const updateFlagStatus = (flagId: string, newStatus: FlagStatus) => {
    setFlags(
      flags.map((flag) =>
        flag.id === flagId
          ? ({
              ...flag,
              status: newStatus,
              resolvedAt:
                newStatus === FlagStatus.RESOLVED ? new Date() : undefined,
            } as Flag)
          : flag
      )
    );
  };

  const handleEditFlag = async () => {
    if (!editingFlag) return;
    setIsUpdatingFlag(true);

    try {
      const response = await fetch("/api/updateflags", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flagId: editingFlag.id,
          comment: editComment,
          type: editType,
          status: editStatus,
          priority: editPriority,
          updatedAt: new Date(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update flag");
      }

      const { flag } = await response.json();

      const updatedFlag: Flag = {
        ...editingFlag,
        comment: editComment,
        type: editType,
        priority: editPriority,
        status: editStatus,
        updatedAt: new Date(),
        resolvedAt:
          editStatus === FlagStatus.RESOLVED
            ? new Date()
            : editingFlag.resolvedAt,
      };

      setFlags(flags.map((f) => (f.id === editingFlag.id ? updatedFlag : f)));

      setEditingFlag(null);
      setShowEditDialog(false);
      setEditComment("");
      setEditType(FlagType.FLAG);
      setEditPriority(Priority.MEDIUM);
      setEditStatus(FlagStatus.ACTIVE);

      console.log("Flag updated successfully");
    } catch (error) {
      console.error("Error updating flag:", error);
      alert("Failed to update flag. Please try again.");
    } finally {
      setIsUpdatingFlag(false);
    }
  };

  const openEditDialog = (flag: Flag) => {
    setEditingFlag(flag);
    setEditComment(flag.comment);
    setEditType(flag.type);
    setEditPriority(flag.priority);
    setEditStatus(flag.status);
    setShowEditDialog(true);
  };

  const renderTextWithFLags = (text: string, section: string) => {
    const sectionFlags = flags
      .filter((flag) => flag.section === section)
      .sort((a, b) => a.startIndex - b.startIndex);

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

      elements.push(
        <span
          key={flag.id}
          className={`relative inline-block ${getFlagTypeColor(
            flag.type
          )} px-1 rounded cursor-pointer border-b-2`}
          title={flag.comment}
        >
          {flag.text}
        </span>
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

  const getSectionFlagCount = (section: string) => {
    return flags.filter(
      (flag) => flag.section === section && flag.status === FlagStatus.ACTIVE
    ).length;
  };

  const getFlagCountsByType = () => {
    return {
      [FlagType.FLAG]: flags.filter(
        (f) => f.type === FlagType.FLAG && f.status === FlagStatus.ACTIVE
      ).length,
      [FlagType.COMMENT]: flags.filter(
        (f) => f.type === FlagType.COMMENT && f.status === FlagStatus.ACTIVE
      ).length,
      [FlagType.QUESTION]: flags.filter(
        (f) => f.type === FlagType.QUESTION && f.status === FlagStatus.ACTIVE
      ).length,
      [FlagType.CRITICAL]: flags.filter(
        (f) => f.type === FlagType.CRITICAL && f.status === FlagStatus.ACTIVE
      ).length,
    };
  };

  const flagCounts = getFlagCountsByType();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileBarChart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Financial Audit Report
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {auditData.filename}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(auditData.status)}>
                  {auditData.status}
                </Badge>
                <Badge
                  variant="destructive"
                  className="flex items-center space-x-1"
                >
                  <FlagTriangleRight className="w-3 h-3" />
                  <span>{flagCounts[FlagType.FLAG]}</span>
                </Badge>
                <Badge
                  variant="secondary"
                  className="flex items-center space-x-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>{flagCounts[FlagType.COMMENT]}</span>
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 flex items-center space-x-1">
                  <HelpCircle className="w-3 h-3" />
                  <span>{flagCounts[FlagType.QUESTION]}</span>
                </Badge>
                <Badge className="bg-orange-100 text-orange-800 flex items-center space-x-1">
                  <AlertCircleIcon className="w-3 h-3" />
                  <span>{flagCounts[FlagType.CRITICAL]}</span>
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-600 mt-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Uploaded: {formatDate(auditData.uploadedAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>User ID: {auditData.userId.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Report ID: {auditData.id.slice(0, 8)}...</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Selection Actions */}
        {selectedText && (
          <Alert className="border-blue-200 bg-blue-50">
            <Edit3 className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-blue-800">
                Selected: <strong>"{selectedText.slice(0, 50)}..."</strong>
              </span>
              <div className="flex space-x-2">
                <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Flag
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Flag</DialogTitle>
                      <DialogDescription>
                        Add a flag, comment, question, or critical issue to the
                        selected text: "{selectedText.slice(0, 100)}..."
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={
                            flagType === FlagType.FLAG
                              ? "destructive"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setFlagType(FlagType.FLAG)}
                          className="flex items-center space-x-1"
                        >
                          <FlagTriangleRight className="w-3 h-3" />
                          <span>Flag</span>
                        </Button>
                        <Button
                          variant={
                            flagType === FlagType.COMMENT
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setFlagType(FlagType.COMMENT)}
                          className="flex items-center space-x-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Comment</span>
                        </Button>
                        <Button
                          variant={
                            flagType === FlagType.QUESTION
                              ? "secondary"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setFlagType(FlagType.QUESTION)}
                          className="flex items-center space-x-1"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>Question</span>
                        </Button>
                        <Button
                          variant={
                            flagType === FlagType.CRITICAL
                              ? "destructive"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setFlagType(FlagType.CRITICAL)}
                          className="flex items-center space-x-1 bg-orange-600 hover:bg-orange-700"
                        >
                          <AlertCircleIcon className="w-3 h-3" />
                          <span>Critical</span>
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                        <Select
                          value={flagPriority}
                          onValueChange={(value) =>
                            setFlagPriority(value as Priority)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={Priority.LOW}>Low</SelectItem>
                            <SelectItem value={Priority.MEDIUM}>
                              Medium
                            </SelectItem>
                            <SelectItem value={Priority.HIGH}>High</SelectItem>
                            <SelectItem value={Priority.CRITICAL}>
                              Critical
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Textarea
                        placeholder={`Enter your ${flagType.toLowerCase()}...`}
                        value={flagComment}
                        onChange={(e) => setFlagComment(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowFlagDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleFlag}
                          disabled={!flagComment.trim() || isCreatingFlag}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add {flagType}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Flag</DialogTitle>
                      <DialogDescription>
                        Update the flag details for: "
                        {editingFlag?.text.slice(0, 100)}..."
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={
                            editType === FlagType.FLAG
                              ? "destructive"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setEditType(FlagType.FLAG)}
                          className="flex items-center space-x-1"
                        >
                          <FlagTriangleRight className="w-3 h-3" />
                          <span>Flag</span>
                        </Button>
                        <Button
                          variant={
                            editType === FlagType.COMMENT
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setEditType(FlagType.COMMENT)}
                          className="flex items-center space-x-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Comment</span>
                        </Button>
                        <Button
                          variant={
                            editType === FlagType.QUESTION
                              ? "secondary"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setEditType(FlagType.QUESTION)}
                          className="flex items-center space-x-1"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>Question</span>
                        </Button>
                        <Button
                          variant={
                            editType === FlagType.CRITICAL
                              ? "destructive"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setEditType(FlagType.CRITICAL)}
                          className="flex items-center space-x-1 bg-orange-600 hover:bg-orange-700"
                        >
                          <AlertCircleIcon className="w-3 h-3" />
                          <span>Critical</span>
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Priority
                          </label>
                          <Select
                            value={editPriority}
                            onValueChange={(value) =>
                              setEditPriority(value as Priority)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={Priority.LOW}>Low</SelectItem>
                              <SelectItem value={Priority.MEDIUM}>
                                Medium
                              </SelectItem>
                              <SelectItem value={Priority.HIGH}>
                                High
                              </SelectItem>
                              <SelectItem value={Priority.CRITICAL}>
                                Critical
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Status</label>
                          <Select
                            value={editStatus}
                            onValueChange={(value) =>
                              setEditStatus(value as FlagStatus)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={FlagStatus.ACTIVE}>
                                Active
                              </SelectItem>
                              <SelectItem value={FlagStatus.IN_REVIEW}>
                                In Review
                              </SelectItem>
                              <SelectItem value={FlagStatus.RESOLVED}>
                                Resolved
                              </SelectItem>
                              <SelectItem value={FlagStatus.DISMISSED}>
                                Dismissed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Textarea
                        placeholder={`Enter your ${editType.toLowerCase()}...`}
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowEditDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleEditFlag}
                          disabled={!editComment.trim() || isUpdatingFlag}
                        >
                          {isUpdatingFlag ? (
                            <>
                              <Clock className="w-3 h-3 mr-1 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Edit3 className="w-3 h-3 mr-1" />
                              Update {editType}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="outline" onClick={clearSelection}>
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Executive Summary</span>
              </div>
              {getSectionFlagCount("summary") > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {getSectionFlagCount("summary")} flags
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={summaryRef}
              className="prose max-w-none select-text cursor-text"
              onMouseUp={() => handleTextSelection("summary", summaryRef)}
            >
              {/* {renderTextWithFLags(auditData.summary, "summary").length > 0 ? (
                renderTextWithFLags(auditData.summary, "summary")
              ) : (
                <div>
                  {auditData.summary.split("\n").map(
                    (paragraph, index) =>
                      paragraph.trim() && (
                        <p
                          key={index}
                          className="mb-3 text-gray-700 leading-relaxed"
                        >
                          {paragraph.startsWith("**") &&
                          paragraph.endsWith("**") ? (
                            <strong className="text-gray-900">
                              {paragraph.slice(2, -2)}
                            </strong>
                          ) : paragraph.startsWith("**") ? (
                            <strong className="text-gray-900">
                              {paragraph.slice(2)}
                            </strong>
                          ) : (
                            paragraph
                          )}
                        </p>
                      )
                  )}
                </div>
              )} */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {auditData.summary.split("\n").map((paragraph, index) => {
                  if (!paragraph.trim()) return null;

                  if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                    return (
                      <h3
                        key={index}
                        className="text-lg font-bold text-gray-900 mb-3"
                      >
                        {paragraph.slice(2, -2)}
                      </h3>
                    );
                  } else if (paragraph.startsWith("**")) {
                    return (
                      <h4
                        key={index}
                        className="text-lg font-bold text-gray-900 mb-3"
                      >
                        {paragraph.slice(2, -2)}
                      </h4>
                    );
                  } else if (paragraph.trim().match(/^\d+\./)) {
                    return (
                      <div
                        key={index}
                        className="flex items-start space-x-2 mb-2"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      </div>
                    );
                  } else if (paragraph.trim()) {
                    return (
                      <div
                        key={index}
                        className="flex items-start space-x-2 mb-2"
                      >
                        <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Original Document Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span>Original Balance Sheet Data</span>
              </div>
              {getSectionFlagCount("originalData") > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {getSectionFlagCount("originalData")} flags
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={originalDataRef}
              className="bg-gray-50 p-4 rounded-lg font-mono text-sm select-text cursor-text"
              onMouseUp={() =>
                handleTextSelection("originalData", originalDataRef)
              }
            >
              <div className="space-y-1">
                {auditData.text.split("\n").map((line, index) => {
                  if (!line.trim()) return null;

                  if (line.includes("Balance Sheet") || line.includes("FY")) {
                    return (
                      <h4
                        key={index}
                        className="font-bold text-gray-900 mb-2 text-base"
                      >
                        {renderTextWithFLags(line, "originalData")}
                      </h4>
                    );
                  } else if (
                    line.includes("Page") ||
                    line.includes("Generated")
                  ) {
                    return (
                      <p
                        key={index}
                        className="text-xs text-gray-500 mt-2 italic"
                      >
                        {renderTextWithFLags(line, "originalData")}
                      </p>
                    );
                  } else {
                    return (
                      <div
                        key={index}
                        className="flex items-start space-x-2 py-1"
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 font-mono text-sm leading-relaxed">
                          {renderTextWithFLags(line, "originalData")}
                        </p>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inconsistencies Found */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Inconsistencies Identified</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inconsistenciesList.map((inconsistency: string, index: number) => (
              <Alert key={index} className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Issue {index + 1}:</strong> {inconsistency}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-purple-600" />
                <span>Detailed Analysis</span>
              </div>
              {getSectionFlagCount("analysis") > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {getSectionFlagCount("analysis")} flags
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={analysisRef}
              className="prose max-w-none select-text cursor-text"
              onMouseUp={() => handleTextSelection("analysis", analysisRef)}
            >
              {/* {renderTextWithFLags(auditData.rag_analysis, "analysis").length >
              0 ? (
                renderTextWithFLags(auditData.rag_analysis, "analysis")
              ) : (
                <div>
                  {auditData.rag_analysis.split("\n").map(
                    (paragraph, index) =>
                      paragraph.trim() && (
                        <div key={index} className="mb-4">
                          {paragraph.startsWith("**") &&
                          paragraph.endsWith("**") ? (
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {paragraph.slice(2, -2)}
                            </h3>
                          ) : paragraph.startsWith("**") ? (
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {paragraph.slice(2)}
                            </h4>
                          ) : (
                            <p className="text-gray-700 leading-relaxed">
                              {paragraph}
                            </p>
                          )}
                        </div>
                      )
                  )}
                </div>
              )} */}

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {auditData.rag_analysis.split("\n").map((paragraph, index) => {
                  if (!paragraph.trim()) return null;

                  if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                    return (
                      <h3
                        key={index}
                        className="text-lg font-bold text-purple-900 mb-3"
                      >
                        {paragraph.slice(2, -2)}
                      </h3>
                    );
                  } else if (paragraph.startsWith("**")) {
                    return (
                      <h4 key={index} className="font-bold text-gray-900 mb-2">
                        {paragraph.slice(2)}
                      </h4>
                    );
                  } else if (paragraph.trim()) {
                    return (
                      <div
                        key={index}
                        className="flex items-start space-x-2 mb-2"
                      >
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-orange-600" />
                <span>Audit Recommendations</span>
              </div>
              {getSectionFlagCount("recommendations") > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {getSectionFlagCount("recommendations")} flags
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={recommendationsRef}
              className="prose max-w-none select-text cursor-text"
              onMouseUp={() =>
                handleTextSelection("recommendations", recommendationsRef)
              }
            >
              {/* {renderTextWithFLags(auditData.recommendations, "recommendations")
                .length > 0 ? (
                renderTextWithFLags(
                  auditData.recommendations,
                  "recommendations"
                )
              ) : (
                <div>
                  {auditData.recommendations.split("\n").map(
                    (paragraph, index) =>
                      paragraph.trim() && (
                        <div key={index} className="mb-4">
                          {paragraph.startsWith("**Recommendation") ? (
                            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
                              <h4 className="font-semibold text-orange-900 mb-2">
                                {paragraph.slice(2, paragraph.indexOf(":**"))}
                              </h4>
                              <p className="text-orange-800">
                                {paragraph.slice(paragraph.indexOf(":**") + 3)}
                              </p>
                            </div>
                          ) : paragraph.startsWith("* Task:") ? (
                            <div className="ml-4 mb-2">
                              <span className="font-medium text-gray-900">
                                Task:
                              </span>
                              <span className="text-gray-700">
                                {paragraph.slice(7)}
                              </span>
                            </div>
                          ) : paragraph.startsWith("* Objective:") ? (
                            <div className="ml-4 mb-3">
                              <span className="font-medium text-gray-900">
                                Objective:
                              </span>
                              <span className="text-gray-700">
                                {paragraph.slice(12)}
                              </span>
                            </div>
                          ) : paragraph.trim() &&
                            !paragraph.startsWith("Here are") ? (
                            <p className="text-gray-700 leading-relaxed mb-3">
                              {paragraph}
                            </p>
                          ) : null}
                        </div>
                      )
                  )}
                </div>
              )} */}

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {auditData.recommendations
                  .split("\n")
                  .map((paragraph, index) => {
                    if (!paragraph.trim()) return null;

                    if (paragraph.startsWith("**Recommendation")) {
                      const title = paragraph.slice(
                        2,
                        paragraph.indexOf(":**")
                      );
                      const content = paragraph.slice(
                        paragraph.indexOf(":**") + 3
                      );

                      return (
                        <div key={index} className="mb-3">
                          <h4 className="font-bold text-orange-900 mb-2">
                            {title}
                          </h4>
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-700 leading-relaxed">
                              {content}
                            </p>
                          </div>
                        </div>
                      );
                    } else if (paragraph.startsWith("* Task:")) {
                      return (
                        <div
                          key={index}
                          className="ml-4 flex items-start space-x-2 mb-2"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <span className="font-semibold text-blue-900">
                              Task:
                            </span>
                            <span className="text-gray-700 ml-1">
                              {paragraph.slice(7)}
                            </span>
                          </div>
                        </div>
                      );
                    } else if (paragraph.startsWith("* Objective:")) {
                      return (
                        <div
                          key={index}
                          className="ml-4 flex items-start space-x-2 mb-3"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <span className="font-semibold text-green-900">
                              Objective:
                            </span>
                            <span className="text-gray-700 ml-1">
                              {paragraph.slice(12)}
                            </span>
                          </div>
                        </div>
                      );
                    } else if (
                      paragraph.trim() &&
                      !paragraph.startsWith("Here are")
                    ) {
                      return (
                        <div
                          key={index}
                          className="flex items-start space-x-2 mb-2"
                        >
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700 leading-relaxed">
                            {paragraph}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flags Summary */}
        {flags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span>All Flags & Comments ({flags.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {flags.map((flag) => (
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
                        <div className="flex items-center space-x-1">
                          {getFlagStatusIcon(flag.status)}
                          <span className="text-xs text-gray-500">
                            {flag.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {flag.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">
                        "{flag.text}"
                      </p>
                      <p className="text-gray-700">{flag.comment}</p>
                      {flag.resolvedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Resolved on {flag.resolvedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(flag)}
                        className="text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit Flag
                      </Button>
                      <div className="flex space-x-1">
                        {flag.status === FlagStatus.ACTIVE && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                updateFlagStatus(flag.id, FlagStatus.RESOLVED)
                              }
                              className="text-green-600 hover:text-green-800"
                              title="Mark as Resolved"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                updateFlagStatus(flag.id, FlagStatus.IN_REVIEW)
                              }
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Mark for Review"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFlag(flag.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete Flag"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    Enhanced Analysis
                  </span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  {auditData.enhanced === "true" ? "Completed" : "Not Applied"}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Processing Status
                  </span>
                </div>
                <p className="text-blue-700 text-sm mt-1 capitalize">
                  {auditData.status.toLowerCase()}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    Error Status
                  </span>
                </div>
                <p className="text-gray-700 text-sm mt-1">
                  {auditData.error || "No errors detected"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
