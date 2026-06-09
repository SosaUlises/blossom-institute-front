import { AppHeader } from '@/components/layout/app-header'
import { AdminDashboardView } from '@/components/admin/dashboard/admin-dashboard-view'
import {
  getAdminDashboard,
  getAdminDashboardTeacherSignals,
} from '@/lib/admin/dashboard/get-admin-dashboard'

export default async function DashboardPage() {
  const [dashboard, teacherSignals] = await Promise.all([
    getAdminDashboard(),
    getAdminDashboardTeacherSignals().catch(() => []),
  ])

  return (
    <>
      <AppHeader title="Panel de administración" />
      <AdminDashboardView dashboard={dashboard} teacherSignals={teacherSignals} />
    </>
  )
}
