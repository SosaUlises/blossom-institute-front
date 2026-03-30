'use client'

import { useEffect, useState } from 'react'
import { BadgeCheck, Mail, Users } from 'lucide-react'

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

function StudentCard({ student }: { student: Student }) {
  return (
    <article className="group relative rounded-[26px] border border-border/70 bg-card/95 p-5 shadow-[0_16px_40px_-24px_rgba(30,42,68,0.16)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_22px_48px_-24px_rgba(30,42,68,0.22)]">
      <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.05),transparent_22%)]" />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-[18px] bg-sky-500/10 text-sky-600 shadow-sm dark:text-sky-400">
            <Users className="size-5" />
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-400">
            <BadgeCheck className="size-3.5" />
            Alumno
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {student.nombre} {student.apellido}
          </h3>

          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-3 py-1">
              DNI {student.dni}
            </span>
          </div>
        </div>

        <div className="rounded-[20px] border border-border/70 bg-background/75 p-3 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
              Email
            </span>
          </div>

          <p className="mt-2 text-sm font-medium text-foreground break-all">
            {student.email ?? 'Sin email registrado'}
          </p>
        </div>
      </div>
    </article>
  )
}

function StudentCardSkeleton() {
  return (
    <div className="rounded-[26px] border border-border/70 bg-card/95 p-5 shadow-[0_16px_40px_-24px_rgba(30,42,68,0.16)]">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="h-12 w-12 animate-pulse rounded-[18px] bg-muted/40" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-muted/40" />
        </div>

        <div className="space-y-3">
          <div className="h-6 w-2/3 animate-pulse rounded-xl bg-muted/40" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-muted/40" />
        </div>

        <div className="h-16 animate-pulse rounded-[20px] bg-muted/40" />
      </div>
    </div>
  )
}

export function TeacherCourseStudents({ courseId }: { courseId: number }) {
  const [data, setData] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <StudentCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (data.length === 0) {
    return (
      <div className="rounded-[26px] border border-dashed border-border/70 bg-background/60 px-6 py-12 text-center text-sm text-muted-foreground">
        <Users className="mx-auto mb-3 size-5" />
        No hay alumnos en este curso.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((student) => (
        <StudentCard key={student.alumnoId} student={student} />
      ))}
    </div>
  )
}