import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  Mail,
  MessageSquareWarning,
  UserRound,
} from 'lucide-react'
import Link from 'next/link'

import { AppHeader } from '@/components/layout/app-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSession } from '@/lib/auth/session'
import { getStudentDashboard } from '@/lib/student/dashboard/server-api'
import type {
  StudentCourseSummary,
  StudentDashboardFeedback,
  StudentDashboardGrade,
  StudentDashboardResponse,
  StudentDashboardTask,
} from '@/lib/student/dashboard/types'
import { cn } from '@/lib/utils'

type SemanticTone = 'neutral' | 'emerald' | 'amber' | 'rose' | 'blue'

const toneStyles: Record<
  SemanticTone,
  {
    card: string
    icon: string
    label: string
    badge: string
  }
> = {
  neutral: {
    card: 'border-border/60 bg-card/95',
    icon: 'bg-muted/60 text-muted-foreground',
    label: 'text-muted-foreground',
    badge: 'border-border/60 bg-muted/35 text-muted-foreground',
  },
  emerald: {
    card: 'border-emerald-500/15 bg-emerald-500/[0.055] hover:bg-emerald-500/[0.075]',
    icon: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    label: 'text-emerald-700/80 dark:text-emerald-400/90',
    badge:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  amber: {
    card: 'border-amber-500/15 bg-amber-500/[0.06] hover:bg-amber-500/[0.08]',
    icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    label: 'text-amber-700/80 dark:text-amber-400/90',
    badge:
      'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  rose: {
    card: 'border-rose-500/15 bg-rose-500/[0.055] hover:bg-rose-500/[0.075]',
    icon: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
    label: 'text-rose-700/80 dark:text-rose-400/90',
    badge:
      'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400',
  },
  blue: {
    card: 'border-primary/15 bg-primary/[0.05] hover:bg-primary/[0.07]',
    icon: 'bg-primary/10 text-primary',
    label: 'text-primary/80',
    badge: 'border-primary/15 bg-primary/10 text-primary',
  },
}

function asArray<T>(value: T[] | null | undefined) {
  return Array.isArray(value) ? value : []
}

function formatNumber(value: number | null | undefined, suffix = '') {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-'
  return `${value.toFixed(1)}${suffix}`
}

function formatInt(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return value
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatTodayLabel() {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

function getGradeTypeLabel(value: unknown) {
  const type = Number(value)

  switch (type) {
    case 1:
      return 'Homework'
    case 2:
      return 'Quiz'
    case 3:
      return 'Test'
    case 4:
      return 'Participation'
    case 5:
      return 'Behaviour'
    default:
      return 'Nota'
  }
}

function getCountTone(value: number) {
  if (value === 0) return 'emerald'
  if (value <= 2) return 'amber'
  return 'rose'
}

function getFeedbackMetricTone({
  pending,
  recentApproved,
  recentTotal,
}: {
  pending: number
  recentApproved: number
  recentTotal: number
}): SemanticTone {
  if (pending > 0) return pending > 2 ? 'rose' : 'amber'
  if (recentApproved > 0) return 'emerald'
  if (recentTotal > 0) return 'blue'
  return 'neutral'
}

function getAverageTone(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'neutral'
  if (value < 65) return 'rose'
  if (value < 80) return 'amber'
  return 'emerald'
}

function getAttendanceTone(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'neutral'
  if (value < 70) return 'rose'
  if (value < 85) return 'amber'
  return 'emerald'
}

function getFeedbackEstado(feedback: StudentDashboardFeedback) {
  const rawEstado = feedback.estado ?? feedback.Estado
  const estado =
    typeof rawEstado === 'string' ? rawEstado.trim().toLowerCase() : rawEstado

  if (estado === 1 || estado === '1' || estado === 'aprobado') {
    return {
      label: 'Aprobado',
      tone: 'emerald' as const,
    }
  }

  if (estado === 2 || estado === '2' || estado === 'rehacer') {
    return {
      label: 'Requiere revision',
      tone: 'rose' as const,
    }
  }

  return {
    label: 'Feedback',
    tone: 'blue' as const,
  }
}

function getTextField(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getNumberField(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  tone: SemanticTone
}) {
  const styles = toneStyles[tone]

  return (
    <div
      className={cn(
        'group rounded-[26px] border p-5 shadow-[0_18px_34px_-24px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_22px_40px_-24px_rgba(15,23,42,0.20)]',
        styles.card,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.16em]',
              styles.label,
            )}
          >
            {title}
          </p>
          <p className="mt-3 text-[2rem] font-semibold leading-none tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-200 group-hover:scale-[1.03]',
            styles.icon,
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}

function FeedbackItem({ feedback }: { feedback: StudentDashboardFeedback }) {
  const estado = getFeedbackEstado(feedback)
  const cursoId = getNumberField(feedback.cursoId ?? feedback.CursoId)
  const tareaId = getNumberField(feedback.tareaId ?? feedback.TareaId)
  const cursoNombre =
    getTextField(feedback.cursoNombre ?? feedback.CursoNombre) ?? 'Curso'
  const tituloTarea =
    getTextField(feedback.tituloTarea ?? feedback.TituloTarea) ?? 'Tarea'
  const comentario = getTextField(feedback.comentario ?? feedback.Comentario)
  const nota = feedback.nota ?? feedback.Nota
  const fecha = formatDate(
    getTextField(feedback.fechaCorreccionUtc ?? feedback.FechaCorreccionUtc),
  )
  const href =
    cursoId && tareaId ? `/student/courses/${cursoId}/tasks/${tareaId}` : null

  const content = (
    <article className="group rounded-[24px] border border-border/60 bg-background/70 px-4 py-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/15 hover:bg-card hover:shadow-[0_18px_36px_-24px_rgba(15,23,42,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-[15px] font-semibold tracking-tight text-foreground">
            {tituloTarea}
          </p>
          <p className="truncate text-xs font-medium text-primary/80">
            {cursoNombre}
          </p>
          <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
            {comentario ?? 'Sin comentario cargado.'}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {fecha}
            {nota != null ? ` · Nota ${nota}` : ''}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={cn(
              'inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
              toneStyles[estado.tone].badge,
            )}
          >
            {estado.label}
          </span>
          {href ? (
            <ArrowRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
          ) : null}
        </div>
      </div>
    </article>
  )

  return href ? (
    <li>
      <Link href={href}>{content}</Link>
    </li>
  ) : (
    <li>{content}</li>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-dashed border-border/70 bg-muted/20 px-5 py-8 text-center">
      <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <CheckCircle2 className="size-5" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{children}</p>
    </div>
  )
}

function TaskItem({ task }: { task: StudentDashboardTask }) {
  const tone = task.vencida ? 'rose' : 'emerald'

  return (
    <li className="group rounded-[24px] border border-border/60 bg-background/70 px-4 py-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/15 hover:bg-card hover:shadow-[0_18px_36px_-24px_rgba(15,23,42,0.18)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-[15px] font-semibold tracking-tight text-foreground">
            {task.titulo || 'Tarea pendiente'}
          </p>
          <p className="truncate text-xs font-medium text-primary/80">
            {task.cursoNombre || 'Curso'}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Entrega {formatDate(task.fechaEntregaUtc)}
          </p>
        </div>

        <span
          className={cn(
            'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
            toneStyles[tone].badge,
          )}
        >
          {task.vencida ? 'Vencida' : 'En fecha'}
        </span>
      </div>
    </li>
  )
}

function GradeItem({ grade }: { grade: StudentDashboardGrade }) {
  const tone = getAverageTone(grade.nota)

  return (
    <li className="group rounded-[24px] border border-border/60 bg-background/70 px-4 py-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/15 hover:bg-card hover:shadow-[0_18px_36px_-24px_rgba(15,23,42,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-[15px] font-semibold tracking-tight text-foreground">
            {grade.titulo || 'Calificacion'}
          </p>
          <p className="truncate text-xs font-medium text-primary/80">
            {grade.cursoNombre || 'Curso'}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {getGradeTypeLabel(grade.tipo)} · {formatDate(grade.fecha)}
          </p>
        </div>

        <div
          className={cn(
            'rounded-2xl border px-3 py-2 text-sm font-semibold',
            toneStyles[tone].badge,
          )}
        >
          {formatNumber(grade.nota)}
        </div>
      </div>
    </li>
  )
}

function CourseSummaryItem({ item }: { item: StudentCourseSummary }) {
  const averageTone = getAverageTone(item.promedio)
  const attendanceTone = getAttendanceTone(item.porcentajeAsistencia)
  const pendingTasks = formatInt(item.tareasPendientes)
  const tasksTone = getCountTone(pendingTasks)
  const needsAttention =
    (typeof item.promedio === 'number' && item.promedio < 65) ||
    (typeof item.porcentajeAsistencia === 'number' &&
      item.porcentajeAsistencia < 70)
  const status = needsAttention
    ? 'Requiere atencion'
    : pendingTasks > 0
      ? 'Tenes pendientes por resolver'
      : 'Buen progreso'
  const statusTone: SemanticTone = needsAttention
    ? 'rose'
    : pendingTasks > 0
      ? tasksTone
      : 'emerald'

  return (
    <li className="rounded-[26px] border border-border/60 bg-background/70 p-5 shadow-[0_16px_34px_-24px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/15 hover:bg-card hover:shadow-[0_20px_42px_-24px_rgba(15,23,42,0.18)]">
      <div className="flex flex-col gap-4">
        <div className="min-w-0">
          <p className="truncate text-[1rem] font-semibold tracking-tight text-foreground">
            {item.cursoNombre || 'Curso'}
          </p>
          <p
            className={cn(
              'mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
              toneStyles[statusTone].badge,
            )}
          >
            {status}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <span
            className={cn(
              'rounded-2xl border px-3 py-2 text-xs font-semibold',
              toneStyles[averageTone].badge,
            )}
          >
            Promedio {formatNumber(item.promedio)}
          </span>
          <span
            className={cn(
              'rounded-2xl border px-3 py-2 text-xs font-semibold',
              toneStyles[attendanceTone].badge,
            )}
          >
            Asistencia {formatNumber(item.porcentajeAsistencia, '%')}
          </span>
          <span
            className={cn(
              'rounded-2xl border px-3 py-2 text-xs font-semibold',
              toneStyles[tasksTone].badge,
            )}
          >
            Tareas {pendingTasks}
          </span>
        </div>
      </div>
    </li>
  )
}

function StudentDashboardContent({
  dashboard,
  firstName,
}: {
  dashboard: StudentDashboardResponse | null
  firstName: string
}) {
  const fullName = [dashboard?.nombre]
    .filter(Boolean)
    .join(' ')
    .trim()
  const studentName = fullName || firstName || 'Alumno'
  const tareasPendientes = asArray(dashboard?.tareasPendientes)
  const feedbacksRecientes = asArray(
    dashboard?.feedbacksRecientes ?? dashboard?.FeedbacksRecientes,
  )
  const ultimasCalificaciones = asArray(dashboard?.ultimasCalificaciones)
  const resumenPorCurso = asArray(dashboard?.resumenPorCurso)

  const tareasPendientesCount =
    dashboard?.tareasPendientesCount ?? tareasPendientes.length
  const feedbacksRehacerCount =
    dashboard?.feedbacksRehacerCount ?? dashboard?.FeedbacksRehacerCount ?? 0
  const feedbacksPendientesAccionCount =
    dashboard?.feedbacksPendientesAccionCount ??
    dashboard?.FeedbacksPendientesAccionCount ??
    0
  const feedbacksPendientes =
    feedbacksPendientesAccionCount + feedbacksRehacerCount
  const recentApprovedFeedbacks = feedbacksRecientes.filter(
    (feedback) => getFeedbackEstado(feedback).tone === 'emerald',
  ).length
  const feedbackMetricValue =
    feedbacksPendientes > 0 ? feedbacksPendientes : feedbacksRecientes.length
  const feedbackMetricSubtitle =
    feedbacksPendientes > 0
      ? 'Pendientes o para rehacer'
      : feedbacksRecientes.length > 0
        ? 'Feedbacks recientes'
        : 'Sin novedades recientes'
  const feedbackMetricTone = getFeedbackMetricTone({
    pending: feedbacksPendientes,
    recentApproved: recentApprovedFeedbacks,
    recentTotal: feedbacksRecientes.length,
  })
  const hasHeroPending = tareasPendientesCount > 0 || feedbacksPendientes > 0

  return (
    <main className="flex-1 overflow-auto px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 px-6 py-7 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:px-7 sm:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.05),transparent_24%)]" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 h-[3px] w-12 rounded-full bg-primary" />

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                Panel alumno
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.35rem]">
                Hola, {studentName}
              </h2>

              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
                {hasHeroPending
                  ? 'Tenés pendientes por resolver. Revisá tus tareas y feedbacks.'
                  : 'Todo al día. Podés concentrarte en tu estudio.'}
              </p>

              <p className="mt-1 text-[12px] capitalize text-muted-foreground/70">
                {formatTodayLabel()}
              </p>
            </div>

            <div
              className={cn(
                'group inline-flex items-center gap-3 rounded-2xl border px-4 py-4 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-22px_rgba(15,23,42,0.22)]',
                hasHeroPending
                  ? 'border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/15'
                  : 'border-border/60 bg-background/80 hover:border-primary/20',
              )}
            >
              <div
                className={cn(
                  'flex size-11 items-center justify-center rounded-2xl',
                  hasHeroPending
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    : 'bg-primary/10 text-primary',
                )}
              >
                <GraduationCap className="size-5" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Hoy
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {hasHeroPending ? 'Tenés pendientes' : 'Todo al día'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Cursos"
            value={formatInt(dashboard?.cantidadCursos)}
            icon={BookOpen}
            tone="blue"
            subtitle="Cursos activos o asignados"
          />
          <MetricCard
            title="Tareas"
            value={tareasPendientesCount}
            icon={ClipboardList}
            tone={getCountTone(tareasPendientesCount)}
            subtitle="Pendientes de entrega"
          />
          <MetricCard
            title="Entregas"
            value={formatInt(dashboard?.entregasRealizadasCount)}
            icon={FileCheck2}
            tone="emerald"
            subtitle="Entregas realizadas"
          />
          <MetricCard
            title="Feedbacks"
            value={feedbackMetricValue}
            icon={MessageSquareWarning}
            tone={feedbackMetricTone}
            subtitle={feedbackMetricSubtitle}
          />
          <MetricCard
            title="Promedio"
            value={formatNumber(dashboard?.promedioGeneral)}
            icon={CheckCircle2}
            tone={getAverageTone(dashboard?.promedioGeneral)}
            subtitle="Rendimiento general"
          />
          <MetricCard
            title="Asistencia"
            value={formatNumber(dashboard?.porcentajeAsistenciaGeneral, '%')}
            icon={CalendarDays}
            tone={getAttendanceTone(dashboard?.porcentajeAsistenciaGeneral)}
            subtitle="Asistencia general"
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <ClipboardList className="size-5 text-primary" />
                Tareas pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tareasPendientes.length === 0 ? (
                <EmptyState>No hay tareas pendientes.</EmptyState>
              ) : (
                <ul className="space-y-2">
                  {tareasPendientes.slice(0, 3).map((task, index) => (
                    <TaskItem key={task.tareaId ?? index} task={task} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <MessageSquareWarning className="size-5 text-primary" />
                Feedback reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedbacksRecientes.length === 0 ? (
                <EmptyState>No tenes feedback pendiente por revisar.</EmptyState>
              ) : (
                <ul className="space-y-2">
                  {feedbacksRecientes.slice(0, 3).map((feedback, index) => (
                    <FeedbackItem
                      key={feedback.feedbackId ?? feedback.FeedbackId ?? index}
                      feedback={feedback}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <CheckCircle2 className="size-5 text-primary" />
                Ultimas calificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ultimasCalificaciones.length === 0 ? (
                <EmptyState>No hay calificaciones recientes para mostrar.</EmptyState>
              ) : (
                <ul className="space-y-2">
                  {ultimasCalificaciones.slice(0, 3).map((grade, index) => (
                    <GradeItem
                      key={grade.calificacionId ?? index}
                      grade={grade}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}

export default async function StudentDashboardPage() {
  const session = await getSession()
  let dashboard: StudentDashboardResponse | null = null

  try {
    dashboard = await getStudentDashboard()
  } catch {
    dashboard = null
  }

  return (
    <>
      <AppHeader title="Student Dashboard" />
      <StudentDashboardContent
        dashboard={dashboard}
        firstName={session?.user.nombre || 'Alumno'}
      />
    </>
  )
}
