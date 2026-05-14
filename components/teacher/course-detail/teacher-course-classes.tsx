'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Search,
  CalendarRange,
  CheckSquare,
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

function getEstadoClass(estado: ClassItem['estado']) {
  switch (estado) {
    case 'Realizada':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    case 'Cancelada':
      return 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
    default:
      return 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400'
  }
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(year, month - 1, day)

  return d.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function StatPill({
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
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-colors',
        tone === 'success' &&
          'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-400',
        tone === 'danger' &&
          'border-rose-500/20 bg-rose-500/[0.08] text-rose-600 dark:text-rose-400',
        tone === 'default' &&
          'border-border/60 bg-background/85 text-muted-foreground',
      )}
    >
      <div className="flex size-8 items-center justify-center rounded-xl bg-background/90 shadow-sm">
        {icon}
      </div>

      <div className="leading-none">
        <p className="text-base font-semibold tabular-nums">{value}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] opacity-80">
          {label}
        </p>
      </div>
    </div>
  )
}

function ClassCard({
  item,
  courseId,
}: {
  item: ClassItem
  courseId: number
}) {
  return (
    <article className="group rounded-2xl border border-border/60 bg-card/95 px-7 py-7 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-all duration-200 ease-out hover:border-border/80 hover:bg-card hover:shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <Calendar className="size-3.5" />
              {formatDate(item.fecha)}
            </div>

            <span
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] shadow-sm',
                getEstadoClass(item.estado),
              )}
            >
              {item.estado}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-[1.3rem] font-semibold leading-tight tracking-tight text-foreground md:text-[1.4rem]">
              {item.descripcion?.trim() || 'Clase sin descripción'}
            </h3>

            <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
              Registro de asistencia y seguimiento académico de esta clase.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatPill
              icon={<Users className="size-4" />}
              value={item.total}
              label="Alumnos"
            />
            <StatPill
              icon={<CheckCircle2 className="size-4" />}
              value={item.presentes}
              label="Presentes"
              tone="success"
            />
            <StatPill
              icon={<XCircle className="size-4" />}
              value={item.ausentes}
              label="Ausentes"
              tone="danger"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center xl:pt-1">
          <Button
            asChild
            className="h-11 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-lg"
          >
            <Link href={`/teacher/courses/${courseId}/classes/${encodeURIComponent(item.fecha)}`}>
              Ver detalle
              <ChevronRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

function ClassCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/95 px-7 py-7 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-7 w-32 animate-pulse rounded-full bg-muted/40" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted/35" />
        </div>

        <div className="space-y-3">
          <div className="h-7 w-3/5 animate-pulse rounded-xl bg-muted/40" />
          <div className="h-4 w-2/3 animate-pulse rounded-lg bg-muted/30" />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="h-14 w-32 animate-pulse rounded-2xl bg-muted/35" />
          <div className="h-14 w-36 animate-pulse rounded-2xl bg-muted/35" />
          <div className="h-14 w-34 animate-pulse rounded-2xl bg-muted/35" />
        </div>

        <div className="h-11 w-36 animate-pulse rounded-2xl bg-muted/40" />
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

  const pageSize = 6

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
      const estado = item.estado.toLowerCase()
      const fecha = formatDate(item.fecha).toLowerCase()
      const rawFecha = item.fecha.toLowerCase()

      return (
        description.includes(term) ||
        estado.includes(term) ||
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
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <ClassCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-5">
     <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] md:p-5">
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="w-full lg:max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar clase..."
          className="h-11 rounded-2xl border-border/70 bg-background/90 pl-11 pr-4 text-sm shadow-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/10"
        />
      </div>
    </div>

    <Button
      asChild
      className="h-11 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
    >
      <Link href={`/teacher/courses/${courseId}/classes/take`}>
        <CheckSquare className="mr-2 size-4" />
        Tomar asistencia
      </Link>
    </Button>
  </div>
</section>

      {filteredData.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 px-6 py-12 text-center text-sm text-muted-foreground">
          {search.trim()
            ? 'No se encontraron clases con ese criterio de búsqueda.'
            : 'No hay clases registradas.'}
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {paginatedData.map((item) => (
              <ClassCard
                key={`${item.claseId}-${item.fecha}`}
                item={item}
                courseId={courseId}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/95 px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Página {page} de {totalPages} · {filteredData.length} clase{filteredData.length === 1 ? '' : 's'}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40 disabled:hover:translate-y-0"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </Button>

              <Button
                variant="outline"
                className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40 disabled:hover:translate-y-0"
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