'use client'

import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { TeacherForm } from '@/components/teachers/teacher-form'
import { createTeacher } from '@/lib/teachers/api'
import type { CreateProfesorDTO, UpdateProfesorDTO } from '@/lib/teachers/types'

export default function NewTeacherPage() {
  const router = useRouter()

  const handleSubmit = async (payload: CreateProfesorDTO | UpdateProfesorDTO) => {
    await createTeacher(payload as CreateProfesorDTO)
    router.push('/dashboard/teachers')
    router.refresh()
  }

  return (
    <>
      <AppHeader title="New teacher" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Nuevo profesor
            </h2>
            <p className="text-sm text-muted-foreground">
              Completá la información principal para registrar un nuevo profesor.
            </p>
          </section>

          <TeacherForm mode="create" onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  )
}