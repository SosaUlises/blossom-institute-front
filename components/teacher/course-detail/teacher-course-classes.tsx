'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  FileText,
  CheckSquare,
  CheckCircle2,
  Users,
  XCircle,
} from 'lucide-react'

import { RowActions } from '@/components/ui/row-actions'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/teacher/course-detail/formatters'
import { getEstadoClaseConfig } from '@/lib/teacher/course-detail/status'

type CourseClass = {
  id: number
  fecha: string
  descripcion?: string | null
  estado: number
  cantAsistencias: number
  cantPresentes: number
  cantAusentes: number
}

type PaginatedClassesEnvelope = {
  message?: string
  data?: {
    total?: number
    pageNumber?: number
    pageSize?: number
    items?: CourseClass[]
  }
}

function ClassStat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  const config =
    label === 'Presentes'
      ? {
          icon: CheckCircle2,
          container: 'border-emerald-500/20 bg-emerald-500/10',
          iconWrap: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
          value: 'text-emerald-700 dark:text-emerald-400',
        }
      : label === 'Ausentes'
        ? {
            icon: XCircle,
            container: 'border-rose-500/20 bg-rose-500/10',
            iconWrap: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
            value: 'text-rose-700 dark:text-rose-400',
          }
        : {
            icon: Users,
            container: 'border-border/60 bg-background/80',
            iconWrap: 'bg-background text-muted-foreground',
            value: 'text-foreground',
          }

  const Icon = config.icon

  return (
    <div
      className={`rounded-[22px] border px-4 py-3 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md ${config.container}`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex size-8 items-center justify-center rounded-xl ${config.iconWrap}`}
        >
          <Icon className="size-4" />
        </div>

        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
      </div>

      <p className={`mt-2 text-xl font-semibold tracking-tight ${config.value}`}>
        {value}
      </p>
    </div>
  )
}

export function TeacherCourseClasses({ courseId }: { courseId: number }) {
  const router = useRouter()

  const [data, setData] = useState<CourseClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const query = new URLSearchParams({
          pageNumber: String(pageNumber),
          pageSize: String(pageSize),
        })

        if (from) query.set('from', from)
        if (to) query.set('to', to)

        const response = await fetch(
          `/api/teacher/courses/${courseId}/classes?${query.toString()}`,
          {
            cache: 'no-store',
          }
        )

        const result = (await response.json()) as PaginatedClassesEnvelope

        if (!response.ok) {
          throw new Error(result.message || 'No se pudieron obtener las clases.')
        }

        setData(result.data?.items ?? [])
        setTotal(result.data?.total ?? 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId, from, to, pageNumber])

  if (loading) {
    return (
      <div className="rounded-[24px] border border-border/60 bg-background/60 px-6 py-10 text-sm text-muted-foreground">
        Cargando clases...
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Classes
          </p>
        </div>

        <Button
          onClick={() => router.push(`/teacher/courses/${courseId}/classes/take`)}
          className="h-10 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
        >
          <CheckSquare className="mr-2 size-4" />
          Tomar asistencia
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-[24px] border border-border/60 bg-card/90 p-4 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value)
                setPageNumber(1)
              }}
              className="w-full rounded-2xl border border-border/70 bg-background/85 px-4 py-3 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value)
                setPageNumber(1)
              }}
              className="w-full rounded-2xl border border-border/70 bg-background/85 px-4 py-3 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-sm"
            onClick={() => {
              setFrom('')
              setTo('')
              setPageNumber(1)
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-border/70 bg-background/60 px-6 py-12 text-center text-sm text-muted-foreground">
          Sin clases.
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item) => {
            const estado = getEstadoClaseConfig(item.estado)

            return (
              <article
                key={item.id}
                className="relative rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_24px_52px_-24px_rgba(15,23,42,0.20)] md:p-6"
              >
                <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.06),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.05),transparent_22%)]" />

                <div className="relative space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                        <CalendarDays className="size-3.5" />
                        Clase
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${estado.className}`}
                      >
                        {estado.label}
                      </span>
                    </div>

                    <div className="pl-2">
                      <RowActions
                        actions={[
                          {
                            label: 'Gestionar asistencia',
                            icon: CheckSquare,
                            onClick: () =>
                              router.push(`/teacher/courses/${courseId}/classes/${item.fecha}`),
                          },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
                    <div className="min-w-0 space-y-2">
                      <h3 className="text-xl font-semibold tracking-tight text-foreground">
                        {formatDate(item.fecha)}
                      </h3>

                      <div className="inline-flex max-w-full items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="size-4 shrink-0" />
                        <span className="truncate">
                          {item.descripcion?.trim() ? item.descripcion : 'Sin descripción'}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <ClassStat label="Asistencias" value={item.cantAsistencias} />
                      <ClassStat label="Presentes" value={item.cantPresentes} />
                      <ClassStat label="Ausentes" value={item.cantAusentes} />
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-sm text-muted-foreground">
          Página {pageNumber} · {total} clases en total
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40 disabled:hover:translate-y-0"
            disabled={pageNumber === 1}
            onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
          >
            Anterior
          </Button>

          <Button
            variant="outline"
            className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40 disabled:hover:translate-y-0"
            disabled={pageNumber * pageSize >= total}
            onClick={() => setPageNumber((prev) => prev + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}