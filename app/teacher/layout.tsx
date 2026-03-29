import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TeacherSidebar } from '@/components/teacher/layout/teacher-sidebar'
import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

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
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
