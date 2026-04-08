import { AppHeader } from '@/components/layout/app-header'
import { TeacherDashboardView } from '@/components/teacher/dashboard/teacher-dashboard-view'
import { getTeacherDashboard } from '@/lib/teacher/dashboard/api'

export default async function TeacherDashboardPage() {
  const dashboard = await getTeacherDashboard()

  return (
    <>
      <AppHeader title="Teacher Dashboard" />

      <main className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <TeacherDashboardView dashboard={dashboard} />
        </div>
      </main>
    </>
  )
}