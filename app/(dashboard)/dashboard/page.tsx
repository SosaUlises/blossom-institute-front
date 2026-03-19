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

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* KPI */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Overview
            </h2>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Students"
                value={dashboardStats.totalStudents.toLocaleString()}
                icon={Users}
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                title="Teachers"
                value={dashboardStats.totalTeachers}
                icon={GraduationCap}
                trend={{ value: 4, isPositive: true }}
              />
              <StatCard
                title="Courses"
                value={dashboardStats.activeCourses}
                icon={BookOpen}
                trend={{ value: 8, isPositive: true }}
              />
              <StatCard
                title="Assignments"
                value={dashboardStats.pendingAssignments}
                icon={ClipboardList}
                trend={{ value: 3, isPositive: false }}
              />
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Performance
            </h2>

            <div className="grid gap-5 lg:grid-cols-2">
              <PerformanceChart />
            </div>
          </div>

          {/* Activity */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Activity
            </h2>

            <div className="grid gap-5 lg:grid-cols-2">
              <RecentActivityCard />
              <UpcomingClassesCard />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}