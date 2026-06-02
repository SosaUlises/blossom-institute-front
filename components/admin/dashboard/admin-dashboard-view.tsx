import Link from 'next/link'
import type { ComponentType, ReactNode } from 'react'
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Inbox,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
  UserPlus,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import type {
  AdminDashboardResponse,
  DashboardAverageGradeByCourse,
  DashboardCriticalCourse,
  DashboardCourseTrendRisk,
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
  unloadedAttendanceCount: number
  coursesAtRiskCount: number
  mainSignal: string
  reasons: string[]
  severity: SignalSeverity
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
  { label: 'Nuevo alumno', href: '/admin/dashboard/students/new', icon: UserPlus, priority: 'primary' },
  { label: 'Nuevo docente', href: '/admin/dashboard/teachers/new', icon: GraduationCap, priority: 'secondary' },
  { label: 'Nuevo curso', href: '/admin/dashboard/courses/new', icon: Plus, priority: 'secondary' },
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

function getTeacherOperationalReasons(teacher: Profesor) {
  const reasons: string[] = []
  const coursesAtRiskCount = teacher.coursesAtRiskCount ?? 0
  const pendingCorrectionsCount = teacher.pendingCorrectionsCount ?? 0
  const unloadedAttendanceCount = teacher.unloadedAttendanceCount ?? 0

  if (coursesAtRiskCount > 0) {
    reasons.push(
      coursesAtRiskCount === 1
        ? '1 curso requiere atención'
        : `${coursesAtRiskCount} cursos requieren atención`,
    )
  }

  if (pendingCorrectionsCount > 0) {
    reasons.push(
      pendingCorrectionsCount === 1
        ? '1 corrección pendiente'
        : `${pendingCorrectionsCount} correcciones pendientes`,
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
      const unloadedAttendanceCount = teacher.unloadedAttendanceCount ?? 0
      const severity: SignalSeverity = coursesAtRiskCount > 0 ? 'critical' : 'attention'

      return {
        id: teacher.id,
        fullName: getTeacherFullName(teacher),
        email: teacher.email,
        avatarUrl: teacher.avatarUrl,
        studentsCount: teacher.studentsCount ?? 0,
        pendingCorrectionsCount,
        unloadedAttendanceCount,
        coursesAtRiskCount,
        mainSignal: teacher.mainSignal || reasons[0] || 'Sin señales pendientes',
        reasons,
        severity,
      }
    })
    .filter((teacher) => teacher.reasons.length > 0)
    .sort((a, b) => {
      const severityWeight = { critical: 0, attention: 1, healthy: 2 }
      const severityDiff = severityWeight[a.severity] - severityWeight[b.severity]
      if (severityDiff !== 0) return severityDiff

      const aSignals =
        a.coursesAtRiskCount + a.pendingCorrectionsCount + a.unloadedAttendanceCount
      const bSignals =
        b.coursesAtRiskCount + b.pendingCorrectionsCount + b.unloadedAttendanceCount

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
    return 'Sin alertas en el trimestre actual ni seguimiento pendiente prioritario.'
  }

  return 'Casos separados por riesgo actual, seguimiento pendiente y tendencias.'
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
  alertCount,
  periodLabel,
}: {
  alertCount: number
  periodLabel: string
}) {
  const hasAlerts = alertCount > 0
  const summary = getAcademicAlertSummary(alertCount)

  return (
    <header className="flex flex-col gap-4 border-b border-border/45 pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium capitalize text-muted-foreground">
          {formatTodayLabel()} · {periodLabel}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Gestión institucional
          </h1>
          <span className={cn('text-sm font-medium', hasAlerts ? toneStyles.amber.text : toneStyles.emerald.text)}>
            {hasAlerts
              ? `${alertCount} ${pluralize(alertCount, 'situación para revisar', 'situaciones para revisar')}`
              : 'Sin alertas prioritarias'}
          </span>
        </div>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          {summary}
        </p>
      </div>

      <QuickActionsToolbar />
    </header>
  )
}

function AcademicExecutiveSummary({ items }: { items: AcademicSummaryItem[] }) {
  return (
    <div className="border-b border-border/35 pb-4">
      <p className="text-sm font-semibold leading-5 text-foreground">
        Resumen de señales
      </p>
      {items.length === 0 ? (
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          No hay alumnos ni cursos marcados para seguimiento inmediato.
        </p>
      ) : (
        <ul className="mt-2 grid gap-1 text-sm leading-6 text-muted-foreground">
          {items.map((item) => (
            <li key={item.id} className="flex min-w-0 items-start gap-2">
              <span className={cn('mt-2 size-1.5 shrink-0 rounded-full', toneStyles[item.tone].icon)} />
              <span className="min-w-0">{item.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function DetailMetric({
  label,
  value,
  context,
  tone = 'neutral',
}: {
  label: string
  value: string
  context?: string | null
  tone?: Tone
}) {
  return (
    <div className="rounded-xl bg-muted/15 px-3 py-2.5 dark:bg-muted/10">
      <p className="text-[11px] font-medium leading-4 text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-base font-semibold tabular-nums text-foreground', toneStyles[tone].text)}>
        {value}
      </p>
      {context ? (
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{context}</p>
      ) : null}
    </div>
  )
}

function DetailList({
  title,
  items,
  empty,
}: {
  title: string
  items: string[]
  empty: string
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm leading-6 text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2 className="mt-1 size-3.5 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function SignalPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: Tone
}) {
  return (
    <span className={cn('inline-flex h-7 items-center whitespace-nowrap rounded-lg px-2 text-xs font-semibold', toneStyles[tone].surface)}>
      {children}
    </span>
  )
}

function CourseSignalMetric({
  label,
  value,
  detail,
  tone,
}: {
  label: string
  value: string
  detail?: string | null
  tone: Tone
}) {
  return (
    <div className="min-w-0 rounded-lg bg-muted/15 px-2.5 py-2 dark:bg-muted/10">
      <p className="text-[11px] font-medium leading-4 text-muted-foreground">
        {label}
      </p>
      <p className={cn('mt-1 text-sm font-semibold tabular-nums text-foreground', toneStyles[tone].text)}>
        {value}
      </p>
      {detail ? (
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
          {detail}
        </p>
      ) : null}
    </div>
  )
}

function StudentFollowUpRow({
  item,
  consecutiveWindowLabel,
}: {
  item: StudentFollowUpItem
  consecutiveWindowLabel: string
}) {
  const attendanceLabel = metricValue(item.attendancePercentage, { percent: true })
  const averageLabel = metricValue(item.averageGrade, { decimals: 0 })
  const primaryReason = item.reasons[0] ?? 'Requiere seguimiento académico'
  const consecutiveLabel =
    typeof item.consecutiveAbsences === 'number'
      ? `${item.consecutiveAbsences}`
      : 'Sin registro'
  const absenceContext =
    typeof item.absences === 'number' && typeof item.classesTotal === 'number'
      ? `${item.absences} ausencias sobre ${item.classesTotal} clases`
      : null
  const attendanceMetricLabel =
    typeof item.absences === 'number' || typeof item.classesTotal === 'number'
      ? 'Asistencia trimestral'
      : `Asistencia ${consecutiveWindowLabel}`
  const averageBadgeValue =
    typeof item.averageGrade === 'number' && !item.recentGradeAlerts[0]
      ? item.averageGrade
      : null
  const attendanceBadgeValue =
    typeof item.attendancePercentage === 'number' && item.attendancePercentage < 85
      ? item.attendancePercentage
      : null

  return (
    <Sheet>
      <article className="group rounded-xl border border-border/55 bg-background/45 px-3.5 py-3 transition-colors hover:bg-muted/15 dark:bg-background/25">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <StudentPhoto name={item.alumnoNombre} avatarUrl={item.alumnoAvatarUrl} />
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-semibold leading-5 text-foreground">
                {item.alumnoNombre}
              </p>
              <p className="mt-0.5 break-words text-xs leading-5 text-muted-foreground">
                <CourseNameWithDescription
                  name={item.cursoNombre}
                  description={item.cursoDescripcion}
                />
              </p>
              <p className="mt-1 text-xs font-medium leading-5 text-foreground/80">
                {primaryReason}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:max-w-[220px] sm:justify-end">
            {item.recentGradeAlerts[0] ? (
              <SignalPill tone={gradeTone(item.recentGradeAlerts[0].grade)}>
                Nota {item.recentGradeAlerts[0].grade.toFixed(0)}
              </SignalPill>
            ) : null}
            {averageBadgeValue !== null ? (
              <SignalPill tone={gradeTone(averageBadgeValue)}>
                Prom. {averageLabel}
              </SignalPill>
            ) : null}
            {attendanceBadgeValue !== null ? (
              <SignalPill tone={attendanceTone(attendanceBadgeValue)}>
                Asistencia {attendanceLabel}
              </SignalPill>
            ) : null}
            <Link
              href={`/admin/dashboard/students/${item.alumnoId}/profile`}
              className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              Ver seguimiento
              <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </div>
        </div>
      </article>

      <SheetContent side="right" className="w-full gap-0 overflow-hidden p-0 sm:max-w-xl">
        <ScrollArea className="h-full">
          <SheetHeader className="border-b border-border/50 p-5 pr-12">
            <div className="flex items-start gap-3">
              <StudentPhoto name={item.alumnoNombre} avatarUrl={item.alumnoAvatarUrl} />
              <div className="min-w-0">
                <SheetTitle className="text-lg">{item.alumnoNombre}</SheetTitle>
                <SheetDescription>
                  {item.cursoNombre}
                  {item.cursoDescripcion ? `, ${item.cursoDescripcion}` : ''}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-6 p-5">
            <div className="grid gap-2 sm:grid-cols-3">
              {typeof item.attendancePercentage === 'number' ? (
                <DetailMetric
                  label={attendanceMetricLabel}
                  value={attendanceLabel}
                  context={absenceContext}
                  tone={attendanceTone(item.attendancePercentage)}
                />
              ) : null}
              {typeof item.averageGrade === 'number' ? (
                <DetailMetric
                  label="Promedio trimestral"
                  value={averageLabel}
                  context="Trimestre actual"
                  tone={gradeTone(item.averageGrade)}
                />
              ) : null}
              {typeof item.consecutiveAbsences === 'number' ? (
                <DetailMetric
                  label="Ausencias consecutivas"
                  value={consecutiveLabel}
                  context={formatShortDate(item.lastAbsenceDate) ? `${consecutiveWindowLabel} · última: ${formatShortDate(item.lastAbsenceDate)}` : consecutiveWindowLabel}
                  tone="amber"
                />
              ) : null}
            </div>

            <DetailList
              title="Por qué aparece acá"
              items={item.reasons}
              empty="No hay motivos adicionales en el resumen actual."
            />

            <section>
              <h3 className="text-sm font-semibold text-foreground">Calificaciones con alerta</h3>
              {item.recentGradeAlerts.length === 0 ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  No hay calificaciones bajas individuales en este resumen.
                </p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {item.recentGradeAlerts.map((grade) => (
                    <div
                      key={grade.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-xl bg-muted/15 px-3 py-2.5 text-sm dark:bg-muted/10"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">{grade.title}</span>
                        <span className="text-xs text-muted-foreground">{formatShortDate(grade.date) ?? 'Sin fecha'}</span>
                      </span>
                      <span className={cn('font-semibold tabular-nums', toneStyles[gradeTone(grade.grade)].text)}>
                        {grade.grade.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <DetailList
              title="Señales de riesgo"
              items={item.riskSignals}
              empty="No hay señales adicionales disponibles."
            />

            <DetailList
              title="Acciones sugeridas"
              items={item.suggestedActions}
              empty="No hay acciones sugeridas para este caso."
            />

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

function CourseFollowUpRow({
  item,
  comparisonLabel,
}: {
  item: CourseHealthItem
  comparisonLabel: string
}) {
  const categoryTone: Tone =
    item.category === 'current'
      ? severityTone(item.severity)
      : item.category === 'pending'
        ? 'amber'
        : 'primary'
  const categoryLabel =
    item.category === 'current'
      ? 'Riesgo actual'
      : item.category === 'pending'
        ? 'Seguimiento pendiente'
        : 'Tendencia'
  const categoryContext =
    item.category === 'current'
      ? 'Trimestre actual'
      : item.category === 'pending'
        ? 'Seguimiento pendiente del trimestre anterior'
        : 'Historial reciente'
  const averageLabel =
    item.averageGrade !== undefined && item.averageGrade !== null
      ? item.averageGrade.toFixed(0)
      : null
  const attendanceLabel =
    item.attendancePercentage !== undefined && item.attendancePercentage !== null
      ? `${item.attendancePercentage.toFixed(0)}%`
      : null
  const teacherLabel = item.profesoresNombres?.length
    ? item.profesoresNombres.join(', ')
    : 'Sin docente asignado'
  const performanceTrend = formatTrendDetail(item.performanceDelta, 'pts', comparisonLabel)
  const attendanceTrend = formatTrendDetail(item.attendanceDelta, 'pp', comparisonLabel)
  const compactPerformanceTrend = formatCompactTrend(item.performanceDelta, 'pts', comparisonLabel)
  const compactAttendanceTrend = formatCompactTrend(item.attendanceDelta, 'pp', comparisonLabel)
  const averageTone = item.averageGrade == null ? 'neutral' : gradeTone(item.averageGrade)
  const courseAttendanceTone = item.attendancePercentage == null ? 'neutral' : attendanceTone(item.attendancePercentage)
  const affectedStudentsLabel = `${item.affectedStudentsCount} ${pluralize(
    item.affectedStudentsCount,
    'alumno',
    'alumnos',
  )}`
  const pendingFollowUpLabel = `${item.pendingFollowUpCount ?? 0} ${pluralize(
    item.pendingFollowUpCount ?? 0,
    'pendiente',
    'pendientes',
  )}`
  const reasonSummary = item.reasons.slice(0, 3).join(' · ')

  return (
    <Sheet>
      <article className="rounded-xl border border-border/55 bg-background/45 px-3.5 py-3 transition-colors hover:bg-muted/15 dark:bg-background/25">
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <p className="min-w-0 text-sm font-semibold leading-5 text-foreground">
                <CourseTitleLine
                  name={item.cursoNombre}
                  description={item.cursoDescripcion}
                />
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <SubtleState tone={categoryTone}>{categoryLabel}</SubtleState>
                <span className="text-xs font-medium text-muted-foreground">
                  {categoryContext}
                </span>
              </div>
            </div>
            <Link
              href={`/admin/dashboard/courses/${item.cursoId}/profile`}
              className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:justify-start"
            >
              Ver curso
              <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {averageLabel ? (
              <CourseSignalMetric
                label={item.category === 'trend' ? 'Promedio en historial reciente' : 'Promedio trimestre actual'}
                value={averageLabel}
                detail={compactPerformanceTrend}
                tone={averageTone}
              />
            ) : null}
            {attendanceLabel ? (
              <CourseSignalMetric
                label={item.category === 'trend' ? 'Asistencia en historial reciente' : 'Asistencia trimestre actual'}
                value={attendanceLabel}
                detail={compactAttendanceTrend}
                tone={courseAttendanceTone}
              />
            ) : null}
            {item.category === 'pending' ? (
              <CourseSignalMetric
                label="Seguimiento pendiente"
                value={pendingFollowUpLabel}
                detail="Con seguimiento pendiente"
                tone={countTone(item.pendingFollowUpCount ?? 0, 2)}
              />
            ) : (
              <CourseSignalMetric
                label="Alumnos afectados"
                value={affectedStudentsLabel}
                detail={item.affectedStudentsCount > 0 ? 'Casos actuales asociados' : 'Sin alumnos actuales asociados'}
                tone={countTone(item.affectedStudentsCount, 2)}
              />
            )}
          </div>

          {reasonSummary ? (
            <p className="text-xs font-medium leading-5 text-muted-foreground">
              {reasonSummary}
            </p>
          ) : null}
        </div>
      </article>

      <SheetContent side="right" className="w-full gap-0 overflow-hidden p-0 sm:max-w-xl">
        <ScrollArea className="h-full">
          <SheetHeader className="border-b border-border/50 p-5 pr-12">
            <SheetTitle className="text-lg">{item.cursoNombre}</SheetTitle>
            <SheetDescription>
              {[item.cursoDescripcion, teacherLabel].filter(Boolean).join(', ')}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 p-5">
            <div className="grid gap-2 sm:grid-cols-3">
              {averageLabel ? (
                <DetailMetric
                  label="Promedio trimestral"
                  value={averageLabel}
                  context={performanceTrend ?? (item.previousAverageGrade == null ? `Sin comparación con ${comparisonLabel}` : `Anterior: ${item.previousAverageGrade.toFixed(0)}`)}
                  tone={item.averageGrade == null ? 'neutral' : gradeTone(item.averageGrade)}
                />
              ) : null}
              {attendanceLabel ? (
                <DetailMetric
                  label={item.category === 'trend' ? 'Asistencia historial reciente' : 'Asistencia trimestre actual'}
                  value={attendanceLabel}
                  context={attendanceTrend ?? (item.previousAttendancePercentage == null ? `Sin comparación con ${comparisonLabel}` : `Anterior: ${item.previousAttendancePercentage.toFixed(0)}%`)}
                  tone={item.attendancePercentage == null ? 'neutral' : attendanceTone(item.attendancePercentage)}
                />
              ) : null}
              {item.category === 'pending' ? (
                <DetailMetric
                  label="Seguimiento pendiente"
                  value={String(item.pendingFollowUpCount ?? 0)}
                  context="Seguimiento pendiente del trimestre anterior"
                  tone={countTone(item.pendingFollowUpCount ?? 0, 2)}
                />
              ) : (
                <DetailMetric
                  label="Alumnos afectados"
                  value={String(item.affectedStudentsCount)}
                  context={item.category === 'current' ? 'Riesgo actual' : 'Historial reciente'}
                  tone={countTone(item.affectedStudentsCount, 2)}
                />
              )}
            </div>

            <DetailList
              title="Por qué aparece acá"
              items={item.reasons}
              empty="No hay motivos adicionales en el resumen actual."
            />

            <section>
              <h3 className="text-sm font-semibold text-foreground">Docente</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{teacherLabel}</p>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-foreground">Alumnos afectados</h3>
              {item.affectedStudents.length === 0 ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  No hay alumnos individuales asociados a esta alerta en el resumen actual.
                </p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {item.affectedStudents.map((student) => (
                    <Link
                      key={student.id}
                      href={`/admin/dashboard/students/${student.alumnoId}/profile`}
                      className="flex items-start gap-2.5 rounded-xl bg-muted/15 px-3 py-2.5 transition-colors hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 dark:bg-muted/10"
                    >
                      <StudentPhoto
                        name={student.alumnoNombre}
                        avatarUrl={student.alumnoAvatarUrl}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {student.alumnoNombre}
                        </span>
                        <span className="mt-0.5 block line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {student.reasons.join(', ')}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

function TeacherOperationalRow({ item }: { item: TeacherOperationalItem }) {
  const tone = severityTone(item.severity)

  return (
    <Link
      href={`/admin/dashboard/teachers/${item.id}/profile`}
      className="group block rounded-xl border border-border/55 bg-background/45 px-3.5 py-3 transition-colors hover:bg-muted/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 dark:bg-background/25"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <TeacherPhoto name={item.fullName} avatarUrl={item.avatarUrl} />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-semibold leading-5 text-foreground">
                {item.fullName}
              </span>
              <SubtleState tone={tone}>
                {item.severity === 'critical' ? 'Crítico' : 'Seguimiento'}
              </SubtleState>
            </span>
            <span className="mt-0.5 block truncate text-xs leading-5 text-muted-foreground">
              {item.email}
            </span>
            <span className="mt-1 block text-xs font-medium leading-5 text-foreground/80">
              {item.mainSignal}
            </span>
          </span>
        </div>

        <span className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {item.coursesAtRiskCount > 0 ? (
            <SignalPill tone="rose">
              {item.coursesAtRiskCount} {pluralize(item.coursesAtRiskCount, 'curso', 'cursos')}
            </SignalPill>
          ) : null}
          {item.pendingCorrectionsCount > 0 ? (
            <SignalPill tone="amber">
              {item.pendingCorrectionsCount} {pluralize(item.pendingCorrectionsCount, 'corrección', 'correcciones')}
            </SignalPill>
          ) : null}
          {item.unloadedAttendanceCount > 0 ? (
            <SignalPill tone="amber">
              {item.unloadedAttendanceCount} {pluralize(item.unloadedAttendanceCount, 'asistencia', 'asistencias')}
            </SignalPill>
          ) : null}
          <span className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary/10">
            Ver seguimiento
            <ArrowRight className="ml-1 size-3.5" />
          </span>
        </span>
      </div>
    </Link>
  )
}

function TeacherOperationalPanel({ teachers }: { teachers: Profesor[] }) {
  const teacherItems = buildTeacherOperationalItems(teachers)

  if (teacherItems.length === 0) return null

  return (
    <section className="mt-5 min-w-0">
      <SectionHeader
        title="Seguimiento docente"
        description="Señales operativas con acceso directo al perfil del docente."
      />
      <div className="mt-2 grid gap-2 xl:grid-cols-2">
        {teacherItems.map((item) => (
          <TeacherOperationalRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

function CourseRiskGroup({
  title,
  description,
  emptyTitle,
  emptyDescription,
  items,
  comparisonLabel,
}: {
  title: string
  description: string
  emptyTitle: string
  emptyDescription: string
  items: CourseHealthItem[]
  comparisonLabel: string
}) {
  return (
    <section className="min-w-0 rounded-xl border border-border/45 bg-background/35 p-3 dark:bg-background/20">
      <SectionHeader title={title} description={description} />
      <div className="mt-2 space-y-2">
        {items.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          items.map((item) => (
            <CourseFollowUpRow
              key={item.id}
              item={item}
              comparisonLabel={comparisonLabel}
            />
          ))
        )}
      </div>
    </section>
  )
}

function AcademicAttentionPanel({
  dashboard,
  teacherSignals,
}: {
  dashboard: AdminDashboardResponse
  teacherSignals: Profesor[]
}) {
  const studentsFollowUpItems = buildStudentsFollowUpItems(dashboard)
  const currentCourseRiskItems = buildCurrentCourseRiskItems(dashboard, studentsFollowUpItems)
  const pendingCourseFollowUpItems = buildCoursePendingFollowUpItems(dashboard)
  const courseTrendItems = buildCourseTrendItems(dashboard)
  const academicSummaryItems = buildAcademicSummaryItems(dashboard, studentsFollowUpItems)
  const comparisonLabel = getTrendComparisonLabel(dashboard)
  const consecutiveWindowLabel = getConsecutiveAbsencesWindowLabel(dashboard)

  return (
    <section className="rounded-2xl bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] ring-1 ring-border/60 dark:bg-card/80 sm:p-5">
      <AcademicExecutiveSummary items={academicSummaryItems} />

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="min-w-0">
          <SectionHeader
            title="Alumnos que requieren seguimiento"
            description="Riesgo actual del trimestre actual y señales de pérdida de continuidad."
          />
          <div className="mt-2 space-y-2">
            {studentsFollowUpItems.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No hay alumnos en seguimiento."
                description="No hay alumnos con señales académicas en los datos actuales."
              />
            ) : (
              studentsFollowUpItems.map((item) => (
                <StudentFollowUpRow
                  key={item.id}
                  item={item}
                  consecutiveWindowLabel={consecutiveWindowLabel}
                />
              ))
            )}
          </div>
        </section>

        <section className="min-w-0 space-y-3">
          <SectionHeader
            title="Cursos"
            description="Riesgo actual, seguimiento pendiente y tendencias separados por contexto."
          />
          <CourseRiskGroup
            title="Riesgo actual"
            description="Cursos con alertas del trimestre actual."
            emptyTitle="Sin alertas en el trimestre actual"
            emptyDescription="No hay cursos con riesgo actual en el trimestre actual."
            items={currentCourseRiskItems}
            comparisonLabel={comparisonLabel}
          />
          <CourseRiskGroup
            title="Seguimiento pendiente"
            description="Seguimiento pendiente del trimestre anterior o historial reciente no resuelto."
            emptyTitle="Sin seguimiento pendiente"
            emptyDescription="No hay cursos con seguimiento pendiente del trimestre anterior."
            items={pendingCourseFollowUpItems}
            comparisonLabel={comparisonLabel}
          />
          <CourseRiskGroup
            title="Tendencias"
            description="Historial reciente comparado con el período anterior."
            emptyTitle="Sin tendencias negativas"
            emptyDescription="No hay cursos con caída relevante en historial reciente."
            items={courseTrendItems}
            comparisonLabel={comparisonLabel}
          />
        </section>
      </div>

      <TeacherOperationalPanel teachers={teacherSignals} />
    </section>
  )
}

function InstitutionalTrendRow({ item }: { item: InstitutionalTrendItem }) {
  return (
    <Link
      href={item.href}
      className="grid gap-3 rounded-xl bg-background/45 px-3 py-3 ring-1 ring-border/35 transition-colors hover:bg-muted/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 dark:bg-background/25 sm:grid-cols-[auto_minmax(0,1fr)]"
    >
      <span className={cn('text-xl font-semibold leading-none tabular-nums tracking-tight', toneStyles[item.tone].text)}>
        {item.value}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-5 text-foreground">
          {item.label}
        </span>
        <span className={cn('mt-0.5 block text-xs font-medium leading-5', toneStyles[item.tone].text)}>
          {item.detail}
        </span>
      </span>
    </Link>
  )
}

function InstitutionalDirectionPanel({ dashboard }: { dashboard: AdminDashboardResponse }) {
  const items = buildInstitutionalTrendItems(dashboard)
  const declineSummary = buildCourseDeclineSummary(dashboard)

  return (
    <section className="rounded-2xl bg-card/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] ring-1 ring-border/35 dark:bg-card/65 sm:p-5">
      <SectionHeader
        title="Evolución institucional"
        description={`Lectura del trimestre comparada con el ${getTrendComparisonLabel(dashboard)}.`}
      />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <InstitutionalTrendRow key={item.id} item={item} />
        ))}
      </div>
      <div className={cn('mt-3 rounded-xl px-3 py-2.5 text-sm leading-6', toneStyles[declineSummary.tone].surface)}>
        {declineSummary.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </section>
  )
}

function HealthSnapshotMetric({
  label,
  value,
  href,
  tone,
  trend,
}: {
  label: string
  value: string
  href: string
  tone: Tone
  trend?: {
    label: string
    tone: Tone
    icon: ComponentType<{ className?: string }>
    title: string
  }
}) {
  const TrendIcon = trend?.icon
  return (
    <Link
      href={href}
      className="block rounded-xl bg-background/45 p-3 ring-1 ring-border/35 transition-colors hover:bg-muted/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 dark:bg-background/25"
    >
      <p className="text-xs font-medium leading-5 text-muted-foreground">{label}</p>
      <p className={cn('mt-2 text-2xl font-semibold leading-none tabular-nums tracking-tight text-foreground', toneStyles[tone].text)}>
        {value}
      </p>
      {trend && TrendIcon ? (
        <span
          title={trend.title}
          className={cn('mt-2 inline-flex items-center gap-1 text-xs font-medium leading-5', toneStyles[trend.tone].text)}
        >
          <TrendIcon className="size-3.5 shrink-0" />
          {trend.label}
        </span>
      ) : null}
    </Link>
  )
}

function HealthSupportMetric({
  label,
  value,
  context,
  href,
  tone,
}: {
  label: string
  value: string
  context: string
  href: string
  tone: Tone
}) {
  return (
    <Link
      href={href}
      className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-5 text-foreground">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{context}</span>
      </span>
      <span className={cn('text-sm font-semibold tabular-nums', toneStyles[tone].text)}>
        {value}
      </span>
    </Link>
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
    description: 'Los indicadores principales no muestran alertas prioritarias.',
  }
}

function InstitutionHealthPanel({ dashboard }: { dashboard: AdminDashboardResponse }) {
  const periodLabel = formatPeriodLabel(dashboard)
  const averageTone =
    typeof dashboard.currentPeriodAverage === 'number'
      ? gradeTone(dashboard.currentPeriodAverage)
      : 'neutral'
  const attendanceHealthTone =
    typeof dashboard.institutionalAttendanceAverage === 'number'
      ? attendanceTone(dashboard.institutionalAttendanceAverage)
      : 'neutral'
  const pendingCorrectionsTone = countTone(
    dashboard.institutionalHomeworkPendingCorrectionCount,
    5,
  )
  const criticalCoursesTone = countTone(dashboard.criticalCourses?.length ?? 0, 1)
  const summary = getInstitutionSummary({
    averageTone,
    attendanceHealthTone,
    criticalCoursesTone,
  })

  return (
    <section className="rounded-2xl bg-card/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] ring-1 ring-border/35 dark:bg-card/65">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Salud institucional
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{periodLabel}</p>
        </div>
        <SubtleState tone={summary.tone}>{summary.label}</SubtleState>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {summary.description}
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <HealthSnapshotMetric
          label="Promedio institucional trimestral"
          value={
            typeof dashboard.currentPeriodAverage === 'number'
              ? dashboard.currentPeriodAverage.toFixed(0)
              : 'Sin datos'
          }
          href="/admin/dashboard/reports/marks"
          tone={averageTone}
          trend={trendInfo(dashboard, 'average-grade', 'pts')}
        />
        <HealthSnapshotMetric
          label="Asistencia promedio trimestral"
          value={
            typeof dashboard.institutionalAttendanceAverage === 'number'
              ? `${dashboard.institutionalAttendanceAverage.toFixed(0)}%`
              : 'Sin datos'
          }
          href="/admin/dashboard/reports/attendance"
          tone={attendanceHealthTone}
          trend={trendInfo(dashboard, 'attendance', 'pp')}
        />
      </div>

      <div className="mt-4 space-y-1 border-t border-border/35 pt-3">
        <HealthSupportMetric
          label="Alumnos matriculados"
          value={dashboard.overview.studentsCount.toLocaleString()}
          context="Matrícula activa"
          href="/admin/dashboard/students"
          tone={dashboard.overview.studentsCount > 0 ? 'emerald' : 'amber'}
        />
        <HealthSupportMetric
          label="Cursos activos"
          value={dashboard.overview.activeCoursesCount.toLocaleString()}
          context="En cursada"
          href="/admin/dashboard/courses"
          tone={dashboard.overview.activeCoursesCount > 0 ? 'emerald' : 'amber'}
        />
        <HealthSupportMetric
          label="Tareas por corregir"
          value={dashboard.institutionalHomeworkPendingCorrectionCount.toLocaleString()}
          context="Revisión pendiente"
          href="/admin/dashboard/reports/homework"
          tone={pendingCorrectionsTone}
        />
        <HealthSupportMetric
          label="Cursos con riesgo actual"
          value={(dashboard.criticalCourses?.length ?? 0).toLocaleString()}
          context="Trimestre actual"
          href="/admin/dashboard/courses"
          tone={criticalCoursesTone}
        />
      </div>
    </section>
  )
}

function buildAgendaItems({
  classes,
  assignments,
}: {
  classes: DashboardUpcomingClass[]
  assignments: DashboardUpcomingAssignment[]
}) {
  const now = new Date()
  const classItems: AgendaItem[] = [...classes]
    .filter((item) => buildClassDateTime(item).getTime() >= now.getTime())
    .map((item, index) => {
      const date = buildClassDateTime(item)

      return {
        id: `class-${item.cursoId}-${item.proximaClase}-${item.horaInicio}-${index}`,
        date,
        group: getAgendaGroup(date),
        timeLabel: formatAgendaTime(date),
        dateLabel: item.diaSemana,
        courseName: item.cursoNombre,
        courseDescription: item.cursoDescripcion,
        href: `/admin/dashboard/courses/${item.cursoId}/profile`,
      }
    })

  const assignmentItems: AgendaItem[] = [...assignments]
    .filter((item) => buildAssignmentDateTime(item).getTime() >= now.getTime())
    .map((item) => {
      const date = buildAssignmentDateTime(item)

      return {
        id: `assignment-${item.tareaId}`,
        date,
        group: getAgendaGroup(date),
        timeLabel: formatAgendaTime(date),
        dateLabel: formatAgendaDateLabel(date),
        courseName: item.cursoNombre,
        courseDescription: item.cursoDescripcion,
        detail: item.titulo,
        href: `/admin/dashboard/courses/${item.cursoId}/profile`,
      }
    })

  return [...classItems, ...assignmentItems]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 8)
}

function ImmediateAgenda({
  classes,
  assignments,
}: {
  classes: DashboardUpcomingClass[]
  assignments: DashboardUpcomingAssignment[]
}) {
  const visibleItems = buildAgendaItems({ classes, assignments })
  const groupedItems = (['Hoy', 'Mañana', 'Próximamente'] as const)
    .map((group) => ({
      group,
      items: visibleItems.filter((item) => item.group === group),
    }))
    .filter(({ items }) => items.length > 0)

  return (
    <section className="rounded-2xl bg-card/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] ring-1 ring-border/35 dark:bg-card/65">
      <SectionHeader
        title="Agenda inmediata"
        description="Clases y vencimientos ordenados por fecha."
      />

      {visibleItems.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={CalendarDays}
            title="Sin agenda inmediata"
            description="No hay clases ni vencimientos próximos registrados."
          />
        </div>
      ) : (
        <div className="mt-4 space-y-5">
          {groupedItems.map(({ group, items }) => (
            <div key={group}>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                {group}
              </p>
              <div className="space-y-1">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group grid min-w-0 grid-cols-[58px_minmax(0,1fr)] gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
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

export function AdminDashboardView({
  dashboard,
  teacherSignals,
}: {
  dashboard: AdminDashboardResponse
  teacherSignals?: Profesor[]
}) {
  const studentsFollowUpItems = buildStudentsFollowUpItems(dashboard)
  const teacherOperationalItems = buildTeacherOperationalItems(teacherSignals ?? [])
  const academicAlertCount = buildAcademicSummaryItems(
    dashboard,
    studentsFollowUpItems,
  ).length + teacherOperationalItems.length
  const periodLabel = formatPeriodLabel(dashboard)

  return (
    <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <AdminDashboardHeader
          alertCount={academicAlertCount}
          periodLabel={periodLabel}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] xl:items-start">
          <div className="space-y-5">
            <AcademicAttentionPanel
              dashboard={dashboard}
              teacherSignals={teacherSignals ?? []}
            />
            <InstitutionalDirectionPanel dashboard={dashboard} />
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5">
            <InstitutionHealthPanel dashboard={dashboard} />
            <ImmediateAgenda
              classes={dashboard.upcomingClasses ?? []}
              assignments={dashboard.upcomingAssignments ?? []}
            />
          </aside>
        </div>
      </div>
    </main>
  )
}
