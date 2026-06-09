import Link from 'next/link'
import { GraduationCap, Plus } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { TeachersTable } from '@/components/admin/teachers/teachers-table'
import { Button } from '@/components/ui/button'

export default function TeachersPage() {
  return (
    <>
      <AppHeader title="Docentes" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <WorkspaceHeader
            title="Docentes"
            description="Equipo académico del instituto."
            metadata={
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                <span className="font-medium text-foreground">Equipo académico</span>
              </div>
            }
            action={
              <Button asChild className="h-10 rounded-xl px-4 shadow-none active:scale-[0.98]">
                <Link href="/admin/dashboard/teachers/new">
                  <Plus className="mr-2 size-4" />
                  Nuevo docente
                </Link>
              </Button>
            }
          />
          <TeachersTable />
        </div>
      </div>
    </>
  )
}
