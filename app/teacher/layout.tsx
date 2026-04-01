import { redirect } from 'next/navigation'

import { TeacherSidebar } from '@/components/teacher/layout/teacher-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getSession } from '@/lib/auth/session'

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (!session.user.roles.includes('Profesor')) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <TeacherSidebar user={session.user} />

      <SidebarInset className="bg-background">
        <div className="min-h-screen">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}