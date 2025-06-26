"use client";

import type React from "react";

import { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";

// const auditStandards = [
//   { value: "iso-27001", label: "ISO 27001 - Information Security Management" },
//   { value: "iso-9001", label: "ISO 9001 - Quality Management Systems" },
//   { value: "iso-14001", label: "ISO 14001 - Environmental Management" },
//   { value: "soc-2", label: "SOC 2 - Service Organization Control 2" },
//   { value: "nist-csf", label: "NIST Cybersecurity Framework" },
//   { value: "pci-dss", label: "PCI DSS - Payment Card Industry" },
//   { value: "hipaa", label: "HIPAA - Health Insurance Portability" },
//   { value: "gdpr", label: "GDPR - General Data Protection Regulation" },
//   { value: "iso-45001", label: "ISO 45001 - Occupational Health & Safety" },
//   { value: "iso-22301", label: "ISO 22301 - Business Continuity Management" },
// ]

export default function AuditVerification() {
  // const {data : session} = useSession()

  // if (!session) return <p>Please log in</p>;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // const [selectedStandard, setSelectedStandard] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationResults, setVerificationResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setVerificationResults(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    // Prepare the form data
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      console.log("Uploading file to backend...");

      // Send the file to the Flask backend
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type header; browser sets it automatically for FormData
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      // Parse the JSON response
      const data = await response.json();
      console.log("Backend response data:", data);

      if (data.status == "success") {
        await fetch("/api/savepdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: data.text,
            inconsistencies: JSON.stringify(data.inconsistencies),
            rag_analysis: data.rag_analysis,
            recommendations: data.recommendations,
            enhanced: String(data.enhanced),
            error: data.error,
            summary: data.summary,
            filename: data.filename,
            status: "PENDING",
          }),
        });
      }

      setUploadProgress(100);

      // Set the results immediately (remove setTimeout for debugging)
      setIsProcessing(false);
      setVerificationResults({
        compliance: 87, // Replace with actual backend response if available
        totalChecks: 156,
        passed: 136,
        failed: 12,
        warnings: 8,
        criticalIssues: 3,
        recommendations: 15,
        filename: selectedFile.name, // Use the original filename
        // Add the actual backend response data
        text: data.text || "No text extracted",
        inconsistencies: data.inconsistencies || [],
        rag_analysis: data.rag_analysis || "No RAG analysis available",
        recommendations_detail:
          data.recommendations || "No recommendations available",
        summary: data.summary || "No summary available",
        enhanced: data.enhanced || false,
        error: data.error || "",
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setIsProcessing(false);
      setUploadProgress(0);

      if (error instanceof Error) {
        alert("Error uploading file: " + error.message);
        console.error("Error details:", error);
      } else {
        alert("An unknown error occurred during upload.");
        console.error("Unknown error:", error);
      }
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    // setSelectedStandard("");
    setVerificationResults(null);
    setUploadProgress(0);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Audit Report Verification
          </h1>
          <p className="text-muted-foreground">
            Upload your audit report for analysis and verification.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Upload & Verify Report
            </CardTitle>
            <CardDescription>
              Select your audit report file for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="audit-file">Audit Report File</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="audit-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="flex-1"
                    ref={fileInputRef}
                  />
                  {selectedFile && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      {selectedFile.name}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                </p>
              </div>

              {/* Commented out compliance standard selection */}
              {/* <div className="space-y-2">
                <Label htmlFor="standard">Compliance Standard</Label>
                <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a compliance standard" />
                  </SelectTrigger>
                  <SelectContent>
                    {auditStandards.map((standard) => (
                      <SelectItem key={standard.value} value={standard.value}>
                        {standard.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing audit report...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={!selectedFile || isProcessing}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isProcessing ? "Processing..." : "Verify Report"}
                </Button>

                {(selectedFile || verificationResults) && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {verificationResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Verification Results
              </CardTitle>
              <CardDescription>
                Analysis results for your audit report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Section */}
              {verificationResults.summary && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Summary</h3>
                  <p className="text-green-700">
                    {verificationResults.summary}
                  </p>
                </div>
              )}

              {/* Extracted Text Preview */}
              {verificationResults.text && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Extracted Text (Preview)
                  </h3>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {verificationResults.text}
                  </p>
                </div>
              )}

              {/* Inconsistencies */}
              {verificationResults.inconsistencies &&
                verificationResults.inconsistencies.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-yellow-800 mb-2">
                      Inconsistencies Found
                    </h3>
                    <ul className="list-disc list-inside text-yellow-700 space-y-1">
                      {verificationResults.inconsistencies.map(
                        (inconsistency: string, index: number) => (
                          <li key={index} className="text-sm">
                            {inconsistency}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* RAG Analysis */}
              {verificationResults.rag_analysis && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    RAG Analysis
                  </h3>
                  <p className="text-blue-700 text-sm">
                    {verificationResults.rag_analysis}
                  </p>
                </div>
              )}

              {/* Recommendations */}
              {verificationResults.recommendations_detail && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">
                    Recommendations
                  </h3>
                  <p className="text-purple-700 text-sm">
                    {verificationResults.recommendations_detail}
                  </p>
                </div>
              )}

              {/* Enhanced Analysis Indicator */}
              {verificationResults.enhanced && (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-indigo-700 text-sm">
                    ✓ Enhanced analysis completed
                  </p>
                </div>
              )}

              {/* Error Display */}
              {verificationResults.error && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-2">Error</h3>
                  <p className="text-red-700 text-sm">
                    {verificationResults.error}
                  </p>
                </div>
              )}

              <Separator />

              {/* Original metrics section - kept for reference */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {verificationResults.compliance}%
                  </div>
                  <div className="text-sm text-green-600">
                    Overall Compliance
                  </div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">
                    {verificationResults.passed}
                  </div>
                  <div className="text-sm text-blue-600">Checks Passed</div>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-700">
                    {verificationResults.failed}
                  </div>
                  <div className="text-sm text-red-600">Issues Found</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Checks:</span>
                  <span className="font-medium">
                    {verificationResults.totalChecks}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Warnings:</span>
                  <Badge variant="secondary">
                    {verificationResults.warnings}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Critical Issues:
                  </span>
                  <Badge variant="destructive">
                    {verificationResults.criticalIssues}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Recommendations:
                  </span>
                  <Badge variant="outline">
                    {verificationResults.recommendations}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Download Full Report
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  View Issues
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
