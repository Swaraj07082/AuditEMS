"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "../../../components/ui/alert"
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
} from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

interface AuditData {
  id: string
  userId: string
  text: string
  inconsistencies: string
  rag_analysis: string
  recommendations: string
  enhanced: string
  error: string
  summary: string
  filename: string
  status: string
  uploadedAt: Date
}

export default function AuditReportPage() {
  const params = useParams()
  const pdfId = params.pdfid as string
  
  const [auditData, setAuditData] = useState<AuditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/getpdfs/${pdfId}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch audit data')
        }
        
        const data = await response.json()
        setAuditData(data.pdf)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (pdfId) {
      fetchAuditData()
    }
  }, [pdfId])

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-lg text-gray-600">Loading audit report...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
    )
  }

  if (!auditData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit data found</h3>
                <p className="text-gray-600">The requested audit report could not be found.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const inconsistenciesList = auditData.inconsistencies ? JSON.parse(auditData.inconsistencies) : []

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
                  <CardTitle className="text-2xl font-bold">Financial Audit Report</CardTitle>
                  <CardDescription className="text-lg">{auditData.filename}</CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(auditData.status)}>{auditData.status}</Badge>
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

        {/* Executive Summary */}
        {auditData.summary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Executive Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {auditData.summary.split("\n").map(
                  (paragraph, index) =>
                    paragraph.trim() && (
                      <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                        {paragraph.startsWith("**") && paragraph.endsWith("**") ? (
                          <strong className="text-gray-900">{paragraph.slice(2, -2)}</strong>
                        ) : paragraph.startsWith("**") ? (
                          <strong className="text-gray-900">{paragraph.slice(2)}</strong>
                        ) : (
                          paragraph
                        )}
                      </p>
                    ),
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Original Document Data */}
        {auditData.text && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span>Original Document Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                {auditData.text.split("\n").map((line, index) => (
                  <div key={index} className="py-1">
                    {line}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
        )}

        {/* Detailed Analysis */}
        {auditData.rag_analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-purple-600" />
                <span>Detailed Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {auditData.rag_analysis.split("\n").map(
                  (paragraph, index) =>
                    paragraph.trim() && (
                      <div key={index} className="mb-4">
                        {paragraph.startsWith("**") && paragraph.endsWith("**") ? (
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{paragraph.slice(2, -2)}</h3>
                        ) : paragraph.startsWith("**") ? (
                          <h4 className="font-semibold text-gray-900 mb-1">{paragraph.slice(2)}</h4>
                        ) : (
                          <p className="text-gray-700 leading-relaxed">{paragraph}</p>
                        )}
                      </div>
                    ),
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {auditData.recommendations && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-orange-600" />
                <span>Audit Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {auditData.recommendations.split("\n").map(
                  (paragraph, index) =>
                    paragraph.trim() && (
                      <div key={index} className="mb-4">
                        {paragraph.startsWith("**Recommendation") ? (
                          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
                            <h4 className="font-semibold text-orange-900 mb-2">
                              {paragraph.slice(2, paragraph.indexOf(":**"))}
                            </h4>
                            <p className="text-orange-800">{paragraph.slice(paragraph.indexOf(":**") + 3)}</p>
                          </div>
                        ) : paragraph.startsWith("* Task:") ? (
                          <div className="ml-4 mb-2">
                            <span className="font-medium text-gray-900">Task:</span>
                            <span className="text-gray-700">{paragraph.slice(7)}</span>
                          </div>
                        ) : paragraph.startsWith("* Objective:") ? (
                          <div className="ml-4 mb-3">
                            <span className="font-medium text-gray-900">Objective:</span>
                            <span className="text-gray-700">{paragraph.slice(12)}</span>
                          </div>
                        ) : paragraph.trim() && !paragraph.startsWith("Here are") ? (
                          <p className="text-gray-700 leading-relaxed mb-3">{paragraph}</p>
                        ) : null}
                      </div>
                    ),
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Processing Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Enhanced Analysis</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  {auditData.enhanced === "true" ? "Completed" : "Not Applied"}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Processing Status</span>
                </div>
                <p className="text-blue-700 text-sm mt-1 capitalize">{auditData.status.toLowerCase()}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Error Status</span>
                </div>
                <p className="text-gray-700 text-sm mt-1">{auditData.error || "No errors detected"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}