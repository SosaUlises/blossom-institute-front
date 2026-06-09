import { AppHeader } from '@/components/layout/app-header'
import { TeacherDashboardView } from '@/components/teacher/dashboard/teacher-dashboard-view'
import { getTeacherDashboard } from '@/lib/teacher/dashboard/api'

export default async function TeacherDashboardPage() {
  const dashboard = await getTeacherDashboard()

  return (
    <>
      <AppHeader title="Inicio" />

      <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <TeacherDashboardView dashboard={dashboard} />
        </div>
      </main>
    </>
  )
}
