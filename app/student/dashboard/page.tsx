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
import { UserAvatar } from '@/components/shared/user-avatar'
import { studentUi } from '@/components/student/courses/student-course-ui'
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
  actorName?: string
  actorAvatarUrl?: string | null
  actorType?: 'teacher' | 'system'
}

type NextStep = {
  title: string
  description: string
  course: string
  meta?: string
  href: string
  cta: string
  tone: SemanticTone
  icon: ComponentType<{ className?: string }>
}

const MAX_LEARNING_FEED_ITEMS = 4

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

function getNestedRecord(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const nested = getRecord(record[key])
    if (nested) return nested
  }

  return null
}

function getActorName(record: Record<string, unknown>) {
  const directName = getRecordText(record, [
    'profesorNombreCompleto',
    'ProfesorNombreCompleto',
    'teacherName',
    'TeacherName',
    'createdByName',
    'autorNombreCompleto',
    'authorName',
  ])

  if (directName) return directName

  const firstName = getRecordText(record, [
    'profesorNombre',
    'ProfesorNombre',
    'teacherFirstName',
    'TeacherFirstName',
    'createdByNombre',
    'autorNombre',
  ])
  const lastName = getRecordText(record, [
    'profesorApellido',
    'ProfesorApellido',
    'teacherLastName',
    'TeacherLastName',
    'createdByApellido',
    'autorApellido',
  ])
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()

  if (fullName) return fullName

  const createdBy = getNestedRecord(record, ['createdBy', 'CreatedBy', 'autor', 'author'])
  if (!createdBy) return null

  const nestedName = getRecordText(createdBy, [
    'nombreCompleto',
    'fullName',
    'name',
  ])

  if (nestedName) return nestedName

  const nestedFirstName = getRecordText(createdBy, ['nombre', 'firstName'])
  const nestedLastName = getRecordText(createdBy, ['apellido', 'lastName'])

  return [nestedFirstName, nestedLastName].filter(Boolean).join(' ').trim() || null
}

function getActorAvatarUrl(record: Record<string, unknown>) {
  const directAvatarUrl = getRecordText(record, [
    'profesorAvatarUrl',
    'ProfesorAvatarUrl',
    'teacherAvatarUrl',
    'TeacherAvatarUrl',
    'createdByAvatarUrl',
    'autorAvatarUrl',
    'avatarUrl',
    'AvatarUrl',
  ])

  if (directAvatarUrl) return directAvatarUrl

  const createdBy = getNestedRecord(record, ['createdBy', 'CreatedBy', 'autor', 'author'])

  return createdBy
    ? getRecordText(createdBy, ['avatarUrl', 'fotoUrl', 'imageUrl'])
    : null
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
      return 'Tarea'
    case 2:
      return 'Quiz'
    case 3:
      return 'Test'
    case 4:
      return 'Participación'
    case 5:
      return 'Conducta'
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

function getCourseTeacherName(course: StudentCourseSummary | null | undefined) {
  if (!course) return null

  const directName = getRecordText(course, [
    'profesorNombreCompleto',
    'ProfesorNombreCompleto',
    'docenteNombreCompleto',
    'DocenteNombreCompleto',
    'teacherName',
    'TeacherName',
  ])

  if (directName) return directName

  const firstName = getRecordText(course, [
    'profesorNombre',
    'ProfesorNombre',
    'docenteNombre',
    'DocenteNombre',
    'teacherFirstName',
    'TeacherFirstName',
  ])
  const lastName = getRecordText(course, [
    'profesorApellido',
    'ProfesorApellido',
    'docenteApellido',
    'DocenteApellido',
    'teacherLastName',
    'TeacherLastName',
  ])

  return [firstName, lastName].filter(Boolean).join(' ').trim() || null
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

function getPluralLabel(count: number, singular: string, plural: string) {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`
}

function getFeedbackActionCount(feedbacks: StudentDashboardFeedback[]) {
  return feedbacks.filter((feedback) => getFeedbackEstado(feedback).tone === 'amber')
    .length
}

function formatStudentSummary({
  pendingTasksCount,
  feedbackActionCount,
}: {
  pendingTasksCount: number
  feedbackActionCount: number
}) {
  if (pendingTasksCount > 0 && feedbackActionCount > 0) {
    return `Tenés ${getPluralLabel(
      pendingTasksCount,
      'tarea para entregar',
      'tareas para entregar',
    )} y ${getPluralLabel(
      feedbackActionCount,
      'devolución para revisar',
      'devoluciones para revisar',
    )}.`
  }

  if (pendingTasksCount > 0) {
    return `Tenés ${getPluralLabel(
      pendingTasksCount,
      'tarea para entregar',
      'tareas para entregar',
    )}.`
  }

  if (feedbackActionCount > 0) {
    return `Tenés ${getPluralLabel(
      feedbackActionCount,
      'devolución para revisar',
      'devoluciones para revisar',
    )}.`
  }

  return 'Sin pendientes importantes para hoy.'
}

function getNextStep({
  tasks,
  feedbacks,
  primaryCourse,
}: {
  tasks: StudentDashboardTask[]
  feedbacks: StudentDashboardFeedback[]
  primaryCourse: StudentCourseSummary | undefined
}): NextStep | null {
  const orderedTasks = [...tasks].sort(
    (a, b) => getTaskDueTime(a) - getTaskDueTime(b),
  )
  const urgentTask = orderedTasks.find((task) => task.vencida || isTaskDueSoon(task))
  const feedbackToReview = feedbacks.find(
    (feedback) => getFeedbackEstado(feedback).tone === 'amber',
  )
  const nextTask = urgentTask ?? orderedTasks[0]

  if (nextTask) {
    const href = getTaskHref(nextTask)

    if (href) {
      return {
        title: nextTask.titulo || 'Próxima tarea',
        description: nextTask.vencida
          ? 'La fecha ya pasó. Revisá la consigna y completala cuando puedas.'
          : isTaskDueSoon(nextTask)
            ? 'Está cerca de vencer. Conviene resolverla primero.'
            : 'Tenés una práctica pendiente para avanzar.',
        course: nextTask.cursoNombre || 'Curso',
        meta: `Entrega ${formatDate(nextTask.fechaEntregaUtc)}`,
        href,
        cta: 'Ver tarea',
        tone: nextTask.vencida ? 'rose' : 'amber',
        icon: Clock3,
      }
    }
  }

  if (feedbackToReview) {
    const href = getFeedbackHref(feedbackToReview)

    if (href) {
      return {
        title:
          getTextField(feedbackToReview.tituloTarea ?? feedbackToReview.TituloTarea) ??
          'Devolución para revisar',
        description:
          getTextField(feedbackToReview.comentario ?? feedbackToReview.Comentario) ??
          'Tu profe dejó una devolución que necesita una nueva revisión.',
        course:
          getTextField(feedbackToReview.cursoNombre ?? feedbackToReview.CursoNombre) ??
          'Curso',
        meta: formatDate(
          getTextField(
            feedbackToReview.fechaCorreccionUtc ??
              feedbackToReview.FechaCorreccionUtc,
          ),
        ),
        href,
        cta: 'Revisar devolución',
        tone: 'amber',
        icon: MessageSquareText,
      }
    }
  }

  const latestFeedback = [...feedbacks]
    .sort(
      (a, b) =>
        getTimeValue(
          getTextField(b.fechaCorreccionUtc ?? b.FechaCorreccionUtc),
        ) -
        getTimeValue(
          getTextField(a.fechaCorreccionUtc ?? a.FechaCorreccionUtc),
        ),
    )[0]

  if (latestFeedback) {
    const href = getFeedbackHref(latestFeedback)

    if (href) {
      return {
        title:
          getTextField(latestFeedback.tituloTarea ?? latestFeedback.TituloTarea) ??
          'Última devolución',
        description:
          getTextField(latestFeedback.comentario ?? latestFeedback.Comentario) ??
          'Hay feedback reciente para leer con calma.',
        course:
          getTextField(latestFeedback.cursoNombre ?? latestFeedback.CursoNombre) ??
          'Curso',
        meta: formatDate(
          getTextField(
            latestFeedback.fechaCorreccionUtc ?? latestFeedback.FechaCorreccionUtc,
          ),
        ),
        href,
        cta: 'Ver devolución',
        tone: 'blue',
        icon: MessageSquareText,
      }
    }
  }

  if (primaryCourse) {
    return {
      title: primaryCourse.cursoNombre || 'Tu aula',
      description: 'Entrá al aula para repasar materiales, tareas y novedades.',
      course: 'Aula principal',
      href: getCourseHref(primaryCourse),
      cta: 'Entrar al aula',
      tone: 'blue',
      icon: BookOpen,
    }
  }

  return null
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

function StudentDayHeader({
  studentName,
  summary,
}: {
  studentName: string
  summary: string
}) {
  return (
    <header className="border-b border-border/60 pb-5 pt-1 sm:pb-6">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {studentName}, hoy en tu aprendizaje
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/85 sm:text-[15px]">
          {summary}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatTodayLabel()}
        </p>
      </div>
    </header>
  )
}

function NextStepCard({ step }: { step: NextStep | null }) {
  if (!step) {
    return (
      <section className="space-y-3 rounded-2xl border border-border/65 bg-card/95 p-4 shadow-sm dark:bg-card/90 sm:p-5">
        <SectionHeader
          title="Próximo paso"
          description="Tu actividad principal aparece acá cuando tengas cursos o tareas."
        />
        <QuietEmptyState
          title="Todavía no hay próximos pasos."
          description="Cuando se active tu aula o recibas una tarea, la vas a ver acá."
        />
      </section>
    )
  }

  const Icon = step.icon

  return (
    <section className="space-y-4 rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-sm dark:border-primary/25 dark:bg-card/90 sm:p-5">
      <div className="flex items-center gap-2">
        <span className={cn('flex size-8 items-center justify-center rounded-lg', toneStyles[step.tone].icon)}>
          <Icon className="size-4" />
        </span>
        <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
          Próximo paso
        </h2>
      </div>

      <article className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {step.course}
            </p>
            {step.meta ? (
              <span className={cn(studentUi.badge.compact, toneStyles[step.tone].badge)}>
                {step.meta}
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {step.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-5 text-muted-foreground">
            {step.description}
          </p>
        </div>

        <Link
          href={step.href}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 active:scale-[0.99] sm:w-auto"
        >
          {step.cta}
          <ArrowRight className="ml-2 size-4" />
        </Link>
      </article>
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
  const items: Array<{
    label: string
    value: string
    tone: SemanticTone
  }> = []

  if (typeof promedioGeneral === 'number' && Number.isFinite(promedioGeneral)) {
    items.push({
      label: 'Promedio actual',
      value: formatNumber(promedioGeneral),
      tone: promedioGeneral < 65 ? 'rose' : promedioGeneral < 80 ? 'amber' : 'neutral',
    })
  }

  if (
    typeof porcentajeAsistenciaGeneral === 'number' &&
    Number.isFinite(porcentajeAsistenciaGeneral)
  ) {
    items.push({
      label: 'Asistencia actual',
      value: formatNumber(porcentajeAsistenciaGeneral, '%'),
      tone:
        porcentajeAsistenciaGeneral < 70
          ? 'rose'
          : porcentajeAsistenciaGeneral < 85
            ? 'amber'
            : 'neutral',
    })
  }

  if (tareasPendientesCount > 0) {
    items.push({
      label: 'Tareas pendientes',
      value: String(tareasPendientesCount),
      tone: getCountTone(tareasPendientesCount),
    })
  }

  if (entregasRecientesCount > 0) {
    items.push({
      label: 'Entregas recientes',
      value: String(entregasRecientesCount),
      tone: 'neutral',
    })
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border/55 bg-background/45 px-3.5 py-3 text-sm text-muted-foreground dark:bg-background/25">
        Todavía no hay indicadores cargados para este período.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/55 bg-background/45 px-3.5 py-3 dark:bg-background/25">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              'flex min-w-[132px] items-center justify-between gap-2 rounded-lg px-2.5 py-1.5',
              item.tone !== 'neutral' && toneStyles[item.tone].chip,
            )}
          >
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              {item.tone !== 'neutral' ? (
                <span
                  className={cn('size-1.5 rounded-full', toneStyles[item.tone].icon)}
                />
              ) : null}
              {item.label}
            </div>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {item.value}
            </p>
          </div>
        ))}
      </div>
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
  const teacherName = getCourseTeacherName(course)

  if (!course) {
    return (
      <QuietEmptyState
        title="Todavía no hay aulas para mostrar."
        description="Cuando te sumen a un curso, va a aparecer acá."
      />
    )
  }

  return (
    <Link
      href={getCourseHref(course)}
      aria-label={`Entrar al aula ${course.cursoNombre || 'principal'}`}
      className={cn(
        'group block rounded-2xl border border-border/65 bg-card/90 p-4 shadow-sm transition-colors hover:border-primary/25 hover:bg-card dark:bg-card/80 sm:p-5',
        studentUi.focus,
      )}
    >
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-primary">
              <BookOpen className="size-3.5" />
              Aula principal
            </span>
            {teacherName ? <span>Con {teacherName}</span> : null}
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {course.cursoNombre || 'Curso'}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {pendingTasks > 0
                  ? 'Tenés práctica pendiente para continuar.'
                  : 'Entrá para repasar materiales, tareas y novedades.'}
              </p>
              <span className="mt-3 inline-flex text-sm font-semibold text-primary">
                Entrar al aula
              </span>
            </div>
            <span className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/70 text-muted-foreground transition-colors group-hover:border-primary/25 group-hover:text-primary dark:bg-background/30">
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>

        <LearningRhythmInline
          entregasRecientesCount={entregasRecientesCount}
          tareasPendientesCount={tareasPendientesCount}
          promedioGeneral={promedioGeneral}
          porcentajeAsistenciaGeneral={porcentajeAsistenciaGeneral}
        />
      </section>
    </Link>
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
  const showActorAvatar =
    movement.actorType === 'teacher' && Boolean(movement.actorName)
  const isPriority =
    featured || (movement.priority ?? (movement.tone === 'amber' || movement.tone === 'rose'))

  const content = (
    <article
      className={cn(
        'group rounded-xl px-2.5 py-3 transition-colors hover:bg-muted/20',
        isPriority && 'bg-primary/[0.04] dark:bg-primary/5',
      )}
    >
      <div className="flex gap-3">
        {showActorAvatar ? (
          <UserAvatar
            name={movement.actorName ?? ''}
            avatarUrl={movement.actorAvatarUrl ?? null}
            size={32}
            className="mt-1 shrink-0"
            fallbackClassName="bg-primary/10 text-primary dark:bg-primary/15"
          />
        ) : (
          <span
            className={cn(
              'mt-1 flex size-8 shrink-0 items-center justify-center rounded-full',
              toneStyles[movement.tone].icon,
            )}
          >
            <Icon className="size-4" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p
              className={cn(
                'min-w-0 truncate font-semibold text-foreground',
                isPriority ? 'text-[15px]' : 'text-sm',
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

          <p className="mt-1.5 text-xs text-muted-foreground/80">
            {movement.actorName ? `${movement.actorName} · ` : ''}
            {movement.course} · {movement.when}
          </p>
        </div>
      </div>
    </article>
  )

  return movement.href ? (
    <Link
      href={movement.href}
      aria-label={`Abrir ${movement.title} en ${movement.course}`}
      className={cn('block rounded-xl', studentUi.focus)}
    >
      {content}
    </Link>
  ) : (
    content
  )
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
    const actorName = getActorName(feedback)

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
      actorName: actorName ?? undefined,
      actorAvatarUrl: getActorAvatarUrl(feedback),
      actorType: actorName ? 'teacher' : undefined,
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
      const actorName = getActorName(record)

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
        actorName: actorName ?? undefined,
        actorAvatarUrl: getActorAvatarUrl(record),
        actorType: actorName ? 'teacher' : undefined,
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
    <section className="space-y-3 rounded-2xl border border-border/60 bg-card/65 p-4 dark:bg-card/50">
      <SectionHeader
        title="Últimos movimientos"
        description="Novedades, entregas y devoluciones recientes de tu aula."
      />

      {movements.length > 0 ? (
        <div className="divide-y divide-border/55 rounded-xl border border-border/55 bg-background/35 dark:bg-background/20">
          {movements.map((movement, index) => (
            <MovementItem key={movement.key} movement={movement} featured={index === 0} />
          ))}
        </div>
      ) : (
        <div>
          <QuietEmptyState
            title="Todavía no hay movimientos recientes."
            description="Cuando haya anuncios, notas, entregas o devoluciones, van a aparecer acá."
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

  const nextStep = getNextStep({
    tasks: tareasPendientes,
    feedbacks: feedbacksRecientes,
    primaryCourse,
  })
  const summary = formatStudentSummary({
    pendingTasksCount: tareasPendientesCount,
    feedbackActionCount:
      feedbacksPendientes || getFeedbackActionCount(feedbacksRecientes),
  })

  return (
    <main className="flex-1 overflow-auto px-5 pb-5 pt-8 sm:pt-9 lg:px-8 lg:pb-6 lg:pt-10">
      <div className="mx-auto max-w-4xl space-y-5">
        <StudentDayHeader
          studentName={studentName}
          summary={summary}
        />

        <div className="space-y-5">
          <NextStepCard step={nextStep} />

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
