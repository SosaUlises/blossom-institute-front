'use client'

import type { ComponentType, ReactNode } from 'react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Edit3,
  Inbox,
  Mail,
  NotebookText,
  Phone,
  ShieldAlert,
  UserRound,
  Users,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { AdminBreadcrumbs } from '@/components/layout/breadcrumbs'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getTeacherAcademicProfile,
  getTeacherAcademicSummary,
} from '@/lib/admin/teachers/api'
import type {
  Profesor,
  TeacherAcademicCourse,
  TeacherAcademicSummary,
  TeacherRecentActivity,
} from '@/lib/admin/teachers/types'
import { cn } from '@/lib/utils'

type OperationalStatusLevel = 'normal' | 'follow-up' | 'critical'
type MetricTone = 'neutral' | 'attention' | 'critical' | 'healthy'

const ACTIVITY_PAGE_SIZE = 6

interface OperationalStatus {
  level: OperationalStatusLevel
  label: string
  description: string
  reason: string
  reasons: string[]
}

function getFullName(teacher: Pick<Profesor, 'nombre' | 'apellido'>) {
  return `${teacher.nombre} ${teacher.apellido}`.trim()
}

function getSummaryFullName(summary: TeacherAcademicSummary) {
  return `${summary.teacher.firstName} ${summary.teacher.lastName}`.trim()
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

function formatDateTime(value?: string | null) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function hasNumericValue(value?: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function normalizeCopy(value?: string | null) {
  if (!value) return ''

  return value
    .replace(/Critico/g, 'Crítico')
    .replace(/critico/g, 'crítico')
    .replace(/atencion/g, 'atención')
    .replace(/Atencion/g, 'Atención')
    .replace(/senales/g, 'señales')
    .replace(/Senales/g, 'Señales')
    .replace(/revision/g, 'revisión')
    .replace(/Revision/g, 'Revisión')
    .replace(/academico/g, 'académico')
    .replace(/Academico/g, 'Académico')
    .replace(/academica/g, 'académica')
    .replace(/Academica/g, 'Académica')
}

function getCoursesCount(teacher: Profesor, summary?: TeacherAcademicSummary | null) {
  return summary?.assignedCoursesCount ?? teacher.assignedCoursesCount ?? teacher.assignedCourses?.length ?? 0
}

function pluralize(value: number, singular: string, plural: string) {
  return value === 1 ? singular : plural
}

function getCourseRows(teacher: Profesor, summary?: TeacherAcademicSummary | null): TeacherAcademicCourse[] {
  if (summary?.assignedCourses?.length) return summary.assignedCourses

  return (teacher.assignedCourses ?? []).map((course) => ({
    id: course.id,
    name: course.name,
    description: course.description,
    studentsCount: 0,
    attendanceAverage: null,
    averageGrade: null,
    requiresAttention: false,
  }))
}

function getCourseStatus(course: TeacherAcademicCourse) {
  if (course.requiresAttention) {
    return {
      label: 'Requiere atención',
      description: 'Priorizar intervención académica',
      tone: 'critical' as const,
    }
  }

  const lowAverage = hasNumericValue(course.averageGrade) && course.averageGrade < 70
  const lowAttendance = hasNumericValue(course.attendanceAverage) && course.attendanceAverage < 82

  if (lowAverage || lowAttendance) {
    return {
      label: 'Seguimiento',
      description: 'Monitorear desempeño y continuidad',
      tone: 'attention' as const,
    }
  }

  return {
    label: 'Normal',
    description: 'Sin señales prioritarias',
    tone: 'healthy' as const,
  }
}

function getCourseMetricTone(kind: 'average' | 'attendance', value?: number | null): MetricTone {
  if (!hasNumericValue(value)) return 'neutral'

  if (kind === 'average') {
    if (value < 60) return 'critical'
    if (value < 70) return 'attention'
    return 'healthy'
  }

  if (value < 70) return 'critical'
  if (value < 82) return 'attention'

  return 'healthy'
}

function getMainCourseLabel(teacher: Profesor, summary?: TeacherAcademicSummary | null) {
  const courses = getCourseRows(teacher, summary)

  if (courses.length === 0) return 'Sin cursos asignados'

  const [firstCourse, ...rest] = courses
  if (rest.length === 0) return firstCourse.name

  return `${firstCourse.name} y ${rest.length} más`
}

function normalizeStatusLevel(level?: string | null): OperationalStatusLevel {
  if (level === 'critical') return 'critical'
  if (level === 'follow-up') return 'follow-up'

  return 'normal'
}

function getStatusTone(level: OperationalStatusLevel): MetricTone {
  if (level === 'critical') return 'critical'
  if (level === 'follow-up') return 'attention'

  return 'healthy'
}

function getFallbackOperationalStatus(teacher: Profesor): OperationalStatus {
  const coursesAtRisk = teacher.coursesAtRiskCount ?? 0
  const pendingCorrections = teacher.pendingCorrectionsCount ?? 0
  const unloadedAttendance = teacher.unloadedAttendanceCount ?? 0
  const coursesCount = getCoursesCount(teacher)

  if (coursesAtRisk > 0) {
    const reason =
      teacher.mainSignal ||
      `${formatNumber(coursesAtRisk)} ${pluralize(coursesAtRisk, 'curso requiere', 'cursos requieren')} atención`

    return {
      level: 'critical',
      label: 'Crítico',
      description: 'Hay cursos que requieren atención prioritaria.',
      reason: normalizeCopy(reason),
      reasons: [normalizeCopy(reason)],
    }
  }

  if (
    teacher.requiresFollowUp ||
    pendingCorrections > 0 ||
    unloadedAttendance > 0 ||
    coursesCount === 0 ||
    !teacher.activo
  ) {
    const reason =
      teacher.mainSignal ||
      (coursesCount === 0
        ? 'Docente sin cursos asignados'
        : 'Hay señales pendientes de seguimiento')

    return {
      level: 'follow-up',
      label: 'Seguimiento',
      description: 'Conviene revisar las señales operativas antes de editar datos.',
      reason: normalizeCopy(reason),
      reasons: [normalizeCopy(reason)],
    }
  }

  return {
    level: 'normal',
    label: 'Normal',
    description: 'No hay señales operativas pendientes para este docente.',
    reason: normalizeCopy(teacher.mainSignal || 'Sin señales pendientes'),
    reasons: [normalizeCopy(teacher.mainSignal || 'Sin señales pendientes')],
  }
}

function getOperationalStatus(
  teacher: Profesor,
  summary?: TeacherAcademicSummary | null,
): OperationalStatus {
  if (!summary?.operationalStatus) return getFallbackOperationalStatus(teacher)

  const level = normalizeStatusLevel(summary.operationalStatus.level)
  const reasons = summary.operationalStatus.reasons ?? []
  const fallbackReason =
    level === 'critical'
      ? 'Hay cursos que requieren atención'
      : level === 'follow-up'
        ? 'Hay señales pendientes de seguimiento'
        : 'Sin señales pendientes'

  return {
    level,
    label: normalizeCopy(summary.operationalStatus.label || getFallbackOperationalStatus(teacher).label),
    description:
      level === 'critical'
        ? 'Hay cursos que requieren atención prioritaria.'
        : level === 'follow-up'
          ? 'Conviene revisar las señales operativas antes de editar datos.'
          : 'No hay señales operativas pendientes para este docente.',
    reason: normalizeCopy(reasons[0] || teacher.mainSignal || fallbackReason),
    reasons: (reasons.length > 0 ? reasons : [teacher.mainSignal || fallbackReason]).map(normalizeCopy),
  }
}

function ActiveStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        active
          ? 'border-border/60 bg-muted/20 text-muted-foreground'
          : 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
      )}
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

function OperationalStatusBadge({ status }: { status: OperationalStatus }) {
  if (status.level === 'critical') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
        <ShieldAlert className="size-3.5" />
        {status.label}
      </span>
    )
  }

  if (status.level === 'follow-up') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
        <AlertCircle className="size-3.5" />
        {status.label}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
      <CheckCircle2 className="size-3.5" />
      {status.label}
    </span>
  )
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 px-5 py-8 text-center shadow-sm">
      <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </section>
  )
}

function InlineEmpty({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-6 text-center dark:bg-background/25">
      <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function InlineMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  icon?: ComponentType<{ className?: string }>
  label: string
  value: string
  detail?: string | null
  tone?: MetricTone
}) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card/95 p-3 shadow-sm',
        tone === 'healthy' && 'border-emerald-500/20 bg-emerald-500/5',
        tone === 'attention' && 'border-amber-500/20 bg-amber-500/5',
        tone === 'critical' && 'border-rose-500/20 bg-rose-500/5',
        tone === 'neutral' && 'border-border/60',
      )}
    >
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      {detail ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p> : null}
    </div>
  )
}

function SectionPanel({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function CourseMeta({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: MetricTone
}) {
  return (
    <div className="min-w-0 rounded-xl bg-background/75 px-3 py-2.5 ring-1 ring-border/50 dark:bg-background/30">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 text-xl font-semibold leading-none text-foreground',
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

function CourseRow({ course }: { course: TeacherAcademicCourse }) {
  const status = getCourseStatus(course)

  return (
    <article
      className={cn(
        'rounded-2xl border bg-background/65 p-4 transition-colors dark:bg-background/25',
        status.tone === 'critical' && 'border-rose-500/25',
        status.tone === 'attention' && 'border-amber-500/25',
        status.tone === 'healthy' && 'border-border/60',
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl',
              status.tone === 'critical' && 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
              status.tone === 'attention' && 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
              status.tone === 'healthy' && 'bg-primary/10 text-primary',
            )}
          >
            <BookOpen className="size-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-semibold leading-6 text-foreground">{course.name}</h4>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              {course.description || 'Sin descripción cargada.'}
            </p>
          </div>
        </div>
        <div className="shrink-0 lg:text-right">
          <span
            className={cn(
              'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
              status.tone === 'critical' && 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
              status.tone === 'attention' && 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
              status.tone === 'healthy' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
            )}
          >
            {status.label}
          </span>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{status.description}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-border/50 pt-3 sm:grid-cols-3">
        <CourseMeta label="Alumnos" value={formatNumber(course.studentsCount)} />
        <CourseMeta
          label="Promedio"
          value={formatDecimal(course.averageGrade)}
          tone={getCourseMetricTone('average', course.averageGrade)}
        />
        <CourseMeta
          label="Asistencia"
          value={formatPercent(course.attendanceAverage)}
          tone={getCourseMetricTone('attendance', course.attendanceAverage)}
        />
      </div>
    </article>
  )
}

function getActivityIcon(type: string): ComponentType<{ className?: string }> {
  const normalized = type.toLowerCase()
  if (normalized.includes('task') || normalized.includes('homework')) return NotebookText
  if (normalized.includes('attendance')) return CalendarDays
  if (normalized.includes('assignment') || normalized.includes('assigned')) return BookOpen
  if (normalized.includes('risk') || normalized.includes('alert') || normalized.includes('incident')) {
    return AlertCircle
  }
  if (normalized.includes('course')) return ShieldAlert

  return AlertCircle
}

function getActivityTone(activity: TeacherRecentActivity): MetricTone {
  if (activity.severity === 'critical') return 'critical'
  if (activity.severity === 'attention') return 'attention'

  return 'neutral'
}

function isDirectorRelevantActivity(activity: TeacherRecentActivity) {
  const type = activity.type.toLowerCase()
  const severity = activity.severity?.toLowerCase()
  const title = normalizeCopy(activity.title).toLowerCase()
  const description = normalizeCopy(activity.description).toLowerCase()
  const searchable = `${type} ${title} ${description}`
  const isTaskCreation =
    (type.includes('task') || type.includes('homework') || searchable.includes('tarea')) &&
    (searchable.includes('created') ||
      searchable.includes('creada') ||
      searchable.includes('creo') ||
      searchable.includes('creó') ||
      searchable.includes('publicada') ||
      searchable.includes('publico') ||
      searchable.includes('publicó') ||
      searchable.includes('nueva tarea'))
  const isAttendanceTaken =
    type.includes('attendance') &&
    (searchable.includes('loaded') ||
      searchable.includes('taken') ||
      searchable.includes('tomada') ||
      searchable.includes('tomo asistencia') ||
      searchable.includes('tomó asistencia') ||
      searchable.includes('cargo asistencia') ||
      searchable.includes('cargó asistencia') ||
      searchable.includes('asistencia cargada'))

  if (type.includes('correction')) return false
  if (type.includes('unloaded-attendance') || type.includes('unloaded_attendance')) return false
  if (isTaskCreation || isAttendanceTaken) return true
  if (type.includes('task') || type.includes('homework')) return false
  if (type.includes('attendance')) return false

  if (severity === 'critical' || severity === 'attention') return true

  return (
    searchable.includes('requiere atención') ||
    searchable.includes('seguimiento') ||
    searchable.includes('riesgo') ||
    searchable.includes('risk') ||
    searchable.includes('alert') ||
    searchable.includes('incident') ||
    searchable.includes('incidencia') ||
    searchable.includes('intervention') ||
    searchable.includes('intervención') ||
    searchable.includes('assignment') ||
    searchable.includes('asignación')
  )
}

function ActivityRow({ activity }: { activity: TeacherRecentActivity }) {
  const Icon = getActivityIcon(activity.type)
  const tone = getActivityTone(activity)
  const formattedDate = formatDateTime(activity.occurredAtUtc)

  return (
    <article className="rounded-xl bg-background/55 p-3 ring-1 ring-border/50 dark:bg-background/25">
      <div className="flex gap-3">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-xl border',
            tone === 'critical' && 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
            tone === 'attention' &&
              'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
            tone === 'neutral' && 'border-border/60 bg-muted/25 text-muted-foreground',
            tone === 'healthy' &&
              'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-foreground">{normalizeCopy(activity.title)}</h4>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {normalizeCopy(activity.description)}
              </p>
              {activity.courseName ? (
                <p className="mt-2 text-xs font-medium text-muted-foreground">{activity.courseName}</p>
              ) : null}
            </div>
            {formattedDate ? (
              <span className="shrink-0 text-xs text-muted-foreground">{formattedDate}</span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

function ActivityPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  if (total <= pageSize) return null

  return (
    <div className="flex flex-col gap-2 border-t border-border/50 pt-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        {from}-{to} de {formatNumber(total)}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-xl shadow-none"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft className="mr-1 size-4" />
          Anterior
        </Button>
        <span className="min-w-16 text-center text-xs font-medium">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-xl shadow-none"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          Siguiente
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border/60 bg-card/95 p-5 shadow-sm">
        <div className="flex gap-4">
          <div className="size-16 animate-pulse rounded-full bg-muted/40" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-56 animate-pulse rounded-lg bg-muted/40" />
            <div className="h-4 w-72 max-w-full animate-pulse rounded-lg bg-muted/30" />
            <div className="h-8 w-80 max-w-full animate-pulse rounded-xl bg-muted/25" />
          </div>
        </div>
      </section>
      <div className="h-11 w-full max-w-xl animate-pulse rounded-xl bg-muted/30" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl bg-muted/30" />
        ))}
      </div>
    </div>
  )
}

function AdminDataItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-3 dark:bg-background/25">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        <span>{label}</span>
      </div>
      <p className="mt-1 break-all text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function TeacherProfileContent({
  teacher,
  summary,
}: {
  teacher: Profesor
  summary: TeacherAcademicSummary | null
}) {
  const [activityPage, setActivityPage] = useState(1)
  const fullName = summary ? getSummaryFullName(summary) : getFullName(teacher)
  const avatarUrl = summary?.teacher.avatarUrl ?? teacher.avatarUrl
  const email = summary?.teacher.email ?? teacher.email
  const active = summary?.teacher.active ?? teacher.activo
  const courses = getCourseRows(teacher, summary)
  const coursesCount = getCoursesCount(teacher, summary)
  const studentsCount = summary?.studentsCount ?? teacher.studentsCount ?? 0
  const pendingCorrections = summary?.pendingCorrectionsCount ?? teacher.pendingCorrectionsCount ?? 0
  const coursesAtAttention =
    summary?.assignedCourses?.filter((course) => course.requiresAttention).length ??
    teacher.coursesAtRiskCount ??
    0
  const status = getOperationalStatus(teacher, summary)
  const statusTone = getStatusTone(status.level)
  const recentActivity = (summary?.recentActivity ?? []).filter(isDirectorRelevantActivity)
  const totalActivityPages = Math.max(1, Math.ceil(recentActivity.length / ACTIVITY_PAGE_SIZE))
  const currentActivityPage = Math.min(activityPage, totalActivityPages)
  const paginatedActivity = recentActivity.slice(
    (currentActivityPage - 1) * ACTIVITY_PAGE_SIZE,
    currentActivityPage * ACTIVITY_PAGE_SIZE,
  )
  const tabs = [
    { value: 'summary', label: 'Resumen' },
    { value: 'courses', label: 'Cursos' },
    { value: 'activity', label: 'Actividad' },
    { value: 'admin', label: 'Datos administrativos' },
  ]

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <UserAvatar
              name={fullName}
              avatarUrl={avatarUrl}
              size={64}
              className="shrink-0"
              fallbackClassName="bg-primary/10 text-primary text-lg"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {fullName}
                </h1>
                <ActiveStatusBadge active={active} />
                <OperationalStatusBadge status={status} />
              </div>
              <div className="mt-2 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate" title={email}>
                  {email}
                </span>
              </div>
              <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                <BookOpen className="mt-0.5 size-4 shrink-0" />
                <p>
                  <span className="font-medium text-foreground">
                    {getMainCourseLabel(teacher, summary)}
                  </span>
                </p>
              </div>
              <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <Users className="mt-0.5 size-4 shrink-0" />
                <p>
                  Gestiona{' '}
                  <span className="font-medium text-foreground">
                    {formatNumber(studentsCount)} {pluralize(studentsCount, 'alumno', 'alumnos')}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="outline" className="h-10 rounded-xl shadow-none active:scale-[0.98]">
              <Link href="/admin/dashboard/teachers">
                <ArrowLeft className="mr-2 size-4" />
                Volver al listado
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-10 rounded-xl shadow-none active:scale-[0.98]">
              <Link href={`/admin/dashboard/teachers/${teacher.id}`}>
                <Edit3 className="mr-2 size-4" />
                Editar datos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Tabs defaultValue="summary" className="space-y-3">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl border border-border/50 bg-background/60 p-1 dark:bg-background/25 sm:w-fit">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="rounded-lg px-3">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="summary" className="space-y-3">
          <section
            className={cn(
              'rounded-2xl border bg-card/95 p-4 shadow-sm sm:p-5',
              statusTone === 'critical' && 'border-rose-500/20 bg-rose-500/5',
              statusTone === 'attention' && 'border-amber-500/20 bg-amber-500/5',
              statusTone === 'healthy' && 'border-emerald-500/20 bg-emerald-500/5',
              statusTone === 'neutral' && 'border-border/60',
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <OperationalStatusBadge status={status} />
                <h3 className="mt-3 text-base font-semibold text-foreground">{status.label}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {status.description}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm dark:bg-background/25">
                <p className="text-xs font-medium text-muted-foreground">Señal principal</p>
                <p className="mt-1 font-medium text-foreground">{status.reason}</p>
              </div>
            </div>
            {status.reasons.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {status.reasons.slice(1).map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InlineMetric
              icon={BookOpen}
              label="Cursos asignados"
              value={formatNumber(coursesCount)}
              detail={getMainCourseLabel(teacher, summary)}
              tone={coursesCount === 0 ? 'attention' : 'neutral'}
            />
            <InlineMetric
              icon={Users}
              label="Alumnos gestionados"
              value={formatNumber(studentsCount)}
              detail={`${pluralize(studentsCount, 'alumno gestionado', 'alumnos gestionados')}`}
            />
            <InlineMetric
              icon={NotebookText}
              label="Correcciones pendientes"
              value={formatNumber(pendingCorrections)}
              detail={pendingCorrections > 0 ? 'Pendientes de revisión' : 'Sin pendientes'}
              tone={pendingCorrections > 0 ? 'attention' : 'healthy'}
            />
            <InlineMetric
              icon={ShieldAlert}
              label="Cursos que requieren atención"
              value={formatNumber(coursesAtAttention)}
              detail={coursesAtAttention > 0 ? 'Revisar prioridad' : 'Sin cursos críticos'}
              tone={coursesAtAttention > 0 ? 'critical' : 'healthy'}
            />
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <SectionPanel
            title="Cursos"
            description="Responsabilidades académicas asignadas, con señales de desempeño y continuidad."
          >
            {courses.length > 0 ? (
              <div className="space-y-3">
                {courses.map((course) => (
                  <CourseRow key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <InlineEmpty
                icon={BookOpen}
                title="Sin cursos asignados"
                description="Asigná cursos desde la gestión académica para que el perfil muestre alumnos, promedios y asistencia."
              />
            )}
          </SectionPanel>
        </TabsContent>

        <TabsContent value="activity">
          <SectionPanel
            title="Actividad"
            description="Señales institucionales, tareas creadas, asistencia tomada e incidencias relevantes."
          >
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  {paginatedActivity.map((activity, index) => (
                    <ActivityRow
                      key={`${activity.type}-${activity.title}-${activity.occurredAtUtc ?? index}`}
                      activity={activity}
                    />
                  ))}
                </div>
                <ActivityPagination
                  page={currentActivityPage}
                  pageSize={ACTIVITY_PAGE_SIZE}
                  total={recentActivity.length}
                  onPageChange={setActivityPage}
                />
              </div>
            ) : (
              <InlineEmpty
                icon={CheckCircle2}
                title="Sin señales relevantes"
                description="No hay alertas, incidencias o asignaciones recientes que requieran seguimiento institucional."
              />
            )}
          </SectionPanel>
        </TabsContent>

        <TabsContent value="admin">
          <SectionPanel
            title="Datos administrativos"
            description="Información secundaria de contacto e identificación."
            action={
              <Button asChild variant="outline" size="sm" className="h-9 rounded-xl shadow-none active:scale-[0.98]">
                <Link href={`/admin/dashboard/teachers/${teacher.id}`}>
                  <Edit3 className="mr-2 size-4" />
                  Editar datos
                </Link>
              </Button>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AdminDataItem icon={UserRound} label="DNI" value={String(teacher.dni)} />
              <AdminDataItem icon={Phone} label="Teléfono" value={teacher.telefono || 'Sin teléfono'} />
              <AdminDataItem icon={Mail} label="Correo" value={email || 'Sin correo'} />
            </div>
          </SectionPanel>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function TeacherAcademicProfile() {
  const params = useParams<{ id: string }>()
  const teacherId = useMemo(() => Number(params.id), [params.id])
  const [teacher, setTeacher] = useState<Profesor | null>(null)
  const [summary, setSummary] = useState<TeacherAcademicSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        if (!Number.isFinite(teacherId) || teacherId <= 0) {
          throw new Error('El identificador del docente no es válido.')
        }

        const [teacherData, summaryData] = await Promise.all([
          getTeacherAcademicProfile(teacherId),
          getTeacherAcademicSummary(teacherId).catch(() => null),
        ])

        setTeacher(teacherData)
        setSummary(summaryData)
      } catch (err: any) {
        setError(err?.message || 'No se pudo cargar el perfil docente.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [teacherId])

  return (
    <>
      <AppHeader title="Perfil docente" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <AdminBreadcrumbs
            items={[
              { label: 'Docentes', href: '/admin/dashboard/teachers' },
              { label: teacher ? getFullName(teacher) : 'Perfil docente' },
            ]}
          />
          {loading ? (
            <ProfileSkeleton />
          ) : error ? (
            <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
              <CardContent className="px-6 py-14">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Inbox className="size-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">
                    No se pudo cargar el perfil
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    {error}
                  </p>
                  <Button asChild variant="outline" className="mt-5 rounded-xl shadow-none">
                    <Link href="/admin/dashboard/teachers">
                      <ArrowLeft className="mr-2 size-4" />
                      Volver al listado
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : teacher ? (
            <TeacherProfileContent teacher={teacher} summary={summary} />
          ) : (
            <EmptyPanel
              icon={UserRound}
              title="Docente no disponible"
              description="No se encontró información académica para el docente seleccionado."
            />
          )}
        </div>
      </div>
    </>
  )
}
