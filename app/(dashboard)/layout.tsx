import { redirect } from 'next/navigation'

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { getSession } from '@/lib/auth/session'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (!session.user.roles.includes('Administrador')) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}