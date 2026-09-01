'use client'

import { useRouter } from 'next/navigation'

import { AppHeader } from '@/components/layout/app-header'
import { TeacherGradeTemplateForm } from './teacher-grade-template-form'
import { createTeacherGradeTemplate } from '@/lib/teacher/grade-templates/api'
import type { GradeTemplateFormPayload } from '@/lib/teacher/grade-templates/types'

type Props = {
  courseId: number
  courseName: string
  courseYear: number
}

export function TeacherGradeTemplateCreateView({
  courseId,
  courseName,
}: Props) {
  const router = useRouter()

  const handleSubmit = async (payload: GradeTemplateFormPayload) => {
    await createTeacherGradeTemplate(courseId, payload)

    setTimeout(() => {
      router.push(`/teacher/courses/${courseId}/grade-templates`)
    }, 700)
  }

  return (
    <>
      <AppHeader title="Nueva plantilla de calificación" />

      <main className="flex-1 overflow-auto px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-5xl space-y-4">
        <header className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {courseName}
          </p>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Nueva plantilla
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Definí una estructura de calificación para reutilizarla con tus alumnos.
            </p>
          </div>
        </header>

        <TeacherGradeTemplateForm
          mode="create"
          onSubmit={handleSubmit}
          submitLabel="Crear plantilla"
        />
        </div>
      </main>
    </>
  )
}
