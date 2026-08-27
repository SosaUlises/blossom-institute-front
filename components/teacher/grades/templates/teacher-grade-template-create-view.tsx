'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
  courseYear,
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

      <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-5xl space-y-4">
        <header className="space-y-3 border-b border-border/60 pb-4">
          <Button
            variant="ghost"
            className="h-9 justify-start rounded-xl px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={() => router.push(`/teacher/courses/${courseId}/grade-templates`)}
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver a plantillas
          </Button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Nueva plantilla
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {courseName} · {courseYear}
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
