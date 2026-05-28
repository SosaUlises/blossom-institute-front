import Link from 'next/link'
import type { ComponentType, ReactNode } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Inbox,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type {
  AdminDashboardResponse,
  DashboardAverageGradeByCourse,
  DashboardCourseTrendRisk,
  DashboardUpcomingAssignment,
  DashboardUpcomingClass,
} from '@/lib/admin/dashboard/types'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'amber' | 'rose' | 'emerald' | 'primary'
type SignalSeverity = 'critical' | 'attention' | 'healthy'

type StudentFollowUpItem = {
  id: string
  alumnoId: number
  alumnoNombre: string
  alumnoAvatarUrl?: string | null
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  reasons: string[]
  badges: string[]
  severity: SignalSeverity
}

type CourseHealthItem = {
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  reasons: string[]
  averageGrade?: number | null
  attendancePercentage?: number | null
  performanceDelta?: number | null
  attendanceDelta?: number | null
  affectedStudentsCount: number
  pendingCorrectionCount?: number
  signalsCount: number
  severity: SignalSeverity
}

type AcademicSignalItem = {
  id: string
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
  cta: string
  tone: Tone
}

type AgendaItem = {
  id: string
  date: Date
  group: 'Hoy' | 'Mañana' | 'Próximamente'
  timeLabel: string
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

function formatPeriodLabel(dashboard: AdminDashboardResponse) {
  const date = dashboard.period?.from ? parseLocalDate(dashboard.period.from) : null

  if (!date || Number.isNaN(date.getTime())) {
    return 'Período actual'
  }

  const value = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(date)

  return value.charAt(0).toUpperCase() + value.slice(1)
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

  if (!trend || typeof trend.delta !== 'number') {
    return {
      label: 'Sin comparación previa',
      tone: 'neutral' as Tone,
      icon: Minus,
      title: 'No hay comparación con el mes anterior disponible.',
    }
  }

  if (trend.delta === 0) {
    return {
      label: 'Sin variación respecto al período anterior',
      tone: 'neutral' as Tone,
      icon: Minus,
      title: 'Sin cambios respecto al período anterior.',
    }
  }

  const improves = trend.delta > 0
  const direction = improves ? '↑' : '↓'
  const unitLabel = unit ? ` ${unit}` : ''

  return {
    label: `${direction} ${Math.abs(trend.delta).toFixed(1)}${unitLabel} respecto al período anterior`,
    tone: improves ? 'emerald' as Tone : 'amber' as Tone,
    icon: improves ? TrendingUp : TrendingDown,
    title: `${improves ? 'Sube' : 'Baja'} ${Math.abs(trend.delta).toFixed(1)}${unitLabel} respecto al período anterior.`,
  }
}

function formatTrendDetail(delta: number | null | undefined, unit: 'pts' | 'pp') {
  if (typeof delta !== 'number') return null
  if (delta === 0) return 'Sin variación respecto al período anterior'

  const direction = delta > 0 ? '↑' : '↓'
  return `${direction} ${Math.abs(delta).toFixed(1)} ${unit} respecto al período anterior`
}

function metricValue(value: number | null | undefined, options?: { percent?: boolean; decimals?: number }) {
  if (typeof value !== 'number') return 'N/D'

  const decimals = options?.decimals ?? 0
  const formatted = value.toFixed(decimals)
  return options?.percent ? `${formatted}%` : formatted
}

function addUnique(items: string[], value: string) {
  if (!items.includes(value)) items.push(value)
}

function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural
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
      reasons: [],
      badges: [],
      severity: 'healthy',
    }

    items.set(id, created)
    return created
  }

  for (const item of dashboard.studentsManualLowPerformance ?? []) {
    const row = ensureItem(item)
    addUnique(row.reasons, `Nota baja: ${item.titulo}`)
    addUnique(row.badges, `Nota ${item.nota.toFixed(2)}`)
    row.severity = mergeSeverity(row.severity, item.nota < 50 ? 'critical' : 'attention')
  }

  for (const item of dashboard.studentsAtRiskByAverage ?? []) {
    const row = ensureItem(item)
    addUnique(row.reasons, 'Promedio bajo en el período')
    addUnique(row.badges, `Prom. ${item.averageGrade.toFixed(2)}`)
    row.severity = mergeSeverity(row.severity, item.averageGrade < 50 ? 'critical' : 'attention')
  }

  for (const item of dashboard.studentsWithCombinedAcademicRisk ?? []) {
    const row = ensureItem(item)
    addUnique(row.reasons, 'Combina bajo rendimiento y baja asistencia')
    addUnique(row.badges, `Prom. ${item.averageGrade.toFixed(2)}`)
    addUnique(row.badges, `Asist. ${item.attendancePercentage.toFixed(0)}%`)
    row.severity = mergeSeverity(
      row.severity,
      item.averageGrade < 50 || item.attendancePercentage < 70 ? 'critical' : 'attention',
    )
  }

  for (const item of dashboard.studentsWithConsecutiveAbsences ?? []) {
    const row = ensureItem(item)
    addUnique(row.reasons, `${item.consecutiveAbsences} ausencias consecutivas`)
    addUnique(row.badges, `Asist. ${item.attendancePercentage.toFixed(0)}%`)
    row.severity = mergeSeverity(
      row.severity,
      item.consecutiveAbsences >= 3 || item.attendancePercentage < 70 ? 'critical' : 'attention',
    )
  }

  for (const item of dashboard.studentsWithMultipleAbsences ?? []) {
    const row = ensureItem(item)
    addUnique(
      row.reasons,
      item.attendancePercentage < 80
        ? 'Asistencia por debajo del umbral'
        : `${item.ausentes} ausencias este mes`,
    )
    addUnique(row.badges, `Asist. ${item.attendancePercentage.toFixed(0)}%`)
    row.severity = mergeSeverity(
      row.severity,
      item.ausentes >= 4 || item.attendancePercentage < 70 ? 'critical' : 'attention',
    )
  }

  return [...items.values()]
    .sort((a, b) => {
      const severityWeight = { critical: 0, attention: 1, healthy: 2 }
      return severityWeight[a.severity] - severityWeight[b.severity]
    })
    .slice(0, 8)
}

function buildCoursesHealthItems(dashboard: AdminDashboardResponse): CourseHealthItem[] {
  const items = new Map<number, CourseHealthItem>()
  const affectedStudentsByCourse = new Map<number, Set<number>>()

  function addAffectedStudent(cursoId: number, alumnoId: number) {
    const current = affectedStudentsByCourse.get(cursoId) ?? new Set<number>()
    current.add(alumnoId)
    affectedStudentsByCourse.set(cursoId, current)
  }

  for (const student of dashboard.studentsManualLowPerformance ?? []) {
    addAffectedStudent(student.cursoId, student.alumnoId)
  }

  for (const student of dashboard.studentsAtRiskByAverage ?? []) {
    addAffectedStudent(student.cursoId, student.alumnoId)
  }

  for (const student of dashboard.studentsWithMultipleAbsences ?? []) {
    addAffectedStudent(student.cursoId, student.alumnoId)
  }

  for (const student of dashboard.studentsWithConsecutiveAbsences ?? []) {
    addAffectedStudent(student.cursoId, student.alumnoId)
  }

  for (const student of dashboard.studentsWithCombinedAcademicRisk ?? []) {
    addAffectedStudent(student.cursoId, student.alumnoId)
  }

  function ensureItem(input: {
    cursoId: number
    cursoNombre: string
    cursoDescripcion?: string | null
  }) {
    const existing = items.get(input.cursoId)

    if (existing) {
      existing.cursoDescripcion = existing.cursoDescripcion ?? input.cursoDescripcion
      return existing
    }

    const created: CourseHealthItem = {
      cursoId: input.cursoId,
      cursoNombre: input.cursoNombre,
      cursoDescripcion: input.cursoDescripcion,
      reasons: [],
      affectedStudentsCount: affectedStudentsByCourse.get(input.cursoId)?.size ?? 0,
      signalsCount: 0,
      severity: 'healthy',
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
      row.performanceDelta = course.delta
    } else {
      row.attendancePercentage = row.attendancePercentage ?? course.currentValue
      row.attendanceDelta = course.delta
    }
    addUnique(row.reasons, label)
    row.signalsCount += 1
    row.severity = mergeSeverity(row.severity, getCourseSeverity(row))
  }

  for (const course of dashboard.coursesAtRiskByManualAverage ?? []) {
    addAverageRisk(course, 'Promedio manual bajo')
  }

  for (const course of getAdditionalOverallCourseRisks(dashboard)) {
    addAverageRisk(course, 'Promedio general bajo')
  }

  for (const course of dashboard.coursesAtRiskByAttendance ?? []) {
    const row = ensureItem(course)
    row.attendancePercentage = course.attendancePercentage
    addUnique(row.reasons, 'Baja asistencia')
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

function buildAcademicSignalItems(
  dashboard: AdminDashboardResponse,
  students: StudentFollowUpItem[],
): AcademicSignalItem[] {
  const items: AcademicSignalItem[] = []

  const combinedRiskCount = dashboard.studentsWithCombinedAcademicRisk?.length ?? 0
  const consecutiveAbsenceCount = dashboard.studentsWithConsecutiveAbsences?.length ?? 0
  const attendanceRiskCount = dashboard.studentsWithMultipleAbsences?.length ?? 0
  const courseDeclineCount = new Set([
    ...(dashboard.coursesWithAttendanceDecline ?? []).map((course) => course.cursoId),
    ...(dashboard.coursesWithPerformanceDecline ?? []).map((course) => course.cursoId),
  ]).size
  const performanceStudentCount = new Set([
    ...(dashboard.studentsManualLowPerformance ?? []).map((student) => student.alumnoId),
    ...(dashboard.studentsAtRiskByAverage ?? []).map((student) => student.alumnoId),
  ]).size

  if (combinedRiskCount > 0) {
    items.push({
      id: 'students-combined-risk',
      icon: Users,
      title: `${combinedRiskCount} ${pluralize(
        combinedRiskCount,
        'alumno combina',
        'alumnos combinan',
      )} bajo rendimiento y baja asistencia`,
      description: 'Prioridad alta para intervención académica y contacto institucional.',
      href: '/admin/dashboard/students',
      cta: 'Revisar alumnos',
      tone: 'rose',
    })
  }

  if (consecutiveAbsenceCount > 0) {
    items.push({
      id: 'students-consecutive-absences',
      icon: CalendarDays,
      title: `${consecutiveAbsenceCount} ${pluralize(
        consecutiveAbsenceCount,
        'alumno tiene',
        'alumnos tienen',
      )} ausencias consecutivas`,
      description: 'Señal temprana para actuar antes de que pierda continuidad.',
      href: '/admin/dashboard/reports/attendance',
      cta: 'Ver asistencia',
      tone: 'amber',
    })
  }

  if (courseDeclineCount > 0) {
    items.push({
      id: 'course-decline',
      icon: BookOpen,
      title: `${courseDeclineCount} ${pluralize(
        courseDeclineCount,
        'curso muestra',
        'cursos muestran',
      )} caída de tendencia`,
      description: 'Bajó la asistencia o el rendimiento respecto al período anterior.',
      href: '/admin/dashboard/courses',
      cta: 'Ver cursos',
      tone: 'amber',
    })
  }

  if (combinedRiskCount === 0 && performanceStudentCount > 0) {
    items.push({
      id: 'students-performance',
      icon: Users,
      title: `${performanceStudentCount} ${pluralize(
        performanceStudentCount,
        'alumno necesita',
        'alumnos necesitan',
      )} acompañamiento académico`,
      description: 'Calificaciones bajas o promedio mensual por debajo de lo esperado.',
      href: '/admin/dashboard/students',
      cta: 'Revisar alumnos',
      tone: students.some((student) => student.severity === 'critical') ? 'rose' : 'amber',
    })
  }

  if (consecutiveAbsenceCount === 0 && attendanceRiskCount > 0) {
    items.push({
      id: 'students-attendance',
      icon: CalendarDays,
      title: `${attendanceRiskCount} ${pluralize(
        attendanceRiskCount,
        'alumno está',
        'alumnos están',
      )} por debajo del umbral de asistencia`,
      description: 'Conviene revisar continuidad y contacto si hace falta.',
      href: '/admin/dashboard/reports/attendance',
      cta: 'Ver asistencia',
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
      icon: Users,
      title: `${students.length} ${pluralize(
        students.length,
        'alumno requiere',
        'alumnos requieren',
      )} seguimiento`,
      description: 'Hay alumnos que conviene mirar con más detalle.',
      href: '/admin/dashboard/students',
      cta: 'Revisar alumnos',
      tone: 'amber',
    })
  }

  return items.slice(0, 6)
}

function buildInstitutionalTrendItems(dashboard: AdminDashboardResponse): InstitutionalTrendItem[] {
  const averageTrend = dashboard.academicTrends?.find((item) => item.key === 'average-grade')
  const attendanceTrend = dashboard.academicTrends?.find((item) => item.key === 'attendance')
  const attendanceDeclineCount = dashboard.coursesWithAttendanceDecline?.length ?? 0
  const performanceDeclineCount = dashboard.coursesWithPerformanceDecline?.length ?? 0

  return [
    {
      id: 'institution-average',
      label: 'Rendimiento institucional',
      value: metricValue(dashboard.currentPeriodAverage, { decimals: 0 }),
      detail: formatTrendDetail(averageTrend?.delta, 'pts') ?? 'Sin comparación disponible',
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
      label: 'Continuidad de cursada',
      value: metricValue(dashboard.institutionalAttendanceAverage, { percent: true }),
      detail: formatTrendDetail(attendanceTrend?.delta, 'pp') ?? 'Sin comparación disponible',
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
    {
      id: 'course-decline',
      label: 'Cursos con caída',
      value: String(attendanceDeclineCount + performanceDeclineCount),
      detail: `${performanceDeclineCount} en rendimiento, ${attendanceDeclineCount} en asistencia`,
      tone: attendanceDeclineCount + performanceDeclineCount > 0 ? 'amber' : 'emerald',
      href: '/admin/dashboard/courses',
    },
  ]
}

function getAcademicSignalSummary(alertCount: number) {
  if (alertCount === 0) {
    return 'No hay alertas académicas prioritarias para hoy.'
  }

  return `${alertCount} ${pluralize(
    alertCount,
    'alerta académica requiere',
    'alertas académicas requieren',
  )} seguimiento hoy.`
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
  const summary = getAcademicSignalSummary(alertCount)

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

function AcademicSignalRow({ item }: { item: AcademicSignalItem }) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className="group flex min-w-0 items-start gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
    >
      <span
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
          toneStyles[item.tone].icon,
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-5 text-foreground">
          {item.title}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
          {item.description}
        </span>
      </span>
      <span className="hidden shrink-0 items-center gap-1 pt-0.5 text-xs font-semibold text-primary sm:inline-flex">
        {item.cta}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

function StudentFollowUpRow({ item }: { item: StudentFollowUpItem }) {
  return (
    <article className="group rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/20">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <StudentPhoto name={item.alumnoNombre} avatarUrl={item.alumnoAvatarUrl} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {item.alumnoNombre}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              <CourseNameWithDescription
                name={item.cursoNombre}
                description={item.cursoDescripcion}
              />
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {item.reasons.join(', ')}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          <span className={cn('text-xs font-medium', toneStyles[severityTone(item.severity)].text)}>
            {item.badges.slice(0, 2).join(', ')}
          </span>
          <Link
            href={`/admin/dashboard/students/${item.alumnoId}`}
            className="inline-flex h-8 items-center whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            Revisar
            <ArrowRight className="ml-1 size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}

function CourseMetric({
  label,
  value,
  tone,
  delta,
  unit,
}: {
  label: string
  value: string
  tone: Tone
  delta?: number | null
  unit: 'pts' | 'pp'
}) {
  const trend = formatTrendDetail(delta, unit)

  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium leading-4 text-muted-foreground">{label}</p>
      <p className={cn('mt-0.5 text-sm font-semibold tabular-nums', toneStyles[tone].text)}>
        {value}
      </p>
      {trend ? (
        <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
          {trend}
        </p>
      ) : null}
    </div>
  )
}

function CourseFollowUpRow({ item }: { item: CourseHealthItem }) {
  const averageLabel =
    item.averageGrade !== undefined && item.averageGrade !== null
      ? item.averageGrade.toFixed(0)
      : 'N/D'
  const attendanceLabel =
    item.attendancePercentage !== undefined && item.attendancePercentage !== null
      ? `${item.attendancePercentage.toFixed(0)}%`
      : 'N/D'

  return (
    <article className="rounded-xl px-2.5 py-3 transition-colors hover:bg-muted/20">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.78fr)]">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-5 text-foreground">
            {item.cursoNombre}
          </p>
          {item.cursoDescripcion ? (
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              {item.cursoDescripcion}
            </p>
          ) : null}
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {item.reasons.slice(0, 2).join(', ')}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <CourseMetric
            label="Promedio"
            value={averageLabel}
            tone={item.averageGrade == null ? 'neutral' : gradeTone(item.averageGrade)}
            delta={item.performanceDelta}
            unit="pts"
          />
          <CourseMetric
            label="Asistencia"
            value={attendanceLabel}
            tone={item.attendancePercentage == null ? 'neutral' : attendanceTone(item.attendancePercentage)}
            delta={item.attendanceDelta}
            unit="pp"
          />
          <div className="min-w-0">
            <p className="text-[11px] font-medium leading-4 text-muted-foreground">Afectados</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {item.affectedStudentsCount}{' '}
              {item.affectedStudentsCount === 1 ? 'alumno' : 'alumnos'}
            </p>
            <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
              Requieren seguimiento
            </p>
          </div>
          <Link
            href={`/admin/dashboard/courses/${item.cursoId}/manage`}
            className="inline-flex h-8 items-center justify-start whitespace-nowrap rounded-lg text-xs font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:col-span-3"
          >
            Ver curso
            <ArrowRight className="ml-1 size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}

function AcademicAttentionPanel({
  dashboard,
}: {
  dashboard: AdminDashboardResponse
}) {
  const studentsFollowUpItems = buildStudentsFollowUpItems(dashboard)
  const coursesHealthItems = buildCoursesHealthItems(dashboard)
  const academicSignals = buildAcademicSignalItems(dashboard, studentsFollowUpItems)

  return (
    <section className="rounded-2xl bg-card/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] ring-1 ring-border/35 dark:bg-card/65 sm:p-5">
      <SectionHeader
        title="Qué merece atención hoy"
        description="Situaciones detectadas a partir de asistencia, rendimiento y cambios de tendencia."
      />

      <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-2">
          <p className="px-2.5 text-xs font-medium text-muted-foreground">
            Prioridad de hoy
          </p>
          {academicSignals.length === 0 ? (
            <AcademicSignalRow
              item={{
                id: 'empty',
                icon: CheckCircle2,
                title: 'Sin alertas académicas prioritarias',
                description: 'No hay alumnos ni cursos marcados para seguimiento inmediato.',
                href: '/admin/dashboard/reports',
                cta: 'Abrir reportes',
                tone: 'emerald',
              }}
            />
          ) : (
            academicSignals.map((item) => (
              <AcademicSignalRow key={item.id} item={item} />
            ))
          )}
        </div>

        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-1">
          <section className="min-w-0">
            <SectionHeader
              title="Alumnos que requieren seguimiento"
              description="Casos con riesgo académico o señales de pérdida de continuidad."
            />
            <div className="mt-2 space-y-1">
              {studentsFollowUpItems.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="No hay alumnos en seguimiento."
                  description="No hay alumnos con señales académicas en los datos actuales."
                />
              ) : (
                studentsFollowUpItems.map((item) => (
                  <StudentFollowUpRow key={item.id} item={item} />
                ))
              )}
            </div>
          </section>

          <section className="min-w-0">
            <SectionHeader
              title="Cursos que requieren atención"
              description="Lectura breve de promedio, asistencia y alumnos afectados."
            />
            <div className="mt-2 space-y-1">
              {coursesHealthItems.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="No hay cursos para revisar."
                  description="No hay cursos con señales de atención en el período actual."
                />
              ) : (
                coursesHealthItems.map((item) => (
                  <CourseFollowUpRow key={item.cursoId} item={item} />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}

function InstitutionalTrendRow({ item }: { item: InstitutionalTrendItem }) {
  return (
    <Link
      href={item.href}
      className="grid gap-2 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:grid-cols-[minmax(0,1fr)_minmax(160px,0.42fr)]"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-5 text-foreground">
          {item.label}
        </span>
        <span className={cn('mt-0.5 block text-xs font-medium leading-5', toneStyles[item.tone].text)}>
          {item.detail}
        </span>
      </span>
      <span className="text-sm font-semibold tabular-nums text-foreground sm:text-right">
        {item.value}
      </span>
    </Link>
  )
}

function InstitutionalDirectionPanel({ dashboard }: { dashboard: AdminDashboardResponse }) {
  const items = buildInstitutionalTrendItems(dashboard)

  return (
    <section className="rounded-2xl bg-card/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] ring-1 ring-border/35 dark:bg-card/65 sm:p-5">
      <SectionHeader
        title="Evolución institucional"
        description="Cambios del período que ayudan a decidir dónde acompañar."
      />
      <div className="mt-3 space-y-1">
        {items.map((item) => (
          <InstitutionalTrendRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

function HealthMetric({
  label,
  value,
  context,
  href,
  tone,
  trend,
  prominent = false,
}: {
  label: string
  value: string
  context?: string
  href?: string
  tone: Tone
  trend?: {
    label: string
    tone: Tone
    icon: ComponentType<{ className?: string }>
    title: string
  }
  prominent?: boolean
}) {
  const TrendIcon = trend?.icon
  const content = (
    <>
      <p className="text-xs font-medium leading-5 text-muted-foreground">{label}</p>
      <div className="mt-1">
        <p
          className={cn(
            'font-semibold leading-none tracking-tight tabular-nums text-foreground',
            prominent ? 'text-[2rem]' : 'text-xl',
          )}
        >
          {value}
        </p>
      </div>
      {trend && TrendIcon ? (
        <span
          title={trend.title}
          className={cn('mt-2 inline-flex items-center gap-1 text-xs font-medium leading-5', toneStyles[trend.tone].text)}
        >
          <TrendIcon className="size-3.5 shrink-0" />
          {trend.label}
        </span>
      ) : context ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{context}</p>
      ) : null}
    </>
  )

  if (!href) {
    return <div>{content}</div>
  }

  return (
    <Link
      href={href}
      className="block rounded-xl p-2 transition-colors hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
    >
      {content}
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

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {summary.description}
      </p>

      <div className="mt-5 space-y-1">
        <HealthMetric
          label="Promedio institucional"
          value={
            typeof dashboard.currentPeriodAverage === 'number'
              ? dashboard.currentPeriodAverage.toFixed(0)
              : 'N/D'
          }
          href="/admin/dashboard/reports/marks"
          tone={averageTone}
          trend={trendInfo(dashboard, 'average-grade', 'pts')}
          prominent
        />
        <HealthMetric
          label="Asistencia promedio"
          value={
            typeof dashboard.institutionalAttendanceAverage === 'number'
              ? `${dashboard.institutionalAttendanceAverage.toFixed(0)}%`
              : 'N/D'
          }
          href="/admin/dashboard/reports/attendance"
          tone={attendanceHealthTone}
          trend={trendInfo(dashboard, 'attendance', 'pp')}
          prominent
        />
      </div>

      <div className="mt-4 space-y-1 border-t border-border/45 pt-4">
        <HealthMetric
          label="Alumnos matriculados"
          value={dashboard.overview.studentsCount.toLocaleString()}
          context="Matrícula activa"
          href="/admin/dashboard/students"
          tone={dashboard.overview.studentsCount > 0 ? 'emerald' : 'amber'}
        />
        <HealthMetric
          label="Cursos activos"
          value={dashboard.overview.activeCoursesCount.toLocaleString()}
          context="En cursada"
          href="/admin/dashboard/courses"
          tone={dashboard.overview.activeCoursesCount > 0 ? 'emerald' : 'amber'}
        />
        <HealthMetric
          label="Tareas por corregir"
          value={dashboard.institutionalHomeworkPendingCorrectionCount.toLocaleString()}
          context="Revisión pendiente"
          href="/admin/dashboard/reports/homework"
          tone={pendingCorrectionsTone}
        />
        <HealthMetric
          label="Cursos a revisar"
          value={(dashboard.criticalCourses?.length ?? 0).toLocaleString()}
          context="Con señales académicas combinadas"
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
        courseName: item.cursoNombre,
        courseDescription: item.cursoDescripcion,
        detail: item.diaSemana,
        href: `/admin/dashboard/courses/${item.cursoId}/manage`,
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
        courseName: item.cursoNombre,
        courseDescription: item.cursoDescripcion,
        detail: item.titulo,
        href: `/admin/dashboard/courses/${item.cursoId}/manage`,
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
        description="Clases y vencimientos ordenados por día."
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
                    className="group grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <span className="pt-0.5 text-xs font-semibold tabular-nums text-foreground">
                      {item.timeLabel}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground group-hover:text-primary">
                        {item.courseName}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
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
}: {
  dashboard: AdminDashboardResponse
}) {
  const studentsFollowUpItems = buildStudentsFollowUpItems(dashboard)
  const academicSignalCount = buildAcademicSignalItems(
    dashboard,
    studentsFollowUpItems,
  ).length
  const periodLabel = formatPeriodLabel(dashboard)

  return (
    <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <AdminDashboardHeader
          alertCount={academicSignalCount}
          periodLabel={periodLabel}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] xl:items-start">
          <div className="space-y-5">
            <AcademicAttentionPanel dashboard={dashboard} />
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
