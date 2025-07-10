'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CheckCircle, Clock } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const stats = [
  {
    title: "Total Users",
    value: "2,847",
    change: "+12%",
    changeType: "positive",
    icon: Users,
  },
  {
    title: "Reports Submitted",
    value: "1,234",
    change: "+8%",
    changeType: "positive",
    icon: FileText,
  },
  {
    title: "Verified Reports",
    value: "987",
    change: "+15%",
    changeType: "positive",
    icon: CheckCircle,
  },
  {
    title: "Pending Review",
    value: "156",
    change: "-5%",
    changeType: "negative",
    icon: Clock,
  },
]

const recentActivity = [
  {
    id: 1,
    action: "Report verified",
    user: "John Doe",
    report: "Financial Audit Q3 2024",
    time: "2 minutes ago",
    status: "success",
  },
  {
    id: 2,
    action: "New user registered",
    user: "Jane Smith",
    report: null,
    time: "15 minutes ago",
    status: "info",
  },
  {
    id: 3,
    action: "Report flagged",
    user: "Mike Johnson",
    report: "Compliance Report 2024",
    time: "1 hour ago",
    status: "warning",
  },
  {
    id: 4,
    action: "Report submitted",
    user: "Sarah Wilson",
    report: "Internal Audit Report",
    time: "2 hours ago",
    status: "info",
  },
]

export default function AdminDashboard() {

  const {data : session , status} = useSession();

  const router = useRouter()
  useEffect(() => {
    // Wait until session is loaded
    if (status === "loading") return;

    if (session?.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading" || (session && session.user.role !== "ADMIN")) {
    return null; // Or a loading spinner
  }
 

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your audit system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in your system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.status === "success"
                        ? "bg-green-500"
                        : activity.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">
                      {activity.user} {activity.report && `• ${activity.report}`}
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Response Time</span>
                <span className="text-sm text-green-600">142ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Status</span>
                <span className="text-sm text-green-600">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm text-yellow-600">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Sessions</span>
                <span className="text-sm text-blue-600">234</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
