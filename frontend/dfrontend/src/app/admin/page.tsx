'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Users, FileText, CheckCircle, Clock } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import CountUp from 'react-countup'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPDFs: 0,
    verifiedPDFs: 0,
    pendingPDFs: 0,
  })

  useEffect(() => {
    if (status === 'loading') return
    if (session?.user.role !== 'ADMIN') {
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/summary')
      const data = await res.json()
      setStats(data)
    }
    fetchStats()
  }, [])

  if (status === 'loading' || (session && session.user.role !== 'ADMIN')) {
    return null
  }

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-gradient-to-tr from-blue-500 to-blue-300',
    },
    {
      title: 'Reports Submitted',
      value: stats.totalPDFs,
      icon: FileText,
      color: 'bg-gradient-to-tr from-green-500 to-green-300',
    },
    {
      title: 'Verified Reports',
      value: stats.verifiedPDFs,
      icon: CheckCircle,
      color: 'bg-gradient-to-tr from-purple-500 to-purple-300',
    },
    {
      title: 'Pending Review',
      value: stats.pendingPDFs,
      icon: Clock,
      color: 'bg-gradient-to-tr from-yellow-500 to-yellow-300',
    },
  ]

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-6 flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your audit system.
        </p>
      </div>

      {/* Full-width 2x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {cards.map((stat) => (
          <Card
            key={stat.title}
            className="h-40 w-full flex flex-col justify-between p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-md text-white ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  {stat.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                  Total as of today
                </CardDescription>
              </div>
            </div>
            <CardContent className="pl-0">
              <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                <CountUp end={stat.value} duration={1.5} separator="," />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
