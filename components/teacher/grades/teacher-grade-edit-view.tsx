'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Inbox, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { TeacherGradeForm } from './teacher-grade-form'
import {
  getTeacherGradeDetail,
  updateTeacherGrade,
} from '@/lib/teacher/grades/api'
import type {
  GradeFormPayload,
  GradeFormValues,
} from '@/lib/teacher/grades/types'

type Props = {
  courseId: number
  alumnoId: number
  gradeId: number
}

function EditViewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-3 border-b border-border/60 pb-4">
        <div className="h-9 w-44 animate-pulse rounded-lg bg-muted/35" />
        <div className="h-7 w-52 animate-pulse rounded-lg bg-muted/40" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded-md bg-muted/30" />
      </div>
    </div>
  )
}

export function TeacherGradeEditView({
  courseId,
  alumnoId,
  gradeId,
}: Props) {
  const router = useRouter()

  const [initialValues, setInitialValues] = useState<GradeFormValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const grade = await getTeacherGradeDetail(courseId, alumnoId, gradeId)

        setInitialValues({
          tipo: String(grade.tipo),
          titulo: grade.titulo ?? '',
          descripcion: grade.descripcion ?? '',
          fecha: grade.fecha ?? '',
          tareaId: '',
          entregaId: '',
          nota: grade.nota != null ? String(grade.nota) : '',
          detalles:
            grade.detalles?.map((detail) => ({
              id: crypto.randomUUID(),
              skill: String(detail.skill),
              puntajeObtenido: String(detail.puntajeObtenido),
              puntajeMaximo: String(detail.puntajeMaximo),
            })) ?? [],
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId, alumnoId, gradeId])

  const handleSubmit = async (payload: GradeFormPayload) => {
    await updateTeacherGrade(courseId, alumnoId, gradeId, payload)

    setTimeout(() => {
      router.push(`/teacher/courses/${courseId}/students/${alumnoId}/grades`)
    }, 700)
  }

  if (loading) {
    return <EditViewSkeleton />
  }

  if (error || !initialValues) {
    return (
      <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
        <CardContent className="px-5 py-8">
          <Empty className="border-0 p-0">
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No se pudo cargar la calificación</EmptyTitle>
              <EmptyDescription>
                {error ?? 'Ocurrió un error al obtener la información.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <header className="space-y-3 border-b border-border/60 pb-4">
        <Button
          variant="ghost"
          className="-ml-2 h-9 w-fit rounded-lg px-2 text-muted-foreground hover:bg-primary/5 hover:text-primary"
          onClick={() =>
            router.push(`/teacher/courses/${courseId}/students/${alumnoId}/grades`)
          }
        >
          <ArrowLeft className="mr-2 size-4" />
          Volver a calificaciones
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Editar calificación
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
            <Pencil className="size-3.5" />
            Edición
          </span>
        </div>
      </header>

      <TeacherGradeForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Actualizar calificación"
      />
    </div>
  )
}
