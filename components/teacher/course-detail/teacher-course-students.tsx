'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  formatQuarterMonthRange,
  getAcademicStatus,
  getAttendanceTone,
  getAverageTone,
  getCurrentQuarterSummary,
  getTeacherCourseStudents,
  type AcademicMetricTone,
  type TeacherCourseStudent,
} from '@/lib/teacher/course-detail/students'
import {
  CoursePeopleSection,
  PersonAvatar,
  PersonMeta,
  PersonRosterSurface,
} from './course-people-ui'
import {
  CourseTabEmptyState,
  CourseTabErrorState,
  CourseTabSearchField,
  CourseTabSkeletonList,
  CourseTabToolbar,
} from './course-tab-ui'

function getMetricClass(tone: AcademicMetricTone) {
  return cn(
    'inline-flex min-w-14 items-center justify-center rounded-md border px-2 py-1 text-sm font-semibold tabular-nums',
    tone === 'neutral' &&
      'border-border/50 bg-background/55 text-muted-foreground',
    tone === 'healthy' &&
      'border-border/50 bg-background/55 text-foreground',
    tone === 'attention' &&
      'border-amber-500/15 bg-amber-500/[0.08] text-amber-700 dark:text-amber-400',
    tone === 'critical' &&
      'border-rose-500/15 bg-rose-500/[0.08] text-rose-700 dark:text-rose-400',
  )
}

function getStatusClass(tone: ReturnType<typeof getAcademicStatus>['tone']) {
  return cn(
    'inline-flex w-fit rounded-md border px-2 py-1 text-xs font-medium',
    tone === 'neutral' &&
      'border-border/50 bg-background/55 text-muted-foreground',
    tone === 'healthy' &&
      'border-border/50 bg-background/55 text-muted-foreground',
    tone === 'attention' &&
      'border-amber-500/15 bg-amber-500/[0.06] text-amber-700 dark:text-amber-400',
    tone === 'critical' &&
      'border-rose-500/15 bg-rose-500/[0.06] text-rose-700 dark:text-rose-400',
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
  const averageTone = getAverageTone(currentQuarter?.promedio)
  const attendanceTone = getAttendanceTone(currentQuarter?.asistencia)
  const showAcademicStatus =
    status.tone === 'critical' || status.tone === 'attention'

  return (
    <PersonRosterSurface tone="student">
      <div className="grid gap-3 lg:grid-cols-[minmax(210px,1.25fr)_minmax(280px,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <PersonAvatar
            name={fullName}
            avatarUrl={student.avatarUrl}
            tone="student"
          />

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-[15px]">
              {fullName}
            </h3>
            <PersonMeta email={student.email} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-[auto_auto] sm:justify-start">
          <div>
            <p className="mb-1 text-[11px] font-medium text-muted-foreground">
              Promedio actual
            </p>
            <span className={getMetricClass(averageTone)}>
              {currentQuarter?.promedio?.toFixed(1) ?? '—'}
            </span>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-medium text-muted-foreground">
              Asistencia actual
            </p>
            <span className={getMetricClass(attendanceTone)}>
              {currentQuarter?.asistencia != null
                ? `${currentQuarter.asistencia.toFixed(1)}%`
                : '—'}
            </span>
          </div>
          {showAcademicStatus ? (
            <div className="col-span-2">
              <span className={getStatusClass(status.tone)}>
                {status.label}
              </span>
            </div>
          ) : null}
        </div>

        <Button
          asChild
          variant="ghost"
          className="h-9 w-full rounded-lg px-2.5 text-sm font-semibold text-muted-foreground shadow-none transition-[background-color,color,transform] duration-150 ease-out hover:bg-primary/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/20 active:scale-[0.98] sm:w-fit lg:justify-self-end"
        >
          <Link href={`/teacher/courses/${courseId}/students/${student.alumnoId}/grades`}>
            Ver seguimiento
            <ArrowRight className="ml-1.5 size-3.5" />
          </Link>
        </Button>
      </div>
    </PersonRosterSurface>
  )
}

function StudentRosterSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-3 sm:px-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(210px,1.25fr)_minmax(280px,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="size-10 animate-pulse rounded-lg bg-muted/40" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded-lg bg-muted/40" />
            <div className="h-4 w-56 animate-pulse rounded-lg bg-muted/30" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-muted/30" />
          ))}
        </div>
        <div className="h-9 w-full animate-pulse rounded-lg bg-muted/35 sm:w-36" />
      </div>
    </div>
  )
}

export function TeacherCourseStudents({ courseId }: { courseId: number }) {
  const [data, setData] = useState<TeacherCourseStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

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

  const currentQuarter = getCurrentQuarterSummary(data[0]?.promediosTrimestrales)
  const currentPeriodLabel = currentQuarter
    ? `${currentQuarter.label} · ${formatQuarterMonthRange(currentQuarter)}`
    : 'Sin trimestre académico vigente'

  if (loading) {
    return (
      <CourseTabSkeletonList>
        {Array.from({ length: 5 }).map((_, index) => (
          <StudentRosterSkeleton key={index} />
        ))}
      </CourseTabSkeletonList>
    )
  }

  if (error) {
    return <CourseTabErrorState>{error}</CourseTabErrorState>
  }

  if (data.length === 0) {
    return (
      <CourseTabEmptyState
        icon={Users}
        title="Todavía no hay alumnos en este curso"
        description="Cuando se asignen estudiantes, van a aparecer acá."
      />
    )
  }

  return (
    <div className="space-y-3">
      <CourseTabToolbar>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <CourseTabSearchField
            className="max-w-sm"
            value={search}
            onChange={setSearch}
            placeholder="Buscar alumno..."
          />
          <div className="text-left sm:text-right">
            <p className="text-xs font-medium text-foreground">
              Estado actual · {currentPeriodLabel}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {filteredStudents.length}{' '}
              {filteredStudents.length === 1 ? 'alumno' : 'alumnos'}
            </p>
          </div>
        </div>
      </CourseTabToolbar>

      {filteredStudents.length === 0 ? (
        <CourseTabEmptyState
          icon={Users}
          title="No se encontraron alumnos"
          description="Probá con otro nombre o correo."
        />
      ) : (
        <CoursePeopleSection>
          {filteredStudents.map((student) => (
            <StudentRosterRow
              key={student.alumnoId}
              student={student}
              courseId={courseId}
            />
          ))}
        </CoursePeopleSection>
      )}
    </div>
  )
}
