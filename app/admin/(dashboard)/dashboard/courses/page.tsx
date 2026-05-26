import { BookOpen } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { CoursesTable } from '@/components/admin/courses/courses-table'

export default function CoursesPage() {
  return (
    <>
      <AppHeader title="Courses" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <WorkspaceHeader
            title="Gestion de cursos"
            description="Administra cursos, horarios, estado y asignaciones academicas."
            metadata={
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-primary" />
                <span className="font-medium text-foreground">Modulo Courses</span>
              </div>
            }
          />
          <CoursesTable />
        </div>
      </div>
    </>
  )
}