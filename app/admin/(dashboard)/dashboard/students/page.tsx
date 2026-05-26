import { GraduationCap } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { StudentsTable } from '@/components/admin/students/students-table'

export default function StudentsPage() {
  return (
    <>
      <AppHeader title="Students" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <WorkspaceHeader
            title="Gestion de alumnos"
            description="Busca, revisa y administra alumnos desde una vista compacta."
            metadata={
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                <span className="font-medium text-foreground">Modulo Students</span>
              </div>
            }
          />
          <StudentsTable />
        </div>
      </div>
    </>
  )
}