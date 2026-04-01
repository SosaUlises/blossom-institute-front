'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TeacherGradeForm } from './teacher-grade-form'
import { createTeacherGrade } from '@/lib/teacher/grades/api'
import type { GradeFormPayload } from '@/lib/teacher/grades/types'

type Props = {
  courseId: number
  alumnoId: number
}

export function TeacherGradeCreateView({ courseId, alumnoId }: Props) {
  const router = useRouter()

  const handleSubmit = async (payload: GradeFormPayload) => {
    await createTeacherGrade(courseId, alumnoId, payload)

    setTimeout(() => {
      router.push(`/teacher/courses/${courseId}/students/${alumnoId}/grades`)
    }, 700)
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
              Crear calificación
            </h1>

            <p className="text-sm leading-6 text-muted-foreground">
              Registrá una calificación manual para el alumno, con nota directa o detalle por skills.
            </p>
          </div>
        </div>
      </section>

      <TeacherGradeForm mode="create" onSubmit={handleSubmit} />
    </div>
  )
}