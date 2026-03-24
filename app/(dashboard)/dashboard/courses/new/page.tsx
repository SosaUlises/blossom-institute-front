'use client'

import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { CourseForm } from '@/components/courses/course-form'
import { createCourse } from '@/lib/courses/api'
import type { CreateCursoDTO, UpdateCursoDTO } from '@/lib/courses/types'

export default function NewCoursePage() {
  const router = useRouter()

  const handleSubmit = async (payload: CreateCursoDTO | UpdateCursoDTO) => {
    await createCourse(payload as CreateCursoDTO)
    router.push('/dashboard/courses')
    router.refresh()
  }

  return (
    <>
      <AppHeader title="New course" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Nuevo curso
            </h2>
            <p className="text-sm text-muted-foreground">
              Completá la información principal para registrar un nuevo curso.
            </p>
          </section>

          <CourseForm mode="create" onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  )
}