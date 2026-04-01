'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TeacherGradeForm } from './teacher-grade-form'
import { getTeacherGradeDetail, updateTeacherGrade } from '@/lib/teacher/grades/api'
import type { GradeFormPayload, GradeFormValues } from '@/lib/teacher/grades/types'

type Props = {
  courseId: number
  alumnoId: number
  gradeId: number
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
    return <p className="text-sm text-muted-foreground">Cargando calificación...</p>
  }

  if (error || !initialValues) {
    return (
      <p className="text-sm text-destructive">
        {error ?? 'No se pudo cargar la calificación.'}
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border/70 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(30,42,68,0.24)] md:p-8">
        <div className="space-y-5">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() =>
              router.push(`/teacher/courses/${courseId}/students/${alumnoId}/grades`)
            }
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver a calificaciones
          </Button>

          <div className="space-y-2">
     

            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Editar calificación
            </h1>

            <p className="text-sm leading-6 text-muted-foreground">
              Modificá tipo, nota, fecha y detalle por skills de la evaluación.
            </p>
          </div>
        </div>
      </section>

      <TeacherGradeForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
      />
    </div>
  )
}