import Link from 'next/link'
import { GraduationCap, Plus } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { StudentsTable } from '@/components/admin/students/students-table'
import { Button } from '@/components/ui/button'

export default function StudentsPage() {
  return (
    <>
      <AppHeader title="Alumnos" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <WorkspaceHeader
            title="Alumnos"
            description="Priorizá seguimiento, curso y señales académicas sin perder las acciones administrativas."
            metadata={
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                <span className="font-medium text-foreground">Seguimiento de alumnos</span>
              </div>
            }
            action={
              <Button asChild className="h-10 rounded-xl px-4 shadow-none active:scale-[0.98]">
                <Link href="/admin/dashboard/students/new">
                  <Plus className="mr-2 size-4" />
                  Crear alumno
                </Link>
              </Button>
            }
          />
          <StudentsTable />
        </div>
      </div>
    </>
  )
}
