'use client'

import { useEffect, useState } from 'react'
import { GraduationCap, Mail, IdCard } from 'lucide-react'

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
  const fullName = `${teacher.nombre} ${teacher.apellido}`

  return (
    <article className="group rounded-xl border border-border/70 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-colors duration-200 ease-out hover:border-primary/20 hover:bg-card dark:bg-card/90">
      <div className="flex h-full flex-col">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-violet-500/15 bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <GraduationCap className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[17px] font-semibold tracking-tight text-foreground">
              {fullName}
            </h3>

            <div className="mt-2 space-y-2 text-[12px] text-muted-foreground">
              <div className="flex min-w-0 items-center gap-1.5">
                <IdCard className="size-3.5 shrink-0" />
                <span className="truncate">DNI {teacher.dni}</span>
              </div>

              <div className="flex min-w-0 items-center gap-1.5">
                <Mail className="size-3.5 shrink-0" />
                <span
                  className="truncate"
                  title={teacher.email ?? 'Sin email registrado'}
                >
                  {teacher.email ?? 'Sin email registrado'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </article>
  )
}

function TeacherCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/70 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-muted/40" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-2/3 animate-pulse rounded-xl bg-muted/40" />
            <div className="h-4 w-4/5 animate-pulse rounded-lg bg-muted/35" />
          </div>
        </div>

        <div className="border-t border-border/40 pt-4">
          <div className="h-4 w-36 animate-pulse rounded-lg bg-muted/35" />
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <TeacherCardSkeleton key={index} />
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
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-5 py-10 text-center text-sm text-muted-foreground">
        <GraduationCap className="mx-auto mb-3 size-5" />
        Sin profesores asignados.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((teacher) => (
        <TeacherCard
          key={teacher.profesorId}
          teacher={teacher}
        />
      ))}
    </div>
  )
}
