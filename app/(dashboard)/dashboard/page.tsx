import { Users, GraduationCap, BookOpen, ClipboardList } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { StatCard } from '@/components/shared/stat-card'
import { RecentActivityCard } from '@/components/dashboard/recent-activity'
import { UpcomingClassesCard } from '@/components/dashboard/upcoming-classes'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { dashboardStats } from '@/lib/placeholder-data'

export default function DashboardPage() {
  return (
    <>
      <AppHeader title="Dashboard" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Students"
              value={dashboardStats.totalStudents.toLocaleString()}
              description="Enrolled across all courses"
              icon={Users}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Total Teachers"
              value={dashboardStats.totalTeachers}
              description="Active faculty members"
              icon={GraduationCap}
              trend={{ value: 4, isPositive: true }}
            />
            <StatCard
              title="Active Courses"
              value={dashboardStats.activeCourses}
              description="Currently running"
              icon={BookOpen}
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Pending Assignments"
              value={dashboardStats.pendingAssignments}
              description="Awaiting submission"
              icon={ClipboardList}
              trend={{ value: 3, isPositive: false }}
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 lg:grid-cols-2">
            <PerformanceChart />
          </div>

          {/* Activity and Classes Row */}
          <div className="grid gap-4 lg:grid-cols-2">
            <RecentActivityCard />
            <UpcomingClassesCard />
          </div>
        </div>
      </div>
    </>
  )
}
