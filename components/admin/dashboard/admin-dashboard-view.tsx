import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  Inbox,
  Plus,
  TrendingDown,
  UserPlus,
  Users,
} from 'lucide-react'

import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { UserAvatar } from '@/components/shared/user-avatar'
import type {
  AdminDashboardResponse,
  DashboardAverageGradeByCourse,
  DashboardLowManualGradeAlert,
  DashboardUpcomingClass,
} from '@/lib/admin/dashboard/types'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'amber' | 'rose' | 'emerald' | 'primary'

type AdminActivityFeedItem = {
  id: string
  title: string
  context: string
  date: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  avatarName?: string
  avatarUrl?: string | null
}

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

function formatClassDate(value: string) {
  const date = parseLocalDate(value)

  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function formatActivityDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function isTodayDate(value: string) {
  const date = parseLocalDate(value)
  const today = new Date()

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

function getAdditionalOverallCourseRisks(dashboard: AdminDashboardResponse) {
  const manualRiskIds = new Set(
    (dashboard.coursesAtRiskByManualAverage ?? []).map((course) => course.cursoId),
  )

  return (dashboard.coursesAtRiskByOverallAverage ?? []).filter(
    (course) => !manualRiskIds.has(course.cursoId),
  )
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
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
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
    <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-3 py-3 text-sm dark:bg-muted/10 sm:px-4">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="mt-1 leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}

function AdminDashboardHeader({
  adminName,
  alertCount,
}: {
  adminName: string
  alertCount: number
}) {
  return (
    <WorkspaceHeader
      title={`Hola, ${adminName}`}
      description={
        alertCount > 0
          ? `Hay ${alertCount} senales academicas para revisar.`
          : 'Sin alertas academicas criticas.'
      }
      metadata={
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-primary" />
          <span className="font-medium text-foreground">{formatTodayLabel()}</span>
        </div>
      }
    />
  )
}

function OperationalAlertCard({
  icon: Icon,
  title,
  description,
  href,
  cta,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
  cta: string
  tone: Tone
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-2xl border p-3 shadow-sm transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:p-4',
        toneStyles[tone].card,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg',
            toneStyles[tone].icon,
          )}
        >
          <Icon className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5 text-foreground">{title}</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            {cta}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function StudentsAtRiskList({ items }: { items: DashboardLowManualGradeAlert[] }) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Alumnos que requieren seguimiento"
        description="Casos concretos para revisar primero."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No hay alumnos en seguimiento."
          description="No hay alumnos con senales academicas en los datos actuales."
        />
      ) : (
        <div className="space-y-2">
          {items.slice(0, 6).map((item) => (
            <article
              key={`${item.calificacionId}-${item.alumnoId}`}
              className="rounded-xl border border-border/60 bg-card/95 px-3 py-3 shadow-sm transition-colors hover:border-primary/20 hover:bg-card"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <UserAvatar
                    name={item.alumnoNombre}
                    avatarUrl={null}
                    size={36}
                    className="shrink-0"
                    fallbackClassName="bg-rose-500/10 text-rose-700 dark:text-rose-400"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.alumnoNombre}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.cursoNombre}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      Motivo: {item.titulo}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                  <span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold', toneStyles.rose.badge)}>
                    Nota {item.nota.toFixed(2)}
                  </span>
                  <Link
                    href={`/admin/dashboard/students/${item.alumnoId}`}
                    className="inline-flex h-8 items-center rounded-lg border border-border/70 bg-background/70 px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    Revisar
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function CoursesAtRiskList({
  items,
  affectedStudents,
}: {
  items: DashboardAverageGradeByCourse[]
  affectedStudents: DashboardLowManualGradeAlert[]
}) {
  function getAffectedStudentsCount(courseId: number) {
    return new Set(
      affectedStudents
        .filter((student) => student.cursoId === courseId)
        .map((student) => student.alumnoId),
    ).size
  }

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Cursos con problemas"
        description="Promedios por debajo del umbral esperado."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No hay cursos con senales criticas."
          description="No hay cursos con promedio manual bajo en los datos actuales."
        />
      ) : (
        <div className="space-y-2">
          {items.slice(0, 6).map((item) => {
            const affectedCount = getAffectedStudentsCount(item.cursoId)

            return (
              <article
                key={item.cursoId}
                className="rounded-xl border border-border/60 bg-card/95 px-3 py-3 shadow-sm transition-colors hover:border-primary/20 hover:bg-card"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      <BookOpen className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.cursoNombre}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        Motivo: promedio manual inferior al esperado.
                      </p>
                      {affectedCount > 0 ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {affectedCount} {affectedCount === 1 ? 'alumno afectado' : 'alumnos afectados'}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    <span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold', toneStyles.amber.badge)}>
                      Prom. {item.averageGrade.toFixed(2)}
                    </span>
                    <Link
                      href={`/admin/dashboard/courses/${item.cursoId}/manage`}
                      className="inline-flex h-8 items-center rounded-lg border border-border/70 bg-background/70 px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    >
                      Ver curso
                    </Link>
                    <Link
                      href="/admin/dashboard/reports/marks"
                      className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    >
                      Ver reporte
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function AdvancedAcademicSignals({ courses }: { courses: DashboardAverageGradeByCourse[] }) {
  if (courses.length === 0) {
    return null
  }

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Senales complementarias"
        description="Hallazgos academicos adicionales sin duplicar el seguimiento principal."
      />

      <div className="grid gap-2 lg:grid-cols-2">
        {courses.slice(0, 4).map((course) => (
          <article
            key={course.cursoId}
            className="rounded-xl border border-border/60 bg-card/95 px-3 py-3 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  <TrendingDown className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {course.cursoNombre}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    Motivo: promedio general por debajo del umbral esperado.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                <span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold', toneStyles.amber.badge)}>
                  Prom. {course.averageGrade.toFixed(2)}
                </span>
                <Link
                  href="/admin/dashboard/reports/marks"
                  className="inline-flex h-8 items-center rounded-lg border border-border/70 bg-background/70 px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  Ver reporte
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function AcademicAttentionPanel({
  dashboard,
}: {
  dashboard: AdminDashboardResponse
}) {
  const lowPerformance = dashboard.studentsManualLowPerformance ?? []
  const coursesAtRisk = dashboard.coursesAtRiskByManualAverage ?? []
  const additionalCourseRisks = getAdditionalOverallCourseRisks(dashboard)
  const totalSignals =
    dashboard.studentsAtRiskThisMonthCount +
    dashboard.studentsManualLowGradesThisMonthCount +
    coursesAtRisk.length +
    additionalCourseRisks.length

  return (
    <section className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
      <SectionHeader
        title="Atencion academica"
        description="Prioridad de seguimiento para la administracion academica."
      />

      {totalSignals === 0 ? (
        <OperationalAlertCard
          icon={CheckCircle2}
          title="Sin alertas academicas criticas"
          description="No hay alumnos ni cursos marcados para seguimiento inmediato."
          href="/admin/dashboard/reports"
          cta="Abrir reportes"
          tone="emerald"
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {dashboard.studentsManualLowGradesThisMonthCount > 0 ? (
            <OperationalAlertCard
              icon={AlertTriangle}
              title={`${dashboard.studentsManualLowGradesThisMonthCount} alumnos presentan bajo desempeno`}
              description="Tienen al menos una calificacion menor a 60 este mes."
              href="/admin/dashboard/students"
              cta="Revisar alumnos"
              tone="rose"
            />
          ) : null}

          {dashboard.studentsAtRiskThisMonthCount > 0 ? (
            <OperationalAlertCard
              icon={Users}
              title={`${dashboard.studentsAtRiskThisMonthCount} alumnos en seguimiento`}
              description="Promedio mensual general por debajo del umbral esperado."
              href="/admin/dashboard/reports/student-summary"
              cta="Abrir reporte"
              tone="amber"
            />
          ) : null}

          {coursesAtRisk.length > 0 ? (
            <OperationalAlertCard
              icon={BookOpen}
              title={`${coursesAtRisk.length} cursos con promedio bajo`}
              description={`${coursesAtRisk[0]?.cursoNombre ?? 'Un curso'} requiere revision academica.`}
              href="/admin/dashboard/reports/marks"
              cta="Ver reporte"
              tone="amber"
            />
          ) : null}

          {additionalCourseRisks.length > 0 ? (
            <OperationalAlertCard
              icon={TrendingDown}
              title={`${additionalCourseRisks.length} cursos con promedio general bajo`}
              description={`${additionalCourseRisks[0]?.cursoNombre ?? 'Un curso'} requiere revision desde reportes.`}
              href="/admin/dashboard/reports/marks"
              cta="Ver reporte"
              tone="amber"
            />
          ) : null}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <StudentsAtRiskList items={lowPerformance} />
        <CoursesAtRiskList
          items={coursesAtRisk}
          affectedStudents={lowPerformance}
        />
      </div>

      <AdvancedAcademicSignals courses={additionalCourseRisks} />
    </section>
  )
}

function ImmediateAgenda({ classes }: { classes: DashboardUpcomingClass[] }) {
  const now = new Date()
  const futureClasses = [...classes]
    .filter((item) => buildClassDateTime(item).getTime() >= now.getTime())
    .sort((a, b) => buildClassDateTime(a).getTime() - buildClassDateTime(b).getTime())
  const todayClasses = futureClasses.filter((item) => isTodayDate(item.proximaClase))
  const visibleClasses = todayClasses.length > 0 ? todayClasses : futureClasses.slice(0, 6)

  return (
    <section className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
      <SectionHeader
        title="Agenda inmediata"
        description="Clases de hoy y proximas clases programadas."
      />

      {visibleClasses.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Sin clases proximas"
          description="No hay clases futuras registradas en la agenda inmediata."
        />
      ) : (
        <div className="divide-y divide-border/60 border-y border-border/70 bg-background/35 dark:bg-background/20">
          {visibleClasses.map((item, index) => (
            <Link
              key={`${item.cursoId}-${item.proximaClase}-${item.horaInicio}-${index}`}
              href={`/admin/dashboard/courses/${item.cursoId}/manage`}
              className="group grid gap-2 px-3 py-3 transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35 sm:grid-cols-[72px_minmax(0,1fr)_minmax(0,180px)] sm:items-center"
            >
              <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-center text-xs font-semibold tabular-nums text-foreground">
                {item.horaInicio.slice(0, 5)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {item.cursoNombre}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {isTodayDate(item.proximaClase) ? 'Hoy' : formatClassDate(item.proximaClase)}
                </span>
              </span>
              <span className="truncate text-sm text-muted-foreground sm:text-right">
                {item.profesorNombre}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function AdminActivityFeed({ items }: { items: AdminActivityFeedItem[] }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
      <SectionHeader
        title="Actividad reciente"
        description="Cambios administrativos y academicos recientes."
      />
      {items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Todavía no hay actividad reciente disponible."
          description="El dashboard actual no expone cambios pasados verificables para este feed."
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon ?? FileText
            const content = (
              <div className="flex min-w-0 items-start gap-3">
                {item.avatarName ? (
                  <UserAvatar
                    name={item.avatarName}
                    avatarUrl={item.avatarUrl ?? null}
                    size={32}
                    className="shrink-0"
                  />
                ) : (
                  <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <p className="text-sm font-semibold leading-5 text-foreground">
                      {item.title}
                    </p>
                    <time
                      dateTime={item.date}
                      className="shrink-0 text-xs font-medium text-muted-foreground"
                    >
                      {formatActivityDate(item.date)}
                    </time>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {item.context}
                  </p>
                </div>
              </div>
            )

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-xl border border-border/60 bg-card/95 px-3 py-3 shadow-sm transition-colors hover:border-primary/20 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  {content}
                </Link>
              )
            }

            return (
              <article
                key={item.id}
                className="rounded-xl border border-border/60 bg-card/95 px-3 py-3 shadow-sm"
              >
                {content}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function InstitutionSummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/75 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-lg font-semibold leading-none text-foreground">{value}</p>
        </div>
        <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
    </div>
  )
}

function InstitutionStatus({ dashboard }: { dashboard: AdminDashboardResponse }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
      <SectionHeader
        title="Estado institucional"
        description="Salud academica general para interpretar la jornada."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <InstitutionSummaryCard
          label="Alumnos activos"
          value={dashboard.overview.studentsCount.toLocaleString()}
          icon={Users}
        />
        <InstitutionSummaryCard
          label="Asistencia promedio"
          value="N/D"
          icon={CalendarDays}
        />
        <InstitutionSummaryCard
          label="Promedio institucional"
          value={dashboard.generalAverage !== null ? dashboard.generalAverage.toFixed(2) : 'N/D'}
          icon={BarChart3}
        />
        <InstitutionSummaryCard
          label="Cursos activos"
          value={dashboard.overview.activeCoursesCount.toLocaleString()}
          icon={BookOpen}
        />
      </div>
    </section>
  )
}

function AdminQuickActions() {
  const actions = [
    { label: 'Crear alumno', href: '/admin/dashboard/students/new', icon: UserPlus },
    { label: 'Crear docente', href: '/admin/dashboard/teachers/new', icon: GraduationCap },
    { label: 'Crear curso', href: '/admin/dashboard/courses/new', icon: Plus },
    { label: 'Asignaciones', href: '/admin/dashboard/courses', icon: Users },
    { label: 'Reportes', href: '/admin/dashboard/reports', icon: BarChart3 },
  ]

  return (
    <section className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
      <SectionHeader
        title="Acciones rapidas"
        description="Tareas frecuentes de administracion."
      />

      <div className="grid gap-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/60 px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 dark:bg-background/30"
          >
            <span className="flex min-w-0 items-center gap-2">
              <action.icon className="size-4 shrink-0" />
              <span className="truncate">{action.label}</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </section>
  )
}

export function AdminDashboardView({
  dashboard,
  adminName,
}: {
  dashboard: AdminDashboardResponse
  adminName: string
}) {
  const academicSignalCount =
    dashboard.studentsAtRiskThisMonthCount +
    dashboard.studentsManualLowGradesThisMonthCount +
    (dashboard.coursesAtRiskByManualAverage?.length ?? 0) +
    getAdditionalOverallCourseRisks(dashboard).length
  const activityItems: AdminActivityFeedItem[] = []

  return (
    <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <AdminDashboardHeader
          adminName={adminName}
          alertCount={academicSignalCount}
        />

        <AcademicAttentionPanel dashboard={dashboard} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <div className="order-1 space-y-5 xl:col-start-1 xl:row-start-1">
            <ImmediateAgenda classes={dashboard.upcomingClasses ?? []} />
          </div>

          <div className="order-2 space-y-5 xl:col-start-2 xl:row-start-1">
            <InstitutionStatus dashboard={dashboard} />
            <AdminQuickActions />
          </div>

          <div className="order-3 space-y-5 xl:col-start-1 xl:row-start-2">
            <AdminActivityFeed items={activityItems} />
          </div>
        </div>
      </div>
    </main>
  )
}
