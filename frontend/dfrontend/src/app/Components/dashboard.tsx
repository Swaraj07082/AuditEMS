"use client"
import { useRouter } from "next/navigation";
import { useState } from "react"
import { Search, Upload, Download, Eye, Trash2, FileText, Calendar, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  // Dialog components removed since not used now
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

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
]

export default function PDFDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredPDFs = samplePDFs.filter((pdf) => {
    const matchesSearch = pdf.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || pdf.status === statusFilter
    const matchesType = typeFilter === "all" || pdf.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleDownload = (pdf: (typeof samplePDFs)[0]) => {
    // Simulate download - replace with actual download logic
    console.log(`Downloading ${pdf.name}`)
  }

  const handleView = (pdf: (typeof samplePDFs)[0]) => {
    // Simulate view - replace with actual PDF viewer logic
    window.open(pdf.url, "_blank")
  }

  const handleDelete = (pdf: (typeof samplePDFs)[0]) => {
    // Simulate delete - replace with actual delete logic
    console.log(`Deleting ${pdf.name}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Dashboard</h1>
          <p className="text-gray-600">Manage and access your uploaded audit reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PDFs</CardTitle>
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
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.8 MB</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search PDFs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Annual Report">Annual Report</SelectItem>
              <SelectItem value="Financial Statement">Financial Statement</SelectItem>
              <SelectItem value="Compliance Report">Compliance Report</SelectItem>
              <SelectItem value="Internal Audit">Internal Audit</SelectItem>
              <SelectItem value="Risk Assessment">Risk Assessment</SelectItem>
              <SelectItem value="Vendor Audit">Vendor Audit</SelectItem>
            </SelectContent>
          </Select>

          {/* Upload button now navigates to /auditVerify */}
          <Button
            className="w-full sm:w-auto flex items-center justify-center"
            onClick={() => router.push("/auditVerify")}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>
        </div>

        {/* PDF Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPDFs.map((pdf) => (
            <Card key={pdf.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate" title={pdf.name}>
                      {pdf.name}
                    </CardTitle>
                    <CardDescription className="mt-1">{pdf.type}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(pdf.status)}>{pdf.status}</Badge>
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
                    <Button variant="outline" size="sm" onClick={() => handleView(pdf)} className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          •••
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(pdf)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(pdf)} className="text-red-600">
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

        {filteredPDFs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No PDFs found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Upload your first PDF to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
