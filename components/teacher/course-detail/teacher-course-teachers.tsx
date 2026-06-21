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
    <article className="flex min-w-0 flex-col gap-3 px-3 py-3.5 sm:flex-row sm:items-center sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <PersonAvatar
          name={fullName}
          avatarUrl={teacher.avatarUrl}
          tone="teacher"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground sm:text-[15px]">
            {fullName}
          </h3>
          <PersonMeta email={teacher.email} />
        </div>
      </div>

      <div className="pl-[52px] sm:w-52 sm:pl-0 sm:text-right">
        <p className="text-xs font-medium text-foreground">Docente del curso</p>
        <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
          Enseñanza y seguimiento académico
        </p>
      </div>
    </article>
  )
}

function TeacherRosterSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/95">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b border-border/50 px-3 py-3.5 last:border-b-0 sm:px-4"
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
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-foreground">Equipo docente</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {teachers.length === 1
            ? 'Docente asignado a este curso.'
            : `${teachers.length} docentes comparten este curso.`}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90">
        <div className="divide-y divide-border/50">
          {teachers.map((teacher) => (
            <TeacherRosterRow key={teacher.profesorId} teacher={teacher} />
          ))}
        </div>
      </div>
    </div>
  )
}
