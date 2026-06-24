'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  CourseTabEmptyState,
  CourseTabErrorState,
  CourseTabPagination,
  CourseTabSearchField,
  CourseTabSkeletonList,
} from './course-tab-ui'

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
  estado: 'Programada' | 'Cancelada'
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
    if (value === 'Cancelada') return 'Cancelada'
    return 'Programada'
  }

  switch (value) {
    case 1:
      return 'Programada'
    case 2:
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

function formatDateParts(date: string) {
  const parsed = parseLocalDate(date)

  if (!parsed) {
    return {
      weekday: '',
      day: date,
      month: '',
    }
  }

  return {
    weekday: parsed.toLocaleDateString('es-AR', { weekday: 'short' }),
    day: parsed.toLocaleDateString('es-AR', { day: '2-digit' }),
    month: parsed.toLocaleDateString('es-AR', { month: 'short' }),
  }
}

function ClassRow({
  item,
  courseId,
}: {
  item: ClassItem
  courseId: number
}) {
  const date = formatDateParts(item.fecha)

  return (
    <article className="mb-4 flex items-center justify-between rounded-2xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:shadow-md md:p-5">
      <div className="flex min-w-0 items-center">
        <time
          dateTime={item.fecha}
          className="mr-4 flex h-[60px] min-w-[60px] flex-col items-center justify-center rounded-xl border border-border/50 bg-muted/50 dark:bg-muted/20"
        >
          <span className="text-xs uppercase text-muted-foreground">
            {date.weekday}
          </span>
          <span className="text-xl font-bold tabular-nums leading-none text-foreground">
            {date.day}
          </span>
          <span className="text-xs uppercase text-muted-foreground">
            {date.month}
          </span>
        </time>

        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">
            {item.descripcion?.trim() || 'Sin tema registrado'}
          </h3>
          {item.presentes > 0 || item.ausentes > 0 ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {item.presentes > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                  <CheckCircle2 className="size-3.5" />
                  <span className="font-semibold tabular-nums">
                    {item.presentes}
                  </span>
                  presentes
                </span>
              ) : null}
              {item.ausentes > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400">
                  <XCircle className="size-3.5" />
                  <span className="font-semibold tabular-nums">
                    {item.ausentes}
                  </span>
                  ausentes
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <Button
        asChild
        variant="ghost"
        className="shrink-0 text-primary transition-colors hover:bg-primary/5 hover:text-primary"
      >
        <Link href={`/teacher/courses/${courseId}/classes/${encodeURIComponent(item.fecha)}`}>
          Ver detalle
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </article>
  )
}

function ClassRowSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card/95 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4">
      <div className="grid gap-3 sm:grid-cols-[68px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
        <div className="h-16 w-full animate-pulse rounded-lg bg-muted/35 sm:w-[68px]" />
        <div className="space-y-2">
          <div className="h-5 w-60 max-w-full animate-pulse rounded bg-muted/40" />
          <div className="flex gap-1.5">
            <div className="h-6 w-24 animate-pulse rounded-md bg-muted/30" />
            <div className="h-6 w-24 animate-pulse rounded-md bg-muted/25" />
          </div>
        </div>
        <div className="h-8 w-32 animate-pulse rounded-lg bg-muted/30" />
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
        const normalized = rawItems
          .map((item) => normalizeClassItem(item))
          .filter((item) => item.total > 0 && item.estado !== 'Cancelada')

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
      <CourseTabSkeletonList label="Cargando historial de asistencias.">
        {Array.from({ length: 5 }).map((_, i) => (
          <ClassRowSkeleton key={i} />
        ))}
      </CourseTabSkeletonList>
    )
  }

  if (error) {
    return <CourseTabErrorState>{error}</CourseTabErrorState>
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <CourseTabSearchField
          className="sm:max-w-md"
          value={search}
          onChange={setSearch}
          placeholder="Buscar asistencias registradas..."
        />

        <Button
          asChild
          className="h-10 w-full rounded-lg px-3 text-sm font-semibold shadow-none transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] sm:w-fit"
        >
          <Link
            href={`/teacher/courses/${courseId}/classes/take`}
            className="justify-center"
          >
            <CheckSquare className="mr-2 size-4" />
            Tomar asistencia
          </Link>
        </Button>
      </div>

      {filteredData.length === 0 ? (
        <CourseTabEmptyState
          icon={CheckSquare}
          title={
            search.trim()
              ? 'No hay asistencias que coincidan'
              : 'Todavía no hay asistencias tomadas en este curso'
          }
          description={
            search.trim()
              ? 'Probá con otra fecha o tema de clase.'
              : 'Cuando registres asistencia, el historial va a aparecer acá.'
          }
        />
      ) : (
        <>
          <div className="space-y-2">
            {paginatedData.map((item) => (
              <ClassRow
                key={`${item.claseId}-${item.fecha}`}
                item={item}
                courseId={courseId}
              />
            ))}
          </div>

          <CourseTabPagination
            label={`${filteredData.length} registro${filteredData.length === 1 ? '' : 's'} de asistencia · Página ${page} de ${totalPages}`}
            page={page}
            totalPages={totalPages}
            onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
            onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          />
        </>
      )}
    </div>
  )
}
