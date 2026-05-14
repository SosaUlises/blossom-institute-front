import { redirect } from 'next/navigation'

import { StudentSidebar } from '@/components/student/layout/student-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getSession } from '@/lib/auth/session'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (!session.user.roles.includes('Alumno')) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <StudentSidebar user={session.user} />

      <SidebarInset className="bg-background">
        <div className="min-h-screen">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
