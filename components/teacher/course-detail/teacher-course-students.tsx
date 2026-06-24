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
  const showAcademicStatus =
    status.tone === 'critical' || status.tone === 'attention'

  return (
    <article className="mb-4 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:shadow-md md:flex-row">
      <div className="flex min-w-0 items-center gap-3 self-stretch md:self-auto">
        <PersonAvatar
          name={fullName}
          avatarUrl={student.avatarUrl}
          tone="student"
          size={48}
        />

        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-[15px]">
            {fullName}
          </h3>
          <PersonMeta email={student.email} />
        </div>
      </div>

      <div className="grid w-full grid-cols-2 justify-items-center gap-4 md:w-auto md:min-w-[260px]">
        <div className="flex w-24 flex-col items-center text-center">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Promedio actual
          </p>
          <span className="text-lg font-bold text-foreground">
            {currentQuarter?.promedio?.toFixed(1) ?? '—'}
          </span>
          {showAcademicStatus ? (
            <span className={cn('mt-1', getStatusClass(status.tone))}>
              {status.label}
            </span>
          ) : null}
        </div>

        <div className="flex w-24 flex-col items-center text-center">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Asistencia actual
          </p>
          <span className="text-lg font-bold text-foreground">
            {currentQuarter?.asistencia != null
              ? `${currentQuarter.asistencia.toFixed(1)}%`
              : '—'}
          </span>
        </div>
      </div>

      <Button
        asChild
        variant="ghost"
        className="w-full shrink-0 text-primary transition-colors hover:bg-primary/5 hover:text-primary md:w-fit"
      >
        <Link
          href={`/teacher/courses/${courseId}/students/${student.alumnoId}/grades`}
          className="justify-center"
        >
          Ver seguimiento
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </article>
  )
}

function StudentRosterSkeleton() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="size-10 animate-pulse rounded-lg bg-muted/40" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded-lg bg-muted/40" />
            <div className="h-4 w-56 animate-pulse rounded-lg bg-muted/30" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:min-w-[260px]">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-muted/30" />
          ))}
        </div>
        <div className="h-9 w-full animate-pulse rounded-lg bg-muted/35 md:w-36" />
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
        setError(err instanceof Error ? err.message : 'Ocurrio un error.')
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
  const currentPeriodLabel = currentQuarter?.label ?? 'Sin trimestre'
  const currentPeriodRange = currentQuarter
    ? formatQuarterMonthRange(currentQuarter)
    : 'Sin trimestre academico vigente'

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
          title="Todavia no hay alumnos asignados a este curso"
          description="Cuando se asignen alumnos, vas a ver el roster academico aca."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
        <CourseTabSearchField
          className="w-full md:max-w-sm"
          value={search}
          onChange={setSearch}
          placeholder="Buscar alumno..."
        />

        <div className="flex w-full flex-col items-start gap-3 md:w-auto md:flex-row md:items-center md:text-right">
          <div className="flex flex-col items-start gap-1 md:mr-4 md:items-end">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-foreground">
                {currentPeriodLabel}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {currentPeriodRange} • {filteredStudents.length}{' '}
              {filteredStudents.length === 1 ? 'alumno' : 'alumnos'}
            </span>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-10 w-full rounded-lg border-border/65 bg-background/60 px-3 text-sm font-medium text-foreground shadow-none transition-[background-color,border-color,color,transform] duration-150 ease-out hover:border-primary/25 hover:bg-primary/5 hover:text-primary active:scale-[0.98] dark:bg-background/30 md:w-fit"
          >
            <Link
              href={`/teacher/courses/${courseId}/grade-templates`}
              className="justify-center"
            >
              <ClipboardList className="mr-2 size-4" />
              <span className="hidden sm:inline">Plantillas de calificacion</span>
              <span className="sm:hidden">Plantillas</span>
            </Link>
          </Button>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <CourseTabEmptyState
          icon={Users}
          title="No hay alumnos que coincidan"
          description="Proba con otro nombre o correo."
        />
      ) : (
        <div>
          {filteredStudents.map((student) => (
            <StudentRosterRow
              key={student.alumnoId}
              student={student}
              courseId={courseId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
