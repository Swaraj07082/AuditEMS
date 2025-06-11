"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useRef } from "react";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const auditStandards = [
  { value: "iso-27001", label: "ISO 27001 - Information Security Management" },
  { value: "iso-9001", label: "ISO 9001 - Quality Management Systems" },
  { value: "iso-14001", label: "ISO 14001 - Environmental Management" },
  { value: "soc-2", label: "SOC 2 - Service Organization Control 2" },
  { value: "nist-csf", label: "NIST Cybersecurity Framework" },
  { value: "pci-dss", label: "PCI DSS - Payment Card Industry" },
  { value: "hipaa", label: "HIPAA - Health Insurance Portability" },
  { value: "gdpr", label: "GDPR - General Data Protection Regulation" },
  { value: "iso-45001", label: "ISO 45001 - Occupational Health & Safety" },
  { value: "iso-22301", label: "ISO 22301 - Business Continuity Management" },
]

export default function AuditVerification() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedStandard, setSelectedStandard] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [verificationResults, setVerificationResults] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setVerificationResults(null)
    }
  }

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  if (!selectedFile || !selectedStandard) {
    return;
  }

  setIsProcessing(true);
  setUploadProgress(0);

  // Prepare the form data
  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    // Send the file to the FastAPI backend
    const response = await fetch("http://localhost:8000/upload/", {
      method: "POST",
      body: formData,
      // Do NOT set Content-Type header; browser sets it automatically for FormData
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    // Optionally handle progress here if you use Axios or advanced fetch APIs

    const data = await response.json();

    setUploadProgress(100);
    setTimeout(() => {
      setIsProcessing(false);
      setVerificationResults({
        compliance: 87, // Replace with actual backend response if available
        totalChecks: 156,
        passed: 136,
        failed: 12,
        warnings: 8,
        criticalIssues: 3,
        recommendations: 15,
        filename: data.filename,
      });
    }, 1000);
  } catch (error) {
  setIsProcessing(false);
  if (error instanceof Error) {
    alert("Error uploading file: " + error.message);
  } else {
    alert("An unknown error occurred during upload.");
  }}
};


const resetForm = () => {
    setSelectedFile(null);
    setSelectedStandard("");
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
          <h1 className="text-3xl font-bold tracking-tight">Audit Report Verification</h1>
          <p className="text-muted-foreground">
            Upload your audit report to compare and convert to the required standard.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Upload & Verify Report
            </CardTitle>
            <CardDescription>
              Select your audit report file and choose the compliance standard for verification
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
                  />
                  {selectedFile && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {selectedFile.name}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)</p>
              </div>

              <div className="space-y-2">
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
              </div>

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
                  disabled={!selectedFile || !selectedStandard || isProcessing}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isProcessing ? "Processing..." : "Verify Report"}
                </Button>

                {(selectedFile || selectedStandard || verificationResults) && (
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
                Compliance analysis for {auditStandards.find((s) => s.value === selectedStandard)?.label}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{verificationResults.compliance}%</div>
                  <div className="text-sm text-green-600">Overall Compliance</div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{verificationResults.passed}</div>
                  <div className="text-sm text-blue-600">Checks Passed</div>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{verificationResults.failed}</div>
                  <div className="text-sm text-red-600">Issues Found</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Checks:</span>
                  <span className="font-medium">{verificationResults.totalChecks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Warnings:</span>
                  <Badge variant="secondary">{verificationResults.warnings}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Critical Issues:</span>
                  <Badge variant="destructive">{verificationResults.criticalIssues}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Recommendations:</span>
                  <Badge variant="outline">{verificationResults.recommendations}</Badge>
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
  )
}
