'use client'

import { useRouter } from 'next/navigation'
import { GraduationCap, UserPlus } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { TeacherForm } from '@/components/admin/teachers/teacher-form'
import { createTeacher } from '@/lib/admin/teachers/api'
import type { CreateProfesorDTO, UpdateProfesorDTO } from '@/lib/admin/teachers/types'

export default function NewTeacherPage() {
  const router = useRouter()

  const handleSubmit = async (payload: CreateProfesorDTO | UpdateProfesorDTO) => {
    await createTeacher(payload as CreateProfesorDTO)
    router.push('/admin/dashboard/teachers')
    router.refresh()
  }

  return (
    <>
      <AppHeader title="Nuevo docente" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <WorkspaceHeader
            title="Nuevo docente"
            description="Cargá la información principal para sumar una cuenta docente al equipo académico."
            metadata={
              <div className="flex items-center gap-2">
                <UserPlus className="size-4 text-primary" />
                <span className="font-medium text-foreground">Alta de docente</span>
              </div>
            }
          />
          <TeacherForm mode="create" onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  )
}
