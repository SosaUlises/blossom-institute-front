import { AppHeader } from '@/components/layout/app-header'
import { AdminDashboardView } from '@/components/admin/dashboard/admin-dashboard-view'
import { getSession } from '@/lib/auth/session'
import { getAdminDashboard } from '@/lib/admin/dashboard/get-admin-dashboard'

export default async function DashboardPage() {
  const [dashboard, session] = await Promise.all([
    getAdminDashboard(),
    getSession(),
  ])

  return (
    <>
      <AppHeader title="Dashboard" />
      <AdminDashboardView
        dashboard={dashboard}
        adminName={session?.user.nombre || 'Admin'}
      />
    </>
  )
}
