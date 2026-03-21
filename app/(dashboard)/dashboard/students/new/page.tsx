'use client'

import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { StudentForm } from '@/components/students/student-form'
import { createStudent } from '@/lib/students/api'
import type { CreateAlumnoDTO, UpdateAlumnoDTO } from '@/lib/students/types'

export default function NewStudentPage() {
  const router = useRouter()

  const handleSubmit = async (payload: CreateAlumnoDTO | UpdateAlumnoDTO) => {
    await createStudent(payload as CreateAlumnoDTO)
    router.push('/dashboard/students')
    router.refresh()
  }

  return (
    <>
      <AppHeader title="New student" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Nuevo alumno
            </h2>
            <p className="text-sm text-muted-foreground">
              Completá la información principal para registrar un nuevo alumno.
            </p>
          </section>

          <StudentForm mode="create" onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  )
}