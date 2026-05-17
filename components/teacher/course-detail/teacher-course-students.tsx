'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Search, Trophy, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CoursePeopleSection,
  PersonAvatar,
  PersonMeta,
  PersonRosterSurface,
} from './course-people-ui'

type Student = {
  alumnoId: number
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

function StudentRosterRow({
  student,
  courseId,
}: {
  student: Student
  courseId: number
}) {
  const fullName = `${student.nombre} ${student.apellido}`.trim()

  return (
    <PersonRosterSurface tone="student">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <PersonAvatar name={fullName} tone="student" />

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-[15px]">
              {fullName}
            </h3>
            <PersonMeta email={student.email} />
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="h-10 w-full rounded-lg border-border/70 bg-background/70 px-3 text-sm shadow-none transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/20 active:bg-primary/10 sm:h-9 sm:w-fit"
        >
          <Link href={`/teacher/courses/${courseId}/students/${student.alumnoId}/grades`}>
            <Trophy className="mr-2 size-4" />
            Ver calificaciones
          </Link>
        </Button>
      </div>
    </PersonRosterSurface>
  )
}

function StudentRosterSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-3 sm:px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="size-10 animate-pulse rounded-lg bg-muted/40" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded-lg bg-muted/40" />
            <div className="h-4 w-56 animate-pulse rounded-lg bg-muted/30" />
          </div>
        </div>
        <div className="h-9 w-full animate-pulse rounded-lg bg-muted/35 sm:w-40" />
      </div>
    </div>
  )
}

export function TeacherCourseStudents({ courseId }: { courseId: number }) {
  const [data, setData] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/teacher/courses/${courseId}/students`, {
          cache: 'no-store',
        })

        const result = (await response.json()) as Envelope<Student>

        if (!response.ok) {
          throw new Error(result.message || 'No se pudieron obtener los alumnos.')
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

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return data

    return data.filter((student) =>
      `${student.nombre} ${student.apellido} ${student.email ?? ''}`
        .toLowerCase()
        .includes(normalizedSearch),
    )
  }, [data, search])

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <StudentRosterSkeleton key={index} />
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
        <Users className="mx-auto mb-3 size-5" />
        <p className="text-sm font-medium text-foreground">Todavía no hay alumnos en este curso.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Cuando se asignen estudiantes, van a aparecer acá.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar alumno..."
          className="h-10 rounded-xl border-border/60 bg-background/75 pl-10 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-5 dark:bg-muted/10">
          <p className="text-sm font-medium text-foreground">Sin resultados</p>
          <p className="mt-1 text-xs text-muted-foreground">
            No hay alumnos que coincidan con la búsqueda.
          </p>
        </div>
      ) : (
        <CoursePeopleSection>
          {filteredStudents.map((student) => (
            <StudentRosterRow
              key={student.alumnoId}
              student={student}
              courseId={courseId}
            />
          ))}
        </CoursePeopleSection>
      )}
    </div>
  )
}
