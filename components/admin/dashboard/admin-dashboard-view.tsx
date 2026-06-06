import Link from 'next/link'
import type { ComponentType, ReactNode } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Inbox,
  Minus,
  Plus,
  Users,
  TrendingDown,
  TrendingUp,
  UserPlus,
  UserRoundCheck,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { OpenFollowUpsSection } from '@/components/admin/dashboard/open-follow-ups-section'
import type {
  AdminDashboardResponse,
  DashboardAverageGradeByCourse,
  DashboardCriticalCourse,
  DashboardCourseTrendRisk,
  DashboardOpenFollowUp,
  DashboardPendingFollowUp,
  DashboardUpcomingAssignment,
  DashboardUpcomingClass,
} from '@/lib/admin/dashboard/types'
import { calculateCourseHealth } from '@/lib/admin/courses/course-health'
import type { Profesor } from '@/lib/admin/teachers/types'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'amber' | 'rose' | 'emerald' | 'primary'
type SignalSeverity = 'critical' | 'attention' | 'healthy'
type CourseAlertCategory = 'current' | 'pending' | 'trend'

type CourseHealth = {
  level: 'normal' | 'follow-up' | 'critical'
  label: string
  reasons: string[]
  color: 'emerald' | 'amber' | 'rose'
}

type StudentFollowUpItem = {
  id: string
  alumnoId: number
  alumnoNombre: string
  alumnoAvatarUrl?: string | null
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  averageGrade?: number | null
  attendancePercentage?: number | null
  absences?: number | null
  classesTotal?: number | null
  consecutiveAbsences?: number | null
  lastAbsenceDate?: string | null
  recentGradeAlerts: StudentGradeAlert[]
  reasons: string[]
  riskSignals: string[]
  suggestedActions: string[]
  severity: SignalSeverity
}

type CourseHealthItem = {
  id: string
  category: CourseAlertCategory
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  profesoresNombres?: string[]
  reasons: string[]
  averageGrade?: number | null
  attendancePercentage?: number | null
  performanceDelta?: number | null
  attendanceDelta?: number | null
  previousAverageGrade?: number | null
  previousAttendancePercentage?: number | null
  affectedStudentsCount: number
  affectedStudents: CourseAffectedStudent[]
  pendingCorrectionCount?: number
  signalsCount: number
  severity: SignalSeverity
  health: CourseHealth
  periodLabel?: string | null
  pendingFollowUpCount?: number
  pendingFollowUp?: DashboardPendingFollowUp[]
}

type TeacherOperationalItem = {
  id: number
  fullName: string
  email: string
  avatarUrl?: string | null
  studentsCount: number
  pendingCorrectionsCount: number
  pendingCorrectionsThreshold: number
  hasRelevantPendingCorrections: boolean
  unloadedAttendanceCount: number
  coursesAtRiskCount: number
  mainSignal: string
  reasons: string[]
  severity: SignalSeverity
}

type DailyQueueKind = 'student' | 'course'

type DailyQueueItem = {
  id: string
  kind: DailyQueueKind
  label: string
  title: string
  context?: string | null
  reason: string
  href: string
  ctaLabel: string
  severity: SignalSeverity
  statusLabel: string
  avatarUrl?: string | null
  secondaryHref?: string
  secondaryLabel?: string
  rank: number
}

type StudentGradeAlert = {
  id: number
  title: string
  grade: number
  date: string
}

type CourseAffectedStudent = {
  id: string
  alumnoId: number
  alumnoNombre: string
  alumnoAvatarUrl?: string | null
  reasons: string[]
  severity: SignalSeverity
}

type AcademicSummaryItem = {
  id: string
  text: string
  tone: Tone
}

type AgendaItem = {
  id: string
  date: Date
  group: 'Hoy' | 'Mañana' | 'Próximamente'
  type: 'Clase' | 'Vencimiento'
  timeLabel: string
  dateLabel: string
  courseName: string
  courseDescription?: string | null
  detail?: string | null
  href: string
}

type InstitutionalTrendItem = {
  id: string
  label: string
  value: string
  detail: string
  tone: Tone
  href: string
}

const quickActions = [
  { label: 'Crear alumno', href: '/admin/dashboard/students/new', icon: UserPlus, priority: 'primary' },
  { label: 'Crear docente', href: '/admin/dashboard/teachers/new', icon: GraduationCap, priority: 'secondary' },
  { label: 'Crear curso', href: '/admin/dashboard/courses/new', icon: Plus, priority: 'secondary' },
  { label: 'Reportes', href: '/admin/dashboard/reports', icon: BarChart3, priority: 'tertiary' },
] as const

const toneStyles: Record<Tone, { text: string; icon: string; surface: string }> = {
  neutral: {
    text: 'text-muted-foreground',
    icon: 'bg-muted/45 text-muted-foreground',
    surface: 'bg-muted/20 text-muted-foreground',
  },
  amber: {
    text: 'text-amber-700 dark:text-amber-400',
    icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    surface: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
  },
  rose: {
    text: 'text-rose-700 dark:text-rose-400',
    icon: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
    surface: 'bg-rose-500/10 text-rose-800 dark:text-rose-300',
  },
  emerald: {
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    surface: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
  },
  primary: {
    text: 'text-primary',
    icon: 'bg-primary/10 text-primary',
    surface: 'bg-primary/10 text-primary',
  },
}

function getDatePart(value: string) {
  return value.split('T')[0]
}

function parseLocalDate(value: string) {
  const [year, month, day] = getDatePart(value).split('-').map(Number)
  return new Date(year, month - 1, day)
}

function buildClassDateTime(item: DashboardUpcomingClass) {
  const date = parseLocalDate(item.proximaClase)
  const [hours, minutes] = item.horaInicio.slice(0, 5).split(':').map(Number)
  date.setHours(hours, minutes, 0, 0)
  return date
}

function buildAssignmentDateTime(item: DashboardUpcomingAssignment) {
  return new Date(item.fechaEntregaUtc)
}

function formatTime24(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatTodayLabel() {
  const value = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getAgendaGroup(date: Date): AgendaItem['group'] {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (sameDay(date, today)) return 'Hoy'
  if (sameDay(date, tomorrow)) return 'Mañana'
  return 'Próximamente'
}

function formatAgendaTime(date: Date) {
  return formatTime24(date)
}

function formatAgendaDateLabel(date: Date) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}

function formatAgendaDayLabel(date: Date) {
  const value = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
  }).format(date)

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatAgendaFullDateLabel(date: Date) {
  return `${formatAgendaDayLabel(date)} ${formatAgendaDateLabel(date)}`
}

function buildAgendaItems({
  classes,
  assignments,
  limit = 3,
}: {
  classes: DashboardUpcomingClass[]
  assignments: DashboardUpcomingAssignment[]
  limit?: number
}): AgendaItem[] {
  const classItems = classes.map((item) => {
    const date = buildClassDateTime(item)

    return {
      id: `class-${item.cursoId}-${item.proximaClase}`,
      date,
      group: getAgendaGroup(date),
      type: 'Clase',
      timeLabel: formatAgendaTime(date),
      dateLabel: item.diaSemana || formatAgendaDayLabel(date),
      courseName: item.cursoNombre,
      courseDescription: item.cursoDescripcion,
      detail: item.profesorNombre,
      href: `/admin/dashboard/courses/${item.cursoId}/profile`,
    } satisfies AgendaItem
  })

  const assignmentItems = assignments.map((item) => {
    const date = buildAssignmentDateTime(item)

    return {
      id: `assignment-${item.tareaId}`,
      date,
      group: getAgendaGroup(date),
      type: 'Vencimiento',
      timeLabel: formatAgendaTime(date),
      dateLabel: formatAgendaDayLabel(date),
      courseName: item.cursoNombre,
      courseDescription: item.cursoDescripcion,
      detail: item.titulo,
      href: `/admin/dashboard/courses/${item.cursoId}/manage`,
    } satisfies AgendaItem
  })

  return [...classItems, ...assignmentItems]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit)
}

function formatPeriodLabel(dashboard: AdminDashboardResponse) {
  const label = dashboard.period?.label?.trim()
  const months = dashboard.period?.monthRangeLabel?.trim()

  if (label && months) return `${label} · ${months}`
  if (label) return label

  const date = dashboard.period?.from ? parseLocalDate(dashboard.period.from) : null

  if (!date || Number.isNaN(date.getTime())) {
    return 'Trimestre actual'
  }

  const value = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(date)

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatHeaderPeriodLabel(value: string) {
  const normalized = value
    .replace(/(\d)°/g, '$1º')
    .replace(/\bTrimestre\b/gi, 'trimestre')
  const rangeMarker = ' a '
  const rangeIndex = normalized.indexOf(rangeMarker)

  if (rangeIndex === -1) return normalized

  const rangeEndIndex = rangeIndex + rangeMarker.length
  return `${normalized.slice(0, rangeEndIndex)}${normalized
    .charAt(rangeEndIndex)
    .toLocaleLowerCase('es-AR')}${normalized.slice(rangeEndIndex + 1)}`
}

function getTrendComparisonLabel(dashboard: AdminDashboardResponse) {
  return dashboard.trendComparison?.label?.trim() || 'trimestre anterior'
}

function getConsecutiveAbsencesWindowLabel(dashboard: AdminDashboardResponse) {
  return dashboard.consecutiveAbsencesWindow?.label?.trim() || 'últimos 21 días'
}

function CourseNameWithDescription({
  name,
  description,
}: {
  name: string
  description?: string | null
}) {
  const cleanDescription = description?.trim()

  return (
    <>
      <span>{name}</span>
      {cleanDescription ? (
        <span className="ml-1.5 text-xs font-medium text-muted-foreground">
          {cleanDescription}
        </span>
      ) : null}
    </>
  )
}

function CourseTitleLine({
  name,
  description,
}: {
  name: string
  description?: string | null
}) {
  const cleanDescription = description?.trim()

  return (
    <span className="break-words">
      <span>{name}</span>
      {cleanDescription ? (
        <span className="text-muted-foreground"> · {cleanDescription}</span>
      ) : null}
    </span>
  )
}

function getStudentInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return 'AL'

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

function StudentPhoto({
  name,
  avatarUrl,
}: {
  name: string
  avatarUrl?: string | null
}) {
  const cleanAvatarUrl = avatarUrl?.trim()
  const initials = getStudentInitials(name)

  return (
    <Avatar className="size-8 shrink-0 rounded-lg border border-border/40 bg-muted">
      {cleanAvatarUrl ? (
        <AvatarImage
          src={cleanAvatarUrl}
          alt={name.trim() || 'Foto del alumno'}
          className="object-cover"
        />
      ) : null}
      <AvatarFallback className="rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

function TeacherPhoto({
  name,
  avatarUrl,
}: {
  name: string
  avatarUrl?: string | null
}) {
  const cleanAvatarUrl = avatarUrl?.trim()
  const initials = getTeacherInitials(name)

  return (
    <Avatar className="size-8 shrink-0 rounded-lg border border-border/40 bg-muted">
      {cleanAvatarUrl ? (
        <AvatarImage
          src={cleanAvatarUrl}
          alt={name.trim() || 'Foto del docente'}
          className="object-cover"
        />
      ) : null}
      <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

function severityTone(severity: SignalSeverity): Tone {
  if (severity === 'critical') return 'rose'
  if (severity === 'attention') return 'amber'
  return 'neutral'
}

function mergeSeverity(current: SignalSeverity, next: SignalSeverity): SignalSeverity {
  if (current === 'critical' || next === 'critical') return 'critical'
  if (current === 'attention' || next === 'attention') return 'attention'
  return 'healthy'
}

function gradeTone(score: number): Tone {
  if (score >= 80) return 'emerald'
  if (score >= 50) return 'amber'
  return 'rose'
}

function attendanceTone(value: number): Tone {
  if (value >= 85) return 'emerald'
  if (value >= 70) return 'amber'
  return 'rose'
}

function countTone(value: number, amberLimit = 5): Tone {
  if (value === 0) return 'emerald'
  if (value <= amberLimit) return 'amber'
  return 'rose'
}

const NORMAL_COURSE_HEALTH: CourseHealth = {
  level: 'normal',
  label: 'Normal',
  reasons: ['Sin alertas en el trimestre actual'],
  color: 'emerald',
}

function normalizeCourseHealth(
  health?: DashboardCriticalCourse['health'] | DashboardCriticalCourse['academicStatusCurrent'] | null,
): CourseHealth {
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
    label: health?.label || NORMAL_COURSE_HEALTH.label,
    reasons:
      health?.reasons && health.reasons.length > 0
        ? health.reasons
        : NORMAL_COURSE_HEALTH.reasons,
    color,
  }
}

function severityFromHealth(health: CourseHealth): SignalSeverity {
  if (health.level === 'critical') return 'critical'
  if (health.level === 'follow-up') return 'attention'
  return 'healthy'
}

function getCourseSeverity(item: {
  averageGrade?: number | null
  attendancePercentage?: number | null
  pendingCorrectionCount?: number
  signalsCount?: number
}): SignalSeverity {
  if (
    (typeof item.averageGrade === 'number' && item.averageGrade < 50) ||
    (typeof item.attendancePercentage === 'number' && item.attendancePercentage < 70) ||
    (item.pendingCorrectionCount ?? 0) >= 10 ||
    (item.signalsCount ?? 0) >= 3
  ) {
    return 'critical'
  }

  if (
    (typeof item.averageGrade === 'number' && item.averageGrade < 70) ||
    (typeof item.attendancePercentage === 'number' && item.attendancePercentage < 82) ||
    (item.pendingCorrectionCount ?? 0) > 0 ||
    (item.signalsCount ?? 0) > 0
  ) {
    return 'attention'
  }

  return 'healthy'
}

function getAdditionalOverallCourseRisks(dashboard: AdminDashboardResponse) {
  const manualRiskIds = new Set(
    (dashboard.coursesAtRiskByManualAverage ?? []).map((course) => course.cursoId),
  )

  return (dashboard.coursesAtRiskByOverallAverage ?? []).filter(
    (course) => !manualRiskIds.has(course.cursoId),
  )
}

function trendInfo(
  dashboard: AdminDashboardResponse,
  key: string,
  unit = '',
) {
  const trend = dashboard.academicTrends?.find((item) => item.key === key)
  const comparisonLabel = getTrendComparisonLabel(dashboard)

  if (!trend || typeof trend.delta !== 'number') {
    return {
      label: 'Sin comparación previa',
      tone: 'neutral' as Tone,
      icon: Minus,
      title: `No hay comparación con el ${comparisonLabel} disponible.`,
    }
  }

  if (trend.delta === 0) {
    return {
      label: `Sin variación vs ${comparisonLabel}`,
      tone: 'neutral' as Tone,
      icon: Minus,
      title: `Sin cambios vs ${comparisonLabel}.`,
    }
  }

  const improves = trend.delta > 0
  const direction = improves ? '↑' : '↓'
  const unitLabel = unit ? ` ${unit}` : ''

  return {
    label: `${direction} ${Math.abs(trend.delta).toFixed(1)}${unitLabel} vs ${comparisonLabel}`,
    tone: improves ? 'emerald' as Tone : 'amber' as Tone,
    icon: improves ? TrendingUp : TrendingDown,
    title: `${improves ? 'Sube' : 'Baja'} ${Math.abs(trend.delta).toFixed(1)}${unitLabel} vs ${comparisonLabel}.`,
  }
}

function formatTrendDetail(
  delta: number | null | undefined,
  unit: 'pts' | 'pp',
  comparisonLabel = 'trimestre anterior',
) {
  if (typeof delta !== 'number') return null
  if (delta === 0) return `Sin variación vs ${comparisonLabel}`

  const direction = delta > 0 ? '↑' : '↓'
  return `${direction} ${Math.abs(delta).toFixed(1)} ${unit} vs ${comparisonLabel}`
}

function formatCompactTrend(
  delta: number | null | undefined,
  unit: 'pts' | 'pp',
  comparisonLabel = 'trimestre anterior',
) {
  if (typeof delta !== 'number') return null
  if (delta === 0) return 'sin cambios'

  const direction = delta > 0 ? '↑' : '↓'
  return `${direction} ${Math.abs(delta).toFixed(1)} ${unit} vs ${comparisonLabel}`
}

function metricValue(value: number | null | undefined, options?: { percent?: boolean; decimals?: number }) {
  if (typeof value !== 'number') return 'Sin datos'

  const decimals = options?.decimals ?? 0
  const formatted = value.toFixed(decimals)
  return options?.percent ? `${formatted}%` : formatted
}

function addUnique(items: string[], value: string) {
  if (!items.includes(value)) items.push(value)
}

function addUniqueGradeAlert(items: StudentGradeAlert[], value: StudentGradeAlert) {
  if (!items.some((item) => item.id === value.id)) items.push(value)
}

function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural
}

function formatShortDate(value: string | null | undefined) {
  if (!value) return null

  const date = parseLocalDate(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}

function cleanTeacherNames(names?: string[] | null) {
  return (names ?? []).map((name) => name.trim()).filter(Boolean)
}

function getTeacherFullName(teacher: Profesor) {
  return `${teacher.nombre} ${teacher.apellido}`.trim()
}

function getTeacherInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return 'DO'

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

function getTeacherPendingCorrectionsThreshold(studentsCount: number | null | undefined) {
  if (typeof studentsCount !== 'number' || studentsCount <= 0) return 3

  return Math.max(3, Math.ceil(studentsCount * 0.5))
}

function getTeacherOperationalReasons(teacher: Profesor) {
  const reasons: string[] = []
  const coursesAtRiskCount = teacher.coursesAtRiskCount ?? 0
  const pendingCorrectionsCount = teacher.pendingCorrectionsCount ?? 0
  const pendingCorrectionsThreshold = getTeacherPendingCorrectionsThreshold(teacher.studentsCount)
  const unloadedAttendanceCount = teacher.unloadedAttendanceCount ?? 0

  if (coursesAtRiskCount > 0) {
    reasons.push(
      coursesAtRiskCount === 1
        ? '1 curso requiere atención'
        : `${coursesAtRiskCount} cursos requieren atención`,
    )
  }

  if (pendingCorrectionsCount >= pendingCorrectionsThreshold) {
    reasons.push(
      pendingCorrectionsCount === 1
        ? '1 corrección acumulada'
        : `${pendingCorrectionsCount} correcciones acumuladas`,
    )
  }

  if (unloadedAttendanceCount > 0) {
    reasons.push(
      unloadedAttendanceCount === 1
        ? '1 asistencia pendiente'
        : `${unloadedAttendanceCount} asistencias pendientes`,
    )
  }

  return reasons
}

function buildTeacherOperationalItems(teachers: Profesor[]): TeacherOperationalItem[] {
  return teachers
    .map((teacher) => {
      const reasons = getTeacherOperationalReasons(teacher)
      const coursesAtRiskCount = teacher.coursesAtRiskCount ?? 0
      const pendingCorrectionsCount = teacher.pendingCorrectionsCount ?? 0
      const pendingCorrectionsThreshold = getTeacherPendingCorrectionsThreshold(teacher.studentsCount)
      const hasRelevantPendingCorrections =
        pendingCorrectionsCount >= pendingCorrectionsThreshold
      const unloadedAttendanceCount = teacher.unloadedAttendanceCount ?? 0
      const severity: SignalSeverity = coursesAtRiskCount > 0 ? 'critical' : 'attention'

      return {
        id: teacher.id,
        fullName: getTeacherFullName(teacher),
        email: teacher.email,
        avatarUrl: teacher.avatarUrl,
        studentsCount: teacher.studentsCount ?? 0,
        pendingCorrectionsCount,
        pendingCorrectionsThreshold,
        hasRelevantPendingCorrections,
        unloadedAttendanceCount,
        coursesAtRiskCount,
        mainSignal: reasons[0] || teacher.mainSignal || 'Sin señales pendientes',
        reasons,
        severity,
      }
    })
    .filter((teacher) => teacher.reasons.length > 0)
    .sort((a, b) => {
      const severityWeight = { critical: 0, attention: 1, healthy: 2 }
      const severityDiff = severityWeight[a.severity] - severityWeight[b.severity]
      if (severityDiff !== 0) return severityDiff

      const aPendingCorrections = a.hasRelevantPendingCorrections
        ? a.pendingCorrectionsCount
        : 0
      const bPendingCorrections = b.hasRelevantPendingCorrections
        ? b.pendingCorrectionsCount
        : 0
      const aSignals =
        a.coursesAtRiskCount + aPendingCorrections + a.unloadedAttendanceCount
      const bSignals =
        b.coursesAtRiskCount + bPendingCorrections + b.unloadedAttendanceCount

      return bSignals - aSignals || a.fullName.localeCompare(b.fullName)
    })
    .slice(0, 6)
}

function buildStudentsFollowUpItems(dashboard: AdminDashboardResponse): StudentFollowUpItem[] {
  const items = new Map<string, StudentFollowUpItem>()

  function ensureItem(input: {
    alumnoId: number
    alumnoNombre: string
    alumnoAvatarUrl?: string | null
    cursoId: number
    cursoNombre: string
    cursoDescripcion?: string | null
  }) {
    const id = `${input.alumnoId}-${input.cursoId}`
    const existing = items.get(id)

    if (existing) {
      existing.alumnoAvatarUrl = existing.alumnoAvatarUrl ?? input.alumnoAvatarUrl
      existing.cursoDescripcion = existing.cursoDescripcion ?? input.cursoDescripcion
      return existing
    }

    const created: StudentFollowUpItem = {
      id,
      alumnoId: input.alumnoId,
      alumnoNombre: input.alumnoNombre,
      alumnoAvatarUrl: input.alumnoAvatarUrl,
      cursoId: input.cursoId,
      cursoNombre: input.cursoNombre,
      cursoDescripcion: input.cursoDescripcion,
      recentGradeAlerts: [],
      reasons: [],
      riskSignals: [],
      suggestedActions: [],
      severity: 'healthy',
    }

    items.set(id, created)
    return created
  }

  for (const item of dashboard.studentsManualLowPerformance ?? []) {
    const row = ensureItem(item)
    row.averageGrade = row.averageGrade ?? item.averageGrade
    addUnique(row.reasons, `Nota baja: ${item.titulo}`)
    addUnique(row.riskSignals, 'Calificación manual por debajo de lo esperado')
    addUnique(row.suggestedActions, 'Revisar con el docente la instancia evaluada y definir una recuperación.')
    addUniqueGradeAlert(row.recentGradeAlerts, {
      id: item.calificacionId,
      title: item.titulo,
      grade: item.nota,
      date: item.fecha,
    })
    row.severity = mergeSeverity(row.severity, item.nota < 50 ? 'critical' : 'attention')
  }

  for (const item of dashboard.studentsAtRiskByAverage ?? []) {
    const row = ensureItem(item)
    row.averageGrade = item.averageGrade
    addUnique(row.reasons, 'Promedio trimestral bajo')
    addUnique(row.riskSignals, `${item.calificacionesCount} calificaciones en el promedio trimestral`)
    addUnique(row.suggestedActions, 'Acordar acompañamiento académico antes del próximo cierre de notas.')
    row.severity = mergeSeverity(row.severity, item.averageGrade < 50 ? 'critical' : 'attention')
  }

  for (const item of dashboard.studentsWithCombinedAcademicRisk ?? []) {
    const row = ensureItem(item)
    row.averageGrade = item.averageGrade
    row.attendancePercentage = item.attendancePercentage
    row.absences = item.absences
    addUnique(row.reasons, 'Combina bajo rendimiento y baja asistencia')
    addUnique(row.riskSignals, `${item.absences} ausencias en el trimestre`)
    addUnique(row.suggestedActions, 'Coordinar seguimiento académico y continuidad de cursada en una misma intervención.')
    row.severity = mergeSeverity(
      row.severity,
      item.averageGrade < 50 || item.attendancePercentage < 70 ? 'critical' : 'attention',
    )
  }

  for (const item of dashboard.studentsWithConsecutiveAbsences ?? []) {
    const row = ensureItem(item)
    row.averageGrade = row.averageGrade ?? item.averageGrade
    row.attendancePercentage = row.attendancePercentage ?? item.attendancePercentage
    row.consecutiveAbsences = item.consecutiveAbsences
    row.lastAbsenceDate = item.lastAbsenceDate
    addUnique(row.reasons, `${item.consecutiveAbsences} ausencias consecutivas`)
    addUnique(row.riskSignals, `Última ausencia registrada: ${formatShortDate(item.lastAbsenceDate) ?? 'sin fecha disponible'}`)
    addUnique(row.suggestedActions, 'Contactar al alumno o la familia para recuperar continuidad de cursada.')
    row.severity = mergeSeverity(
      row.severity,
      item.attendancePercentage < 70 ? 'critical' : 'attention',
    )
  }

  for (const item of dashboard.studentsWithMultipleAbsences ?? []) {
    const row = ensureItem(item)
    row.averageGrade = row.averageGrade ?? item.averageGrade
    row.attendancePercentage = item.attendancePercentage
    row.absences = item.ausentes
    row.classesTotal = item.clasesTotales
    addUnique(
      row.reasons,
      item.attendancePercentage < 70
        ? 'Asistencia menor al 70%'
        : `${item.ausentes} ausencias en el trimestre`,
    )
    addUnique(row.riskSignals, `${item.ausentes} ausencias sobre ${item.clasesTotales} clases`)
    addUnique(row.suggestedActions, 'Verificar causas de inasistencia y registrar el próximo contacto.')
    row.severity = mergeSeverity(
      row.severity,
      item.attendancePercentage < 70 ? 'critical' : 'attention',
    )
  }

  return [...items.values()]
    .sort((a, b) => {
      const severityWeight = { critical: 0, attention: 1, healthy: 2 }
      return severityWeight[a.severity] - severityWeight[b.severity]
    })
    .slice(0, 8)
}

function buildCoursesHealthItems(
  dashboard: AdminDashboardResponse,
  studentsFollowUpItems: StudentFollowUpItem[],
): CourseHealthItem[] {
  const items = new Map<number, CourseHealthItem>()
  const affectedStudentsByCourse = studentsFollowUpItems.reduce(
    (acc, student) => {
      const current = acc.get(student.cursoId) ?? []
      current.push({
        id: student.id,
        alumnoId: student.alumnoId,
        alumnoNombre: student.alumnoNombre,
        alumnoAvatarUrl: student.alumnoAvatarUrl,
        reasons: student.reasons,
        severity: student.severity,
      })
      acc.set(student.cursoId, current)
      return acc
    },
    new Map<number, CourseAffectedStudent[]>(),
  )

  function ensureItem(input: {
    cursoId: number
    cursoNombre: string
    cursoDescripcion?: string | null
    profesoresNombres?: string[] | null
  }) {
    const existing = items.get(input.cursoId)

    if (existing) {
      existing.cursoDescripcion = existing.cursoDescripcion ?? input.cursoDescripcion
      existing.profesoresNombres = existing.profesoresNombres?.length
        ? existing.profesoresNombres
        : cleanTeacherNames(input.profesoresNombres)
      return existing
    }

    const affectedStudents = affectedStudentsByCourse.get(input.cursoId) ?? []
    const teacherNames = cleanTeacherNames(input.profesoresNombres)
    const created: CourseHealthItem = {
      id: `legacy-${input.cursoId}`,
      category: 'current',
      cursoId: input.cursoId,
      cursoNombre: input.cursoNombre,
      cursoDescripcion: input.cursoDescripcion,
      profesoresNombres: teacherNames,
      reasons: [],
      affectedStudentsCount: affectedStudents.length,
      affectedStudents,
      signalsCount: 0,
      severity: 'healthy',
      health: calculateCourseHealth({
        attendanceAverage: null,
        academicAverage: null,
        studentsAtRiskCount: 0,
        teacherAssigned: teacherNames.length > 0,
      }),
    }

    items.set(input.cursoId, created)
    return created
  }

  function addAverageRisk(course: DashboardAverageGradeByCourse, label: string) {
    const row = ensureItem(course)
    row.averageGrade = row.averageGrade ?? course.averageGrade
    addUnique(row.reasons, label)
    row.signalsCount += 1
    row.severity = mergeSeverity(row.severity, getCourseSeverity(row))
  }

  function addCourseTrendRisk(course: DashboardCourseTrendRisk, label: string, type: 'performance' | 'attendance') {
    const row = ensureItem(course)
    if (type === 'performance') {
      row.averageGrade = row.averageGrade ?? course.currentValue
      row.previousAverageGrade = course.previousValue
      row.performanceDelta = course.delta
    } else {
      row.attendancePercentage = row.attendancePercentage ?? course.currentValue
      row.previousAttendancePercentage = course.previousValue
      row.attendanceDelta = course.delta
    }
    addUnique(row.reasons, label)
    row.signalsCount += 1
    row.severity = mergeSeverity(row.severity, getCourseSeverity(row))
  }

  for (const course of dashboard.coursesAtRiskByManualAverage ?? []) {
    addAverageRisk(course, 'Promedio trimestral manual bajo')
  }

  for (const course of getAdditionalOverallCourseRisks(dashboard)) {
    addAverageRisk(course, 'Promedio trimestral bajo')
  }

  for (const course of dashboard.coursesAtRiskByAttendance ?? []) {
    const row = ensureItem(course)
    row.attendancePercentage = course.attendancePercentage
    addUnique(row.reasons, 'Asistencia trimestral menor al 70%')
    row.signalsCount += 1
    row.severity = mergeSeverity(row.severity, getCourseSeverity(row))
  }

  for (const course of dashboard.coursesWithPerformanceDecline ?? []) {
    addCourseTrendRisk(course, 'Rendimiento en descenso', 'performance')
  }

  for (const course of dashboard.coursesWithAttendanceDecline ?? []) {
    addCourseTrendRisk(course, 'Asistencia en descenso', 'attendance')
  }

  for (const course of dashboard.criticalCourses ?? []) {
    const row = ensureItem(course)
    row.averageGrade = row.averageGrade ?? course.averageGrade
    row.attendancePercentage = row.attendancePercentage ?? course.attendancePercentage
    row.pendingCorrectionCount = course.pendingCorrectionCount
    row.signalsCount = Math.max(row.signalsCount, course.signalsCount)
    if (course.signalsCount >= 2) {
      addUnique(row.reasons, 'Señales académicas repetidas')
    }
    row.severity = mergeSeverity(row.severity, getCourseSeverity(row))
  }

  return [...items.values()]
    .map((item) => {
      const health = calculateCourseHealth({
        attendanceAverage: item.attendancePercentage,
        academicAverage: item.averageGrade,
        studentsAtRiskCount: item.affectedStudentsCount,
        teacherAssigned: (item.profesoresNombres?.length ?? 0) > 0,
      })
      const healthSeverity: SignalSeverity =
        health.level === 'critical'
          ? 'critical'
          : health.level === 'follow-up'
            ? 'attention'
            : 'healthy'

      return {
        ...item,
        health,
        severity: mergeSeverity(healthSeverity, item.severity),
        reasons: [
          ...health.reasons.filter((reason) => reason !== 'Sin alertas académicas'),
          ...item.reasons,
        ].filter((reason, index, reasons) => reasons.indexOf(reason) === index),
      }
    })
    .filter((item) => item.reasons.length > 0)
    .sort((a, b) => {
      const severityWeight = { critical: 0, attention: 1, healthy: 2 }
      return (
        severityWeight[a.severity] - severityWeight[b.severity] ||
        b.signalsCount - a.signalsCount ||
        b.affectedStudentsCount - a.affectedStudentsCount
      )
    })
    .slice(0, 8)
}

function createCourseDashboardItem(input: {
  category: CourseAlertCategory
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  profesoresNombres?: string[] | null
  health?: CourseHealth
}): CourseHealthItem {
  return {
    id: `${input.category}-${input.cursoId}`,
    category: input.category,
    cursoId: input.cursoId,
    cursoNombre: input.cursoNombre,
    cursoDescripcion: input.cursoDescripcion,
    profesoresNombres: cleanTeacherNames(input.profesoresNombres),
    reasons: [],
    affectedStudentsCount: 0,
    affectedStudents: [],
    signalsCount: 0,
    severity: 'healthy',
    health: input.health ?? NORMAL_COURSE_HEALTH,
  }
}

function buildCurrentCourseRiskItems(
  dashboard: AdminDashboardResponse,
  studentsFollowUpItems: StudentFollowUpItem[],
): CourseHealthItem[] {
  const items = new Map<number, CourseHealthItem>()
  const affectedStudentsByCourse = studentsFollowUpItems.reduce(
    (acc, student) => {
      const current = acc.get(student.cursoId) ?? []
      current.push({
        id: student.id,
        alumnoId: student.alumnoId,
        alumnoNombre: student.alumnoNombre,
        alumnoAvatarUrl: student.alumnoAvatarUrl,
        reasons: student.reasons,
        severity: student.severity,
      })
      acc.set(student.cursoId, current)
      return acc
    },
    new Map<number, CourseAffectedStudent[]>(),
  )

  function ensureItem(input: {
    cursoId: number
    cursoNombre: string
    cursoDescripcion?: string | null
    profesoresNombres?: string[] | null
  }) {
    const existing = items.get(input.cursoId)
    if (existing) {
      existing.cursoDescripcion = existing.cursoDescripcion ?? input.cursoDescripcion
      existing.profesoresNombres = existing.profesoresNombres?.length
        ? existing.profesoresNombres
        : cleanTeacherNames(input.profesoresNombres)
      return existing
    }

    const row = createCourseDashboardItem({ category: 'current', ...input })
    row.affectedStudents = affectedStudentsByCourse.get(input.cursoId) ?? []
    row.affectedStudentsCount = row.affectedStudents.length
    items.set(input.cursoId, row)
    return row
  }

  function addAverageRisk(course: DashboardAverageGradeByCourse, label: string) {
    const row = ensureItem(course)
    row.averageGrade = row.averageGrade ?? course.averageGrade
    addUnique(row.reasons, `Riesgo actual: ${label}`)
    row.signalsCount += 1
    row.severity = mergeSeverity(row.severity, getCourseSeverity(row))
  }

  for (const course of dashboard.coursesAtRiskByManualAverage ?? []) {
    addAverageRisk(course, 'promedio manual bajo en el trimestre actual')
  }

  for (const course of getAdditionalOverallCourseRisks(dashboard)) {
    addAverageRisk(course, 'promedio bajo en el trimestre actual')
  }

  for (const course of dashboard.coursesAtRiskByAttendance ?? []) {
    const row = ensureItem(course)
    row.attendancePercentage = course.attendancePercentage
    addUnique(row.reasons, 'Riesgo actual: asistencia menor al 70% en el trimestre actual')
    row.signalsCount += 1
    row.severity = mergeSeverity(row.severity, getCourseSeverity(row))
  }

  for (const course of dashboard.criticalCourses ?? []) {
    const row = ensureItem(course)
    const health = normalizeCourseHealth(course.academicStatusCurrent ?? course.health)
    row.health = health
    row.averageGrade = row.averageGrade ?? course.averageGrade
    row.attendancePercentage = row.attendancePercentage ?? course.attendancePercentage
    row.pendingCorrectionCount = course.pendingCorrectionCount
    row.pendingFollowUpCount = course.pendingFollowUpCount
    row.signalsCount = Math.max(row.signalsCount, course.signalsCount)
    row.severity = mergeSeverity(row.severity, severityFromHealth(health))

    for (const reason of health.reasons) {
      if (reason !== NORMAL_COURSE_HEALTH.reasons[0]) {
        addUnique(row.reasons, `Riesgo actual: ${reason}`)
      }
    }

    if (course.signalsCount >= 2) {
      addUnique(row.reasons, 'Riesgo actual: señales académicas repetidas')
    }
  }

  return [...items.values()]
    .filter((item) => item.reasons.length > 0)
    .sort((a, b) => {
      const severityWeight = { critical: 0, attention: 1, healthy: 2 }
      return (
        severityWeight[a.severity] - severityWeight[b.severity] ||
        b.signalsCount - a.signalsCount ||
        b.affectedStudentsCount - a.affectedStudentsCount
      )
    })
    .slice(0, 8)
}

function getDashboardPendingFollowUpItems(dashboard: AdminDashboardResponse) {
  const items = [
    ...(dashboard.coursesPendingFollowUp ?? []),
    ...(dashboard.coursesWithPendingFollowUp ?? []),
    ...(dashboard.pendingFollowUp ?? []),
    ...(dashboard.criticalCourses ?? []).flatMap((course) => course.pendingFollowUp ?? []),
  ]

  return items.filter((item, index, all) => {
    const key = `${item.cursoId}-${item.alumnoId ?? 'curso'}-${item.periodLabel}-${item.reason}`
    return all.findIndex((candidate) => (
      `${candidate.cursoId}-${candidate.alumnoId ?? 'curso'}-${candidate.periodLabel}-${candidate.reason}`
    ) === key) === index
  })
}

function formatPendingFollowUpReason(item: DashboardPendingFollowUp) {
  const periodLabel = item.periodLabel || (item.quarterNumber ? `${item.quarterNumber}º trimestre` : 'trimestre anterior')
  const average = typeof item.averageValue === 'number'
    ? `Promedio ${item.averageValue.toFixed(0)} en ${periodLabel}`
    : null
  const attendance = typeof item.attendanceValue === 'number'
    ? `Asistencia ${item.attendanceValue.toFixed(0)}% en ${periodLabel}`
    : null
  const levelLabel = item.level === 'critical'
    ? `Crítico en ${periodLabel}`
    : `Seguimiento pendiente en ${periodLabel}`

  return item.description || average || attendance || item.reason || levelLabel
}

function buildCoursePendingFollowUpItems(dashboard: AdminDashboardResponse): CourseHealthItem[] {
  const items = new Map<number, CourseHealthItem>()

  for (const pending of getDashboardPendingFollowUpItems(dashboard)) {
    const existing = items.get(pending.cursoId)
    const row = existing ?? createCourseDashboardItem({
      category: 'pending',
      cursoId: pending.cursoId,
      cursoNombre: pending.cursoNombre,
      cursoDescripcion: pending.cursoDescripcion,
      health: {
        level: pending.level === 'critical' ? 'critical' : 'follow-up',
        label: 'Seguimiento pendiente',
        reasons: ['Seguimiento pendiente del trimestre anterior'],
        color: pending.level === 'critical' ? 'rose' : 'amber',
      },
    })

    row.periodLabel = row.periodLabel ?? pending.periodLabel
    row.pendingFollowUp = [...(row.pendingFollowUp ?? []), pending]
    row.pendingFollowUpCount = row.pendingFollowUp.length
    row.signalsCount += 1
    row.severity = mergeSeverity(row.severity, pending.level === 'critical' ? 'critical' : 'attention')
    addUnique(row.reasons, formatPendingFollowUpReason(pending))
    if (pending.level === 'critical') {
      addUnique(row.reasons, `Crítico en ${pending.periodLabel}`)
    }

    items.set(pending.cursoId, row)
  }

  return [...items.values()]
    .sort((a, b) => {
      const severityWeight = { critical: 0, attention: 1, healthy: 2 }
      return (
        severityWeight[a.severity] - severityWeight[b.severity] ||
        (b.pendingFollowUpCount ?? 0) - (a.pendingFollowUpCount ?? 0)
      )
    })
    .slice(0, 8)
}

function buildOpenFollowUpFallback(items: CourseHealthItem[]): DashboardOpenFollowUp[] {
  return items.flatMap((item) => {
    const pendingItems = item.pendingFollowUp?.length
      ? item.pendingFollowUp
      : [
          {
            cursoId: item.cursoId,
            cursoNombre: item.cursoNombre,
            cursoDescripcion: item.cursoDescripcion,
            periodLabel: item.periodLabel || 'trimestre anterior',
            quarterNumber: undefined,
            year: undefined,
            level: item.health.level,
            reason: item.reasons[0] || 'Seguimiento académico pendiente',
          } satisfies DashboardPendingFollowUp,
        ]

    return pendingItems.map((pending, index) => ({
      id: `course-fallback-${pending.cursoId}-${pending.periodLabel}-${index}`,
      entityType: 'course',
      entityId: pending.cursoId,
      cursoId: pending.cursoId,
      cursoNombre: pending.cursoNombre,
      cursoDescripcion: pending.cursoDescripcion,
      periodLabel: pending.periodLabel || 'trimestre anterior',
      quarterNumber: pending.quarterNumber ?? 0,
      year: pending.year ?? 0,
      reason: formatPendingFollowUpReason(pending),
      source: 'course-pending-follow-up',
      level: pending.level,
      averageGrade: pending.averageValue ?? item.averageGrade ?? null,
      attendancePercentage: pending.attendanceValue ?? item.attendancePercentage ?? null,
      href: `/admin/dashboard/courses/${pending.cursoId}/profile`,
    }))
  })
}

function filterOpenFollowUpsAgainstDailyQueue(
  items: DashboardOpenFollowUp[],
  dailyQueueItems: DailyQueueItem[],
) {
  const activeStudentKeys = new Set(
    dailyQueueItems
      .filter((item) => item.kind === 'student')
      .map((item) => item.id.replace(/^student-/, '')),
  )
  const activeCourseIds = new Set(
    dailyQueueItems
      .filter((item) => item.kind === 'course')
      .map((item) => Number(item.id.replace(/^course-current-/, ''))),
  )

  return items.filter((item) => {
    if (item.entityType === 'student' && item.alumnoId && item.cursoId) {
      return !activeStudentKeys.has(`${item.alumnoId}-${item.cursoId}`)
    }

    if (item.entityType === 'course' && item.cursoId) {
      return !activeCourseIds.has(item.cursoId)
    }

    return true
  })
}

function buildCourseTrendItems(dashboard: AdminDashboardResponse): CourseHealthItem[] {
  const items = new Map<number, CourseHealthItem>()

  function ensureItem(course: DashboardCourseTrendRisk) {
    const existing = items.get(course.cursoId)
    if (existing) return existing

    const row = createCourseDashboardItem({
      category: 'trend',
      cursoId: course.cursoId,
      cursoNombre: course.cursoNombre,
      cursoDescripcion: course.cursoDescripcion,
      profesoresNombres: course.profesoresNombres,
      health: {
        level: 'follow-up',
        label: 'Tendencia',
        reasons: ['Historial reciente con caída de tendencia'],
        color: 'amber',
      },
    })
    row.severity = 'attention'
    items.set(course.cursoId, row)
    return row
  }

  for (const course of dashboard.coursesWithPerformanceDecline ?? []) {
    const row = ensureItem(course)
    row.averageGrade = course.currentValue
    row.previousAverageGrade = course.previousValue
    row.performanceDelta = course.delta
    row.signalsCount += 1
    addUnique(row.reasons, 'Tendencia: caída de rendimiento en historial reciente')
  }

  for (const course of dashboard.coursesWithAttendanceDecline ?? []) {
    const row = ensureItem(course)
    row.attendancePercentage = course.currentValue
    row.previousAttendancePercentage = course.previousValue
    row.attendanceDelta = course.delta
    row.signalsCount += 1
    addUnique(row.reasons, 'Tendencia: caída de asistencia en historial reciente')
  }

  return [...items.values()]
    .sort((a, b) => b.signalsCount - a.signalsCount || a.cursoNombre.localeCompare(b.cursoNombre))
    .slice(0, 8)
}

function cleanQueueReason(value: string | null | undefined) {
  const cleanValue = value?.trim()
  if (!cleanValue) return 'Revisar el seguimiento disponible.'

  return cleanValue
    .replace(/^Riesgo actual:\s*/i, '')
    .replace(/^Tendencia:\s*/i, '')
    .replace(/\s+/g, ' ')
}

function getQueueStatusLabel(severity: SignalSeverity, fallback = 'Seguimiento') {
  if (severity === 'critical') return 'Alta prioridad'
  if (severity === 'attention') return fallback
  return 'Para revisar'
}

function buildDailyQueueItems({
  students,
  currentCourses,
}: {
  students: StudentFollowUpItem[]
  currentCourses: CourseHealthItem[]
}): DailyQueueItem[] {
  const queue: DailyQueueItem[] = []

  for (const student of students) {
    queue.push({
      id: `student-${student.id}`,
      kind: 'student',
      label: 'Alumno',
      title: student.alumnoNombre,
      context: student.cursoDescripcion
        ? `${student.cursoNombre}, ${student.cursoDescripcion}`
        : student.cursoNombre,
      reason: cleanQueueReason(student.reasons[0]),
      href: `/admin/dashboard/students/${student.alumnoId}/profile`,
      ctaLabel: 'Ver caso',
      severity: student.severity,
      statusLabel: getQueueStatusLabel(student.severity),
      avatarUrl: student.alumnoAvatarUrl,
      secondaryHref: `/admin/dashboard/courses/${student.cursoId}/profile`,
      secondaryLabel: 'Ver curso',
      rank: 10,
    })
  }

  for (const course of currentCourses) {
    queue.push({
      id: `course-current-${course.cursoId}`,
      kind: 'course',
      label: 'Curso',
      title: course.cursoNombre,
      context: course.cursoDescripcion,
      reason: cleanQueueReason(course.reasons[0] ?? course.health.reasons[0]),
      href: `/admin/dashboard/courses/${course.cursoId}/profile`,
      ctaLabel: 'Ver curso',
      severity: course.severity,
      statusLabel: getQueueStatusLabel(course.severity),
      rank: 20,
    })
  }

  const severityWeight: Record<SignalSeverity, number> = {
    critical: 0,
    attention: 1,
    healthy: 2,
  }

  return queue.sort((a, b) => (
    a.rank - b.rank ||
    severityWeight[a.severity] - severityWeight[b.severity] ||
    a.title.localeCompare(b.title)
  ))
}

function buildAcademicSummaryItems(
  dashboard: AdminDashboardResponse,
  students: StudentFollowUpItem[],
): AcademicSummaryItem[] {
  const items: AcademicSummaryItem[] = []

  const combinedRiskCount = dashboard.studentsWithCombinedAcademicRisk?.length ?? 0
  const consecutiveAbsenceCount = dashboard.studentsWithConsecutiveAbsences?.length ?? 0
  const attendanceRiskCount = dashboard.studentsWithMultipleAbsences?.length ?? 0
  const courseDeclineCount = new Set([
    ...(dashboard.coursesWithAttendanceDecline ?? []).map((course) => course.cursoId),
    ...(dashboard.coursesWithPerformanceDecline ?? []).map((course) => course.cursoId),
  ]).size
  const pendingCourseFollowUpCount = new Set(
    getDashboardPendingFollowUpItems(dashboard).map((item) => item.cursoId),
  ).size
  const performanceStudentCount = new Set([
    ...(dashboard.studentsManualLowPerformance ?? []).map((student) => student.alumnoId),
    ...(dashboard.studentsAtRiskByAverage ?? []).map((student) => student.alumnoId),
  ]).size

  if (combinedRiskCount > 0) {
    items.push({
      id: 'students-combined-risk',
      text: `${combinedRiskCount} ${pluralize(
        combinedRiskCount,
        'alumno combina',
        'alumnos combinan',
      )} bajo rendimiento y baja asistencia`,
      tone: 'rose',
    })
  }

  if (consecutiveAbsenceCount > 0) {
    items.push({
      id: 'students-consecutive-absences',
      text: `${consecutiveAbsenceCount} ${pluralize(
        consecutiveAbsenceCount,
        'alumno tiene',
        'alumnos tienen',
      )} ausencias consecutivas`,
      tone: 'amber',
    })
  }

  if (courseDeclineCount > 0) {
    items.push({
      id: 'course-decline',
      text: `${courseDeclineCount} ${pluralize(
        courseDeclineCount,
        'curso muestra',
        'cursos muestran',
      )} tendencia negativa en historial reciente`,
      tone: 'amber',
    })
  }

  if (pendingCourseFollowUpCount > 0) {
    items.push({
      id: 'course-pending-follow-up',
      text: `${pendingCourseFollowUpCount} ${pluralize(
        pendingCourseFollowUpCount,
        'curso tiene',
        'cursos tienen',
      )} seguimiento pendiente del trimestre anterior`,
      tone: 'amber',
    })
  }

  if (combinedRiskCount === 0 && performanceStudentCount > 0) {
    items.push({
      id: 'students-performance',
      text: `${performanceStudentCount} ${pluralize(
        performanceStudentCount,
        'alumno necesita',
        'alumnos necesitan',
      )} acompañamiento académico`,
      tone: students.some((student) => student.severity === 'critical') ? 'rose' : 'amber',
    })
  }

  if (consecutiveAbsenceCount === 0 && attendanceRiskCount > 0) {
    items.push({
      id: 'students-attendance',
      text: `${attendanceRiskCount} ${pluralize(
        attendanceRiskCount,
        'alumno está',
        'alumnos están',
      )} con asistencia menor al 70%`,
      tone: (dashboard.studentsWithMultipleAbsences ?? []).some(
        (student) => student.attendancePercentage < 70,
      )
        ? 'rose'
        : 'amber',
    })
  }

  if (items.length === 0 && students.length > 0) {
    items.push({
      id: 'students-follow-up',
      text: `${students.length} ${pluralize(
        students.length,
        'alumno requiere',
        'alumnos requieren',
      )} seguimiento`,
      tone: 'amber',
    })
  }

  return items.slice(0, 6)
}

function buildInstitutionalTrendItems(dashboard: AdminDashboardResponse): InstitutionalTrendItem[] {
  const averageTrend = dashboard.academicTrends?.find((item) => item.key === 'average-grade')
  const attendanceTrend = dashboard.academicTrends?.find((item) => item.key === 'attendance')

  return [
    {
      id: 'institution-average',
      label: 'Promedio institucional trimestral',
      value: metricValue(dashboard.currentPeriodAverage, { decimals: 0 }),
      detail: formatTrendDetail(averageTrend?.delta, 'pts', getTrendComparisonLabel(dashboard)) ?? 'Sin comparación disponible',
      tone:
        typeof averageTrend?.delta === 'number'
          ? averageTrend.delta < 0
            ? 'amber'
            : averageTrend.delta > 0
              ? 'emerald'
              : 'neutral'
          : 'neutral',
      href: '/admin/dashboard/reports/marks',
    },
    {
      id: 'institution-attendance',
      label: 'Asistencia promedio trimestral',
      value: metricValue(dashboard.institutionalAttendanceAverage, { percent: true }),
      detail: formatTrendDetail(attendanceTrend?.delta, 'pp', getTrendComparisonLabel(dashboard)) ?? 'Sin comparación disponible',
      tone:
        typeof attendanceTrend?.delta === 'number'
          ? attendanceTrend.delta < 0
            ? 'amber'
            : attendanceTrend.delta > 0
              ? 'emerald'
              : 'neutral'
          : 'neutral',
      href: '/admin/dashboard/reports/attendance',
    },
  ]
}

function buildCourseDeclineSummary(dashboard: AdminDashboardResponse) {
  const attendanceDeclineCount = dashboard.coursesWithAttendanceDecline?.length ?? 0
  const performanceDeclineCount = dashboard.coursesWithPerformanceDecline?.length ?? 0
  const lines: string[] = []

  if (performanceDeclineCount > 0) {
    lines.push(`${performanceDeclineCount} ${pluralize(
      performanceDeclineCount,
      'curso bajó',
      'cursos bajaron',
    )} en rendimiento`)
  }

  if (attendanceDeclineCount > 0) {
    lines.push(`${attendanceDeclineCount} ${pluralize(
      attendanceDeclineCount,
      'curso bajó',
      'cursos bajaron',
    )} en asistencia`)
  }

  if (lines.length === 0) {
    lines.push('No se detectaron caídas relevantes en cursos durante este trimestre.')
  }

  return {
    lines,
    tone: lines.length === 1 && performanceDeclineCount + attendanceDeclineCount === 0
      ? 'emerald' as Tone
      : 'amber' as Tone,
  }
}

function getAcademicAlertSummary(alertCount: number) {
  if (alertCount === 0) {
    return 'Sin casos prioritarios en el trimestre actual ni seguimiento pendiente.'
  }

  return 'Casos agrupados por prioridad, seguimiento pendiente y cambios recientes.'
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
}: {
  icon?: ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl bg-muted/15 px-3 py-3 text-sm dark:bg-muted/10">
      <div className="flex items-start gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background/80 text-muted-foreground dark:bg-background/35">
          <Icon className="size-3.5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}

function SubtleState({
  tone,
  children,
}: {
  tone: Tone
  children: ReactNode
}) {
  return (
    <span className={cn('rounded-md px-1.5 py-0.5 text-xs font-medium', toneStyles[tone].surface)}>
      {children}
    </span>
  )
}

function QuickActionsToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
      {quickActions.map((action) => {
        const Icon = action.icon
        const primary = action.priority === 'primary'
        const tertiary = action.priority === 'tertiary'

        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
              primary &&
                'bg-primary text-primary-foreground hover:bg-primary/90',
              action.priority === 'secondary' &&
                'bg-muted/45 text-foreground hover:bg-muted/70',
              tertiary &&
                'px-2 text-muted-foreground hover:bg-muted/45 hover:text-foreground',
            )}
          >
            <Icon className="size-3.5" />
            <span>{action.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

function AdminDashboardHeader({
  queueCount,
  periodLabel,
  healthSummary,
}: {
  queueCount: number
  periodLabel: string
  healthSummary: ReturnType<typeof getDashboardHealthSummary>
}) {
  const hasQueue = queueCount > 0
  const summary =
    healthSummary.tone === 'rose'
      ? 'Hay situaciones académicas que requieren seguimiento.'
      : hasQueue
        ? `${queueCount} ${pluralize(queueCount, 'caso requiere', 'casos requieren')} atención hoy.`
        : 'No hay casos prioritarios para revisar hoy.'
  const metadata = `${formatTodayLabel()} · ${formatHeaderPeriodLabel(periodLabel)}`

  return (
    <header className="flex flex-col gap-4 border-b border-border/45 pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Hoy en Blossom
        </h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <SubtleState tone={healthSummary.tone}>{healthSummary.label}</SubtleState>
          <p className="text-sm leading-6 text-muted-foreground">{summary}</p>
        </div>
        <p className="mt-2.5 text-xs font-medium text-muted-foreground">
          {metadata}
        </p>
      </div>

      <div className="lg:pt-0.5">
        <QuickActionsToolbar />
      </div>
    </header>
  )
}

function DailyQueueAvatar({ item }: { item: DailyQueueItem }) {
  if (item.kind === 'student') {
    return <StudentPhoto name={item.title} avatarUrl={item.avatarUrl} />
  }

  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/45 bg-muted/20 text-muted-foreground">
      <GraduationCap className="size-4" />
    </span>
  )
}

function DailyQueueRow({ item }: { item: DailyQueueItem }) {
  const tone = severityTone(item.severity)
  const showSeverity = item.severity === 'critical'

  return (
    <article className="grid gap-2.5 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 gap-2.5">
        <DailyQueueAvatar item={item} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-muted/30 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {item.label}
            </span>
            {showSeverity ? <SubtleState tone={tone}>{item.statusLabel}</SubtleState> : null}
          </div>
          <p className="mt-1 break-words text-sm font-semibold leading-5 text-foreground">
            {item.title}
          </p>
          {item.context ? (
            <p className="mt-0.5 line-clamp-1 text-xs leading-5 text-muted-foreground">
              {item.context}
            </p>
          ) : null}
          <p className="mt-1 line-clamp-1 text-xs font-medium leading-5 text-foreground/80">
            {item.reason}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {item.secondaryHref && item.secondaryLabel ? (
          <Link
            href={item.secondaryHref}
            className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/45 hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            {item.secondaryLabel}
          </Link>
        ) : null}
        <Link
          href={item.href}
          className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          {item.ctaLabel}
          <ArrowRight className="ml-1 size-3.5" />
        </Link>
      </div>
    </article>
  )
}

function DailyQueueGroup({
  title,
  items,
}: {
  title: string
  items: DailyQueueItem[]
}) {
  if (items.length === 0) return null

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
        {title}
      </p>
      <div className="divide-y divide-border/45">
        {items.map((item) => (
          <DailyQueueRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

function DailyWorkQueue({ items }: { items: DailyQueueItem[] }) {
  const visibleStudents = items.filter((item) => item.kind === 'student').slice(0, 3)
  const visibleCourses = items.filter((item) => item.kind === 'course').slice(0, 3)
  const visibleCount = visibleStudents.length + visibleCourses.length
  const hiddenCount = Math.max(items.length - visibleCount, 0)
  const hasVisibleItems = visibleCount > 0

  return (
    <section className="rounded-2xl bg-card/95 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] ring-1 ring-border/60 dark:bg-card/80 sm:p-4">
      <SectionHeader
        title="Para revisar hoy"
        description="Riesgos actuales ordenados por impacto académico."
        action={hiddenCount > 0 ? (
          <Link
            href="/admin/dashboard/reports"
            className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            Ver todos los casos
          </Link>
        ) : null}
      />

      {!hasVisibleItems ? (
        <div className="mt-3">
          <EmptyState
            icon={CheckCircle2}
            title="No hay casos urgentes para revisar hoy"
            description="Alumnos y cursos no presentan riesgos actuales."
          />
        </div>
      ) : (
        <div className="mt-3 space-y-3.5">
          <DailyQueueGroup title="Alumnos en riesgo" items={visibleStudents} />
          <DailyQueueGroup title="Cursos en riesgo" items={visibleCourses} />
        </div>
      )}

      {hiddenCount > 0 ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Hay {hiddenCount} {pluralize(hiddenCount, 'caso más', 'casos más')} para revisar en reportes.
        </p>
      ) : null}
    </section>
  )
}

function getInstitutionSummary({
  averageTone,
  attendanceHealthTone,
  criticalCoursesTone,
}: {
  averageTone: Tone
  attendanceHealthTone: Tone
  criticalCoursesTone: Tone
}) {
  if (
    averageTone === 'rose' ||
    attendanceHealthTone === 'rose' ||
    criticalCoursesTone === 'rose'
  ) {
    return {
      label: 'Requiere intervención',
      tone: 'rose' as Tone,
      description: 'Hay situaciones académicas que conviene revisar hoy.',
    }
  }

  if (
    averageTone === 'amber' ||
    attendanceHealthTone === 'amber' ||
    criticalCoursesTone === 'amber'
  ) {
    return {
      label: 'Con seguimiento',
      tone: 'amber' as Tone,
      description: 'Hay situaciones académicas para seguir de cerca.',
    }
  }

  return {
    label: 'Salud estable',
    tone: 'emerald' as Tone,
    description: 'Los indicadores principales no muestran casos prioritarios.',
  }
}

function getDashboardHealthSummary(dashboard: AdminDashboardResponse) {
  const averageTone =
    typeof dashboard.currentPeriodAverage === 'number'
      ? gradeTone(dashboard.currentPeriodAverage)
      : 'neutral'
  const attendanceHealthTone =
    typeof dashboard.institutionalAttendanceAverage === 'number'
      ? attendanceTone(dashboard.institutionalAttendanceAverage)
      : 'neutral'
  const criticalCoursesTone = countTone(dashboard.criticalCourses?.length ?? 0, 1)
  const summary = getInstitutionSummary({
    averageTone,
    attendanceHealthTone,
    criticalCoursesTone,
  })

  if (summary.tone === 'rose') {
    return {
      label: 'Riesgo institucional',
      tone: 'rose' as Tone,
      description: summary.description,
    }
  }

  if (summary.tone === 'amber') {
    return {
      label: 'Atención moderada',
      tone: 'amber' as Tone,
      description: summary.description,
    }
  }

  return {
    label: 'Salud estable',
    tone: 'emerald' as Tone,
    description: summary.description,
  }
}

function AgendaDialogRow({ item }: { item: AgendaItem }) {
  const secondaryText = [item.courseDescription, item.detail].filter(Boolean).join(' · ')

  return (
    <Link
      href={item.href}
      className="group grid min-w-0 gap-2 px-4 py-3 transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:grid-cols-[92px_minmax(0,1fr)_auto] sm:items-center"
    >
      <span className="grid min-w-0 grid-cols-[48px_minmax(0,1fr)] items-start gap-2 sm:block">
        <span className="block text-sm font-semibold tabular-nums text-foreground">
          {item.timeLabel}
        </span>
        <span className="block text-xs leading-5 text-muted-foreground sm:mt-0.5">
          {formatAgendaFullDateLabel(item.date)}
        </span>
      </span>

      <span className="min-w-0">
        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-semibold leading-5 text-foreground group-hover:text-primary">
            {item.courseName}
          </span>
          <span className="rounded-md bg-muted/35 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {item.type}
          </span>
        </span>
        {secondaryText ? (
          <span className="mt-0.5 block break-words text-xs leading-5 text-muted-foreground">
            {secondaryText}
          </span>
        ) : null}
      </span>

      <span className="hidden text-xs font-semibold text-primary sm:inline-flex">
        Ver
      </span>
    </Link>
  )
}

function AgendaDialog({ items }: { items: AgendaItem[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          Ver agenda completa
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] gap-0 overflow-hidden rounded-2xl border-border/60 bg-card p-0 shadow-lg sm:max-w-2xl">
        <DialogHeader className="gap-1 px-4 pb-3 pt-4 pr-12">
          <DialogTitle className="text-base">Agenda completa</DialogTitle>
          <DialogDescription>
            Clases próximas ordenadas por fecha.
          </DialogDescription>
        </DialogHeader>

        <div className="border-t border-border/50">
          {items.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={CalendarDays}
                title="No hay clases ni vencimientos próximos"
                description="La agenda está despejada por ahora."
              />
            </div>
          ) : (
            <ScrollArea className="max-h-[min(460px,calc(100vh-13rem))]">
              <div className="divide-y divide-border/45">
                {items.map((item) => (
                  <AgendaDialogRow key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ImmediateAgenda({
  classes,
  assignments,
}: {
  classes: DashboardUpcomingClass[]
  assignments: DashboardUpcomingAssignment[]
}) {
  const allItems = buildAgendaItems({ classes, assignments, limit: Number.MAX_SAFE_INTEGER })
  const visibleItems = allItems.slice(0, 3)
  const groupedItems = (['Hoy', 'Mañana', 'Próximamente'] as const)
    .map((group) => ({
      group,
      items: visibleItems.filter((item) => item.group === group),
    }))
    .filter(({ items }) => items.length > 0)

  return (
    <section className="rounded-2xl bg-card/80 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.035)] ring-1 ring-border/35 dark:bg-card/65">
      <SectionHeader
        title="Agenda inmediata"
        action={<AgendaDialog items={allItems} />}
      />

      {visibleItems.length === 0 ? (
        <div className="mt-2.5">
          <EmptyState
            icon={CalendarDays}
            title="Sin clases ni vencimientos próximos"
            description="La agenda está despejada por ahora."
          />
        </div>
      ) : (
        <div className="mt-2.5 space-y-2.5">
          {groupedItems.map(({ group, items }) => (
            <div key={group}>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {group}
              </p>
              <div className="space-y-1">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group grid min-w-0 grid-cols-[50px_minmax(0,1fr)] gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-xs font-semibold tabular-nums text-foreground">
                        {item.timeLabel}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] leading-4 text-muted-foreground">
                        {item.dateLabel}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block break-words text-sm font-semibold leading-5 text-foreground group-hover:text-primary">
                        {item.courseName}
                      </span>
                      <span className="mt-0.5 block break-words text-xs leading-5 text-muted-foreground">
                        {[item.courseDescription, item.detail].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

type InstitutionalSnapshotMetric = {
  id: string
  label: string
  value: string
  tone: Tone
  icon: ComponentType<{ className?: string }>
  href?: string
}

function buildInstitutionalSnapshotMetrics({
  dashboard,
  openFollowUpsCount,
}: {
  dashboard: AdminDashboardResponse
  openFollowUpsCount: number
}) {
  const criticalCourseCount = dashboard.criticalCourses?.length ?? 0
  const metrics: InstitutionalSnapshotMetric[] = [
    {
      id: 'active-students',
      label: 'Alumnos activos',
      value: dashboard.overview.studentsCount.toLocaleString(),
      tone: dashboard.overview.studentsCount > 0 ? 'emerald' : 'neutral',
      icon: Users,
      href: '/admin/dashboard/students',
    },
    {
      id: 'active-teachers',
      label: 'Docentes activos',
      value: dashboard.overview.teachersCount.toLocaleString(),
      tone: dashboard.overview.teachersCount > 0 ? 'emerald' : 'neutral',
      icon: UserRoundCheck,
      href: '/admin/dashboard/teachers',
    },
    {
      id: 'active-courses',
      label: 'Cursos activos',
      value: dashboard.overview.activeCoursesCount.toLocaleString(),
      tone: dashboard.overview.activeCoursesCount > 0 ? 'emerald' : 'neutral',
      icon: BookOpen,
      href: '/admin/dashboard/courses',
    },
    {
      id: 'pending-follow-ups',
      label: 'Seguimientos abiertos',
      value: openFollowUpsCount.toLocaleString(),
      tone: openFollowUpsCount > 0 ? 'amber' : 'emerald',
      icon: ClipboardCheck,
      href: '/admin/dashboard/courses',
    },
    {
      id: 'critical-courses',
      label: 'Cursos en riesgo',
      value: criticalCourseCount.toLocaleString(),
      tone: criticalCourseCount > 0 ? 'rose' : 'emerald',
      icon: BarChart3,
      href: '/admin/dashboard/courses',
    },
  ]

  if (typeof dashboard.institutionalAttendanceAverage === 'number') {
    metrics.push({
      id: 'attendance-average',
      label: 'Asistencia promedio',
      value: `${dashboard.institutionalAttendanceAverage.toFixed(0)}%`,
      tone: attendanceTone(dashboard.institutionalAttendanceAverage),
      icon: CalendarDays,
      href: '/admin/dashboard/reports/attendance',
    })
  }

  if (typeof dashboard.currentPeriodAverage === 'number') {
    metrics.push({
      id: 'institutional-average',
      label: 'Promedio institucional',
      value: dashboard.currentPeriodAverage.toFixed(0),
      tone: gradeTone(dashboard.currentPeriodAverage),
      icon: GraduationCap,
      href: '/admin/dashboard/reports/marks',
    })
  }

  return metrics
}

function InstitutionalSnapshotMetricRow({ metric }: { metric: InstitutionalSnapshotMetric }) {
  const Icon = metric.icon
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-2">
        <span className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/25 dark:bg-muted/15',
          toneStyles[metric.tone].text,
        )}>
          <Icon className="size-3.5" />
        </span>
        <span className="block min-w-0 truncate text-sm font-medium text-foreground">
          {metric.label}
        </span>
      </span>
      <span className={cn(
        'shrink-0 text-right text-sm font-semibold tabular-nums',
        toneStyles[metric.tone].text,
      )}>
        {metric.value}
      </span>
    </>
  )

  const className = 'grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-1.5'

  if (!metric.href) {
    return <div className={className}>{content}</div>
  }

  return (
    <Link
      href={metric.href}
      className={cn(
        className,
        'transition-colors hover:bg-muted/15 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
      )}
    >
      {content}
    </Link>
  )
}

function InstitutionalSnapshotSection({
  dashboard,
  openFollowUpsCount,
}: {
  dashboard: AdminDashboardResponse
  openFollowUpsCount: number
}) {
  const metrics = buildInstitutionalSnapshotMetrics({
    dashboard,
    openFollowUpsCount,
  })

  return (
    <section id="snapshot-institucional" className="scroll-mt-6 border-t border-border/45 pt-4">
      <div className="rounded-2xl bg-card/60 px-3 py-3 ring-1 ring-border/30 dark:bg-card/45 sm:px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Snapshot institucional
            </h2>
          </div>
          <Link
            href="/admin/dashboard/reports"
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            Ver reportes
            <ArrowRight className="ml-1 size-3.5" />
          </Link>
        </div>

        <div className="mt-2.5 grid gap-x-2 gap-y-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
          {metrics.map((metric) => (
            <InstitutionalSnapshotMetricRow key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function AdminDashboardView({
  dashboard,
  teacherSignals: _teacherSignals,
}: {
  dashboard: AdminDashboardResponse
  teacherSignals?: Profesor[]
}) {
  const studentsFollowUpItems = buildStudentsFollowUpItems(dashboard)
  const currentCourseRiskItems = buildCurrentCourseRiskItems(
    dashboard,
    studentsFollowUpItems,
  )
  const dailyQueueItems = buildDailyQueueItems({
    students: studentsFollowUpItems,
    currentCourses: currentCourseRiskItems,
  })
  const pendingCourseFollowUpItems = buildCoursePendingFollowUpItems(dashboard)
  const rawOpenFollowUpItems = dashboard.openFollowUps?.length
    ? dashboard.openFollowUps
    : buildOpenFollowUpFallback(pendingCourseFollowUpItems)
  const openFollowUpItems = filterOpenFollowUpsAgainstDailyQueue(
    rawOpenFollowUpItems,
    dailyQueueItems,
  )
  const periodLabel = formatPeriodLabel(dashboard)
  const healthSummary = getDashboardHealthSummary(dashboard)

  return (
    <main className="flex-1 overflow-auto px-5 pb-4 pt-7 lg:px-8 lg:pb-5 lg:pt-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <AdminDashboardHeader
          queueCount={dailyQueueItems.length}
          periodLabel={periodLabel}
          healthSummary={healthSummary}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.22fr)_minmax(300px,0.78fr)] xl:items-start">
          <div className="space-y-4">
            <DailyWorkQueue items={dailyQueueItems} />
          </div>

          <aside className="space-y-4 xl:sticky xl:top-4">
            <ImmediateAgenda
              classes={dashboard.upcomingClasses ?? []}
              assignments={dashboard.upcomingAssignments ?? []}
            />
          </aside>
        </div>

        <OpenFollowUpsSection items={openFollowUpItems} />

        <InstitutionalSnapshotSection
          dashboard={dashboard}
          openFollowUpsCount={openFollowUpItems.length}
        />
      </div>
    </main>
  )
}
