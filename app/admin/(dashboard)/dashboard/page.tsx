import { AppHeader } from '@/components/layout/app-header'
import { AdminDashboardView } from '@/components/admin/dashboard/admin-dashboard-view'
import { getAdminDashboard } from '@/lib/admin/dashboard/get-admin-dashboard'

export default async function DashboardPage() {
  const dashboard = await getAdminDashboard()

  return (
    <>
      <AppHeader title="Panel de administración" />
      <AdminDashboardView dashboard={dashboard} />
    </>
  )
}
