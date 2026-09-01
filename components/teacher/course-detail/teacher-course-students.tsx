'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, ClipboardList, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  formatQuarterMonthRange,
  getAcademicStatus,
  getCurrentQuarterSummary,
  type AcademicMetricTone,
  getTeacherCourseStudents,
  type TeacherCourseStudent,
} from '@/lib/teacher/course-detail/students'
import { PersonAvatar, PersonMeta } from './course-people-ui'
import {
  CourseTabEmptyState,
  CourseTabErrorState,
  CourseTabSearchField,
  CourseTabSkeletonList,
} from './course-tab-ui'

function getStatusClass(tone: ReturnType<typeof getAcademicStatus>['tone']) {
  return cn(
    'inline-flex w-fit rounded-full border px-2 py-0.5 text-xs font-medium',
    tone === 'attention' &&
      'border-amber-500/20 bg-amber-500/[0.08] text-amber-700 dark:text-amber-300',
    tone === 'critical' &&
      'border-rose-500/20 bg-rose-500/[0.08] text-rose-700 dark:text-rose-300',
  )
}

function getStudentSignalLabel(status: ReturnType<typeof getAcademicStatus>) {
  if (status.tone !== 'critical' && status.tone !== 'attention') return null

  if (status.averageTone === 'critical' && status.attendanceTone === 'critical') {
    return 'Riesgo combinado'
  }

  if (status.averageTone === 'critical') {
    return 'Necesita refuerzo'
  }

  if (status.attendanceTone === 'critical') {
    return 'Asistencia baja'
  }

  return 'En seguimiento'
}

function getMetricValueClass(tone: AcademicMetricTone) {
  return cn(
    'text-lg font-semibold tabular-nums tracking-tight text-foreground',
    tone === 'attention' && 'text-amber-700 dark:text-amber-300',
    tone === 'critical' && 'text-rose-700 dark:text-rose-300',
  )
}

function getMetricSurfaceClass(tone: AcademicMetricTone) {
  return cn(
    'border-border/50 bg-background/55 dark:bg-background/30',
    tone === 'attention' &&
      'border-amber-500/20 bg-amber-500/[0.06] dark:bg-amber-500/[0.08]',
    tone === 'critical' &&
      'border-rose-500/20 bg-rose-500/[0.06] dark:bg-rose-500/[0.08]',
  )
}

function StudentMetric({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: AcademicMetricTone
}) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-xl border px-3 py-2 transition-colors',
        getMetricSurfaceClass(tone),
      )}
    >
      <p className="text-[11px] font-medium leading-none text-muted-foreground">
        {label}
      </p>
      <p className={getMetricValueClass(tone)}>{value}</p>
    </div>
  )
}

function StudentRosterRow({
  student,
  courseId,
}: {
  student: TeacherCourseStudent
  courseId: number
}) {
  const fullName = `${student.nombre} ${student.apellido}`.trim()
  const currentQuarter = getCurrentQuarterSummary(student.promediosTrimestrales)
  const status = getAcademicStatus(currentQuarter)
  const signalLabel = getStudentSignalLabel(status)

  return (
    <article className="grid gap-3 rounded-2xl border border-border/60 bg-card/95 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] transition-colors hover:border-border sm:grid-cols-[minmax(0,1fr)_minmax(210px,250px)_auto] sm:items-center sm:p-4 dark:bg-card/90">
      <div className="flex min-w-0 items-center gap-3">
        <PersonAvatar
          name={fullName}
          avatarUrl={student.avatarUrl}
          tone="student"
          size={44}
        />

        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
            {fullName}
          </h3>
          <PersonMeta email={student.email} />
          {signalLabel ? (
            <span className={cn('mt-2', getStatusClass(status.tone))}>
              {signalLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StudentMetric
          label="Promedio"
          value={currentQuarter?.promedio?.toFixed(1) ?? '—'}
          tone={status.averageTone}
        />
        <StudentMetric
          label="Asistencia"
          value={
            currentQuarter?.asistencia != null
              ? `${currentQuarter.asistencia.toFixed(1)}%`
              : '—'
          }
          tone={status.attendanceTone}
        />
      </div>

      <Button
        asChild
        variant="ghost"
        className="h-8 w-fit justify-self-start rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary sm:justify-self-end"
      >
        <Link
          href={`/teacher/courses/${courseId}/students/${student.alumnoId}/grades`}
          className="justify-center"
        >
          Ver seguimiento
          <ChevronRight className="ml-1 size-4" />
        </Link>
      </Button>
    </article>
  )
}

function StudentRosterSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/95 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:p-4 dark:bg-card/90">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(210px,250px)_auto] sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="size-11 animate-pulse rounded-full bg-muted/40" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded-lg bg-muted/45" />
            <div className="h-4 w-56 max-w-full animate-pulse rounded-lg bg-muted/30" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-xl bg-muted/30" />
          ))}
        </div>
        <div className="hidden h-8 w-28 animate-pulse rounded-lg bg-muted/30 sm:block" />
      </div>
    </div>
  )
}

export function TeacherCourseStudents({ courseId }: { courseId: number }) {
  const [data, setData] = useState<TeacherCourseStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(12)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        setData(await getTeacherCourseStudents(courseId))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId])

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const students = normalizedSearch
      ? data.filter((student) =>
          `${student.nombre} ${student.apellido} ${student.email ?? ''}`
            .toLowerCase()
            .includes(normalizedSearch),
        )
      : data

    return [...students].sort((firstStudent, secondStudent) => {
      const firstStatus = getAcademicStatus(
        getCurrentQuarterSummary(firstStudent.promediosTrimestrales),
      )
      const secondStatus = getAcademicStatus(
        getCurrentQuarterSummary(secondStudent.promediosTrimestrales),
      )
      const priorityDifference = firstStatus.priority - secondStatus.priority

      if (priorityDifference !== 0) return priorityDifference

      return `${firstStudent.apellido} ${firstStudent.nombre}`.localeCompare(
        `${secondStudent.apellido} ${secondStudent.nombre}`,
        'es',
      )
    })
  }, [data, search])

  useEffect(() => {
    setVisibleCount(12)
  }, [search])

  const currentQuarter = getCurrentQuarterSummary(data[0]?.promediosTrimestrales)
  const currentPeriodLabel = currentQuarter?.label ?? 'Sin trimestre'
  const currentPeriodRange = currentQuarter
    ? formatQuarterMonthRange(currentQuarter)
    : 'Sin trimestre académico vigente'
  const hasSearch = search.trim().length > 0
  const visibleStudents = filteredStudents.slice(0, visibleCount)
  const hasMoreStudents = visibleStudents.length < filteredStudents.length

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <CourseTabSkeletonList label="Cargando alumnos del curso.">
          {Array.from({ length: 5 }).map((_, index) => (
            <StudentRosterSkeleton key={index} />
          ))}
        </CourseTabSkeletonList>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <CourseTabErrorState>{error}</CourseTabErrorState>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <CourseTabEmptyState
          icon={Users}
          title="Todavía no hay alumnos asignados a este curso"
          description="Cuando se asignen alumnos, vas a ver el roster académico acá."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-4 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-sm">
          <CourseTabSearchField
            className="w-full"
            value={search}
            onChange={setSearch}
            placeholder="Buscar alumno..."
          />
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <div className="text-left md:text-right">
            <div className="inline-flex rounded-full border border-border/60 bg-muted/25 px-2.5 py-1 text-xs font-medium text-foreground">
              {currentPeriodLabel}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {currentPeriodRange} · {filteredStudents.length}{' '}
              {filteredStudents.length === 1 ? 'alumno' : 'alumnos'}
            </p>
          </div>

          <Button
            asChild
            variant="ghost"
            className="h-8 w-fit rounded-lg px-2.5 text-sm font-medium text-muted-foreground shadow-none transition-[background-color,color,transform] duration-150 ease-out hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
          >
            <Link
              href={`/teacher/courses/${courseId}/grade-templates`}
              className="justify-center"
            >
              <ClipboardList className="mr-2 size-4" />
              <span className="hidden sm:inline">Plantillas de calificación</span>
              <span className="sm:hidden">Plantillas</span>
            </Link>
          </Button>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <CourseTabEmptyState
          icon={Users}
          title="No hay alumnos que coincidan"
          description="Probá con otro nombre o correo."
        />
      ) : (
        <>
          <div className="space-y-2">
            {visibleStudents.map((student) => (
              <StudentRosterRow
                key={student.alumnoId}
                student={student}
                courseId={courseId}
              />
            ))}
          </div>

          {hasMoreStudents ? (
            <div className="mt-3 flex flex-col gap-2.5 border-t border-border/50 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {visibleStudents.length} de {filteredStudents.length}{' '}
                alumnos
              </p>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-lg border-border/70 bg-background/70 px-3 text-sm font-medium shadow-none transition-[border-color,background-color,color,transform] duration-150 ease-out hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
                onClick={() =>
                  setVisibleCount((current) =>
                    Math.min(current + 12, filteredStudents.length),
                  )
                }
              >
                Ver más alumnos
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
