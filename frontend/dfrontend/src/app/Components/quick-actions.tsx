import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Share2, Settings, Download, Zap } from "lucide-react"

export function QuickActions() {
  return (
    <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30" variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Upload PDF
        </Button>
        <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30" variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Create Document
        </Button>
        <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30" variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share Link
        </Button>
        <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
        <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30" variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </Button>
      </CardContent>
    </Card>
  )
}
