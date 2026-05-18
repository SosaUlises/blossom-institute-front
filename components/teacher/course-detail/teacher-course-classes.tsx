'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Search,
  Users,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type RawClassItem = {
  id: number
  cursoId: number
  fecha: string
  estado: number | string
  descripcion?: string | null
  cantAsistencias: number
  cantPresentes: number
  cantAusentes: number
}

type ClassItem = {
  claseId: number
  fecha: string
  descripcion?: string | null
  estado: 'Programada' | 'Realizada' | 'Cancelada'
  presentes: number
  ausentes: number
  total: number
}

type Envelope<T> = {
  message?: string | null
  success?: boolean
  statusCode?: number
  data?: {
    total?: number
    pageNumber?: number
    pageSize?: number
    items?: T[]
  }
}

function normalizeEstado(value: number | string | undefined): ClassItem['estado'] {
  if (typeof value === 'string') {
    if (value === 'Programada' || value === 'Realizada' || value === 'Cancelada') {
      return value
    }
  }

  switch (value) {
    case 1:
      return 'Programada'
    case 2:
      return 'Realizada'
    case 3:
      return 'Cancelada'
    default:
      return 'Programada'
  }
}

function normalizeClassItem(item: RawClassItem): ClassItem {
  return {
    claseId: item.id,
    fecha: item.fecha,
    descripcion: item.descripcion,
    estado: normalizeEstado(item.estado),
    presentes: item.cantPresentes ?? 0,
    ausentes: item.cantAusentes ?? 0,
    total: item.cantAsistencias ?? 0,
  }
}

function parseLocalDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDate(date: string) {
  const parsed = parseLocalDate(date)

  if (!parsed) return date

  return parsed.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function AttendancePill({
  icon,
  value,
  label,
  tone = 'default',
}: {
  icon: React.ReactNode
  value: number
  label: string
  tone?: 'default' | 'success' | 'danger'
}) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
        tone === 'success' &&
          'border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-400',
        tone === 'danger' &&
          'border-rose-500/15 bg-rose-500/[0.06] text-rose-600 dark:text-rose-400',
        tone === 'default' &&
          'border-border/60 bg-background/60 text-muted-foreground dark:bg-background/30',
      )}
    >
      {icon}
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  )
}

function ClassRow({
  item,
  courseId,
}: {
  item: ClassItem
  courseId: number
}) {
  return (
    <article className="group rounded-xl border border-border/70 bg-card/95 px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-colors duration-200 ease-out hover:border-primary/20 hover:bg-card dark:bg-card/90 sm:py-3.5">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground dark:bg-background/30">
            <Calendar className="size-3" />
            {formatDate(item.fecha)}
          </span>
          <span className="inline-flex items-center rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            Registrada
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-6 tracking-tight text-foreground sm:text-lg">
            {item.descripcion?.trim() || 'Clase sin descripcion'}
          </h3>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            <AttendancePill
              icon={<Users className="size-3.5" />}
              value={item.total}
              label="alumnos"
            />
            <AttendancePill
              icon={<CheckCircle2 className="size-3.5" />}
              value={item.presentes}
              label="presentes"
              tone="success"
            />
            <AttendancePill
              icon={<XCircle className="size-3.5" />}
              value={item.ausentes}
              label="ausentes"
              tone="danger"
            />
          </div>

          <Button
            asChild
            variant="ghost"
            className="h-8 w-fit rounded-lg px-2.5 text-xs font-semibold text-foreground shadow-none transition-colors duration-200 hover:bg-primary/5 hover:text-primary"
          >
            <Link href={`/teacher/courses/${courseId}/classes/${encodeURIComponent(item.fecha)}`}>
              Editar asistencia
              <ChevronRight className="ml-0.5 size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

function ClassRowSkeleton() {
  return (
    <div className="rounded-xl border border-border/70 bg-card/95 px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:py-3.5">
      <div className="space-y-2.5">
        <div className="flex gap-2">
          <div className="h-5 w-24 animate-pulse rounded-full bg-muted/40" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-muted/35" />
        </div>
        <div className="h-5 w-60 animate-pulse rounded bg-muted/40" />
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1.5">
            <div className="h-7 w-20 animate-pulse rounded-full bg-muted/35" />
            <div className="h-7 w-24 animate-pulse rounded-full bg-muted/35" />
            <div className="h-7 w-20 animate-pulse rounded-full bg-muted/35" />
          </div>
          <div className="h-8 w-32 animate-pulse rounded-lg bg-muted/35" />
        </div>
      </div>
    </div>
  )
}

export function TeacherCourseClasses({ courseId }: { courseId: number }) {
  const [data, setData] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const pageSize = 8

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/teacher/courses/${courseId}/classes`, {
          cache: 'no-store',
        })

        const result = (await response.json()) as Envelope<RawClassItem>

        if (!response.ok) {
          throw new Error(result.message || 'Error al cargar clases')
        }

        const rawItems = result.data?.items ?? []
        const normalized = rawItems.map((item) => normalizeClassItem(item))

        setData(normalized)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error inesperado')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId])

  const filteredData = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return data

    return data.filter((item) => {
      const description = item.descripcion?.toLowerCase() ?? ''
      const fecha = formatDate(item.fecha).toLowerCase()
      const rawFecha = item.fecha.toLowerCase()

      return (
        description.includes(term) ||
        fecha.includes(term) ||
        rawFecha.includes(term)
      )
    })
  }, [data, search])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, page])

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  if (loading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <ClassRowSkeleton key={i} />
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

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-border/70 bg-card/85 p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar clase registrada..."
                className="h-10 rounded-xl border-border/60 bg-background/75 pl-10 pr-4 text-sm shadow-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
              />
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-10 rounded-lg border-primary/15 bg-primary/[0.04] px-3 text-sm font-semibold text-primary shadow-none transition-colors duration-200 hover:border-primary/25 hover:bg-primary/[0.07] hover:text-primary"
          >
            <Link href={`/teacher/courses/${courseId}/classes/take`}>
              <CheckSquare className="mr-2 size-4" />
              Tomar asistencia
            </Link>
          </Button>
        </div>
      </section>

      {filteredData.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-5 py-10 text-center text-sm text-muted-foreground">
          {search.trim()
            ? 'No se encontraron clases con ese criterio de busqueda.'
            : 'Todavia no cargaste asistencias para este curso.'}
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {paginatedData.map((item) => (
              <ClassRow
                key={`${item.claseId}-${item.fecha}`}
                item={item}
                courseId={courseId}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2.5 rounded-xl border border-border/70 bg-card/90 px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Pagina {page} de {totalPages} - {filteredData.length} clase{filteredData.length === 1 ? '' : 's'}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-lg border-border/70 bg-background/70 transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </Button>

              <Button
                variant="outline"
                className="rounded-lg border-border/70 bg-background/70 transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
