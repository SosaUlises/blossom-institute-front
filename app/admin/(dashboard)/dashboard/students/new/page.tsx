'use client'

import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { StudentForm } from '@/components/admin/students/student-form'
import { createStudent } from '@/lib/admin/students/api'
import type { CreateAlumnoDTO, UpdateAlumnoDTO } from '@/lib/admin/students/types'

export default function NewStudentPage() {
  const router = useRouter()

  const handleSubmit = async (payload: CreateAlumnoDTO | UpdateAlumnoDTO) => {
    await createStudent(payload as CreateAlumnoDTO)
    router.push('/admin/dashboard/students')
    router.refresh()
  }

  return (
    <>
      <AppHeader title="New student" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <WorkspaceHeader
            title="Nuevo alumno"
            description="Carga la informacion principal para crear una cuenta de alumno."
            metadata={
              <div className="flex items-center gap-2">
                <UserPlus className="size-4 text-primary" />
                <span className="font-medium text-foreground">Alta de alumno</span>
              </div>
            }
          />
          <StudentForm mode="create" onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  )
}