import type { ComponentType, ReactNode } from 'react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Megaphone,
  MessageSquareText,
} from 'lucide-react'
import Link from 'next/link'

import { AppHeader } from '@/components/layout/app-header'
import {
  StudentIconContainer,
  studentUi,
} from '@/components/student/courses/student-course-ui'
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

type SemanticTone = 'neutral' | 'emerald' | 'amber' | 'rose' | 'blue' | 'violet'

type Movement = {
  key: string
  title: string
  description: string
  course: string
  when: string
  sortTime: number
  href: string | null
  label: string
  tone: SemanticTone
  icon: ComponentType<{ className?: string }>
  priority?: boolean
  score?: string
}

const MAX_LEARNING_FEED_ITEMS = 6

const toneStyles: Record<SemanticTone, { badge: string; icon: string; chip: string }> = {
  neutral: {
    badge: 'border-border/60 bg-muted/30 text-muted-foreground',
    icon: 'bg-muted/45 text-muted-foreground',
    chip: 'border-border/55 bg-background/45 text-foreground dark:bg-background/25',
  },
  emerald: {
    badge:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    chip:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
  },
  amber: {
    badge:
      'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    chip:
      'border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  },
  rose: {
    badge:
      'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400',
    icon: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
    chip:
      'border-rose-500/20 bg-rose-500/10 text-rose-800 dark:text-rose-300',
  },
  blue: {
    badge: 'border-primary/15 bg-primary/10 text-primary',
    icon: 'bg-primary/10 text-primary',
    chip: 'border-primary/15 bg-primary/10 text-primary',
  },
  violet: {
    badge:
      'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    icon: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    chip:
      'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300',
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

function getTimeValue(value: string | null | undefined) {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

function formatTodayLabel() {
  const value = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getTextField(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getNumberField(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function getRecord(value: unknown) {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null
}

function getRecordText(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = getTextField(record[key])
    if (value) return value
  }

  return null
}

function getRecordNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    const numberValue =
      typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim()
          ? Number(value)
          : Number.NaN

    if (Number.isFinite(numberValue)) return numberValue
  }

  return null
}

function getRecordArray(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) return value
  }

  return []
}

function getAverageTone(value: number | null | undefined): SemanticTone {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'neutral'
  if (value < 65) return 'rose'
  if (value < 80) return 'amber'
  return 'emerald'
}

function getAttendanceTone(value: number | null | undefined): SemanticTone {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'neutral'
  if (value < 70) return 'rose'
  if (value < 85) return 'amber'
  return 'emerald'
}

function getCountTone(value: number): SemanticTone {
  if (value === 0) return 'emerald'
  if (value <= 2) return 'amber'
  return 'rose'
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

function getFeedbackEstado(feedback: StudentDashboardFeedback) {
  const rawEstado = feedback.estado ?? feedback.Estado
  const estado =
    typeof rawEstado === 'string' ? rawEstado.trim().toLowerCase() : rawEstado

  if (estado === 1 || estado === '1' || estado === 'aprobado') {
    return { label: 'Aprobado', tone: 'emerald' as const }
  }

  if (estado === 2 || estado === '2' || estado === 'rehacer') {
    return { label: 'Necesita cambios', tone: 'amber' as const }
  }

  return { label: 'Feedback', tone: 'blue' as const }
}

function getTaskHref(task: StudentDashboardTask) {
  return task.cursoId && task.tareaId
    ? `/student/courses/${task.cursoId}/tasks/${task.tareaId}`
    : null
}

function getFeedbackHref(feedback: StudentDashboardFeedback) {
  const cursoId = getNumberField(feedback.cursoId ?? feedback.CursoId)
  const tareaId = getNumberField(feedback.tareaId ?? feedback.TareaId)

  return cursoId && tareaId
    ? `/student/courses/${cursoId}/tasks/${tareaId}`
    : null
}

function getCourseHref(course: StudentCourseSummary | null | undefined) {
  return course?.cursoId ? `/student/courses/${course.cursoId}` : '/student/courses'
}

function getTaskDueTime(task: StudentDashboardTask) {
  if (!task.fechaEntregaUtc) return Number.POSITIVE_INFINITY
  const dueTime = new Date(task.fechaEntregaUtc).getTime()
  return Number.isNaN(dueTime) ? Number.POSITIVE_INFINITY : dueTime
}

function isTaskDueSoon(task: StudentDashboardTask) {
  const dueTime = getTaskDueTime(task)
  if (!Number.isFinite(dueTime)) return false

  const now = Date.now()
  const threeDays = 1000 * 60 * 60 * 24 * 3

  return dueTime >= now && dueTime - now <= threeDays
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
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function QuietEmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-sm leading-6 text-muted-foreground dark:bg-muted/5">
      <span className="font-medium text-foreground">{title}</span>{' '}
      {description}
    </div>
  )
}

function CompactDashboardHero({
  studentName,
  hasAction,
  primaryCourse,
}: {
  studentName: string
  hasAction: boolean
  primaryCourse: StudentCourseSummary | undefined
}) {
  const href = getCourseHref(primaryCourse)

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/65 bg-card/85 shadow-[0_12px_36px_-28px_rgba(15,23,42,0.28)] dark:bg-card/65">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_20%,rgba(16,185,129,0.12),transparent_28%)]" />
      <div className="absolute inset-y-0 left-0 z-0 w-[78%] bg-gradient-to-r from-background via-background/96 to-transparent dark:from-background dark:via-background/92" />
      <img
        src="/hero-chicos.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 right-0 z-0 hidden h-[108%] w-auto max-w-[40%] select-none object-contain md:block md:-bottom-9 md:right-4 md:h-[112%] md:max-w-[39%] lg:-bottom-8 lg:right-6 lg:h-[96%] lg:max-w-[36%]"
      />

      <div className="relative z-10 flex min-h-[168px] flex-col justify-between gap-5 p-5 sm:min-h-[176px] sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-medium capitalize text-muted-foreground">
            {formatTodayLabel()}
          </p>
          <span
            className={cn(
              studentUi.badge.compact,
              hasAction ? toneStyles.amber.badge : toneStyles.emerald.badge,
            )}
          >
            {hasAction ? 'Hay próximos pasos' : 'Buen ritmo'}
          </span>
        </div>

        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Hola, {studentName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            {hasAction ? 'Tenés algo para revisar hoy.' : 'Sin pendientes importantes.'}{' '}
            Podés entrar a tu aula para repasar o seguir avanzando.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={href}
            className={cn(
              studentUi.button.secondaryCta,
              'h-10 rounded-full gap-1 border-border/70 bg-background/85 px-4 backdrop-blur-md transition-all hover:border-primary/25 hover:bg-background hover:text-primary sm:w-auto',
            )}
          >
            Ingresar a tu aula
            <ArrowRight className="size-4" />
          </Link>

        </div>
      </div>
    </section>
  )
}

function LearningRhythmInline({
  entregasRecientesCount,
  tareasPendientesCount,
  promedioGeneral,
  porcentajeAsistenciaGeneral,
}: {
  entregasRecientesCount: number
  tareasPendientesCount: number
  promedioGeneral: number | null | undefined
  porcentajeAsistenciaGeneral: number | null | undefined
}) {
  const items = [
    {
      label: 'Promedio',
      value: formatNumber(promedioGeneral),
      tone: getAverageTone(promedioGeneral),
    },
    {
      label: 'Asistencia',
      value: formatNumber(porcentajeAsistenciaGeneral, '%'),
      tone: getAttendanceTone(porcentajeAsistenciaGeneral),
    },
    {
      label: 'Entregas',
      value: String(entregasRecientesCount),
      tone: entregasRecientesCount > 0 ? ('blue' as const) : ('neutral' as const),
    },
    {
      label: 'Tareas',
      value: String(tareasPendientesCount),
      tone: getCountTone(tareasPendientesCount),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            'rounded-xl border px-4 py-3 transition-colors duration-200 ease-out hover:bg-card',
            toneStyles[item.tone].chip,
          )}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className={cn('size-2 rounded-full', toneStyles[item.tone].icon)} />
            {item.label}
          </div>
          <p className="mt-1.5 text-lg font-semibold leading-none">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

function ClassroomRhythmCard({
  course,
  entregasRecientesCount,
  tareasPendientesCount,
  promedioGeneral,
  porcentajeAsistenciaGeneral,
}: {
  course: StudentCourseSummary | undefined
  entregasRecientesCount: number
  tareasPendientesCount: number
  promedioGeneral: number | null | undefined
  porcentajeAsistenciaGeneral: number | null | undefined
}) {
  const pendingTasks = formatInt(course?.tareasPendientes)

  if (!course) {
    return (
      <QuietEmptyState
        title="Todavía no hay aulas para mostrar."
        description="Cuando te sumen a un curso, va a aparecer acá."
      />
    )
  }

  return (
    <section className="rounded-2xl border border-border/65 bg-card/75 p-4 transition-colors hover:border-primary/20 dark:bg-card/55">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
        <Link href={getCourseHref(course)} className="group block min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Tu aula de este año
              </p>
              <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-foreground">
                {course.cursoNombre || 'Curso'}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {pendingTasks > 0
                  ? 'Entrá y seguí con la práctica pendiente.'
                  : 'Aula lista para repasar o avanzar.'}
              </p>
            </div>
            <StudentIconContainer
              icon={BookOpen}
              size="sm"
              className="border-transparent bg-primary/10 text-primary"
            />
          </div>

          <div className="mt-3">
            <span className="inline-flex h-9 items-center gap-1 rounded-full border border-primary/15 bg-primary/10 px-3 text-sm font-semibold text-primary transition-colors group-hover:border-primary/25 group-hover:bg-primary/15">
              Abrir aula
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>

        <LearningRhythmInline
          entregasRecientesCount={entregasRecientesCount}
          tareasPendientesCount={tareasPendientesCount}
          promedioGeneral={promedioGeneral}
          porcentajeAsistenciaGeneral={porcentajeAsistenciaGeneral}
        />
      </div>
    </section>
  )
}

function MovementItem({
  movement,
  featured = false,
}: {
  movement: Movement
  featured?: boolean
}) {
  const Icon = movement.icon
  const isPriority =
    featured || (movement.priority ?? (movement.tone === 'amber' || movement.tone === 'rose'))

  const content = (
    <article
      className={cn(
        'group rounded-xl px-2 py-3 transition-colors hover:bg-muted/20',
        isPriority && 'bg-primary/[0.045] px-3 py-4 dark:bg-primary/5',
      )}
    >
      <div className="flex gap-3">
        <span
          className={cn(
            'mt-1 flex size-8 shrink-0 items-center justify-center rounded-full',
            toneStyles[movement.tone].icon,
          )}
        >
          <Icon className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p
              className={cn(
                'min-w-0 truncate font-semibold text-foreground',
                isPriority ? 'text-base' : 'text-sm',
              )}
            >
              {movement.title}
            </p>
            {isPriority ? (
              <span className={cn(studentUi.badge.compact, toneStyles[movement.tone].badge)}>
                {movement.label}
              </span>
            ) : null}
            {movement.score ? (
              <span className={cn(studentUi.badge.compact, toneStyles[movement.tone].badge)}>
                Nota {movement.score}
              </span>
            ) : null}
          </div>

          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {movement.description}
          </p>

          <p className="mt-1 text-xs text-muted-foreground/80">
            {movement.course} · {movement.when}
          </p>
        </div>
      </div>
    </article>
  )

  return movement.href ? <Link href={movement.href}>{content}</Link> : content
}

function buildMovements({
  dashboard,
  tasks,
  feedbacks,
  grades,
  deliveries,
}: {
  dashboard: StudentDashboardResponse | null
  tasks: StudentDashboardTask[]
  feedbacks: StudentDashboardFeedback[]
  grades: StudentDashboardGrade[]
  deliveries: unknown[]
}) {
  const dashboardRecord = getRecord(dashboard)
  const announcements = dashboardRecord
    ? getRecordArray(dashboardRecord, [
        'anunciosRecientes',
        'novedadesRecientes',
        'ultimosAnuncios',
        'anuncios',
      ])
    : []

  const feedbackMovements: Movement[] = feedbacks.slice(0, 3).map((feedback, index) => {
    const estado = getFeedbackEstado(feedback)
    const date = getTextField(feedback.fechaCorreccionUtc ?? feedback.FechaCorreccionUtc)

    return {
      key: `feedback-${feedback.feedbackId ?? feedback.FeedbackId ?? index}`,
      title:
        getTextField(feedback.tituloTarea ?? feedback.TituloTarea) ??
        'Tu profe dejó feedback',
      description:
        getTextField(feedback.comentario ?? feedback.Comentario) ??
        'Hay una devolución para revisar.',
      course:
        getTextField(feedback.cursoNombre ?? feedback.CursoNombre) ?? 'Curso',
      when: formatDate(date),
      sortTime: getTimeValue(date),
      href: getFeedbackHref(feedback),
      label: estado.label,
      tone: estado.tone,
      icon: MessageSquareText,
      priority: estado.tone === 'amber',
    }
  })

  const gradeMovements: Movement[] = grades.slice(0, 3).map((grade, index) => {
    const tone = getAverageTone(grade.nota)

    return {
      key: `grade-${grade.calificacionId ?? index}`,
      title: grade.titulo || 'Nueva calificación',
      description: getGradeTypeLabel(grade.tipo),
      course: grade.cursoNombre || 'Curso',
      when: formatDate(grade.fecha),
      sortTime: getTimeValue(grade.fecha),
      href: null,
      label: 'Nota',
      tone: tone === 'neutral' ? 'blue' : tone,
      icon: CheckCircle2,
      score: formatNumber(grade.nota),
    }
  })

  const deliveryMovements: Movement[] = deliveries
    .slice(0, 3)
    .map((delivery, index): Movement | null => {
      const record = getRecord(delivery)
      if (!record) return null

      const courseId = getRecordNumber(record, ['cursoId', 'CursoId'])
      const taskId = getRecordNumber(record, ['tareaId', 'TareaId'])
      const date = getRecordText(record, [
        'fechaEntregaUtc',
        'FechaEntregaUtc',
        'fechaEntregadaUtc',
        'FechaEntregadaUtc',
      ])

      return {
        key: `delivery-${getRecordText(record, ['entregaId', 'EntregaId']) ?? index}`,
        title:
          getRecordText(record, [
            'tituloTarea',
            'TituloTarea',
            'tareaTitulo',
            'titulo',
          ]) ?? 'Entrega realizada',
        description: 'Tu trabajo quedó enviado.',
        course:
          getRecordText(record, ['cursoNombre', 'CursoNombre', 'courseName']) ??
          'Curso',
        when: formatDate(date),
        sortTime: getTimeValue(date),
        href:
          courseId && taskId
            ? `/student/courses/${courseId}/tasks/${taskId}`
            : null,
        label: 'Entrega',
        tone: 'blue',
        icon: FileCheck2,
      }
    })
    .filter((movement): movement is Movement => Boolean(movement))

  const announcementMovements: Movement[] = announcements
    .slice(0, 3)
    .map((announcement, index): Movement | null => {
      const record = getRecord(announcement)
      if (!record) return null

      const courseId = getRecordNumber(record, ['cursoId', 'CursoId'])
      const taskId = getRecordNumber(record, ['tareaId', 'TareaId', 'id'])
      const date = getRecordText(record, [
        'createdAtUtc',
        'fechaUtc',
        'FechaUtc',
        'fecha',
      ])

      return {
        key: `announcement-${taskId ?? index}`,
        title:
          getRecordText(record, ['titulo', 'Titulo', 'nombre', 'asunto']) ??
          'Nuevo anuncio',
        description:
          getRecordText(record, [
            'descripcion',
            'Descripcion',
            'mensaje',
            'contenido',
          ]) ?? 'Hay una novedad en el curso.',
        course:
          getRecordText(record, ['cursoNombre', 'CursoNombre', 'courseName']) ??
          'Curso',
        when: formatDate(date),
        sortTime: getTimeValue(date),
        href:
          courseId && taskId
            ? `/student/courses/${courseId}/tasks/${taskId}`
            : courseId
              ? `/student/courses/${courseId}`
              : null,
        label: 'Anuncio',
        tone: 'violet',
        icon: Megaphone,
      }
    })
    .filter((movement): movement is Movement => Boolean(movement))

  const taskMovements: Movement[] = tasks.slice(0, 3).map((task, index) => ({
    key: `task-${task.tareaId ?? index}`,
    title: task.titulo || 'Próxima tarea',
    description: task.vencida
      ? 'La fecha ya pasó; podés repasar la consigna.'
      : 'Próxima práctica para completar.',
    course: task.cursoNombre || 'Curso',
    when: `Entrega ${formatDate(task.fechaEntregaUtc)}`,
    sortTime: getTimeValue(task.fechaEntregaUtc),
    href: getTaskHref(task),
    label: task.vencida ? 'Fecha pasada' : 'Próxima tarea',
    tone: task.vencida ? 'rose' : 'amber',
    icon: Clock3,
    priority: task.vencida || isTaskDueSoon(task),
  }))

  return [
    ...announcementMovements,
    ...feedbackMovements,
    ...gradeMovements,
    ...deliveryMovements,
    ...taskMovements,
  ]
    .sort((a, b) => b.sortTime - a.sortTime)
    .slice(0, MAX_LEARNING_FEED_ITEMS)
}

function LearningFeed({ movements }: { movements: Movement[] }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/65 bg-card/70 p-4 dark:bg-card/55">
      <SectionHeader
        title="Lo que está pasando en tu aprendizaje"
        description="Movimientos recientes de tus aulas."
      />

      {movements.length > 0 ? (
        <div className="divide-y divide-border/60 border-y border-border/70 bg-background/35 dark:bg-background/20">
          {movements.map((movement, index) => (
            <MovementItem key={movement.key} movement={movement} featured={index === 0} />
          ))}
        </div>
      ) : (
        <div>
          <QuietEmptyState
            title="Sin movimientos recientes."
            description="Cuando haya anuncios, notas, entregas o feedback, van a aparecer acá."
          />
        </div>
      )}
    </section>
  )
}

function StudentDashboardContent({
  dashboard,
  firstName,
}: {
  dashboard: StudentDashboardResponse | null
  firstName: string
}) {
  const studentName =
    [dashboard?.nombre].filter(Boolean).join(' ').trim() || firstName || 'Alumno'

  const tareasPendientes = asArray(dashboard?.tareasPendientes)
  const feedbacksRecientes = asArray(
    dashboard?.feedbacksRecientes ?? dashboard?.FeedbacksRecientes,
  )
  const ultimasCalificaciones = asArray(dashboard?.ultimasCalificaciones)
  const ultimasEntregas = asArray(dashboard?.ultimasEntregas)
  const resumenPorCurso = asArray(dashboard?.resumenPorCurso)
  const primaryCourse = resumenPorCurso[0]

  const latestMovements = buildMovements({
    dashboard,
    tasks: tareasPendientes,
    feedbacks: feedbacksRecientes,
    grades: ultimasCalificaciones,
    deliveries: ultimasEntregas,
  })

  const tareasPendientesCount =
    dashboard?.tareasPendientesCount ?? tareasPendientes.length

  const feedbacksPendientes =
    (dashboard?.feedbacksPendientesAccionCount ??
      dashboard?.FeedbacksPendientesAccionCount ??
      0) +
    (dashboard?.feedbacksRehacerCount ?? dashboard?.FeedbacksRehacerCount ?? 0)

  const hasAction = tareasPendientesCount > 0 || feedbacksPendientes > 0

  return (
    <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <CompactDashboardHero
          studentName={studentName}
          hasAction={hasAction}
          primaryCourse={primaryCourse}
        />

        <div className="space-y-5">
          <ClassroomRhythmCard
            course={primaryCourse}
            entregasRecientesCount={ultimasEntregas.length}
            tareasPendientesCount={tareasPendientesCount}
            promedioGeneral={dashboard?.promedioGeneral}
            porcentajeAsistenciaGeneral={dashboard?.porcentajeAsistenciaGeneral}
          />

          <LearningFeed movements={latestMovements} />
        </div>
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
      <AppHeader title="Inicio" subtitle="Blossom Institute · Alumno" />
      <StudentDashboardContent
        dashboard={dashboard}
        firstName={session?.user.nombre || 'Alumno'}
      />
    </>
  )
}
