'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarClock,
  ClipboardCheck,
  Inbox,
  Search,
  Users,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CourseThemeBackground,
} from '@/components/teacher/course-detail/course-theme-background'
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

type DashboardEnvelope = {
  data?: ProfesorDashboardResponse
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

function CourseCardSkeleton() {
  return (
    <li className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
      <div className="h-28 border-b border-border/40 bg-muted/20">
        <div className="h-full w-full animate-pulse bg-muted/35" />
      </div>
      <div className="flex min-h-40 flex-col p-5">
        <div className="space-y-2.5">
          <div className="h-5 w-36 animate-pulse rounded-md bg-muted/50" />
          <div className="h-4 w-48 max-w-full animate-pulse rounded-md bg-muted/35" />
        </div>
        <div className="mt-auto space-y-2 pt-5">
          <div className="h-4 w-40 animate-pulse rounded-md bg-muted/35" />
          <div className="h-4 w-28 animate-pulse rounded-md bg-muted/30" />
        </div>
      </div>
    </li>
  )
}

function CourseCard({
  course,
  dashboard,
  theme,
}: {
  course: TeacherCourseListItem
  dashboard: ProfesorDashboardResponse | null
  theme?: string | null
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
      <Link
        href={`/teacher/courses/${course.id}`}
        aria-label={`Abrir curso ${course.nombre}`}
        className="group block h-full rounded-2xl outline-none transition-transform duration-200 ease-out active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <article className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all hover:shadow-md">
          <div className="relative h-28 w-full overflow-hidden border-b border-border/40 bg-muted/20">
            <CourseThemeBackground
              theme={theme}
              variant="card"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/20 to-transparent" />
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                {course.nombre}
              </h2>
              {description ? (
                <p className="mt-1 line-clamp-1 text-sm leading-5 text-muted-foreground">
                  {description}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">{course.anio}</p>
              )}
            </div>

          <div className="mt-auto flex flex-col gap-2.5 pt-5 text-sm">
            {nextClass ? (
              <div className="flex items-center gap-2 font-medium text-foreground">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
                  <CalendarClock className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="mr-1.5 text-xs font-normal text-muted-foreground">
                    Próxima clase
                  </span>
                  {formatNextClass(nextClass)}
                </span>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {summary ? (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Users className="size-4" />
                  {summary.cantidadAlumnos}{' '}
                  {summary.cantidadAlumnos === 1 ? 'alumno' : 'alumnos'}
                </span>
              ) : null}

              {summary?.entregasPendientesCorreccion ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/8 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <ClipboardCheck className="size-3.5" />
                  {summary.entregasPendientesCorreccion}{' '}
                  {summary.entregasPendientesCorreccion === 1
                    ? 'entrega pendiente'
                    : 'entregas pendientes'}
                </span>
              ) : null}

              <span className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-muted-foreground transition-[border-color,background-color,color,transform] duration-200 group-hover:translate-x-0.5 group-hover:border-primary/25 group-hover:bg-primary/8 group-hover:text-primary">
                <ArrowRight className="size-4" />
              </span>
            </div>
          </div>
          </div>
        </article>
      </Link>
    </li>
  )
}

function CourseCardCompact({
  course,
  dashboard,
  theme,
}: {
  course: TeacherCourseListItem
  dashboard: ProfesorDashboardResponse | null
  theme?: string | null
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
      <Link
        href={`/teacher/courses/${course.id}`}
        aria-label={`Abrir curso ${course.nombre}`}
        className="group block h-full rounded-2xl outline-none transition-transform duration-200 ease-out active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <article className="relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all hover:shadow-md">
          <div className="relative h-28 w-full overflow-hidden border-b border-border/40 bg-muted/20">
            <CourseThemeBackground theme={theme} variant="card" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/20 to-transparent" />
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                  {course.nombre}
                </h3>
                {description ? (
                  <p className="mt-1 line-clamp-1 text-sm leading-5 text-muted-foreground">
                    {description}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {course.anio}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 justify-end">
                {summary?.entregasPendientesCorreccion ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/8 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <ClipboardCheck className="size-3.5" />
                    {summary.entregasPendientesCorreccion}{' '}
                    {summary.entregasPendientesCorreccion === 1
                      ? 'entrega pendiente'
                      : 'entregas pendientes'}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-auto flex items-end justify-between gap-4">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                {nextClass ? (
                  <div className="flex items-center gap-1.5">
                    <CalendarClock className="size-4 text-primary" />
                    <span>{formatNextClass(nextClass)}</span>
                  </div>
                ) : null}

                {summary ? (
                  <div className="flex items-center gap-1.5">
                    <Users className="size-4" />
                    <span>
                      {summary.cantidadAlumnos}{' '}
                      {summary.cantidadAlumnos === 1 ? 'alumno' : 'alumnos'}
                    </span>
                  </div>
                ) : null}
              </div>

              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-muted-foreground transition-[border-color,background-color,color,transform] duration-200 group-hover:translate-x-0.5 group-hover:border-primary/25 group-hover:bg-primary/8 group-hover:text-primary">
                <ArrowRight className="size-4" />
              </span>
            </div>
          </div>
        </article>
      </Link>
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
    () =>
      `${items.length} ${
        items.length === 1 ? 'espacio de clase' : 'espacios de clase'
      }`,
    [items.length],
  )

  return (
    <div className="space-y-4">
      <section className="mb-5 rounded-2xl border border-border/40 bg-card p-3 shadow-sm sm:p-3.5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_140px] lg:grid-cols-[1fr_140px_180px]">
          <div className="relative col-span-2 sm:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Buscar curso..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 rounded-xl border-border/60 bg-background/75 pl-10 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35 sm:h-10"
            />
          </div>

          <Input
            type="number"
            placeholder="Año"
            value={anio}
            min={2000}
            max={2100}
            onChange={(event) => setAnio(event.target.value)}
            className="h-11 rounded-xl border-border/60 bg-background/75 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35 sm:h-10"
          />

          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger className="h-11 rounded-xl border-border/60 bg-background/75 px-4 text-sm shadow-none focus:ring-2 focus:ring-primary/15 dark:bg-background/35 sm:col-span-2 sm:h-10 lg:col-span-1">
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
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <CourseCardSkeleton key={index} />
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

          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((course) => (
              <CourseCardCompact
                key={course.id}
                course={course}
                dashboard={dashboard}
                theme={course.themeIcon}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
