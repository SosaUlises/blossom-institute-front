'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Inbox } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { getTeacherCourseDetail } from '@/lib/teacher/course-detail/api'
import { getTeacherCourseStudents } from '@/lib/teacher/course-detail/students'
import {
  getTeacherGradeDetail,
  updateTeacherGrade,
} from '@/lib/teacher/grades/api'
import type {
  GradeFormPayload,
  GradeFormValues,
} from '@/lib/teacher/grades/types'
import { TeacherGradeForm } from './teacher-grade-form'
import { TeacherGradePageHeader } from './teacher-grade-page-header'

type Props = {
  courseId: number
  alumnoId: number
  gradeId: number
}

type StudentContext = {
  name: string
  email?: string | null
  avatarUrl?: string | null
}

function EditViewSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/95 p-4 dark:bg-card/90 sm:p-5">
      <div className="h-4 w-40 animate-pulse rounded-full bg-muted/40" />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="h-20 animate-pulse rounded-xl bg-muted/35 md:col-span-2" />
        <div className="h-10 animate-pulse rounded-xl bg-muted/35" />
        <div className="h-10 animate-pulse rounded-xl bg-muted/35" />
        <div className="h-24 animate-pulse rounded-xl bg-muted/30 md:col-span-2" />
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
  const [studentContext, setStudentContext] = useState<StudentContext | null>(null)
  const [courseName, setCourseName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const [gradeResult, courseResult, studentsResult] = await Promise.allSettled([
          getTeacherGradeDetail(courseId, alumnoId, gradeId),
          getTeacherCourseDetail(courseId),
          getTeacherCourseStudents(courseId),
        ])

        if (gradeResult.status === 'rejected') {
          throw gradeResult.reason
        }

        if (courseResult.status === 'fulfilled') {
          setCourseName(courseResult.value.nombre)
        }

        if (studentsResult.status === 'fulfilled') {
          const student = studentsResult.value.find(
            (item) => item.alumnoId === alumnoId,
          )

          if (student) {
            setStudentContext({
              name: `${student.nombre} ${student.apellido}`.trim(),
              email: student.email,
              avatarUrl: student.avatarUrl,
            })
          }
        }

        const grade = gradeResult.value

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

    void load()
  }, [courseId, alumnoId, gradeId])

  const handleSubmit = async (payload: GradeFormPayload) => {
    await updateTeacherGrade(courseId, alumnoId, gradeId, payload)

    setTimeout(() => {
      router.push(`/teacher/courses/${courseId}/students/${alumnoId}/grades`)
    }, 700)
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <TeacherGradePageHeader mode="edit" loading />
        <EditViewSkeleton />
      </div>
    )
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
    <div className="space-y-5">
      <TeacherGradePageHeader
        mode="edit"
        studentName={studentContext?.name}
        studentEmail={studentContext?.email}
        studentAvatarUrl={studentContext?.avatarUrl}
        courseName={courseName}
      />

      <TeacherGradeForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Actualizar calificación"
      />
    </div>
  )
}
