import { GraduationCap } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { TeachersTable } from '@/components/admin/teachers/teachers-table'

export default function TeachersPage() {
  return (
    <>
      <AppHeader title="Teachers" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <WorkspaceHeader
            title="Gestion de profesores"
            description="Administra docentes, accesos y estado operativo."
            metadata={
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                <span className="font-medium text-foreground">Modulo Teachers</span>
              </div>
            }
          />
          <TeachersTable />
        </div>
      </div>
    </>
  )
}