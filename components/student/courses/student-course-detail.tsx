'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileText,
  Megaphone,
  Paperclip,
  Users,
} from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import {
  StudentIconContainer,
  StudentMetaRow,
  StudentSecondaryBadge,
  StudentStatusBadge,
  studentUi,
} from '@/components/student/courses/student-course-ui'
import type { StudentCourseSectionItem } from '@/lib/student/courses/types'
import { cn } from '@/lib/utils'

type Tab =
  | 'tasks'
  | 'grades'
  | 'attendance'
  | 'people'

type SectionState = {
  loading: boolean
  loaded: boolean
  items: StudentCourseSectionItem[]
  error: string | null
}

const initialSectionState: SectionState = {
  loading: false,
  loaded: false,
  items: [],
  error: null,
}

const tabStyles: Record<
  Tab,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
  }
> = {
  tasks: {
    label: 'Tablón',
    icon: ClipboardList,
    title: 'Tablón',
    description: 'Novedades y tareas del curso.',
  },
  grades: {
    label: 'Calificaciones',
    icon: CheckCircle2,
    title: 'Calificaciones',
    description: 'Tus notas del curso.',
  },
  attendance: {
    label: 'Clases',
    icon: CalendarCheck2,
    title: 'Clases',
    description: 'Tu camino en clase.',
  },
  people: {
    label: 'Personas',
    icon: Users,
    title: 'Personas',
    description: 'Tus profes y compañeros.',
  },
}

const sectionPaths: Partial<Record<Tab, string>> = {
  tasks: 'tasks',
  grades: 'grades',
  attendance: 'attendance',
  people: 'people',
}

const panelHeaders: Partial<Record<Tab, { title: string; description: string }>> = {
  grades: {
    title: 'Calificaciones',
    description: 'Acá podés ver cómo vas en quizzes, tests, comportamiento y participación.',
  },
  attendance: {
    title: 'Historial de clases',
    description: 'Acá ves tus clases y asistencias.',
  },
  people: {
    title: 'Personas del curso',
    description: 'Acá ves quiénes aprenden con vos y quiénes te acompañan.',
  },
}

const badgeStyles = {
  neutral: 'border-border/60 bg-muted/35 text-muted-foreground',
  emerald:
    'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  amber:
    'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  rose:
    'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400',
  violet:
    'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400',
  sky:
    'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400',
}

function asItems(value: unknown): StudentCourseSectionItem[] {
  if (Array.isArray(value)) return value as StudentCourseSectionItem[]

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>

    if (record.data) return asItems(record.data)

    const commonArrayKeys = ['items', 'results', 'records', 'list', 'value']
    for (const key of commonArrayKeys) {
      if (Array.isArray(record[key])) {
        return record[key] as StudentCourseSectionItem[]
      }
    }

    const knownArrayKeys = [
      'tareas',
      'calificaciones',
      'asistencias',
      'entregas',
      'personas',
      'profesores',
      'alumnos',
      'companeros',
      'teachers',
      'students',
    ]

    const items = knownArrayKeys.flatMap((key) => {
      const nested = record[key]
      return Array.isArray(nested)
        ? (nested as StudentCourseSectionItem[]).map((item) => ({
            ...item,
            __source: key,
          }))
        : []
    })

    if (items.length > 0) return items
  }

  return []
}

function formatDate(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null

  const trimmed = value.trim()
  const localDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  const date = localDateMatch
    ? new Date(
        Number(localDateMatch[1]),
        Number(localDateMatch[2]) - 1,
        Number(localDateMatch[3]),
      )
    : new Date(trimmed)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function parseLocalDate(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null

  const trimmed = value.trim()
  const datePartMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed)
  const date = datePartMatch
    ? new Date(
        Number(datePartMatch[1]),
        Number(datePartMatch[2]) - 1,
        Number(datePartMatch[3]),
      )
    : new Date(trimmed)

  return Number.isNaN(date.getTime()) ? null : date
}

function formatCompactDate(value: unknown) {
  const date = parseLocalDate(value)

  if (!date) return typeof value === 'string' && value.trim() ? value : null

  const includeYear = date.getFullYear() !== new Date().getFullYear()

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
  })
    .format(date)
    .replace('.', '')
}

function safeText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null
}

async function loadSection(courseId: number, section: string) {
  const response = await fetch(`/api/student/courses/${courseId}/${section}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.message || 'No pudimos cargar esta parte del curso.')
  }

  const items = asItems(result)

  return items
}

function getValue(item: StudentCourseSectionItem, keys: string[]) {
  for (const key of keys) {
    const value = item[key]
    const display = displayValue(value)
    if (display) return display
  }

  return null
}

function displayValue(value: unknown): string | null {
  if (typeof value === 'string') {
    if (!value.trim()) return null
    return value
  }

  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'

  if (Array.isArray(value)) {
    return value.length > 0 ? `${value.length} elementos` : null
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return (
      getValue(record, ['nombreCompleto', 'titulo', 'nombre', 'descripcion']) ??
      null
    )
  }

  return null
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
      return 'Participación'
    case 5:
      return 'Comportamiento'
    default:
      return displayValue(value) ?? 'Nota'
  }
}

function isVisibleGradeType(value: unknown) {
  const type = Number(value)
  return type === 2 || type === 3 || type === 4 || type === 5
}

function isSkillGradeType(value: unknown) {
  const type = Number(value)
  return type === 2 || type === 3
}

function isQualitativeGradeType(value: unknown) {
  const type = Number(value)
  return type === 4 || type === 5
}

function getEstadoLabel(value: unknown) {
  const raw = displayValue(value)
  if (!raw) return null

  const normalized = raw.toLowerCase()

  if (normalized === '1') return 'Presente'
  if (normalized === '2') return 'Ausente'

  return raw
}

function getGradeBadgeClass(value: unknown) {
  const grade = Number(value)

  if (!Number.isFinite(grade)) return badgeStyles.neutral
  if (grade >= 90) return badgeStyles.violet
  if (grade >= 80) return badgeStyles.emerald
  if (grade >= 65) return badgeStyles.amber
  return badgeStyles.rose
}

function getGradeFeedbackLabel(value: unknown) {
  const grade = Number(value)

  if (!Number.isFinite(grade)) return 'Sin nota todavía'
  if (grade >= 90) return 'Excelente'
  if (grade >= 80) return 'Muy bien'
  if (grade >= 65) return 'Bien'
  return 'A revisar'
}

function getQualitativeGradeLabel(type: unknown, value: unknown) {
  if (!isQualitativeGradeType(type)) return getGradeFeedbackLabel(value)

  const grade = Number(value)

  if (grade === 100) return 'E · Excelente'
  if (grade === 90) return 'VG · Muy bien'
  if (grade === 80) return 'G · Bien'
  if (grade === 65) return 'R · A seguir practicando'

  return getGradeFeedbackLabel(value)
}

function getGradeTone(value: unknown) {
  const grade = Number(value)

  if (!Number.isFinite(grade)) {
    return {
      panelClassName: 'border-border/70 bg-muted/25 text-muted-foreground',
      badgeClassName: badgeStyles.neutral,
      progressClassName: 'bg-muted-foreground/45',
    }
  }

  if (grade >= 90) {
    return {
      panelClassName:
        'border-violet-200 bg-violet-50/70 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
      badgeClassName:
        'border-violet-200 bg-violet-50/70 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
      progressClassName: 'bg-violet-500',
    }
  }

  if (grade >= 80) {
    return {
      panelClassName:
        'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
      badgeClassName:
        'border-emerald-200 bg-emerald-50/70 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
      progressClassName: 'bg-emerald-500',
    }
  }

  if (grade >= 65) {
    return {
      panelClassName:
        'border-amber-200 bg-amber-50/70 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
      badgeClassName:
        'border-amber-200 bg-amber-50/70 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
      progressClassName: 'bg-amber-500',
    }
  }

  return {
    panelClassName:
      'border-rose-200 bg-rose-50/70 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
    badgeClassName:
      'border-rose-200 bg-rose-50/70 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
    progressClassName: 'bg-rose-500',
  }
}

function getSkillLabel(value: unknown) {
  const skill = Number(value)

  switch (skill) {
    case 1:
      return 'Reading'
    case 2:
      return 'Use of English'
    case 3:
      return 'Listening'
    case 4:
      return 'Writing'
    case 5:
      return 'Speaking'
    default:
      return displayValue(value) ?? 'Skill'
  }
}

function getSkillOrder(value: unknown) {
  const skill = Number(value)
  return Number.isFinite(skill) ? skill : 99
}

function getGradeDetails(item: StudentCourseSectionItem) {
  const details = item.detalles ?? item.Detalles
  return Array.isArray(details)
    ? [...(details as Record<string, unknown>[])].sort(
        (a, b) => getSkillOrder(a.skill ?? a.Skill) - getSkillOrder(b.skill ?? b.Skill),
      )
    : []
}

function hasGradeSkillDetails(item: StudentCourseSectionItem) {
  const value = item.tieneDetalleSkills ?? item.TieneDetalleSkills
  return value === true || String(value).toLowerCase() === 'true'
}

function getSkillPercent(detail: Record<string, unknown>) {
  const existing = Number(detail.porcentaje ?? detail.Porcentaje)
  if (Number.isFinite(existing)) return existing

  const score = Number(detail.puntajeObtenido ?? detail.PuntajeObtenido)
  const max = Number(detail.puntajeMaximo ?? detail.PuntajeMaximo)

  if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) return null

  return Math.round((score * 10000) / max) / 100
}

function getSkillScoreLabel(detail: Record<string, unknown>) {
  const score = displayValue(detail.puntajeObtenido ?? detail.PuntajeObtenido)
  const max = displayValue(detail.puntajeMaximo ?? detail.PuntajeMaximo)

  return score && max ? `${score} / ${max}` : null
}

function getAttendanceBadgeClass(value: unknown) {
  const label = getEstadoLabel(value)?.toLowerCase()

  if (label === 'presente') return badgeStyles.emerald
  if (label === 'ausente') return badgeStyles.rose
  return badgeStyles.neutral
}

type AttendanceStatus = {
  key: 'present' | 'absent' | 'unknown'
  label: string
  icon: React.ComponentType<{ className?: string }>
  badgeClassName: string
  iconClassName: string
  dotClassName: string
}

function getAttendanceStatus(value: unknown): AttendanceStatus {
  const label = getEstadoLabel(value)?.toLowerCase()

  if (label === 'presente') {
    return {
      key: 'present',
      label: 'Estuviste presente',
      icon: CheckCircle2,
      badgeClassName:
        'border-emerald-200 bg-emerald-50/70 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
      iconClassName:
        'border-emerald-200 bg-emerald-50/70 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
      dotClassName: 'bg-emerald-500',
    }
  }

  if (label === 'ausente') {
    return {
      key: 'absent',
      label: 'No asististe',
      icon: AlertCircle,
      badgeClassName:
        'border-rose-200 bg-rose-50/70 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
      iconClassName:
        'border-rose-200 bg-rose-50/70 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
      dotClassName: 'bg-rose-400 dark:bg-rose-500',
    }
  }

  return {
    key: 'unknown',
    label: 'Sin registro todavía',
    icon: CalendarCheck2,
    badgeClassName:
      'border-border/70 bg-muted/35 text-muted-foreground',
    iconClassName:
      'border-border/70 bg-muted/35 text-muted-foreground',
    dotClassName: 'bg-muted-foreground/45',
  }
}

type TaskStatus = {
  label: string
  actionLabel: string
  icon: React.ComponentType<{ className?: string }>
  badgeClassName: string
  iconClassName: string
  accentClassName: string
}

function getTaskStatus(item: StudentCourseSectionItem): TaskStatus {
  if (item.feedbackPendienteAccion === true) {
    return {
      label: 'Necesita cambios',
      actionLabel: 'Mejorar entrega',
      icon: AlertCircle,
      badgeClassName:
        'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300',
      iconClassName:
        'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      accentClassName: 'bg-amber-400',
    }
  }

  if (item.tieneEntrega === true) {
    return {
      label: 'Entregada',
      actionLabel: 'Revisar entrega',
      icon: CheckCircle2,
      badgeClassName:
        'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      iconClassName:
        'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      accentClassName: 'bg-emerald-500',
    }
  }

  if (item.vencida === true && !item.tieneEntrega) {
    return {
      label: 'Fecha pasada',
      actionLabel: 'Repasar consigna',
      icon: AlertCircle,
      badgeClassName:
        'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
      iconClassName:
        'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
      accentClassName: 'bg-rose-500',
    }
  }

  if (hasTaskDueDate(item)) {
    return {
      label: 'Para entregar',
      actionLabel: 'Empezar tarea',
      icon: Clock3,
      badgeClassName:
        'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300',
      iconClassName:
        'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
      accentClassName: 'bg-sky-500',
    }
  }

  return {
    label: 'Anuncio',
    actionLabel: 'Leer anuncio',
    icon: Megaphone,
    badgeClassName:
      'border-violet-300/60 bg-violet-50/60 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
    iconClassName:
      'border-violet-300/60 bg-violet-50/70 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
    accentClassName: 'bg-violet-300 dark:bg-violet-500',
  }
}

function hasTaskDueDate(item: StudentCourseSectionItem) {
  return typeof item.fechaEntregaUtc === 'string' && item.fechaEntregaUtc.trim().length > 0
}

function isAnnouncement(item: StudentCourseSectionItem) {
  return item.esAnuncio === true || !hasTaskDueDate(item)
}

function getTeacherDisplayName(item: StudentCourseSectionItem) {
  const firstName = safeText(item.profesorNombre)
  const lastName = safeText(item.profesorApellido)
  return [firstName, lastName].filter(Boolean).join(' ').trim() || 'Profesor'
}

function getResourceLabel(item: StudentCourseSectionItem) {
  if (item.tieneRecursos !== true) return null

  const count = Number(item.recursosCount)
  if (!Number.isFinite(count) || count <= 0) return 'Recursos'

  return `${count} ${count === 1 ? 'recurso' : 'recursos'}`
}

function getTaskDueMeta(item: StudentCourseSectionItem) {
  const dueDate = formatCompactDate(item.fechaEntregaUtc)

  if (!dueDate) {
    return {
      label: 'Anuncio',
      className: 'text-muted-foreground',
    }
  }

  if (item.tieneEntrega === true) {
    return {
      label: `Vencía ${dueDate}`,
      className: 'text-emerald-700/75 dark:text-emerald-400/75',
    }
  }

  if (item.vencida === true) {
    return {
      label: `Venció · ${dueDate}`,
      className: 'text-rose-700 dark:text-rose-400',
    }
  }

  return {
    label: `Vence el ${dueDate}`,
    className: 'text-amber-700 dark:text-amber-400',
  }
}

function getPersonRole(item: StudentCourseSectionItem): 'teacher' | 'classmate' {
  const source = getValue(item, ['__source'])?.toLowerCase()
  const role = getValue(item, ['rol'])?.toLowerCase()

  if (source === 'profesores' || source === 'teachers' || role === 'profesor') {
    return 'teacher'
  }

  return 'classmate'
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function getFullName(item: StudentCourseSectionItem) {
  const fullName = getValue(item, ['nombreCompleto'])
  if (fullName) return fullName

  const firstName = getValue(item, ['nombre'])
  const lastName = getValue(item, ['apellido'])
  return [firstName, lastName].filter(Boolean).join(' ').trim() || null
}

function getPeopleGroups(items: StudentCourseSectionItem[]) {
  return items.reduce<{
    teachers: StudentCourseSectionItem[]
    classmates: StudentCourseSectionItem[]
  }>(
    (groups, item) => {
      if (getPersonRole(item) === 'teacher') {
        groups.teachers.push(item)
      } else {
        groups.classmates.push(item)
      }

      return groups
    },
    { teachers: [], classmates: [] },
  )
}

function isCurrentStudent(item: StudentCourseSectionItem, currentStudentId?: number) {
  if (!currentStudentId) return false

  const id = Number(item.alumnoId ?? item.id)
  return Number.isFinite(id) && id === currentStudentId
}

function MetaPills({ values }: { values: Array<string | null | undefined> }) {
  const visible = values.filter((value): value is string => !!value)

  if (visible.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {visible.map((value) => (
        <span
          key={value}
          className="rounded-full border border-border/50 bg-muted/25 px-2.5 py-1 text-xs font-medium tracking-tight text-muted-foreground"
        >
          {value}
        </span>
      ))}
    </div>
  )
}

function SectionCard({
  title,
  meta,
  badge,
  badgeClassName = badgeStyles.neutral,
  description,
  action,
}: {
  title: string
  meta: Array<string | null | undefined>
  badge?: string | null
  badgeClassName?: string
  description?: string | null
  action?: React.ReactNode
}) {
  return (
    <article className="rounded-lg border border-border/60 bg-background/60 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-colors duration-200 ease-out hover:border-primary/20 hover:bg-card dark:bg-background/35 dark:hover:bg-card/90">
      <div className="flex items-start justify-between gap-4">
        <p className="min-w-0 truncate text-[15px] font-semibold tracking-tight text-foreground">
          {title}
        </p>
        {badge ? (
          <span
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
              badgeClassName,
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>

      {description ? (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}

      <MetaPills values={meta} />

      {action ? <div className="mt-4">{action}</div> : null}
    </article>
  )
}

function TaskPostCard({
  item,
  courseId,
}: {
  item: StudentCourseSectionItem
  courseId: number
}) {
  const announcement = isAnnouncement(item)
  const teacherName = getTeacherDisplayName(item)
  const title = getValue(item, ['titulo', 'nombre', 'tareaTitulo']) ?? 'Sin título'
  const description = getValue(item, ['descripcion', 'consigna'])
  const taskId = item.tareaId ?? item.id
  const status = getTaskStatus(item)
  const StatusIcon = status.icon
  const dueMeta = getTaskDueMeta(item)
  const createdAt = formatCompactDate(item.createdAtUtc)
  const resourceLabel = getResourceLabel(item)

  if (!announcement) {
    return (
      <article className={cn('group relative overflow-hidden', studentUi.card.feed)}>
        <div
          className={cn(
            'absolute inset-y-4 left-0 w-1.5 rounded-r-full',
            status.accentClassName,
          )}
        />

        <div className="grid grid-cols-[auto,minmax(0,1fr)] gap-4 p-4 pl-5 sm:flex sm:items-start sm:gap-4 sm:p-5 sm:pl-6">
          <StudentIconContainer
            icon={FileText}
            className="border-primary/15 bg-primary/10 text-primary"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-5 text-muted-foreground">
            Tarea de {teacherName}
            </p>
            <h3 className="mt-1 line-clamp-3 text-lg font-semibold leading-7 tracking-tight text-foreground sm:line-clamp-2">
              {title}
            </h3>
            {description ? (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground sm:line-clamp-2">
                {description}
              </p>
            ) : null}

            <StudentMetaRow>
              <StudentSecondaryBadge
                icon={CalendarCheck2}
                className={cn(
                  dueMeta.className,
                )}
              >
                {dueMeta.label}
              </StudentSecondaryBadge>
              {resourceLabel ? (
                <StudentSecondaryBadge icon={Paperclip}>
                  {resourceLabel}
                </StudentSecondaryBadge>
              ) : null}
              {createdAt ? (
                <time className={studentUi.meta.time}>
                  Publicada {createdAt}
                </time>
              ) : null}
            </StudentMetaRow>
          </div>

        <div className="col-span-full flex shrink-0 flex-col gap-2 sm:col-span-auto sm:min-w-32 sm:items-end">
            <StudentStatusBadge icon={StatusIcon} className={status.badgeClassName}>
              {status.label}
            </StudentStatusBadge>

            {taskId != null ? (
              <Link
                href={`/student/courses/${courseId}/tasks/${taskId}`}
                className={studentUi.button.secondaryCta}
              >
                {status.actionLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className={cn('group', studentUi.card.feed, 'border-violet-200/70 hover:border-violet-300/70 dark:border-violet-500/15 dark:hover:border-violet-500/25')}>
      <div className="grid grid-cols-[auto,minmax(0,1fr)] gap-4 p-4 sm:flex sm:items-start sm:gap-4 sm:p-5">
        <StudentIconContainer
          icon={Megaphone}
          className="border-violet-200 bg-violet-50/70 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300"
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-5 text-muted-foreground">
            Anuncio de {teacherName}
          </p>
          <h3 className="mt-1 line-clamp-3 text-lg font-semibold leading-7 tracking-tight text-foreground sm:line-clamp-2">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}

          <StudentMetaRow>
            {createdAt ? (
              <time className={studentUi.meta.time}>
                Publicado {createdAt}
              </time>
            ) : null}
            {resourceLabel ? (
              <StudentSecondaryBadge icon={Paperclip}>
                {resourceLabel}
              </StudentSecondaryBadge>
            ) : null}
          </StudentMetaRow>
        </div>

        <div className="col-span-full flex shrink-0 flex-col gap-2 sm:col-span-auto sm:min-w-28 sm:items-end">
          <StudentStatusBadge icon={StatusIcon} className={status.badgeClassName}>
            {status.label}
          </StudentStatusBadge>

          {taskId != null ? (
            <Link
              href={`/student/courses/${courseId}/tasks/${taskId}`}
              className={studentUi.button.violetCta}
            >
              {status.actionLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function AttendanceRow({ item }: { item: StudentCourseSectionItem }) {
  const estado = getEstadoLabel(item.estado) ?? getEstadoLabel(item.estadoClase)
  const status = getAttendanceStatus(estado)
  const StatusIcon = status.icon
  const fecha =
    formatDate(item.fecha) ??
    formatDate(item.fechaClase) ??
    formatDate(item.claseFecha) ??
    'Fecha sin cargar.'
  const description = getValue(item, ['descripcionClase']) ?? 'Clase del curso.'

  return (
    <article className="relative pl-7 sm:pl-9">
      <span
        className={cn(
          'absolute left-0 top-5 z-10 flex size-4 items-center justify-center rounded-full ring-4 ring-card',
          status.dotClassName,
        )}
      >
        <StatusIcon className="size-2.5 text-white" />
      </span>

      <div className={cn(studentUi.card.item, 'flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between')}>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-6 text-foreground">
            {description}
          </p>
          <time className="mt-2 block text-xs font-medium text-muted-foreground">
            {fecha}
          </time>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {status.key === 'present'
              ? 'Cada clase suma para tu progreso.'
              : status.key === 'absent'
                ? 'Podés pedir ayuda para ponerte al día.'
                : 'Cuando se tome asistencia, vas a ver el registro acá.'}
          </p>
        </div>

        <StudentStatusBadge icon={StatusIcon} className={status.badgeClassName}>
          {status.label}
        </StudentStatusBadge>
      </div>
    </article>
  )
}

function AttendanceSummary({
  items,
}: {
  items: StudentCourseSectionItem[]
}) {
  const summary = items.reduce<{ present: number; absent: number }>(
    (current, item) => {
      const estado = getEstadoLabel(item.estado) ?? getEstadoLabel(item.estadoClase)
      const status = getAttendanceStatus(estado)

      if (status.key === 'present') current.present += 1
      if (status.key === 'absent') current.absent += 1

      return current
    },
    { present: 0, absent: 0 },
  )

  const stats = [
    {
      label: 'Clases',
      value: items.length,
      className: 'border-border/55 bg-background/75 text-foreground',
    },
    {
      label: 'Prácticas',
      value: summary.present,
      className: 'border-emerald-200/50 bg-emerald-50/25 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-300',
    },
    {
      label: 'Por recuperar',
      value: summary.absent,
      className: 'border-rose-200/50 bg-rose-50/25 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/5 dark:text-rose-300',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(studentUi.card.item, 'flex min-h-20 flex-col justify-center px-3 py-3 sm:min-h-24 sm:px-4', stat.className)}
        >
          <p className="text-2xl font-semibold leading-none tracking-tight sm:text-3xl">
            {stat.value}
          </p>
          <p className="mt-2 text-[11px] font-medium leading-4 text-muted-foreground sm:text-xs">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

function AttendanceHistory({
  items,
}: {
  items: StudentCourseSectionItem[]
}) {
  return (
    <section className="space-y-5">
      <AttendanceSummary items={items} />

      <div className="relative space-y-3 before:absolute before:left-2 before:bottom-5 before:top-5 before:w-px before:bg-border/50 sm:space-y-4">
        {items.map((item, index) => (
          <AttendanceRow
            key={String(item.id ?? item.asistenciaId ?? item.claseId ?? index)}
            item={item}
          />
        ))}
      </div>
    </section>
  )
}

function TeacherPersonCard({ item }: { item: StudentCourseSectionItem }) {
  const name = getFullName(item) ?? 'Nombre no disponible'

  return (
    <article className="rounded-xl border border-violet-200/60 bg-violet-50/30 p-4 transition-colors duration-200 ease-out hover:border-violet-300/70 hover:bg-violet-50/45 dark:border-violet-500/15 dark:bg-violet-500/5 dark:hover:border-violet-500/25">
      <div className="flex items-center gap-3">
        <StudentIconContainer className="border-violet-200 bg-background/80 text-sm font-semibold text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
          {getInitials(name) || '?'}
        </StudentIconContainer>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-[15px] font-semibold leading-5 tracking-tight text-foreground">
              {name}
            </h3>
            <span className={cn(studentUi.badge.compact, 'border-violet-200 bg-background/70 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300')}>
              Profe
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Te acompaña en este curso</p>
        </div>
      </div>
    </article>
  )
}

function ClassmatePersonCard({
  item,
  currentStudentId,
}: {
  item: StudentCourseSectionItem
  currentStudentId?: number
}) {
  const name = getFullName(item) ?? 'Nombre no disponible'
  const current = isCurrentStudent(item, currentStudentId)

  return (
    <article
      className={cn(
        'rounded-xl border p-4 transition-colors duration-200 ease-out hover:border-primary/15 hover:bg-card',
        current
          ? 'border-primary/25 bg-primary/8'
          : 'border-border/60 bg-background/60 dark:bg-background/35',
      )}
    >
      <div className="flex items-center gap-3">
        <StudentIconContainer size="md" className="border-primary/10 bg-primary/8 text-sm font-semibold text-primary">
          {getInitials(name) || '?'}
        </StudentIconContainer>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-[15px] font-semibold leading-5 tracking-tight text-foreground">
              {name}
            </h3>
            <span className={cn(studentUi.badge.compact, 'border-border/60 bg-muted/30 text-muted-foreground')}>
              {current ? 'Vos' : 'Compañero'}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {current ? 'Este sos vos' : 'Aprende con vos'}
          </p>
        </div>
      </div>
    </article>
  )
}

function PeopleEmptyState({ text }: { text: string }) {
  return (
    <div className={cn(studentUi.card.empty, 'px-5 py-8 text-center')}>
      <p className="text-sm font-semibold text-foreground">{text}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Cuando el curso tenga movimiento, vas a verlo organizado acá.
      </p>
    </div>
  )
}

function PeopleCommunity({
  items,
  currentStudentId,
}: {
  items: StudentCourseSectionItem[]
  currentStudentId?: number
}) {
  const { teachers, classmates } = getPeopleGroups(items)

  if (teachers.length === 0 && classmates.length === 0) {
    return <PeopleEmptyState text="Todavía no hay personas para mostrar." />
  }

  return (
    <section className="space-y-6">
      <section className="space-y-3" aria-labelledby="course-teachers-title">
        <h3 id="course-teachers-title" className="text-sm font-semibold text-foreground">
          Tus profes
        </h3>
        {teachers.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {teachers.map((item, index) => (
              <TeacherPersonCard
                key={String(item.id ?? item.profesorId ?? index)}
                item={item}
              />
            ))}
          </div>
        ) : (
          <PeopleEmptyState text="Todavía no hay profes asignados." />
        )}
      </section>

      <section className="space-y-3" aria-labelledby="course-classmates-title">
        <h3 id="course-classmates-title" className="text-sm font-semibold text-foreground">
          Compañeros
        </h3>
        {classmates.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {classmates.map((item, index) => (
              <ClassmatePersonCard
                key={String(item.id ?? item.alumnoId ?? index)}
                item={item}
                currentStudentId={currentStudentId}
              />
            ))}
          </div>
        ) : (
          <PeopleEmptyState text="Todavía no hay compañeros en la lista." />
        )}
      </section>
    </section>
  )
}

function GradeCard({ item }: { item: StudentCourseSectionItem }) {
  const [skillsOpen, setSkillsOpen] = useState(false)
  const grade = Number(item.nota)
  const gradeDisplay = displayValue(item.nota) ?? 'Sin nota todavía'
  const tone = getGradeTone(item.nota)
  const feedbackLabel = getQualitativeGradeLabel(item.tipo, item.nota)
  const description = safeText(item.descripcion)
  const details = getGradeDetails(item)
  const date = formatDate(item.fecha)
  const showSkills =
    isSkillGradeType(item.tipo) &&
    hasGradeSkillDetails(item) &&
    details.length > 0
  const skillPanelId = `grade-skills-${String(item.id ?? item.calificacionId ?? item.titulo ?? 'item')}`

  return (
    <article className={studentUi.card.grade}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <span
              className={cn(
                studentUi.badge.compact,
                tone.badgeClassName,
              )}
            >
              {getGradeTypeLabel(item.tipo)}
            </span>
            {date ? <time>{date}</time> : null}
          </div>

          <h3 className="mt-3 text-lg font-semibold leading-6 tracking-tight text-foreground">
            {safeText(item.titulo) ?? 'Sin título'}
          </h3>

          {description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {Number.isFinite(grade)
              ? 'Usá esta nota para entender qué seguir practicando.'
              : 'Cuando tu profe cargue la nota, va a aparecer acá.'}
          </p>
        </div>

        <div
          className={cn(
            'flex w-full shrink-0 flex-col items-start gap-2 rounded-2xl border px-4 py-3 sm:w-36 sm:justify-center',
            tone.panelClassName,
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-80">
            Nota final
          </p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:mt-2 sm:block">
            <p className="text-3xl font-semibold leading-none tracking-tight">
              {Number.isFinite(grade) ? gradeDisplay : '-'}
            </p>
            <p className="text-sm font-semibold sm:mt-1">{feedbackLabel}</p>
          </div>
        </div>
      </div>

      {showSkills ? (
        <div className="mt-5 border-t border-border/60 pt-4">
          <button
            type="button"
            aria-expanded={skillsOpen}
            aria-controls={skillPanelId}
            onClick={() => setSkillsOpen((current) => !current)}
            className={cn('group flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left text-sm font-semibold text-foreground transition-colors duration-200 ease-out hover:bg-muted/40', studentUi.focus)}
          >
            <span>
              {skillsOpen ? 'Ocultar detalle por skills' : 'Ver cómo te fue por skill'}
            </span>
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-hover:text-foreground',
                skillsOpen && 'rotate-180',
              )}
            />
          </button>
          {skillsOpen ? (
            <div id={skillPanelId} className="mt-3 space-y-3 animate-in fade-in-0 slide-in-from-top-1 duration-200">
            {details.map((detail, index) => {
              const percent = getSkillPercent(detail)
              const clampedPercent = percent == null ? 0 : Math.min(100, Math.max(0, percent))
              const scoreLabel = getSkillScoreLabel(detail)

              return (
                <div key={`${String(detail.skill ?? detail.Skill)}-${index}`} className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                    <span className="font-medium text-foreground">
                      {getSkillLabel(detail.skill ?? detail.Skill)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {[scoreLabel]}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full transition-[width] duration-500 ease-out', tone.progressClassName)}
                      style={{ width: `${clampedPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

function renderSectionCard(
  item: StudentCourseSectionItem,
  tab: Tab,
  courseId: number
) {
  if (tab === 'tasks') {
    return <TaskPostCard item={item} courseId={courseId} />
  }

  if (tab === 'grades') {
    return <GradeCard item={item} />

  }

  if (tab === 'attendance') {
    const estado = getEstadoLabel(item.estado) ?? getEstadoLabel(item.estadoClase)
    const fecha =
      formatDate(item.fecha) ??
      formatDate(item.fechaClase) ??
      formatDate(item.claseFecha)

    return (
      <SectionCard
        title={fecha ?? 'Fecha sin cargar'}
        badge={estado}
        badgeClassName={getAttendanceBadgeClass(estado)}
        description={getValue(item, ['descripcionClase'])}
        meta={[
          getValue(item, ['cursoNombre']),
        ]}
      />
    )
  }

  return (
    <SectionCard
      title={getValue(item, ['titulo', 'nombre']) ?? 'Elemento del curso'}
      meta={[getValue(item, ['descripcion'])]}
    />
  )
}

function InfoStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/90 px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/85">
      <div className="flex items-center gap-3">
        <StudentIconContainer icon={Icon} size="md" className="border-transparent bg-primary/10 text-primary" />

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold leading-none tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

function SectionSkeleton() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-xl border border-border/60 bg-muted/25"
        />
      ))}
    </div>
  )
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <Card className="rounded-xl border border-dashed border-border/70 bg-muted/15 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-muted/10">
      <CardContent className="px-6 py-14 text-center">
        <StudentIconContainer icon={BookOpen} className="mx-auto size-11 rounded-lg border-transparent bg-primary/10 text-primary" />
        <p className="mt-4 text-sm font-semibold text-foreground">{text}</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          Cuando tu profe publique algo nuevo, lo vas a encontrar en esta sección.
        </p>
      </CardContent>
    </Card>
  )
}

function AttendanceEmptyState() {
  return (
    <div className={cn(studentUi.card.empty, 'px-5 py-10 text-center')}>
      <StudentIconContainer icon={CalendarCheck2} className="mx-auto border-transparent bg-primary/10 text-primary" />
      <p className="mt-3 text-sm font-medium text-muted-foreground">
        Todavía no hay clases para mostrar en este curso.
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Cuando empiece el registro de clases, vas a poder seguir tu recorrido.
      </p>
    </div>
  )
}

function TaskFeedSkeleton() {
  return (
    <div className="mx-auto max-w-[900px] space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-xl border border-border/60 bg-muted/25"
        />
      ))}
    </div>
  )
}

function TaskFeed({
  items,
  courseId,
}: {
  items: StudentCourseSectionItem[]
  courseId: number
}) {
  return (
    <div className="mx-auto max-w-[900px] space-y-3">
      {items.map((item, index) => (
        <TaskPostCard
          key={String(item.id ?? item.tareaId ?? index)}
          item={item}
          courseId={courseId}
        />
      ))}
    </div>
  )
}

function SectionList({
  tab,
  state,
  courseId,
  currentStudentId,
}: {
  tab: Tab
  state: SectionState
  courseId: number
  currentStudentId?: number
}) {
  if (state.loading && tab === 'tasks') return <TaskFeedSkeleton />
  if (state.loading) return <SectionSkeleton />

  if (state.error) {
    return <EmptyPanel text={state.error} />
  }

  const visibleItems = tab === 'grades'
    ? state.items.filter((item) => isVisibleGradeType(item.tipo))
    : state.items

  if (visibleItems.length === 0) {
    if (tab === 'attendance') return <AttendanceEmptyState />
    if (tab === 'tasks') {
      return <EmptyPanel text="Todavía no hay actividades en el tablón." />
    }

    if (tab === 'grades') {
      return <EmptyPanel text="Todavía no hay calificaciones para aprender de ellas." />
    }

    if (tab === 'people') {
      return <PeopleEmptyState text="Todavía no hay personas para mostrar." />
    }

    return <EmptyPanel text="Todavía no hay contenido en esta sección." />
  }

  if (tab === 'attendance') {
    return <AttendanceHistory items={visibleItems} />
  }

  if (tab === 'tasks') {
    return <TaskFeed items={visibleItems} courseId={courseId} />
  }

  if (tab === 'people') {
    return <PeopleCommunity items={visibleItems} currentStudentId={currentStudentId} />
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {visibleItems.map((item, index) => (
        <div
          key={String(item.id ?? item.tareaId ?? item.calificacionId ?? index)}
        >
          {renderSectionCard(item, tab, courseId)}
        </div>
      ))}
    </div>
  )
}

export function StudentCourseDetail({
  courseId,
  currentStudentId,
}: {
  courseId: number
  currentStudentId?: number
}) {
  const [tab, setTab] = useState<Tab>('tasks')
  const [sections, setSections] = useState<Record<string, SectionState>>({})
  const panelHeader = panelHeaders[tab]
  const sectionPath = sectionPaths[tab]
  const sectionState = sections[tab] ?? initialSectionState

  useEffect(() => {
    if (!sectionPath || sectionState.loading || sectionState.loaded) return

    setSections((current) => ({
      ...current,
      [tab]: { ...initialSectionState, loading: true, loaded: false },
    }))

    loadSection(courseId, sectionPath)
      .then((items) => {
        setSections((current) => ({
          ...current,
          [tab]: { loading: false, loaded: true, items, error: null },
        }))
      })
      .catch((error) => {
        setSections((current) => ({
          ...current,
          [tab]: {
            loading: false,
            loaded: true,
            items: [],
            error: error instanceof Error ? error.message : 'No pudimos cargar esta parte.',
          },
        }))
      })
  }, [courseId, sectionPath, sectionState.loaded, sectionState.loading, tab])

  const tabs = useMemo(
    () => ['tasks', 'attendance', 'grades', 'people'] as Tab[],
    []
  )

  return (
    <>
      <div className="space-y-4">
        <nav
          aria-label="Secciones del curso"
          className="flex max-w-full flex-wrap gap-4 border-b border-border/70"
        >
          {tabs.map((key) => {
            const tabConfig = tabStyles[key]
            const Icon = tabConfig.icon
            const active = tab === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  'group -mb-px inline-flex min-h-10 items-center gap-2 border-b-2 px-0.5 py-2 text-sm font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 sm:px-1',
                  active
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                )}
              >
                <Icon className="size-4 transition-colors duration-200 ease-out" />
                <span>{tabConfig.label}</span>
              </button>
            )
          })}
        </nav>

        {tab === 'tasks' ? (
          <SectionList
            tab={tab}
            state={sectionState}
            courseId={courseId}
            currentStudentId={currentStudentId}
          />
        ) : (
          <div className={studentUi.card.panel}>
            {panelHeader ? (
              <div className="border-b border-border/60 px-4 py-4 sm:px-6 sm:py-5">
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                  {panelHeader.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {panelHeader.description}
                </p>
              </div>
            ) : null}

            <div className="p-4 sm:p-6">
            <SectionList
              tab={tab}
              state={sectionState}
              courseId={courseId}
              currentStudentId={currentStudentId}
            />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
