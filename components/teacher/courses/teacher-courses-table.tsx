'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CalendarRange,
  ClipboardCheck,
  Inbox,
  Search,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { getTeacherCourses } from '@/lib/teacher/courses/api'
import type { TeacherCourseListItem } from '@/lib/teacher/courses/types'
import { EstadoCurso } from '@/lib/teacher/courses/types'
import type {
  ProfesorDashboardProximaClaseItem,
  ProfesorDashboardResponse,
} from '@/lib/teacher/dashboard/types'

const SELECT_ALL = 'all'

const ESTADO_OPTIONS = [
  { value: String(EstadoCurso.Activo), label: 'Activo' },
  { value: String(EstadoCurso.Inactivo), label: 'Inactivo' },
  { value: String(EstadoCurso.Archivado), label: 'Archivado' },
] as const

const ESTADO_CONFIG: Record<
  EstadoCurso,
  { label: string; dot: string; pill: string }
> = {
  [EstadoCurso.Activo]: {
    label: 'Activo',
    dot: 'bg-emerald-500',
    pill:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  [EstadoCurso.Inactivo]: {
    label: 'Inactivo',
    dot: 'bg-amber-500',
    pill:
      'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  [EstadoCurso.Archivado]: {
    label: 'Archivado',
    dot: 'bg-slate-400',
    pill:
      'border-slate-400/20 bg-slate-500/10 text-slate-600 dark:text-slate-400',
  },
}

type DashboardEnvelope = {
  data?: ProfesorDashboardResponse
}

function EstadoBadge({ estado }: { estado: EstadoCurso }) {
  const config = ESTADO_CONFIG[estado] ?? {
    label: 'Desconocido',
    dot: 'bg-muted-foreground',
    pill: 'border-border/60 bg-muted/40 text-muted-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        config.pill,
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

function parseClassDate(item: ProfesorDashboardProximaClaseItem) {
  const [year, month, day] = item.fecha.split('T')[0].split('-').map(Number)
  const [hours, minutes] = item.horaInicio.slice(0, 5).split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes)
}

function formatNextClass(item: ProfesorDashboardProximaClaseItem) {
  const date = parseClassDate(item)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  const sameDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()

  const dayLabel = sameDay(date, today)
    ? 'Hoy'
    : sameDay(date, tomorrow)
      ? 'Mañana'
      : new Intl.DateTimeFormat('es-AR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }).format(date)

  return `${dayLabel} · ${item.horaInicio.slice(0, 5)}`
}

function CourseRowSkeleton() {
  return (
    <li className="rounded-xl border border-border/60 bg-card/90 px-4 py-4">
      <div className="flex items-center gap-4">
        <div className="size-10 animate-pulse rounded-lg bg-muted/50" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-5 w-44 animate-pulse rounded-md bg-muted/50" />
          <div className="h-4 w-3/5 animate-pulse rounded-md bg-muted/35" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded-md bg-muted/30" />
        </div>
        <div className="hidden h-9 w-28 animate-pulse rounded-lg bg-muted/40 sm:block" />
      </div>
    </li>
  )
}

function CourseRow({
  course,
  dashboard,
}: {
  course: TeacherCourseListItem
  dashboard: ProfesorDashboardResponse | null
}) {
  const courseContext = dashboard?.cursos.find((item) => item.cursoId === course.id)
  const summary = dashboard?.resumenPorCurso.find(
    (item) => item.cursoId === course.id,
  )
  const nextClass = dashboard?.proximasClases
    .filter(
      (item) =>
        item.cursoId === course.id && parseClassDate(item).getTime() > Date.now(),
    )
    .sort((a, b) => parseClassDate(a).getTime() - parseClassDate(b).getTime())[0]
  const description = courseContext?.descripcion?.trim()

  return (
    <li>
      <article className="group rounded-xl border border-border/60 bg-card/95 px-4 py-4 transition-colors duration-200 hover:border-primary/20 hover:bg-card dark:bg-card/90">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/8 text-primary">
              <BookOpen className="size-4.5" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/teacher/courses/${course.id}`}
                  className="truncate text-base font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
                >
                  {course.nombre}
                </Link>
                <EstadoBadge estado={course.estado} />
              </div>

              {description ? (
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
                  {description}
                </p>
              ) : null}

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                {nextClass ? (
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
                    <CalendarClock className="size-3.5 text-primary" />
                    {formatNextClass(nextClass)}
                  </span>
                ) : null}
                {summary ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    {summary.cantidadAlumnos} alumnos
                  </span>
                ) : null}
                {summary?.entregasPendientesCorreccion ? (
                  <span className="inline-flex items-center gap-1.5">
                    <ClipboardCheck className="size-3.5" />
                    {summary.entregasPendientesCorreccion} por corregir
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarRange className="size-3.5" />
                  {course.anio}
                </span>
              </div>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-9 w-full shrink-0 rounded-lg border-border/70 bg-background/70 px-3 text-sm font-semibold shadow-none transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary sm:w-auto"
          >
            <Link href={`/teacher/courses/${course.id}`}>
              Abrir curso
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </article>
    </li>
  )
}

async function getDashboardContext(): Promise<ProfesorDashboardResponse | null> {
  const response = await fetch('/api/teacher/dashboard', {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) return null

  const result = (await response.json()) as
    | DashboardEnvelope
    | ProfesorDashboardResponse

  if ('data' in result) {
    return result.data ?? null
  }

  return result as ProfesorDashboardResponse
}

export function TeacherCoursesTable() {
  const [items, setItems] = useState<TeacherCourseListItem[]>([])
  const [dashboard, setDashboard] = useState<ProfesorDashboardResponse | null>(null)
  const [search, setSearch] = useState('')
  const [anio, setAnio] = useState('')
  const [estado, setEstado] = useState(SELECT_ALL)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(timeout)
  }, [search])

  const loadCourses = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [courses, dashboardContext] = await Promise.all([
        getTeacherCourses({
          pageNumber: 1,
          pageSize: 50,
          search: debouncedSearch,
          anio: anio ? Number(anio) : undefined,
          estado: estado !== SELECT_ALL ? Number(estado) : undefined,
        }),
        getDashboardContext().catch(() => null),
      ])

      setItems(courses.items)
      setDashboard(dashboardContext)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudieron cargar los cursos.',
      )
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, anio, estado])

  useEffect(() => {
    void loadCourses()
  }, [loadCourses])

  const hasActiveFilters = !!debouncedSearch || !!anio || estado !== SELECT_ALL
  const visibleCountLabel = useMemo(
    () => `${items.length} ${items.length === 1 ? 'curso' : 'cursos'}`,
    [items.length],
  )

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border/60 bg-card/80 p-2.5 dark:bg-card/70">
        <div className="grid gap-2.5 sm:grid-cols-[1fr_140px] lg:grid-cols-[1fr_140px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Buscar curso..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 rounded-xl border-border/60 bg-background/75 pl-10 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
            />
          </div>

          <Input
            type="number"
            placeholder="Año"
            value={anio}
            min={2000}
            max={2100}
            onChange={(event) => setAnio(event.target.value)}
            className="h-10 rounded-xl border-border/60 bg-background/75 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
          />

          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger className="h-10 rounded-xl border-border/60 bg-background/75 px-4 text-sm shadow-none focus:ring-2 focus:ring-primary/15 dark:bg-background/35 sm:col-span-2 lg:col-span-1">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/60">
              <SelectItem value={SELECT_ALL}>Todos los estados</SelectItem>
              {ESTADO_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <ul className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <CourseRowSkeleton key={index} />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <Card className="rounded-xl border border-border/60 bg-card/95 shadow-none dark:bg-card/90">
          <CardContent className="px-6 py-10">
            <Empty className="border-0 p-0">
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>
                  {hasActiveFilters ? 'Sin resultados' : 'Sin cursos asignados'}
                </EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? 'No se encontraron cursos con esos filtros.'
                    : 'Todavía no tenés cursos asignados.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-sm text-muted-foreground">{visibleCountLabel}</p>
            {hasActiveFilters ? (
              <span className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">
                Filtros activos
              </span>
            ) : null}
          </div>

          <ul className="space-y-2.5">
            {items.map((course) => (
              <CourseRow key={course.id} course={course} dashboard={dashboard} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
