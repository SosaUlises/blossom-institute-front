'use client'

import { useRouter } from 'next/navigation'

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
    <div className="space-y-5">
      <header className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Seguimiento académico
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Crear calificación
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            Registrá una evaluación para el seguimiento del alumno.
          </p>
        </div>
      </header>

      <TeacherGradeForm
        mode="create"
        onSubmit={handleSubmit}
        submitLabel="Guardar calificación"
      />
    </div>
  )
}
