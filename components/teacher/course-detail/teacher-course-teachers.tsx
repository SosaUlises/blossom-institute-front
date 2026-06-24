'use client'

import { useEffect, useState } from 'react'
import { GraduationCap } from 'lucide-react'

import { PersonAvatar, PersonMeta } from './course-people-ui'
import {
  CourseTabEmptyState,
  CourseTabErrorState,
  CourseTabSkeletonList,
} from './course-tab-ui'

type Teacher = {
  profesorId: number
  nombre: string
  apellido: string
  email?: string | null
  avatarUrl?: string | null
}

type TeachersEnvelope = {
  message?: string
  data?: {
    items?: Teacher[]
  }
}

function TeacherRosterRow({ teacher }: { teacher: Teacher }) {
  const fullName = `${teacher.nombre} ${teacher.apellido}`.trim()

  return (
    <article className="mb-4 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:shadow-md md:flex-row md:p-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <PersonAvatar
          name={fullName}
          avatarUrl={teacher.avatarUrl}
          tone="teacher"
          size={48}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground sm:text-[15px]">
            {fullName}
          </h3>
          <PersonMeta email={teacher.email} />
        </div>
      </div>

      <div className="flex w-full flex-col items-center text-center md:w-auto md:items-end md:text-right">
        <span className="mb-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
          Docente del curso
        </span>
        <span className="text-xs text-muted-foreground">
          Enseñanza y seguimiento académico
        </span>
      </div>
    </article>
  )
}

function TeacherRosterSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="mb-4 flex items-center gap-3 rounded-2xl border border-border/40 bg-card p-4 shadow-sm md:p-5"
        >
          <div className="size-10 animate-pulse rounded-full bg-muted/40" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-36 animate-pulse rounded-md bg-muted/40" />
            <div className="h-4 w-48 max-w-full animate-pulse rounded-md bg-muted/30" />
          </div>
          <div className="hidden w-40 space-y-2 sm:block">
            <div className="ml-auto h-3.5 w-28 animate-pulse rounded-md bg-muted/35" />
            <div className="ml-auto h-3 w-40 animate-pulse rounded-md bg-muted/25" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TeacherCourseTeachers({ courseId }: { courseId: number }) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTeachers() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/teacher/courses/${courseId}/teachers`, {
          cache: 'no-store',
        })
        const result = (await response.json()) as TeachersEnvelope

        if (!response.ok) {
          throw new Error(result.message ?? 'No se pudo cargar el equipo docente.')
        }

        if (!cancelled) {
          setTeachers(result.data?.items ?? [])
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Ocurrió un error al cargar el equipo docente.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadTeachers()

    return () => {
      cancelled = true
    }
  }, [courseId])

  if (loading) {
    return (
      <CourseTabSkeletonList label="Cargando equipo docente del curso.">
        <TeacherRosterSkeleton />
      </CourseTabSkeletonList>
    )
  }

  if (error) {
    return <CourseTabErrorState>{error}</CourseTabErrorState>
  }

  if (teachers.length === 0) {
    return (
      <CourseTabEmptyState
        icon={GraduationCap}
        title="Todavía no hay docentes asignados a este curso"
        description="Cuando se asigne el equipo docente, va a aparecer acá."
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {teachers.map((teacher) => (
        <TeacherRosterRow key={teacher.profesorId} teacher={teacher} />
      ))}
    </div>
  )
}
