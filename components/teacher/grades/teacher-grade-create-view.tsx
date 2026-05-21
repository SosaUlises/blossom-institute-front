'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

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

        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Crear calificación
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registrá una evaluación con nota directa o detalle por habilidades.
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
