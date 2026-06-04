'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Pencil,
  Search,
  Users,
} from 'lucide-react'

import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCourses } from '@/lib/admin/courses/api'
import type { CourseHealth } from '@/lib/admin/courses/course-health'
import { EstadoCurso, type CursoHealthStatus, type CursoListItem } from '@/lib/admin/courses/types'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20
const FETCH_PAGE_SIZE = 100

type CourseFilterKey =
  | 'all'
  | 'requires-attention'
  | 'low-attendance'
  | 'low-performance'
  | 'no-teachers'
  | 'low-enrollment'
  | 'active'
  | 'archived'

const courseFilters: Array<{ key: CourseFilterKey; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'requires-attention', label: 'Requieren atención' },
  { key: 'low-attendance', label: 'Baja asistencia' },
  { key: 'low-performance', label: 'Bajo rendimiento' },
  { key: 'no-teachers', label: 'Sin docentes' },
  { key: 'low-enrollment', label: 'Baja matrícula' },
  { key: 'active', label: 'Activos' },
  { key: 'archived', label: 'Archivados' },
]

function normalizeCopy(value?: string | null) {
  if (!value) return ''

  return value
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã/g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã/g, 'Í')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã‘/g, 'Ñ')
    .replace(/Âº/g, 'º')
    .replace(/Â·/g, '·')
}

function CoursesToolbar({
  search,
  setSearch,
  activeFilter,
  setActiveFilter,
}: {
  search: string
  setSearch: (value: string) => void
  activeFilter: CourseFilterKey
  setActiveFilter: (value: CourseFilterKey) => void
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar curso o docente..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 rounded-xl border-border/70 bg-background/85 pl-10 shadow-none transition-[border-color,box-shadow] duration-200 ease-out focus-visible:ring-4 focus-visible:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {courseFilters.map((filter) => {
            const selected = activeFilter === filter.key

            return (
              <button
                key={filter.key}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveFilter(filter.key)}
                className={cn(
                  'h-9 rounded-xl border px-3 text-sm font-medium transition-[transform,background-color,border-color,color] duration-200 ease-out active:scale-[0.98]',
                  selected
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'border-border/60 bg-background/65 text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
                )}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const NORMAL_COURSE_HEALTH: CourseHealth = {
  level: 'normal',
  label: 'Normal',
  reasons: ['Sin alertas en el trimestre actual'],
  color: 'emerald',
}

function normalizeCourseHealth(health?: CursoHealthStatus | null): CourseHealth {
  const level =
    health?.level === 'critical' || health?.level === 'follow-up' ? health.level : 'normal'
  const color =
    health?.color === 'rose' || health?.color === 'amber' || health?.color === 'emerald'
      ? health.color
      : level === 'critical'
        ? 'rose'
        : level === 'follow-up'
          ? 'amber'
          : 'emerald'

  return {
    level,
    label: normalizeCopy(health?.label) || NORMAL_COURSE_HEALTH.label,
    reasons:
      health?.reasons && health.reasons.length > 0
        ? health.reasons.map(normalizeCopy)
        : NORMAL_COURSE_HEALTH.reasons,
    color,
  }
}

function getCourseHealth(course: CursoListItem) {
  return normalizeCourseHealth(course.academicStatusCurrent ?? course.healthStatus)
}

function getCourseCurrentAttendance(course: CursoListItem) {
  return (
    course.metricsCurrent?.attendanceAverage ??
    course.metricsCurrent?.asistenciaActual ??
    course.asistenciaActual ??
    course.attendanceAverage
  )
}

function getCourseCurrentAverage(course: CursoListItem) {
  return (
    course.metricsCurrent?.academicAverage ??
    course.metricsCurrent?.promedioActual ??
    course.promedioActual ??
    course.academicAverage
  )
}

function getCoursePendingFollowUpCount(course: CursoListItem) {
  return course.pendingFollowUpCount ?? course.metricsCurrent?.pendingFollowUpCount ?? course.pendingFollowUp?.length ?? 0
}

function courseRequiresAttention(course: CursoListItem) {
  const studentsCount = course.studentsCount ?? course.cantidadAlumnos
  const health = getCourseHealth(course)
  const pendingFollowUpCount = getCoursePendingFollowUpCount(course)

  return (
    health.level !== 'normal' ||
    pendingFollowUpCount > 0 ||
    studentsCount < 5 ||
    (course.pendingCorrectionsCount ?? 0) > 0
  )
}

function HealthBadge({ health }: { health: CourseHealth }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        health.color === 'rose' && 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
        health.color === 'amber' && 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        health.color === 'emerald' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      )}
    >
      {health.label}
    </span>
  )
}

function CourseTeachers({ course }: { course: CursoListItem }) {
  const teachers = course.teachers ?? []
  const teacherNames = course.teacherNames ?? []
  const hasTeacherCount = course.cantidadProfesores > 0
  const names = teachers.length
    ? teachers.map((teacher) => `${teacher.firstName} ${teacher.lastName}`.trim())
    : teacherNames

  if (teachers.length === 0 && teacherNames.length === 0) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <UserAvatar
          name={hasTeacherCount ? 'Docentes asignados' : 'Sin docentes'}
          size={30}
          className="border border-border/60"
          fallbackClassName={cn(
            'text-xs',
            hasTeacherCount
              ? 'bg-muted text-muted-foreground'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
          )}
        />
        <span
          className={cn(
            'truncate text-sm font-medium',
            hasTeacherCount
              ? 'text-muted-foreground'
              : 'text-amber-700 dark:text-amber-300',
          )}
        >
          {hasTeacherCount
            ? `${course.cantidadProfesores} docente${course.cantidadProfesores === 1 ? '' : 's'} asignado${course.cantidadProfesores === 1 ? '' : 's'}`
            : 'Sin docentes'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex -space-x-2">
        {names.slice(0, 3).map((name, index) => (
          <UserAvatar
            key={teachers[index]?.id ?? `${name}-${index}`}
            name={name}
            avatarUrl={teachers[index]?.avatarUrl}
            size={30}
            className="border-2 border-card"
            fallbackClassName="bg-primary/10 text-primary text-xs"
          />
        ))}
      </div>

      <span className="truncate text-sm font-medium text-foreground">
        {names.slice(0, 2).map(normalizeCopy).join(', ')}
        {names.length > 2 ? ` y ${names.length - 2} más` : ''}
      </span>
    </div>
  )
}

function CourseAlertBlocks({ course }: { course: CursoListItem }) {
  const health = getCourseHealth(course)
  const currentReasons =
    health.level !== 'normal' ? health.reasons : ['Sin alertas en el trimestre actual']
  const pendingFollowUpCount = getCoursePendingFollowUpCount(course)
  const pendingPreview = course.pendingFollowUp?.[0]
  const hasPendingFollowUp = pendingFollowUpCount > 0

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div
        className={cn(
          'rounded-xl border px-3 py-2 text-sm',
          health.level === 'critical' &&
            'border-rose-500/20 bg-rose-500/10 text-rose-800 dark:text-rose-200',
          health.level === 'follow-up' &&
            'border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-200',
          health.level === 'normal' &&
            'border-border/60 bg-muted/20 text-muted-foreground',
        )}
      >
        <div className="flex items-start gap-2">
          {health.level === 'normal' ? (
            <BookOpen className="mt-0.5 size-4 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide">
              Alertas del trimestre actual
            </p>
            <p className="mt-1 line-clamp-2 leading-5">
              {currentReasons[0] || 'Sin alertas en el trimestre actual'}
            </p>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'rounded-xl border px-3 py-2 text-sm',
          hasPendingFollowUp
            ? 'border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-200'
            : 'border-border/60 bg-muted/20 text-muted-foreground',
        )}
      >
        <div className="flex items-start gap-2">
          {hasPendingFollowUp ? (
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          ) : (
            <BookOpen className="mt-0.5 size-4 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide">
              Seguimiento pendiente
            </p>
            <p className="mt-1 line-clamp-2 leading-5">
              {hasPendingFollowUp
                ? normalizeCopy(pendingPreview?.description) ||
                  normalizeCopy(pendingPreview?.reason) ||
                  'Con seguimiento pendiente del trimestre anterior'
                : 'Sin seguimiento pendiente'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RosterMetric({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'healthy' | 'attention' | 'critical'
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 text-xl font-semibold leading-none text-foreground tabular-nums',
          tone === 'healthy' && 'text-emerald-700 dark:text-emerald-300',
          tone === 'attention' && 'text-amber-700 dark:text-amber-300',
          tone === 'critical' && 'text-rose-700 dark:text-rose-300',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function CourseRow({ course }: { course: CursoListItem }) {
  const studentsCount = course.studentsCount ?? course.cantidadAlumnos
  const attendanceAverage = getCourseCurrentAttendance(course)
  const academicAverage = getCourseCurrentAverage(course)
  const description = normalizeCopy(course.descripcion?.trim()) || 'Sin descripción cargada.'
  const health = getCourseHealth(course)
  const requiresAttention = courseRequiresAttention(course)

  return (
    <article
      className={cn(
        'rounded-2xl border bg-card/95 p-4 shadow-sm transition-[border-color,background-color] duration-200 ease-out sm:p-5',
        requiresAttention
          ? 'border-amber-500/25'
          : 'border-border/60 hover:border-border/80',
      )}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.7fr)_minmax(340px,0.85fr)] xl:items-center">
        <div className="min-w-0 space-y-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-4.5" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold tracking-tight text-foreground">
                {normalizeCopy(course.nombre)}
              </h3>
              <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>

          <CourseAlertBlocks course={course} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="min-w-0 rounded-xl bg-background/55 px-3 py-2 ring-1 ring-border/45 dark:bg-background/25">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Docentes</p>
            <CourseTeachers course={course} />
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-background/55 px-3 py-2 ring-1 ring-border/45 dark:bg-background/25">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/45 text-muted-foreground">
              <Users className="size-4" />
            </div>
            <RosterMetric
              label="Alumnos"
              value={formatNumber(studentsCount)}
              tone={studentsCount < 5 ? 'attention' : 'neutral'}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <RosterMetric
              label="Asistencia"
              value={formatPercent(attendanceAverage)}
              tone={getAttendanceTone(attendanceAverage)}
            />
            <RosterMetric
              label="Promedio"
              value={formatDecimal(academicAverage)}
              tone={getAverageTone(academicAverage)}
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Salud</p>
              <div className="mt-1">
                <HealthBadge health={health} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
            <Link href={`/admin/dashboard/courses/${course.id}/profile`}>
              <Button className="h-9 rounded-xl px-3 text-sm transition-[transform,background-color] duration-200 ease-out active:scale-[0.98]">
                Ver seguimiento
                <ArrowUpRight className="ml-2 size-4" />
              </Button>
            </Link>

            <Link href={`/admin/dashboard/courses/${course.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-xl border-border/70 bg-background/70 px-3 text-sm transition-[transform,background-color,border-color,color] duration-200 ease-out hover:bg-muted/35 active:scale-[0.98]"
              >
                <Pencil className="mr-2 size-4" />
                Ajustes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

function getAverageTone(
  value?: number | null,
): 'neutral' | 'healthy' | 'attention' | 'critical' {
  if (value === null || value === undefined) return 'neutral'
  if (value < 60) return 'critical'
  if (value < 75) return 'attention'
  return 'healthy'
}

function getAttendanceTone(
  value?: number | null,
): 'neutral' | 'healthy' | 'attention' | 'critical' {
  if (value === null || value === undefined) return 'neutral'
  if (value < 70) return 'critical'
  if (value < 85) return 'attention'
  return 'healthy'
}

function CoursesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm sm:p-5"
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.7fr)_minmax(340px,0.85fr)]">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="size-10 animate-pulse rounded-xl bg-muted/35" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-5 w-48 animate-pulse rounded-lg bg-muted/35" />
                  <div className="h-4 w-full max-w-xl animate-pulse rounded-lg bg-muted/25" />
                </div>
              </div>
              <div className="h-9 w-56 animate-pulse rounded-xl bg-muted/25" />
            </div>

            <div className="space-y-3">
              <div className="h-14 animate-pulse rounded-xl bg-muted/25" />
              <div className="h-14 animate-pulse rounded-xl bg-muted/25" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="h-12 animate-pulse rounded-xl bg-muted/25" />
                <div className="h-12 animate-pulse rounded-xl bg-muted/25" />
                <div className="h-12 animate-pulse rounded-xl bg-muted/25" />
              </div>
              <div className="flex justify-end gap-2">
                <div className="h-9 w-24 animate-pulse rounded-xl bg-muted/30" />
                <div className="h-9 w-20 animate-pulse rounded-xl bg-muted/25" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyCoursesState({ text }: { text: string }) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
      <CardContent className="px-6 py-14">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <GraduationCap className="size-6" />
          </div>

          <h4 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            Sin cursos para mostrar
          </h4>

          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {text}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function CoursesPaginationFooter({
  pageNumber,
  pageSize,
  total,
  onPageChange,
}: {
  pageNumber: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (pageNumber - 1) * pageSize + 1
  const to = Math.min(pageNumber * pageSize, total)

  if (total <= pageSize) return null

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/95 px-4 py-3 text-sm text-muted-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <span>
        Mostrando {from}-{to} de {total} cursos
      </span>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-xl transition-[transform,background-color,border-color,color] duration-200 ease-out active:scale-[0.98]"
          disabled={pageNumber <= 1}
          onClick={() => onPageChange(pageNumber - 1)}
        >
          Anterior
        </Button>
        <span className="min-w-16 text-center text-xs font-medium text-muted-foreground">
          {pageNumber} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-xl transition-[transform,background-color,border-color,color] duration-200 ease-out active:scale-[0.98]"
          disabled={pageNumber >= totalPages}
          onClick={() => onPageChange(pageNumber + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}

export function CoursesTable() {
  const [items, setItems] = useState<CursoListItem[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<CourseFilterKey>('all')
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    let mounted = true

    async function loadCourses() {
      setLoading(true)
      setError(null)

      try {
        const data = await getCourses({
          pageNumber: 1,
          pageSize: FETCH_PAGE_SIZE,
          search: debouncedSearch,
        })

        if (!mounted) return

        setItems(data.items)
      } catch {
        if (!mounted) return
        setError('No se pudieron obtener los cursos.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadCourses()

    return () => {
      mounted = false
    }
  }, [debouncedSearch])

  const filteredItems = useMemo(() => {
    return items.filter((course) => matchesCourseFilter(course, activeFilter))
  }, [items, activeFilter])

  const visibleItems = useMemo(() => {
    const start = (pageNumber - 1) * PAGE_SIZE
    return filteredItems.slice(start, start + PAGE_SIZE)
  }, [filteredItems, pageNumber])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))

  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(totalPages)
    }
  }, [pageNumber, totalPages])

  const emptyStateText = useMemo(() => {
    if (error) return error

    if (debouncedSearch.trim() || activeFilter !== 'all') {
      return 'No se encontraron cursos con esos filtros.'
    }

    return 'Todavía no hay cursos cargados.'
  }, [activeFilter, debouncedSearch, error])

  return (
    <div className="space-y-5">
      <CoursesToolbar
        search={search}
        setSearch={(value) => {
          setSearch(value)
          setPageNumber(1)
        }}
        activeFilter={activeFilter}
        setActiveFilter={(value) => {
          setActiveFilter(value)
          setPageNumber(1)
        }}
      />

      {loading ? (
        <CoursesSkeleton />
      ) : error || visibleItems.length === 0 ? (
        <EmptyCoursesState text={emptyStateText} />
      ) : (
        <>
          <div className="space-y-3">
            {visibleItems.map((course) => (
              <CourseRow key={course.id} course={course} />
            ))}
          </div>

          <CoursesPaginationFooter
            pageNumber={pageNumber}
            pageSize={PAGE_SIZE}
            total={filteredItems.length}
            onPageChange={setPageNumber}
          />
        </>
      )}
    </div>
  )
}

function matchesCourseFilter(course: CursoListItem, filter: CourseFilterKey) {
  const studentsCount = course.studentsCount ?? course.cantidadAlumnos
  const teachersCount = course.teachers?.length ?? course.cantidadProfesores
  const attendanceAverage = getCourseCurrentAttendance(course)
  const academicAverage = getCourseCurrentAverage(course)

  switch (filter) {
    case 'requires-attention':
      return courseRequiresAttention(course)
    case 'low-attendance':
      return hasNumber(attendanceAverage) && attendanceAverage < 70
    case 'low-performance':
      return hasNumber(academicAverage) && academicAverage < 60
    case 'no-teachers':
      return teachersCount === 0
    case 'low-enrollment':
      return studentsCount < 5
    case 'active':
      return course.estado === EstadoCurso.Activo
    case 'archived':
      return course.estado === EstadoCurso.Archivado
    case 'all':
    default:
      return true
  }
}

function hasNumber(value?: number | null): value is number {
  return value !== null && value !== undefined && !Number.isNaN(value)
}

function formatNumber(value?: number | null, fallback = '0') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback

  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDecimal(value?: number | null, fallback = 'Sin datos') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback

  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 1,
  }).format(value)
}

function formatPercent(value?: number | null, fallback = 'Sin datos') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback

  return `${formatDecimal(value)}%`
}
