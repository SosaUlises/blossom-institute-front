'use client'

import { useEffect, useState } from 'react'
import { GraduationCap, Mail, BadgeCheck } from 'lucide-react'

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

function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <article className="group relative rounded-[26px] border border-border/70 bg-card/95 p-5 shadow-[0_16px_40px_-24px_rgba(30,42,68,0.16)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_22px_48px_-24px_rgba(30,42,68,0.22)]">
      <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.05),transparent_22%)]" />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-[18px] bg-violet-500/10 text-violet-600 shadow-sm dark:text-violet-400">
            <GraduationCap className="size-5" />
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/15 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-400">
            <BadgeCheck className="size-3.5" />
            Profesor
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {teacher.nombre} {teacher.apellido}
          </h3>

          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-3 py-1">
              DNI {teacher.dni}
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

          <p className="mt-2 text-sm font-medium text-foreground">
            {teacher.email ?? 'Sin email registrado'}
          </p>
        </div>
      </div>
    </article>
  )
}

function TeacherCardSkeleton() {
  return (
    <div className="rounded-[26px] border border-border/70 bg-card/95 p-5 shadow-[0_16px_40px_-24px_rgba(30,42,68,0.16)]">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="h-12 w-12 animate-pulse rounded-[18px] bg-muted/40" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted/40" />
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <TeacherCardSkeleton key={index} />
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
        <GraduationCap className="mx-auto mb-3 size-5" />
        Sin profesores asignados.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((teacher) => (
        <TeacherCard key={teacher.profesorId} teacher={teacher} />
      ))}
    </div>
  )
}