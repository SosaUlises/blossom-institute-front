'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Mail, Trophy, Users, IdCard } from 'lucide-react'

import { Button } from '@/components/ui/button'

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

function StudentCard({
  student,
  courseId,
}: {
  student: Student
  courseId: number
}) {
  const fullName = `${student.nombre} ${student.apellido}`

  return (
    <article className="group relative rounded-[26px] border border-border/60 bg-card/95 p-5 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.14)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-border/80 hover:bg-card hover:shadow-[0_22px_48px_-24px_rgba(15,23,42,0.20)]">
      <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.05),transparent_22%)]" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 shadow-sm dark:text-sky-400">
            <Users className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[17px] font-semibold tracking-tight text-foreground">
              {fullName}
            </h3>

            <div className="mt-2 space-y-2 text-[12px] text-muted-foreground">
              <div className="flex min-w-0 items-center gap-1.5">
                <IdCard className="size-3.5 shrink-0" />
                <span className="truncate">DNI {student.dni}</span>
              </div>

              <div className="flex min-w-0 items-center gap-1.5">
                <Mail className="size-3.5 shrink-0" />
                <span
                  className="truncate"
                  title={student.email ?? 'Sin email registrado'}
                >
                  {student.email ?? 'Sin email registrado'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
          <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            Ver calificaciones
          </span>

          <Button
            asChild
            size="sm"
            className="rounded-xl bg-primary px-3.5 text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:translate-y-[-1px] hover:shadow-[0_14px_30px_-12px_rgba(245,158,11,0.85)]"
          >
            <Link
              href={`/teacher/courses/${courseId}/students/${student.alumnoId}/grades`}
            >
              <Trophy className="mr-2 size-4" />
              Calificaciones
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

function StudentCardSkeleton() {
  return (
    <div className="rounded-[26px] border border-border/60 bg-card/95 p-5 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.14)]">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 animate-pulse rounded-2xl bg-muted/40" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-2/3 animate-pulse rounded-xl bg-muted/40" />
            <div className="h-4 w-4/5 animate-pulse rounded-lg bg-muted/35" />
          </div>
        </div>

        <div className="border-t border-border/40 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 w-28 animate-pulse rounded-lg bg-muted/35" />
            <div className="h-9 w-32 animate-pulse rounded-xl bg-muted/40" />
          </div>
        </div>
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
    return (
      <div className="rounded-[24px] border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
        {error}
      </div>
    )
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
        <StudentCard
          key={student.alumnoId}
          student={student}
          courseId={courseId}
        />
      ))}
    </div>
  )
}