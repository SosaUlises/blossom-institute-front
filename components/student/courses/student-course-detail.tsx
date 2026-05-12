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
    description: 'Publicaciones y actividades del curso.',
  },
  grades: {
    label: 'Calificaciones',
    icon: CheckCircle2,
    title: 'Calificaciones',
    description: 'Notas registradas para este curso.',
  },
  attendance: {
    label: 'Clases',
    icon: CalendarCheck2,
    title: 'Clases',
    description: 'Clases y asistencia registradas para este curso.',
  },
  people: {
    label: 'Personas',
    icon: Users,
    title: 'Personas',
    description: 'Equipo docente y personas vinculadas al curso.',
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
    description: 'Notas registradas para este curso.',
  },
  attendance: {
    title: 'Historial de clases',
    description: 'Estas son las clases registradas y tu asistencia.',
  },
  people: {
    title: 'Personas del curso',
    description: 'Acá ves quiénes comparten este curso con vos.',
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
    throw new Error(result?.message || 'No se pudo cargar la sección.')
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
    return value.length > 0 ? `${value.length} registros` : null
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

  if (!Number.isFinite(grade)) return 'Sin nota'
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
    label: 'Sin asistencia cargada',
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
      actionLabel: 'Corregir',
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
      actionLabel: 'Ver mi entrega',
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
      label: 'Se venció',
      actionLabel: 'Ver tarea',
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
      actionLabel: 'Hacer tarea',
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
      label: `Vencía el ${dueDate}`,
      className: 'text-emerald-700/75 dark:text-emerald-400/75',
    }
  }

  if (item.vencida === true) {
    return {
      label: `Se venció · ${dueDate}`,
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
          className="rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-xs font-medium tracking-tight text-muted-foreground"
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
    <article className="rounded-[24px] border border-border/60 bg-background/75 p-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/20 hover:bg-card hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.18)]">
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
  const ctaClassName =
    'inline-flex h-9 w-full items-center justify-center rounded-xl border border-border/70 bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/20 hover:bg-muted/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:w-fit'

  if (!announcement) {
    return (
      <article className="group relative overflow-hidden rounded-[24px] border border-border/70 bg-card shadow-[0_14px_34px_-28px_rgba(15,23,42,0.25)] transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/20 hover:shadow-[0_20px_44px_-30px_rgba(15,23,42,0.32)]">
        <div
          className={cn(
            'absolute inset-y-4 left-0 w-1.5 rounded-r-full',
            status.accentClassName,
          )}
        />

        <div className="flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-start sm:gap-4 sm:p-5 sm:pl-6">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
            <FileText className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-5 text-muted-foreground">
              Tarea de {teacherName}
            </p>
            <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-6 tracking-tight text-foreground">
              {title}
            </h3>
            {description ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/75 px-2.5 py-1 font-medium',
                  dueMeta.className,
                )}
              >
                <CalendarCheck2 className="size-4" />
                {dueMeta.label}
              </span>
              {resourceLabel ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/75 px-2.5 py-1 font-medium">
                  <Paperclip className="size-4" />
                  {resourceLabel}
                </span>
              ) : null}
              {createdAt ? (
                <time className="inline-flex items-center rounded-full px-1 text-xs">
                  Publicada {createdAt}
                </time>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:min-w-36 sm:items-end">
            <span
              className={cn(
                'inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold',
                status.badgeClassName,
              )}
            >
              <StatusIcon className="size-4" />
              {status.label}
            </span>

            {taskId != null ? (
              <Link
                href={`/student/courses/${courseId}/tasks/${taskId}`}
                className={ctaClassName}
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
    <article className="group rounded-[24px] border border-violet-200/70 bg-card shadow-[0_12px_30px_-30px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:border-violet-300/70 hover:shadow-[0_18px_40px_-34px_rgba(15,23,42,0.24)] dark:border-violet-500/15 dark:hover:border-violet-500/25">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50/70 text-violet-700 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
          <Megaphone className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-5 text-muted-foreground">
            Anuncio de {teacherName}
          </p>
          <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-6 tracking-tight text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {createdAt ? (
              <time className="inline-flex items-center rounded-full px-1 text-xs">
                Publicado {createdAt}
              </time>
            ) : null}
            {resourceLabel ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/75 px-2.5 py-1 font-medium">
                <Paperclip className="size-4" />
                {resourceLabel}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:min-w-28 sm:items-end">
          <span
            className={cn(
              'inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold',
              status.badgeClassName,
            )}
          >
            <StatusIcon className="size-4" />
            {status.label}
          </span>

          {taskId != null ? (
            <Link
              href={`/student/courses/${courseId}/tasks/${taskId}`}
              className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-violet-200/70 bg-transparent px-3 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/25 sm:w-fit dark:border-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
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
  const description = getValue(item, ['descripcionClase']) ?? 'Clase registrada.'

  return (
    <article className="relative pl-9">
      <span
        className={cn(
          'absolute left-0 top-5 z-10 flex size-4 items-center justify-center rounded-full ring-4 ring-card',
          status.dotClassName,
        )}
      >
        <StatusIcon className="size-2.5 text-white" />
      </span>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/75 px-4 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-6 text-foreground">
            {description}
          </p>
          <time className="mt-2 block text-xs font-medium text-muted-foreground">
            {fecha}
          </time>
        </div>

        <span
          className={cn(
            'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold',
            status.badgeClassName,
          )}
        >
          <StatusIcon className="size-4" />
          {status.label}
        </span>
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
      label: 'Clases registradas',
      value: items.length,
      className: 'border-border/55 bg-background/75 text-foreground',
    },
    {
      label: 'Presentes',
      value: summary.present,
      className: 'border-emerald-200/50 bg-emerald-50/25 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-300',
    },
    {
      label: 'Ausentes',
      value: summary.absent,
      className: 'border-rose-200/50 bg-rose-50/25 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/5 dark:text-rose-300',
    },
  ]

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn('flex min-h-24 flex-col justify-center rounded-2xl border px-4 py-3 transition-colors hover:bg-muted/30', stat.className)}
        >
          <p className="text-3xl font-semibold leading-none tracking-tight">
            {stat.value}
          </p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">{stat.label}</p>
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

      <div className="relative space-y-3 before:absolute before:left-2 before:bottom-5 before:top-5 before:w-px before:bg-border/50">
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
  const name = getFullName(item) ?? 'Sin nombre'

  return (
    <article className="rounded-[22px] border border-violet-200/60 bg-violet-50/35 p-4 transition-colors hover:border-violet-300/70 hover:bg-violet-50/55 dark:border-violet-500/15 dark:bg-violet-500/5 dark:hover:border-violet-500/25">
      <div className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-violet-200 bg-background/80 text-sm font-semibold text-violet-700 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
          {getInitials(name) || '?'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-[15px] font-semibold leading-5 tracking-tight text-foreground">
              {name}
            </h3>
            <span className="rounded-full border border-violet-200 bg-background/70 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
              Profe
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Acompaña este curso</p>
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
  const name = getFullName(item) ?? 'Sin nombre'
  const current = isCurrentStudent(item, currentStudentId)

  return (
    <article
      className={cn(
        'rounded-[20px] border p-4 transition-colors hover:border-primary/15 hover:bg-card',
        current
          ? 'border-primary/25 bg-primary/8'
          : 'border-border/60 bg-background/75',
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-primary/8 text-sm font-semibold text-primary">
          {getInitials(name) || '?'}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold leading-5 tracking-tight text-foreground">
              {name}
            </h3>
            <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {current ? 'Vos' : 'Compañero'}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {current ? 'Este sos vos' : 'Comparte este curso con vos'}
          </p>
        </div>
      </div>
    </article>
  )
}

function PeopleEmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-5 py-8 text-center">
      <p className="text-sm font-medium text-muted-foreground">{text}</p>
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
    return <PeopleEmptyState text="Todavía no hay personas cargadas para este curso." />
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
          <PeopleEmptyState text="Todavía no hay profes cargados." />
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
          <PeopleEmptyState text="Todavía no hay compañeros cargados." />
        )}
      </section>
    </section>
  )
}

function GradeCard({ item }: { item: StudentCourseSectionItem }) {
  const [skillsOpen, setSkillsOpen] = useState(false)
  const grade = Number(item.nota)
  const gradeDisplay = displayValue(item.nota) ?? 'Sin nota'
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
    <article className="rounded-[24px] border border-border/60 bg-background/75 p-4 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.16)] transition-colors hover:border-primary/20 hover:bg-card sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-1 font-semibold',
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
        </div>

        <div
          className={cn(
            'flex w-full shrink-0 items-center justify-between rounded-2xl border px-4 py-3 sm:w-36 sm:flex-col sm:items-start sm:justify-center',
            tone.panelClassName,
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-80">
            Nota final
          </p>
          <div className="flex items-baseline gap-2 sm:mt-2 sm:block">
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
            className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <span>
              {skillsOpen ? 'Ocultar detalle por skills' : 'Ver detalle por skills'}
            </span>
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                skillsOpen && 'rotate-180',
              )}
            />
          </button>
          {skillsOpen ? (
            <div id={skillPanelId} className="mt-3 space-y-3">
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
                      className={cn('h-full rounded-full', tone.progressClassName)}
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
        title={fecha ?? 'Sin fecha'}
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
      title={getValue(item, ['titulo', 'nombre']) ?? 'Registro'}
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
    <div className="rounded-[22px] border border-border/60 bg-card/85 px-4 py-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.20)]">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>

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
          className="h-28 animate-pulse rounded-[24px] border border-border/60 bg-muted/30"
        />
      ))}
    </div>
  )
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <Card className="rounded-[28px] border border-dashed border-border/70 bg-muted/20 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.14)]">
      <CardContent className="px-6 py-14 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <BookOpen className="size-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  )
}

function AttendanceEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-5 py-10 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <CalendarCheck2 className="size-5" />
      </div>
      <p className="mt-3 text-sm font-medium text-muted-foreground">
        Todavía no hay clases cargadas para este curso.
      </p>
    </div>
  )
}

function TaskFeedSkeleton() {
  return (
    <div className="mx-auto max-w-[900px] space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-2xl border border-border/60 bg-muted/25"
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
    <div className="mx-auto max-w-[900px] space-y-4">
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
      return <EmptyPanel text="Todavía no hay publicaciones en el tablón." />
    }

    if (tab === 'grades') {
      return <EmptyPanel text="Todavía no hay calificaciones de quizzes, tests o participación." />
    }

    if (tab === 'people') {
      return <PeopleEmptyState text="Todavía no hay personas cargadas para este curso." />
    }

    return <EmptyPanel text="No hay registros para mostrar." />
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
            error: error instanceof Error ? error.message : 'No se pudo cargar.',
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
          className="flex flex-wrap gap-1 border-b border-border/60"
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
                  'group -mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
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
          <div className="rounded-[30px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
            {panelHeader ? (
              <div className="border-b border-border/60 px-6 py-5">
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                  {panelHeader.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {panelHeader.description}
                </p>
              </div>
            ) : null}

            <div className="p-6">
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
