import Link from 'next/link'
import type { ReactNode } from 'react'
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
  DashboardUpcomingAssignment,
  DashboardUpcomingClass,
} from '@/lib/admin/dashboard/types'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'amber' | 'rose' | 'emerald' | 'primary'

type SignalSeverity = 'rose' | 'amber' | 'neutral'

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
  affectedStudentsCount: number
  pendingCorrectionCount?: number
  signalsCount: number
  severity: SignalSeverity
}

type AcademicSignalItem = {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  courseName?: string
  courseDescription?: string | null
  description: string
  href: string
  cta: string
  tone: Tone
}

type AgendaItem = {
  id: string
  date: Date
  label: string
  courseName: string
  courseDescription?: string | null
  href: string
}

const quickActions = [
  { label: 'Nuevo alumno', href: '/admin/dashboard/students/new', icon: UserPlus },
  { label: 'Nuevo docente', href: '/admin/dashboard/teachers/new', icon: GraduationCap },
  { label: 'Nuevo curso', href: '/admin/dashboard/courses/new', icon: Plus },
  { label: 'Reportes', href: '/admin/dashboard/reports', icon: BarChart3 },
]

const toneStyles: Record<Tone, { card: string; icon: string; badge: string }> = {
  neutral: {
    card: 'border-border/70 bg-card/90',
    icon: 'bg-muted/45 text-muted-foreground',
    badge: 'border-border/60 bg-muted/25 text-muted-foreground',
  },
  amber: {
    card: 'border-amber-500/20 bg-amber-500/[0.055]',
    icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    badge: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  rose: {
    card: 'border-rose-500/20 bg-rose-500/[0.055]',
    icon: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
    badge: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400',
  },
  emerald: {
    card: 'border-emerald-500/20 bg-emerald-500/[0.055]',
    icon: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  primary: {
    card: 'border-primary/15 bg-primary/[0.045]',
    icon: 'bg-primary/10 text-primary',
    badge: 'border-primary/15 bg-primary/10 text-primary',
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

function formatTodayLabel() {
  const value = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatAgendaDate(date: Date) {
  const today = new Date()
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()

  if (isToday) {
    return formatTime24(date)
  }

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()

  if (isTomorrow) {
    return 'Mañana'
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function formatTime24(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatCourseLabel(name: string, description?: string | null) {
  const cleanDescription = description?.trim()
  return cleanDescription ? `${name} · ${cleanDescription}` : name
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

  if (parts.length === 0) {
    return 'AL'
  }

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
    <Avatar className="size-8 shrink-0 border border-border/60 bg-muted ring-1 ring-border/40">
      {cleanAvatarUrl ? (
        <AvatarImage
          src={cleanAvatarUrl}
          alt={name.trim() || 'Foto del alumno'}
          className="object-cover"
        />
      ) : null}
      <AvatarFallback className="bg-amber-500/10 text-xs font-semibold text-amber-700 dark:text-amber-400">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

function buildAssignmentDateTime(item: DashboardUpcomingAssignment) {
  return new Date(item.fechaEntregaUtc)
}

function getAdditionalOverallCourseRisks(dashboard: AdminDashboardResponse) {
  const manualRiskIds = new Set(
    (dashboard.coursesAtRiskByManualAverage ?? []).map((course) => course.cursoId),
  )

  return (dashboard.coursesAtRiskByOverallAverage ?? []).filter(
    (course) => !manualRiskIds.has(course.cursoId),
  )
}

function mergeSeverity(current: SignalSeverity, next: SignalSeverity): SignalSeverity {
  if (current === 'rose' || next === 'rose') return 'rose'
  if (current === 'amber' || next === 'amber') return 'amber'
  return 'neutral'
}

function severityTone(severity: SignalSeverity): Tone {
  if (severity === 'rose') return 'rose'
  if (severity === 'amber') return 'amber'
  return 'neutral'
}

function scoreTone(score: number): Tone {
  if (score >= 75) return 'emerald'
  if (score >= 60) return 'amber'
  return 'rose'
}

function attendanceTone(value: number): Tone {
  if (value >= 85) return 'emerald'
  if (value >= 75) return 'amber'
  return 'rose'
}

function countHealthTone(value: number, amberLimit = 2): Tone {
  if (value === 0) return 'emerald'
  if (value <= amberLimit) return 'amber'
  return 'rose'
}

function trendInfo(
  dashboard: AdminDashboardResponse,
  key: string,
  suffix = '',
) {
  const trend = dashboard.academicTrends?.find((item) => item.key === key)

  if (!trend || typeof trend.delta !== 'number') {
    return {
      label: 'Período actual',
      tone: 'neutral' as Tone,
      icon: Minus,
      title: 'No hay comparación con el mes anterior disponible.',
    }
  }

  if (trend.delta === 0) {
    return {
      label: 'Sin variación',
      tone: 'neutral' as Tone,
      icon: Minus,
      title: 'Sin cambios frente al mes anterior.',
    }
  }

  const improves = trend.delta > 0
  const direction = improves ? 'Sube' : 'Baja'

  return {
    label: `${direction} ${Math.abs(trend.delta).toFixed(1)}${suffix}`,
    tone: improves ? 'emerald' as Tone : 'amber' as Tone,
    icon: improves ? TrendingUp : TrendingDown,
    title: `${direction} ${Math.abs(trend.delta).toFixed(1)}${suffix} vs. mes anterior.`,
  }
}

function addUnique(items: string[], value: string) {
  if (!items.includes(value)) {
    items.push(value)
  }
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
      severity: 'neutral',
    }

    items.set(id, created)
    return created
  }

  for (const item of dashboard.studentsManualLowPerformance ?? []) {
    const row = ensureItem(item)
    addUnique(row.reasons, `Nota baja: ${item.titulo}`)
    addUnique(row.badges, `Nota ${item.nota.toFixed(2)}`)
    row.severity = mergeSeverity(row.severity, item.nota < 50 ? 'rose' : 'amber')
  }

  for (const item of dashboard.studentsAtRiskByAverage ?? []) {
    const row = ensureItem(item)
    addUnique(row.reasons, 'Promedio bajo del mes')
    addUnique(row.badges, `Prom. ${item.averageGrade.toFixed(2)}`)
    row.severity = mergeSeverity(row.severity, item.averageGrade < 50 ? 'rose' : 'amber')
  }

  for (const item of dashboard.studentsWithMultipleAbsences ?? []) {
    const row = ensureItem(item)
    addUnique(row.reasons, `${item.ausentes} ausencias este mes`)
    addUnique(row.badges, `Asist. ${item.attendancePercentage.toFixed(0)}%`)
    row.severity = mergeSeverity(
      row.severity,
      item.ausentes >= 4 || item.attendancePercentage < 70 ? 'rose' : 'amber',
    )
  }

  return [...items.values()]
    .sort((a, b) => {
      const severityWeight = { rose: 0, amber: 1, neutral: 2 }
      return severityWeight[a.severity] - severityWeight[b.severity]
    })
    .slice(0, 8)
}

function buildCoursesHealthItems(
  dashboard: AdminDashboardResponse,
  students: StudentFollowUpItem[],
): CourseHealthItem[] {
  const items = new Map<number, CourseHealthItem>()
  const affectedStudentsByCourse = students.reduce((acc, student) => {
    const current = acc.get(student.cursoId) ?? new Set<number>()
    current.add(student.alumnoId)
    acc.set(student.cursoId, current)
    return acc
  }, new Map<number, Set<number>>())

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
      severity: 'neutral',
    }

    items.set(input.cursoId, created)
    return created
  }

  function addAverageRisk(course: DashboardAverageGradeByCourse, label: string) {
    const row = ensureItem(course)
    row.averageGrade = row.averageGrade ?? course.averageGrade
    addUnique(row.reasons, label)
    row.signalsCount += 1
    row.severity = mergeSeverity(row.severity, course.averageGrade < 50 ? 'rose' : 'amber')
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
    row.severity = mergeSeverity(
      row.severity,
      course.attendancePercentage < 70 ? 'rose' : 'amber',
    )
  }

  for (const course of dashboard.criticalCourses ?? []) {
    const row = ensureItem(course)
    row.averageGrade = row.averageGrade ?? course.averageGrade
    row.attendancePercentage = row.attendancePercentage ?? course.attendancePercentage
    row.pendingCorrectionCount = course.pendingCorrectionCount
    row.signalsCount = Math.max(row.signalsCount, course.signalsCount)
    if (course.pendingCorrectionCount > 0) {
      addUnique(row.reasons, `${course.pendingCorrectionCount} correcciones pendientes`)
    }
    row.severity = mergeSeverity(row.severity, course.signalsCount >= 2 ? 'rose' : 'amber')
  }

  return [...items.values()]
    .sort((a, b) => {
      const severityWeight = { rose: 0, amber: 1, neutral: 2 }
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
  const coveredCourseIds = new Set<number>()

  for (const course of [...(dashboard.coursesAtRiskByAttendance ?? [])]
    .sort((a, b) => a.attendancePercentage - b.attendancePercentage)
    .slice(0, 2)) {
    coveredCourseIds.add(course.cursoId)
    items.push({
      id: `attendance-${course.cursoId}`,
      icon: CalendarDays,
      courseName: course.cursoNombre,
      courseDescription: course.cursoDescripcion,
      title: `presenta baja asistencia (${course.attendancePercentage.toFixed(0)}%)`,
      description: 'Conviene revisar qué está pasando con este curso.',
      href: '/admin/dashboard/reports/attendance',
      cta: 'Ver asistencia',
      tone: 'amber',
    })
  }

  const courseAverageRisks = [
    ...(dashboard.coursesAtRiskByManualAverage ?? []),
    ...getAdditionalOverallCourseRisks(dashboard),
  ]
    .filter((course) => !coveredCourseIds.has(course.cursoId))
    .sort((a, b) => a.averageGrade - b.averageGrade)

  for (const course of courseAverageRisks.slice(0, 2)) {
    coveredCourseIds.add(course.cursoId)
    items.push({
      id: `average-${course.cursoId}`,
      icon: TrendingDown,
      courseName: course.cursoNombre,
      courseDescription: course.cursoDescripcion,
      title: `tiene promedio bajo (${course.averageGrade.toFixed(2)})`,
      description: 'El rendimiento está por debajo de lo esperado.',
      href: '/admin/dashboard/reports/marks',
      cta: 'Ver reporte',
      tone: 'amber',
    })
  }

  const performanceStudentCount = new Set([
    ...(dashboard.studentsManualLowPerformance ?? []).map((student) => student.alumnoId),
    ...(dashboard.studentsAtRiskByAverage ?? []).map((student) => student.alumnoId),
  ]).size

  if (performanceStudentCount > 0) {
    items.push({
      id: 'students-performance',
      icon: Users,
      title: `${performanceStudentCount} ${pluralize(
        performanceStudentCount,
        'alumno tiene',
        'alumnos tienen',
      )} rendimiento bajo`,
      description: 'Tienen calificaciones bajas o necesitan acompañamiento.',
      href: '/admin/dashboard/students',
      cta: 'Revisar alumnos',
      tone: 'amber',
    })
  }

  const absenceStudentCount = dashboard.studentsWithMultipleAbsences?.length ?? 0

  if (absenceStudentCount > 0) {
    items.push({
      id: 'students-absences',
      icon: CalendarDays,
      title: `${absenceStudentCount} ${pluralize(
        absenceStudentCount,
        'alumno acumula',
        'alumnos acumulan',
      )} ausencias`,
      description: 'Conviene revisar su asistencia y contactar si hace falta.',
      href: '/admin/dashboard/reports/attendance',
      cta: 'Ver asistencia',
      tone: 'amber',
    })
  }

  for (const course of (dashboard.criticalCourses ?? [])
    .filter((course) => !coveredCourseIds.has(course.cursoId))
    .sort((a, b) => b.signalsCount - a.signalsCount)
    .slice(0, 2)) {
    const details = [
      course.averageGrade !== null ? `promedio ${course.averageGrade.toFixed(2)}` : null,
      course.attendancePercentage !== null
        ? `asistencia ${course.attendancePercentage.toFixed(0)}%`
        : null,
      course.pendingCorrectionCount > 0
        ? `${course.pendingCorrectionCount} correcciones pendientes`
        : null,
    ].filter(Boolean)

    coveredCourseIds.add(course.cursoId)
    items.push({
      id: `critical-${course.cursoId}`,
      icon: BookOpen,
      courseName: course.cursoNombre,
      courseDescription: course.cursoDescripcion,
      title: 'necesita atención',
      description: details.length > 0 ? details.join(' · ') : 'Tiene más de una señal para revisar.',
      href: `/admin/dashboard/courses/${course.cursoId}/manage`,
      cta: 'Ver curso',
      tone: 'amber',
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
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
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
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-muted/15 px-3 py-2.5 text-sm dark:bg-muted/10">
      <div className="flex items-start gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
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

function AdminDashboardHeader({
  alertCount,
}: {
  alertCount: number
}) {
  const hasAlerts = alertCount > 0

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/90 bg-gradient-to-br from-card via-card to-secondary px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.07),0_10px_26px_-22px_rgba(15,23,42,0.28)] dark:border-border/60 dark:bg-none dark:bg-card/80 dark:shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:px-6 sm:py-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_10%,rgba(14,165,233,0.12),transparent_34%)] dark:bg-[radial-gradient(circle_at_92%_10%,rgba(56,189,248,0.07),transparent_32%)]" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/80 dark:ring-0" />

      <div className="relative z-10 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium capitalize text-muted-foreground">
            {formatTodayLabel()}
          </p>
          <span
            className={cn(
              'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
              hasAlerts ? toneStyles.amber.badge : toneStyles.emerald.badge,
            )}
          >
            {hasAlerts ? 'Señales pendientes' : 'Sin alertas críticas'}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Hola, administrador
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
          {hasAlerts
            ? `Hay ${alertCount} señales académicas para revisar.`
            : 'La operación académica no registra alertas críticas para este período.'}
        </p>
      </div>
    </section>
  )
}

function QuickActionsToolbar() {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/85 p-2 shadow-sm dark:bg-card/70">
      <div className="flex flex-wrap items-center gap-1.5">
      {quickActions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 dark:bg-background/30"
        >
          <action.icon className="size-3.5" />
          <span>{action.label}</span>
        </Link>
      ))}
      </div>
    </section>
  )
}

function AcademicSignalRow({ item }: { item: AcademicSignalItem }) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className="group block px-3 py-2.5 transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
    >
      <div className="flex items-start gap-2.5 sm:items-center">
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg',
            toneStyles[item.tone].icon,
          )}
        >
          <Icon className="size-3.5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5 text-foreground">
            {item.courseName ? (
              <>
                <CourseNameWithDescription
                  name={item.courseName}
                  description={item.courseDescription}
                />{' '}
                <span>{item.title}</span>
              </>
            ) : (
              item.title
            )}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.description}</p>
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary sm:hidden">
            {item.cta}
            <ArrowRight className="size-3.5" />
          </span>
        </div>

        <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-primary sm:inline-flex">
          {item.cta}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

function StudentsFollowUpPanel({ items }: { items: StudentFollowUpItem[] }) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Alumnos para revisar"
        description="Personas que pueden necesitar acompañamiento."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No hay alumnos en seguimiento."
          description="No hay alumnos con señales académicas en los datos actuales."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-background/45 dark:bg-background/25">
          <div className="divide-y divide-border/55">
          {items.map((item) => (
            <article
              key={item.id}
              className="px-3 py-2.5 transition-colors hover:bg-muted/20"
            >
              <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-2.5">
                  <StudentPhoto
                    name={item.alumnoNombre}
                    avatarUrl={item.alumnoAvatarUrl}
                  />
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
                      Por qué aparece: {item.reasons.join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5 lg:justify-end">
                  {item.badges.slice(0, 2).map((badge) => (
                    <span
                      key={badge}
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-xs font-semibold',
                        toneStyles[severityTone(item.severity)].badge,
                      )}
                    >
                      {badge}
                    </span>
                  ))}
                  <Link
                    href={`/admin/dashboard/students/${item.alumnoId}`}
                    className="inline-flex h-8 items-center whitespace-nowrap rounded-lg border border-border/70 bg-background/70 px-2.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    Revisar alumno
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
          </div>
        </div>
      )}
    </section>
  )
}

function CoursesHealthPanel({ items }: { items: CourseHealthItem[] }) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Cursos que necesitan atención"
        description="Asistencia, rendimiento o correcciones pendientes."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No hay cursos para revisar."
          description="No hay cursos con señales de atención en el período actual."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-background/45 dark:bg-background/25">
          <div className="divide-y divide-border/55">
          {items.map((item) => (
            <article
              key={item.cursoId}
              className="px-3 py-2.5 transition-colors hover:bg-muted/20"
            >
              <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg',
                      toneStyles.amber.icon,
                    )}
                  >
                    <BookOpen className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      <CourseNameWithDescription
                        name={item.cursoNombre}
                        description={item.cursoDescripcion}
                      />
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      Por qué aparece: {item.reasons.join(' · ')}
                    </p>
                    {item.affectedStudentsCount > 0 ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.affectedStudentsCount}{' '}
                        {item.affectedStudentsCount === 1 ? 'alumno afectado' : 'alumnos afectados'}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5 lg:justify-end">
                  {item.averageGrade !== undefined && item.averageGrade !== null ? (
                    <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold', toneStyles[scoreTone(item.averageGrade)].badge)}>
                      Prom. {item.averageGrade.toFixed(2)}
                    </span>
                  ) : null}
                  {item.attendancePercentage !== undefined && item.attendancePercentage !== null ? (
                    <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold', toneStyles[attendanceTone(item.attendancePercentage)].badge)}>
                      Asist. {item.attendancePercentage.toFixed(0)}%
                    </span>
                  ) : null}
                  <Link
                    href={`/admin/dashboard/courses/${item.cursoId}/manage`}
                    className="inline-flex h-8 items-center whitespace-nowrap rounded-lg border border-border/70 bg-background/70 px-2.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    Ver curso
                  </Link>
                </div>
              </div>
            </article>
          ))}
          </div>
        </div>
      )}
    </section>
  )
}

function AcademicAttentionPanel({
  dashboard,
}: {
  dashboard: AdminDashboardResponse
}) {
  const studentsFollowUpItems = buildStudentsFollowUpItems(dashboard)
  const coursesHealthItems = buildCoursesHealthItems(dashboard, studentsFollowUpItems)
  const academicSignals = buildAcademicSignalItems(dashboard, studentsFollowUpItems)

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm dark:bg-card/85 sm:p-5">
      <SectionHeader
        title="Seguimiento académico"
        description="Empezá por acá para saber qué alumnos o cursos conviene revisar."
      />

      {academicSignals.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-background/45 dark:bg-background/25">
          <AcademicSignalRow
            item={{
              id: 'empty',
              icon: CheckCircle2,
              title: 'Sin alertas académicas críticas',
              description: 'No hay alumnos ni cursos marcados para seguimiento inmediato.',
              href: '/admin/dashboard/reports',
              cta: 'Abrir reportes',
              tone: 'emerald',
            }}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-background/45 dark:bg-background/25">
          <div className="divide-y divide-border/55">
            {academicSignals.map((item) => (
              <AcademicSignalRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 2xl:grid-cols-2">
        <StudentsFollowUpPanel items={studentsFollowUpItems} />
        <CoursesHealthPanel items={coursesHealthItems} />
      </div>
    </section>
  )
}

function ImmediateAgenda({
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
        label: formatAgendaDate(date),
        courseName: item.cursoNombre,
        courseDescription: item.cursoDescripcion,
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
        label: formatAgendaDate(date),
        courseName: item.cursoNombre,
        courseDescription: item.cursoDescripcion,
        href: `/admin/dashboard/courses/${item.cursoId}/manage`,
      }
    })

  const visibleItems = [...classItems, ...assignmentItems]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 8)

  return (
    <section className="space-y-3 rounded-2xl border border-border/60 bg-card/95 p-3 shadow-sm dark:bg-card/85 sm:p-4">
      <SectionHeader
        title="Agenda inmediata"
        description="Próximas clases y vencimientos."
      />

      {visibleItems.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Sin agenda inmediata"
          description="No hay clases ni vencimientos próximos registrados."
        />
      ) : (
        <div className="space-y-2">
          {visibleItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex items-start gap-3 rounded-xl border border-border/50 bg-background/45 px-2.5 py-2.5 transition-colors hover:border-primary/20 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 dark:bg-background/25"
            >
              <span className="inline-flex min-w-[76px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-card/70 px-2 py-1 text-xs font-semibold tabular-nums text-foreground dark:bg-card/50">
                <CalendarDays className="size-3.5 text-primary" />
                {item.label}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground group-hover:text-primary">
                  {item.courseName}
                </span>
                {item.courseDescription ? (
                  <span className="mt-0.5 block line-clamp-2 text-xs leading-4 text-muted-foreground">
                    {item.courseDescription}
                  </span>
                ) : null}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function InstitutionHealthMetric({
  label,
  value,
  context,
  href,
  tone,
  trend,
}: {
  label: string
  value: string
  context?: string
  href?: string
  tone: Tone
  trend?: {
    label: string
    tone: Tone
    icon: React.ComponentType<{ className?: string }>
    title: string
  }
}) {
  const TrendIcon = trend?.icon
  const content = (
    <div className="flex h-full flex-col">
      <div className="flex min-h-8 items-start justify-between gap-2">
        <p className="text-xs font-medium leading-4 text-muted-foreground">{label}</p>
        <span className={cn('mt-0.5 size-2 rounded-full', toneStyles[tone].icon)} />
      </div>
      <p className="mt-1 text-lg font-semibold leading-none tabular-nums text-foreground">
        {value}
      </p>
      <div className="mt-2 min-h-5">
        {trend && TrendIcon ? (
          <span
            title={trend.title}
            className={cn(
              'inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors hover:bg-background/80',
              toneStyles[trend.tone].badge,
            )}
          >
            <TrendIcon className="size-3.5 shrink-0" />
            <span className="whitespace-normal leading-4">{trend.label}</span>
          </span>
        ) : null}
        {context && !trend ? (
          <p className="text-xs leading-4 text-muted-foreground">{context}</p>
        ) : null}
      </div>
    </div>
  )

  const className = cn(
    'block h-full rounded-xl border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
    toneStyles[tone].card,
    href ? 'hover:border-primary/25 hover:bg-card' : '',
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}

function InstitutionHealthPanel({ dashboard }: { dashboard: AdminDashboardResponse }) {
  const averageTone =
    typeof dashboard.currentPeriodAverage === 'number'
      ? scoreTone(dashboard.currentPeriodAverage)
      : 'neutral'
  const attendanceHealthTone =
    typeof dashboard.institutionalAttendanceAverage === 'number'
      ? attendanceTone(dashboard.institutionalAttendanceAverage)
      : 'neutral'
  const pendingCorrectionsTone = countHealthTone(
    dashboard.institutionalHomeworkPendingCorrectionCount,
    5,
  )
  const criticalCoursesTone = countHealthTone(dashboard.criticalCourses?.length ?? 0, 1)

  return (
    <section className="space-y-3 rounded-2xl border border-border/60 bg-card/95 p-3 shadow-sm dark:bg-card/85 sm:p-4">
      <SectionHeader
        title="Salud institucional"
        description="Lectura general del período actual."
      />

      <div className="grid auto-rows-fr grid-cols-2 gap-2">
        <InstitutionHealthMetric
          label="Alumnos matriculados"
          value={dashboard.overview.studentsCount.toLocaleString()}
          href="/admin/dashboard/students"
          tone={dashboard.overview.studentsCount > 0 ? 'emerald' : 'amber'}
        />
        <InstitutionHealthMetric
          label="Cursos activos"
          value={dashboard.overview.activeCoursesCount.toLocaleString()}
          href="/admin/dashboard/courses"
          tone={dashboard.overview.activeCoursesCount > 0 ? 'emerald' : 'amber'}
        />
        <InstitutionHealthMetric
          label="Promedio institucional"
          value={
            typeof dashboard.currentPeriodAverage === 'number'
              ? dashboard.currentPeriodAverage.toFixed(2)
              : 'N/D'
          }
          href="/admin/dashboard/reports/marks"
          tone={averageTone}
          trend={trendInfo(dashboard, 'average-grade')}
        />
        <InstitutionHealthMetric
          label="Asistencia promedio"
          value={
            typeof dashboard.institutionalAttendanceAverage === 'number'
              ? `${dashboard.institutionalAttendanceAverage.toFixed(0)}%`
              : 'N/D'
          }
          href="/admin/dashboard/reports/attendance"
          tone={attendanceHealthTone}
          trend={trendInfo(dashboard, 'attendance', ' pp')}
        />
        <InstitutionHealthMetric
          label="Tareas por corregir"
          value={dashboard.institutionalHomeworkPendingCorrectionCount.toLocaleString()}
          href="/admin/dashboard/reports/homework"
          tone={pendingCorrectionsTone}
        />
        <InstitutionHealthMetric
          label="Cursos críticos"
          value={(dashboard.criticalCourses?.length ?? 0).toLocaleString()}
          href="/admin/dashboard/courses"
          tone={criticalCoursesTone}
        />
      </div>
    </section>
  )
}

export function AdminDashboardView({
  dashboard,
}: {
  dashboard: AdminDashboardResponse
}) {
  const academicSignalCount = buildAcademicSignalItems(
    dashboard,
    buildStudentsFollowUpItems(dashboard),
  ).length

  return (
    <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <AdminDashboardHeader
          alertCount={academicSignalCount}
        />

        <QuickActionsToolbar />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <AcademicAttentionPanel dashboard={dashboard} />

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
