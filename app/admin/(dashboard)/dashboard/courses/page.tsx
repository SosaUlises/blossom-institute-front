import Link from 'next/link'
import { Plus } from 'lucide-react'

import { CoursesTable } from '@/components/admin/courses/courses-table'
import { AppHeader } from '@/components/layout/app-header'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { Button } from '@/components/ui/button'

export default function CoursesPage() {
  return (
    <>
      <AppHeader title="Cursos" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <WorkspaceHeader
            title="Seguimiento de cursos"
            description="Leé salud, asistencia y señales para priorizar acompañamiento académico."
            action={
              <Link href="/admin/dashboard/courses/new">
                <Button className="h-10 rounded-xl px-4 active:scale-[0.98]">
                  <Plus className="mr-2 size-4" />
                  Nuevo curso
                </Button>
              </Link>
            }
          />
          <CoursesTable />
        </div>
      </div>
    </>
  )
}
