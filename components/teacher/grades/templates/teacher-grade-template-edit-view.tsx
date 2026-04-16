'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/button'
import { TeacherGradeTemplateForm } from './teacher-grade-template-form'
import {
  getTeacherGradeTemplateById,
  updateTeacherGradeTemplate,
} from '@/lib/teacher/grade-templates/api'
import type {
  GradeTemplateFormPayload,
  GradeTemplateFormValues,
} from '@/lib/teacher/grade-templates/types'
import { mapGradeTemplateDetailToFormValues } from '@/lib/teacher/grade-templates/utils'

type Props = {
  courseId: number
  templateId: number
  courseName: string
  courseYear: number
}

export function TeacherGradeTemplateEditView({
  courseId,
  templateId,
  courseName,
  courseYear,
}: Props) {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialValues, setInitialValues] = useState<GradeTemplateFormValues | undefined>(
    undefined
  )

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true)
        setError(null)

        const template = await getTeacherGradeTemplateById(courseId, templateId)
        setInitialValues(mapGradeTemplateDetailToFormValues(template))
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo obtener el detalle de la plantilla.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadTemplate()
  }, [courseId, templateId])

  const handleSubmit = async (payload: GradeTemplateFormPayload) => {
    await updateTeacherGradeTemplate(courseId, templateId, payload)

    setTimeout(() => {
      router.push(`/teacher/courses/${courseId}/grade-templates`)
    }, 700)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Editar plantilla de calificación" />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="relative overflow-hidden rounded-[30px] border border-border/60 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)] md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.06),transparent_28%)]" />

          <div className="relative space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
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
                Editar plantilla
              </h1>

              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
                Ajustá tipo, título y detalle de skills para reutilizar esta estructura en el curso {courseName} · {courseYear}.
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-[28px] border border-dashed border-border/70 bg-background/40 px-6 py-16 text-center text-sm text-muted-foreground">
            Cargando plantilla...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : initialValues ? (
          <TeacherGradeTemplateForm
            mode="edit"
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel="Guardar cambios"
          />
        ) : null}
      </div>
    </div>
  )
}