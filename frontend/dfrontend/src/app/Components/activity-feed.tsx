import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, Share, Edit } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "upload",
    title: "Uploaded new PDF",
    description: "Annual Report 2024.pdf",
    time: "2 hours ago",
    icon: Upload,
  },
  {
    id: 2,
    type: "edit",
    title: "Edited document",
    description: "Marketing Proposal.pdf",
    time: "5 hours ago",
    icon: Edit,
  },
  {
    id: 3,
    type: "share",
    title: "Shared document",
    description: "Project Timeline.pdf with team@company.com",
    time: "1 day ago",
    icon: Share,
  },
  {
    id: 4,
    type: "download",
    title: "Downloaded PDF",
    description: "Invoice_March_2024.pdf",
    time: "2 days ago",
    icon: Download,
  },
  {
    id: 5,
    type: "upload",
    title: "Uploaded new PDF",
    description: "Contract_Template.pdf",
    time: "3 days ago",
    icon: Upload,
  },
]

export function ActivityFeed() {
  return (
    <Card className="border-l-4 border-l-indigo-500 shadow-lg">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest document activities and interactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-muted-foreground">Documents</p>
            </div>
            <div>
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
