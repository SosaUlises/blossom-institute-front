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
    <div className="min-h-screen bg-background">
      <AppHeader title="Nueva plantilla de calificación" />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.035)] md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-primary/[0.025]" />

          <div className="relative space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                onClick={() => router.push(`/teacher/courses/${courseId}/grade-templates`)}
              >
                <ArrowLeft className="mr-2 size-4" />
                Volver a plantillas
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Gestionar calificaciones
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Crear plantilla reutilizable
              </h1>

              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
                Configurá una estructura base para reutilizar en evaluaciones del curso {courseName} ({courseYear}) y acelerar la carga masiva de notas.
              </p>
            </div>
          </div>
        </section>

        <TeacherGradeTemplateForm
          mode="create"
          onSubmit={handleSubmit}
          submitLabel="Crear plantilla"
        />
      </div>
    </div>
  )
}