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

      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <header className="space-y-3">
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
              Editar plantilla
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {courseName} · {courseYear}
            </p>
          </div>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 px-4 py-10 text-center text-sm text-muted-foreground">
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
