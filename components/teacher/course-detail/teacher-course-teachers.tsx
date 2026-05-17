'use client'

import { useEffect, useState } from 'react'
import { GraduationCap } from 'lucide-react'
import {
  CoursePeopleSection,
  PersonAvatar,
  PersonMeta,
  PersonRosterSurface,
} from './course-people-ui'

type Teacher = {
  profesorId: number
  nombre: string
  apellido: string
  dni: number
  email?: string | null
}

type Envelope<T> = {
  message?: string
  data?: {
    items?: T[]
  }
}

function TeacherRosterCard({ teacher }: { teacher: Teacher }) {
  const fullName = `${teacher.nombre} ${teacher.apellido}`.trim()

  return (
    <PersonRosterSurface tone="teacher">
      <div className="flex min-w-0 items-center gap-3">
        <PersonAvatar name={fullName} tone="teacher" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-[15px]">
              {fullName}
            </h3>
            <span className="inline-flex rounded-full border border-violet-500/15 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:text-violet-300">
              Docente
            </span>
          </div>

          <PersonMeta email={teacher.email} />
        </div>
      </div>
    </PersonRosterSurface>
  )
}

function TeacherRosterSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-background/55 px-3 py-3 sm:px-4">
      <div className="flex items-center gap-3">
        <div className="size-10 animate-pulse rounded-lg bg-muted/40" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-36 animate-pulse rounded-lg bg-muted/40" />
          <div className="h-4 w-52 animate-pulse rounded-lg bg-muted/30" />
        </div>
      </div>
    </div>
  )
}

export function TeacherCourseTeachers({ courseId }: { courseId: number }) {
  const [data, setData] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/teacher/courses/${courseId}/teachers`, {
          cache: 'no-store',
        })

        const result = (await response.json()) as Envelope<Teacher>

        if (!response.ok) {
          throw new Error(result.message || 'No se pudieron obtener los profesores.')
        }

        setData(result.data?.items ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId])

  if (loading) {
    return (
      <div className="grid gap-2 md:grid-cols-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <TeacherRosterSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-5 py-7 text-center dark:bg-muted/10">
        <GraduationCap className="mx-auto mb-3 size-5" />
        <p className="text-sm font-medium text-foreground">Todavía no hay docentes asignados.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Cuando el curso tenga equipo docente, se verá acá.
        </p>
      </div>
    )
  }

  return (
    <CoursePeopleSection variant="grid">
      {data.map((teacher) => (
        <TeacherRosterCard key={teacher.profesorId} teacher={teacher} />
      ))}
    </CoursePeopleSection>
  )
}
