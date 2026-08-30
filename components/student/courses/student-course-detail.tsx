'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  BookOpen,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileText,
  Megaphone,
  Users,
} from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import {
  StudentIconContainer,
  StudentStatusBadge,
  studentUi,
} from '@/components/student/courses/student-course-ui'
import { UserAvatar } from '@/components/shared/user-avatar'
import type { StudentCourseSectionItem } from '@/lib/student/courses/types'
import { cn } from '@/lib/utils'

type Tab =
  | 'tasks'
  | 'grades'
  | 'attendance'
  | 'people'

const tabSlugs: Record<Tab, string> = {
  tasks: 'tablon',
  attendance: 'clases',
  grades: 'calificaciones',
  people: 'personas',
}

function getTabFromSlug(value: string | null): Tab {
  const entry = Object.entries(tabSlugs).find(([, slug]) => slug === value)
  return (entry?.[0] as Tab | undefined) ?? 'tasks'
}

type SectionState = {
  loading: boolean
  loaded: boolean
  items: StudentCourseSectionItem[]
  summary?: StudentGradesAcademicSummary | null
  error: string | null
}

type StudentGradesAcademicSummary = Record<string, unknown> & {
  averageGrade?: number | null
  AverageGrade?: number | null
  academicGradesCount?: number | null
  AcademicGradesCount?: number | null
  quizCount?: number | null
  QuizCount?: number | null
  testCount?: number | null
  TestCount?: number | null
  year?: number | null
  Year?: number | null
  quarter?: number | null
  Quarter?: number | null
  periodLabel?: string | null
  PeriodLabel?: string | null
  periodRangeLabel?: string | null
  PeriodRangeLabel?: string | null
}

type SectionPayload = {
  items: StudentCourseSectionItem[]
  summary?: StudentGradesAcademicSummary | null
}

type StudentPublicationAttachment = {
  id?: number | string | null
  url: string
  nombre: string
  contentType?: string | null
  sizeBytes?: number | null
}

const initialSectionState: SectionState = {
  loading: false,
  loaded: false,
  items: [],
  summary: null,
  error: null,
}

const INITIAL_VISIBLE_GRADES = 8

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
    description: 'Quienes forman parte de tu aula.',
  },
}

const sectionPaths: Partial<Record<Tab, string>> = {
  tasks: 'tasks',
  grades: 'grades',
  attendance: 'attendance',
  people: 'people',
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

function asSectionPayload(value: unknown): SectionPayload {
  const record = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
  const data = record?.data && typeof record.data === 'object' && !Array.isArray(record.data)
    ? record.data as Record<string, unknown>
    : record

  return {
    items: asItems(value),
    summary: data?.summary && typeof data.summary === 'object' && !Array.isArray(data.summary)
      ? data.summary as StudentGradesAcademicSummary
      : null,
  }
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

function formatAttachmentSize(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null
  }

  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
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

  const payload = asSectionPayload(result)

  if (section !== 'tasks') return payload

  return {
    ...payload,
    items: await enrichTaskResources(courseId, payload.items),
  }
}

function unwrapRecord(value: unknown): StudentCourseSectionItem | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const record = value as StudentCourseSectionItem
  const data = record.data

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as StudentCourseSectionItem
  }

  return record
}

function shouldLoadTaskResources(item: StudentCourseSectionItem) {
  const taskId = item.tareaId ?? item.id

  return (
    taskId != null &&
    !Array.isArray(item.recursos) &&
    !Array.isArray(item.resources) &&
    !Array.isArray(item.adjuntos)
  )
}

async function enrichTaskResources(
  courseId: number,
  items: StudentCourseSectionItem[],
) {
  const enriched = await Promise.all(
    items.map(async (item) => {
      if (!shouldLoadTaskResources(item)) return item

      const taskId = item.tareaId ?? item.id

      try {
        const response = await fetch(`/api/student/courses/${courseId}/tasks/${taskId}`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!response.ok) return item

        const detail = unwrapRecord(await response.json().catch(() => null))
        if (!detail) return item

        return {
          ...item,
          recursos: Array.isArray(detail.recursos) ? detail.recursos : item.recursos,
          resources: Array.isArray(detail.resources) ? detail.resources : item.resources,
          adjuntos: Array.isArray(detail.adjuntos) ? detail.adjuntos : item.adjuntos,
        }
      } catch {
        return item
      }
    }),
  )

  return enriched
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

function formatGradeNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function sortGradesByRecentDate(items: StudentCourseSectionItem[]) {
  return [...items].sort((a, b) => {
    const dateA = parseLocalDate(a.fecha)?.getTime() ?? 0
    const dateB = parseLocalDate(b.fecha)?.getTime() ?? 0

    if (dateA !== dateB) return dateB - dateA

    return String(safeText(a.titulo) ?? '').localeCompare(String(safeText(b.titulo) ?? ''))
  })
}

function getSummaryNumber(summary: StudentGradesAcademicSummary | null | undefined, keys: string[]) {
  if (!summary) return null

  for (const key of keys) {
    const value = summary[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }

  return null
}

function getSummaryText(summary: StudentGradesAcademicSummary | null | undefined, keys: string[]) {
  if (!summary) return null

  for (const key of keys) {
    const value = summary[key]
    if (typeof value === 'string' && value.trim()) return value
  }

  return null
}

function formatQuarter(value: number | null) {
  if (!value || !Number.isFinite(value)) return 'trimestre actual'
  return `${value}º trimestre`
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
      return displayValue(value) ?? 'Habilidad'
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
  const fullName =
    getValue(item, ['profesorNombreCompleto', 'teacherName', 'createdByName']) ??
    getValueFromNestedRecord(item, ['createdBy', 'CreatedBy', 'autor', 'author'], [
      'nombreCompleto',
      'fullName',
      'name',
    ])

  if (fullName) return fullName

  const firstName = safeText(item.profesorNombre)
  const lastName = safeText(item.profesorApellido)
  const nestedFirstName = getValueFromNestedRecord(
    item,
    ['createdBy', 'CreatedBy', 'autor', 'author'],
    ['nombre', 'firstName'],
  )
  const nestedLastName = getValueFromNestedRecord(
    item,
    ['createdBy', 'CreatedBy', 'autor', 'author'],
    ['apellido', 'lastName'],
  )

  return (
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    [nestedFirstName, nestedLastName].filter(Boolean).join(' ').trim() ||
    'Profesor'
  )
}

function getValueFromNestedRecord(
  item: StudentCourseSectionItem,
  recordKeys: string[],
  valueKeys: string[],
) {
  for (const recordKey of recordKeys) {
    const record = item[recordKey]
    if (!record || typeof record !== 'object') continue

    const value = getValue(record as Record<string, unknown>, valueKeys)
    if (value) return value
  }

  return null
}

function getTeacherAvatarUrl(item: StudentCourseSectionItem) {
  return (
    getValue(item, [
      'profesorAvatarUrl',
      'ProfesorAvatarUrl',
      'teacherAvatarUrl',
      'TeacherAvatarUrl',
      'createdByAvatarUrl',
      'avatarUrl',
    ]) ??
    getValueFromNestedRecord(item, ['createdBy', 'CreatedBy', 'autor', 'author'], [
      'avatarUrl',
      'fotoUrl',
      'imageUrl',
    ])
  )
}

function isImageAttachment(attachment: StudentPublicationAttachment) {
  const contentType = attachment.contentType?.toLowerCase() ?? ''
  const name = attachment.nombre.toLowerCase()
  const url = attachment.url.toLowerCase()

  return (
    contentType.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/.test(name) ||
    /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/.test(url)
  )
}

function getPublicationAttachments(item: StudentCourseSectionItem) {
  const resources = Array.isArray(item.recursos)
    ? item.recursos
    : Array.isArray(item.resources)
      ? item.resources
      : Array.isArray(item.adjuntos)
        ? item.adjuntos
        : null

  if (!resources) return []

  return resources
    .map((resource): StudentPublicationAttachment | null => {
      const record = resource as Record<string, unknown>
      const url = String(
        record.url ??
          record.Url ??
          record.publicUrl ??
          record.secureUrl ??
          record.downloadUrl ??
          record.archivoUrl ??
          '',
      ).trim()

      if (!url) return null

      return {
        id: (record.id as number | string | null | undefined) ?? url,
        url,
        nombre: String(record.nombre ?? record.Nombre ?? record.name ?? record.fileName ?? 'Adjunto').trim() || 'Adjunto',
        contentType:
          typeof record.contentType === 'string'
            ? record.contentType
            : typeof record.ContentType === 'string'
              ? record.ContentType
              : typeof record.mimeType === 'string'
                ? record.mimeType
              : null,
        sizeBytes:
          typeof record.sizeBytes === 'number'
            ? record.sizeBytes
            : typeof record.SizeBytes === 'number'
              ? record.SizeBytes
              : null,
      }
    })
    .filter(
      (attachment): attachment is StudentPublicationAttachment => attachment !== null,
    )
}

function getTaskDueMeta(item: StudentCourseSectionItem) {
  const dueDate = formatCompactDate(item.fechaEntregaUtc)

  if (!dueDate) return null

  if (item.tieneEntrega === true) {
    return {
      label: `Vencía ${dueDate}`,
      className:
        'border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-300',
    }
  }

  if (item.vencida === true) {
    return {
      label: `Venció ${dueDate}`,
      className:
        'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    }
  }

  return {
    label: `Vence ${dueDate}`,
    className:
      'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  }
}

function getTaskCreatedMeta(item: StudentCourseSectionItem) {
  return (
    formatCompactDate(item.createdAtUtc) ??
    formatCompactDate(item.fechaCreacionUtc) ??
    formatCompactDate(item.fechaPublicacionUtc)
  )
}

function getPersonRole(item: StudentCourseSectionItem): 'teacher' | 'classmate' {
  const source = getValue(item, ['__source'])?.toLowerCase()
  const role = getValue(item, ['rol'])?.toLowerCase()

  if (source === 'profesores' || source === 'teachers' || role === 'profesor') {
    return 'teacher'
  }

  return 'classmate'
}

function getFullName(item: StudentCourseSectionItem) {
  const fullName = getValue(item, ['nombreCompleto'])
  if (fullName) return fullName

  const firstName = getValue(item, ['nombre'])
  const lastName = getValue(item, ['apellido'])
  return [firstName, lastName].filter(Boolean).join(' ').trim() || null
}

function getPersonEmail(item: StudentCourseSectionItem) {
  return (
    getValue(item, ['email', 'correo', 'mail', 'correoElectronico']) ??
    getValueFromNestedRecord(item, ['user', 'User', 'usuario', 'Usuario'], [
      'email',
      'correo',
      'mail',
      'correoElectronico',
    ])
  )
}

function getAvatarUrl(item: StudentCourseSectionItem) {
  return (
    getValue(item, [
      'avatarUrl',
      'AvatarUrl',
      'fotoUrl',
      'FotoUrl',
      'profileImageUrl',
      'ProfileImageUrl',
      'imagenPerfilUrl',
      'ImagenPerfilUrl',
      'profesorAvatarUrl',
      'ProfesorAvatarUrl',
      'alumnoAvatarUrl',
      'AlumnoAvatarUrl',
      'userAvatarUrl',
      'UserAvatarUrl',
    ]) ??
    getValueFromNestedRecord(item, ['user', 'User', 'usuario', 'Usuario'], [
      'avatarUrl',
      'fotoUrl',
      'profileImageUrl',
      'imagenPerfilUrl',
    ])
  )
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

function PostAuthorAvatar({
  teacherName,
  teacherAvatarUrl,
  fallbackIcon: FallbackIcon,
  fallbackClassName,
}: {
  teacherName: string
  teacherAvatarUrl: string | null
  fallbackIcon: React.ComponentType<{ className?: string }>
  fallbackClassName: string
}) {
  if (teacherName && teacherName !== 'Profesor') {
    return (
      <UserAvatar
        name={teacherName}
        avatarUrl={teacherAvatarUrl}
        size={38}
        className="shrink-0 bg-background/80"
        fallbackClassName="bg-background/90 text-sm text-foreground"
      />
    )
  }

  return (
    <StudentIconContainer
      icon={FallbackIcon}
      className={fallbackClassName}
    />
  )
}

function PublicationAttachments({
  attachments,
}: {
  attachments: StudentPublicationAttachment[]
}) {
  if (attachments.length === 0) return null

  const images = attachments.filter(isImageAttachment)
  const documents = attachments.filter((attachment) => !isImageAttachment(attachment))

  return (
    <div className="mt-3 space-y-2.5">
      {images.length > 0 ? (
        <div
          className={cn(
            'grid gap-2',
            images.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
          )}
        >
          {images.slice(0, 4).map((attachment) => (
            <a
              key={String(attachment.id ?? attachment.url)}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-xl border border-border/60 bg-background/50 transition-colors hover:border-border"
            >
              <img
                src={attachment.url}
                alt={attachment.nombre}
                className={cn(
                  'w-full transition-transform duration-200 group-hover:scale-[1.01]',
                  images.length === 1
                    ? 'max-h-[420px] bg-muted/20 object-contain'
                    : 'h-52 object-cover sm:h-64',
                )}
                loading="lazy"
              />
            </a>
          ))}
        </div>
      ) : null}

      {documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((attachment) => {
            const size = formatAttachmentSize(attachment.sizeBytes)

            return (
              <a
                key={String(attachment.id ?? attachment.url)}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-14 w-full max-w-md items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-3 transition-colors hover:bg-muted/50"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground">
                  <FileText className="size-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold leading-5 text-foreground">
                    {attachment.nombre}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {size ?? attachment.contentType ?? 'Documento adjunto'}
                  </span>
                </span>
              </a>
            )
          })}
        </div>
      ) : null}
    </div>
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
  const teacherAvatarUrl = getTeacherAvatarUrl(item)
  const hasTeacherName = teacherName !== 'Profesor'
  const title = getValue(item, ['titulo', 'nombre', 'tareaTitulo']) ?? 'Sin título'
  const description = getValue(item, ['descripcion', 'consigna'])
  const taskId = item.tareaId ?? item.id
  const status = getTaskStatus(item)
  const StatusIcon = status.icon
  const TypeIcon = announcement ? Megaphone : ClipboardList
  const dueMeta = getTaskDueMeta(item)
  const createdAt = getTaskCreatedMeta(item)
  const attachments = getPublicationAttachments(item)
  const typeLabel = announcement ? 'Anuncio' : 'Tarea'
  const titleId = `student-course-post-${String(taskId ?? title)}`
  const railClassName = announcement
    ? 'bg-slate-400/80 dark:bg-slate-500/65'
    : 'bg-primary'
  const typeIconClassName = announcement
    ? 'text-slate-500 dark:text-slate-300'
    : 'text-primary'

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        'group relative overflow-hidden rounded-2xl border shadow-sm transition-colors duration-200 ease-out',
        'bg-card border-border/60 hover:border-border',
      )}
    >
      <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 w-1', railClassName)} />

      <div className="p-3 pl-5 sm:p-4 sm:pl-6">
        <header className="flex items-start gap-3">
          <PostAuthorAvatar
            teacherName={teacherName}
            teacherAvatarUrl={teacherAvatarUrl}
            fallbackIcon={announcement ? Megaphone : BookOpen}
            fallbackClassName="border-border/60 bg-background/80 text-muted-foreground"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-5 text-foreground">
              {hasTeacherName ? teacherName : 'Profesor'}
            </p>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-4 text-muted-foreground">
              {createdAt ? <time>Publicado {createdAt}</time> : null}
              {createdAt ? <span aria-hidden="true">•</span> : null}
              <span className="inline-flex items-center gap-1">
                <TypeIcon className={cn('size-3.5', typeIconClassName)} />
                {typeLabel}
              </span>
            </div>
          </div>
        </header>

        <div className="mt-3 min-w-0">
          <h3
            id={titleId}
            className="line-clamp-2 min-w-0 break-words text-base font-semibold leading-6 text-foreground sm:text-[17px]"
          >
            {title}
          </h3>

          {description ? (
            <p className="mt-1 line-clamp-3 break-words whitespace-pre-line text-sm leading-5 text-foreground/85">
              {description}
            </p>
          ) : null}

          <PublicationAttachments attachments={attachments} />
        </div>

        {!announcement ? (
          <footer className="mt-3 flex flex-col gap-3 border-t border-border/40 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <StudentStatusBadge
                icon={StatusIcon}
                className={cn('rounded-lg px-2.5 py-1.5 text-xs leading-4', status.badgeClassName)}
              >
                {status.label}
              </StudentStatusBadge>

              {dueMeta ? (
                <span
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-background/70 px-2.5 py-1.5 text-xs font-semibold leading-4 text-muted-foreground"
                >
                  <CalendarClock className="size-3.5" />
                  {dueMeta.label}
                </span>
              ) : null}
            </div>

            {taskId != null ? (
              <Link
                href={`/student/courses/${courseId}/tasks/${taskId}`}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-none transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 active:scale-[0.98] sm:w-auto"
              >
                {status.actionLabel}
              </Link>
            ) : null}
          </footer>
        ) : null}
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
  const description = getValue(item, ['descripcionClase'])

  return (
    <article className={cn(studentUi.card.item, 'flex flex-col gap-3 rounded-xl px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between')}>
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border',
            status.iconClassName,
          )}
        >
          <StatusIcon className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <time className="block text-[15px] font-semibold leading-5 tracking-tight text-foreground">
            {fecha}
          </time>
          {description ? (
            <p className="mt-1 line-clamp-1 text-sm leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-start sm:justify-end">
        <StudentStatusBadge
          icon={StatusIcon}
          className={cn('rounded-lg px-2.5 py-1 text-xs', status.badgeClassName)}
        >
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
  const countedClasses = summary.present + summary.absent
  const attendancePercent =
    countedClasses > 0 ? Math.round((summary.present / countedClasses) * 100) : null
  const attendanceTone =
    attendancePercent == null
      ? 'border-border/60 bg-muted/25 text-muted-foreground'
      : attendancePercent < 60
        ? 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300'
        : attendancePercent < 75
          ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'
          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
  const attendanceMessage =
    attendancePercent == null
      ? 'Todavía no hay registros suficientes.'
      : attendancePercent < 60
        ? 'Necesitás recuperar asistencia.'
        : attendancePercent < 75
          ? 'Conviene cuidar la asistencia.'
          : 'Buen recorrido de asistencia.'

  const stats = [
    {
      label: 'Registradas',
      value: items.length,
      className: 'text-foreground',
    },
    {
      label: 'Presentes',
      value: summary.present,
      className: summary.present > 0
        ? 'text-emerald-700 dark:text-emerald-300'
        : 'text-muted-foreground',
    },
    {
      label: 'Ausencias',
      value: summary.absent,
      className: summary.absent > 0
        ? 'text-rose-700 dark:text-rose-300'
        : 'text-muted-foreground',
    },
  ]

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 px-3.5 py-3 dark:bg-card/70">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium leading-5 text-muted-foreground">
            Asistencia actual
          </p>
          <p className="mt-0.5 text-sm font-medium leading-5 text-foreground">
            {attendanceMessage}
          </p>
        </div>

        <span
          className={cn(
            'inline-flex w-fit items-center rounded-lg border px-2.5 py-1 text-sm font-semibold leading-5',
            attendanceTone,
          )}
        >
          {attendancePercent == null ? '-' : `${attendancePercent}%`}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/50 pt-2.5 text-sm">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="inline-flex items-baseline gap-1.5"
          >
            <p className={cn('text-sm font-semibold leading-5', stat.className)}>
              {stat.value}
            </p>
            <p className="text-xs font-medium leading-5 text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AttendanceHistory({
  items,
}: {
  items: StudentCourseSectionItem[]
}) {
  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <AttendanceSummary items={items} />

      <div className="space-y-2.5 sm:space-y-3">
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
  const avatarUrl = getAvatarUrl(item)
  const email = getPersonEmail(item)

  return (
    <article className="rounded-2xl border border-violet-200/70 bg-card/95 p-4 shadow-sm transition-colors duration-200 ease-out hover:border-violet-300/70 dark:border-violet-500/20 dark:bg-card/85 dark:hover:border-violet-500/35">
      <div className="flex items-center gap-3.5">
        <UserAvatar
          name={name}
          avatarUrl={avatarUrl}
          size={48}
          fallbackClassName="bg-background/80 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-base font-semibold leading-5 tracking-tight text-foreground">
              {name}
            </h3>
            <span className={cn(studentUi.badge.compact, 'border-violet-200 bg-background/70 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300')}>
              Docente del curso
            </span>
          </div>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">Te acompaña en este curso</p>
          {email ? (
            <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground/85">{email}</p>
          ) : null}
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
  const avatarUrl = getAvatarUrl(item)
  const current = isCurrentStudent(item, currentStudentId)
  const email = getPersonEmail(item)

  return (
    <article
      className={cn(
        'rounded-xl border px-3 py-2.5 transition-colors duration-200 ease-out hover:border-primary/15 hover:bg-card',
        current
          ? 'border-primary/25 bg-primary/8'
          : 'border-border/60 bg-background/60 dark:bg-background/35',
      )}
    >
      <div className="flex items-center gap-2.5">
        <UserAvatar
          name={name}
          avatarUrl={avatarUrl}
          size={36}
          fallbackClassName="bg-primary/8 text-primary"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 truncate text-sm font-semibold leading-5 tracking-tight text-foreground">
              {name}
            </h3>
            {current ? (
              <span className={cn(studentUi.badge.compact, 'border-primary/20 bg-primary/10 text-primary')}>
                Vos
              </span>
            ) : null}
          </div>
          {email ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground/80">{email}</p>
          ) : current ? (
            <p className="mt-0.5 text-xs text-muted-foreground/80">Este sos vos</p>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function PeopleEmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border/55 bg-background/45 px-4 py-4 text-sm text-muted-foreground dark:bg-background/25">
      <p className="text-sm font-semibold text-foreground">{text}</p>
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
    return <PeopleEmptyState text="Todavía no hay personas asignadas a este curso." />
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <section className="space-y-3" aria-labelledby="course-teachers-title">
        <div className="flex items-center justify-between gap-3">
          <h3 id="course-teachers-title" className="text-sm font-semibold text-foreground">
            Tus profes
          </h3>
          {teachers.length > 0 ? (
            <span className="text-xs font-medium text-muted-foreground">
              {teachers.length} {teachers.length === 1 ? 'docente' : 'docentes'}
            </span>
          ) : null}
        </div>
        {teachers.length > 0 ? (
          <div className={cn('grid gap-3', teachers.length > 1 && 'md:grid-cols-2')}>
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
        <div className="flex items-center justify-between gap-3">
          <h3 id="course-classmates-title" className="text-sm font-semibold text-foreground">
            Compañeros
          </h3>
          {classmates.length > 0 ? (
            <span className="text-xs font-medium text-muted-foreground">
              {classmates.length} {classmates.length === 1 ? 'alumno' : 'alumnos'}
            </span>
          ) : null}
        </div>
        {classmates.length > 0 ? (
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {classmates.map((item, index) => (
              <ClassmatePersonCard
                key={String(item.id ?? item.alumnoId ?? index)}
                item={item}
                currentStudentId={currentStudentId}
              />
            ))}
          </div>
        ) : (
          <PeopleEmptyState text="Todavía no hay compañeros asignados." />
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
  const dateTime = parseLocalDate(item.fecha)?.toISOString()
  const showSkills =
    isSkillGradeType(item.tipo) &&
    hasGradeSkillDetails(item) &&
    details.length > 0
  const skillPanelId = `grade-skills-${String(item.id ?? item.calificacionId ?? item.titulo ?? 'item')}`

  return (
    <article className="rounded-xl border border-border/60 bg-card/95 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] transition-colors duration-200 ease-out hover:border-primary/20 dark:bg-card/90 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
            {date ? <time dateTime={dateTime}>{date}</time> : null}
          </div>

          <h3 className="mt-1.5 line-clamp-2 text-base font-semibold leading-6 tracking-tight text-foreground">
            {safeText(item.titulo) ?? 'Sin título'}
          </h3>

          {description ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            'flex w-full shrink-0 items-center justify-between gap-3 rounded-lg border px-3 py-2 sm:w-32 sm:flex-col sm:items-start sm:justify-center',
            tone.panelClassName,
          )}
        >
          <p className="text-[11px] font-semibold leading-4 opacity-80">
            Nota
          </p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:block">
            <p className="text-xl font-semibold leading-none tracking-tight sm:text-2xl">
              {Number.isFinite(grade) ? gradeDisplay : '-'}
            </p>
            <p className="text-xs font-semibold sm:mt-1">{feedbackLabel}</p>
          </div>
        </div>
      </div>

      {showSkills ? (
        <div className="mt-3 border-t border-border/50 pt-3">
          <button
            type="button"
            aria-expanded={skillsOpen}
            aria-controls={skillPanelId}
            onClick={() => setSkillsOpen((current) => !current)}
            className={cn('group flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm font-semibold text-foreground transition-colors duration-200 ease-out hover:bg-muted/35', studentUi.focus)}
          >
            <span>Habilidades evaluadas</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span>{skillsOpen ? 'Ocultar' : 'Ver detalle'}</span>
              <ChevronDown
                className={cn(
                  'size-4 shrink-0 transition-transform duration-200 ease-out group-hover:text-foreground',
                  skillsOpen && 'rotate-180',
                )}
              />
            </span>
          </button>
          {skillsOpen ? (
            <div id={skillPanelId} className="mt-2.5 space-y-3 rounded-xl border border-border/50 bg-muted/15 p-3 animate-in fade-in-0 slide-in-from-top-1 duration-200 dark:bg-muted/10">
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
                      {scoreLabel}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-background/80 dark:bg-background/40">
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

function GradesSummary({
  items,
  summary,
}: {
  items: StudentCourseSectionItem[]
  summary?: StudentGradesAcademicSummary | null
}) {
  const gradedItems = items.filter((item) => Number.isFinite(Number(item.nota)))
  const fallbackAcademicItems = gradedItems.filter((item) => {
    const type = Number(item.tipo)
    return type === 2 || type === 3
  })
  const backendAverage = getSummaryNumber(summary, ['averageGrade', 'AverageGrade'])
  const quarter = getSummaryNumber(summary, ['quarter', 'Quarter'])
  const rangeLabel = getSummaryText(summary, ['periodRangeLabel', 'PeriodRangeLabel'])
  const fallbackAverage =
    fallbackAcademicItems.length > 0
      ? fallbackAcademicItems.reduce((total, item) => total + Number(item.nota), 0) / fallbackAcademicItems.length
      : null
  const average = backendAverage ?? fallbackAverage
  const averageTone = getGradeTone(average ?? undefined)

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3.5 dark:bg-card/70">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium leading-5 text-muted-foreground">
            Promedio del trimestre actual
          </p>
          <p className="mt-0.5 text-sm font-medium leading-5 text-foreground">
            {average == null
              ? 'Todavía no hay Quiz o Test cargados en este trimestre.'
              : `Calculado con Quiz y Test · ${formatQuarter(quarter)}${rangeLabel ? ` · ${rangeLabel}` : ''}.`}
          </p>
        </div>

        <span
          className={cn(
            'inline-flex w-fit min-w-20 items-center justify-center rounded-xl border px-3 py-2 text-2xl font-semibold leading-none tracking-tight sm:text-3xl',
            averageTone.panelClassName,
          )}
        >
          {average == null ? '-' : formatGradeNumber(average)}
        </span>
      </div>
    </div>
  )
}

function GradesHistory({
  items,
  summary,
}: {
  items: StudentCourseSectionItem[]
  summary?: StudentGradesAcademicSummary | null
}) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_GRADES)
  const sortedItems = sortGradesByRecentDate(items)
  const visibleItems = sortedItems.slice(0, visibleCount)
  const remainingCount = Math.max(0, sortedItems.length - visibleItems.length)

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_GRADES)
  }, [items.length])

  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <GradesSummary items={items} summary={summary} />

      <p className="px-0.5 text-xs font-medium leading-5 text-muted-foreground">
        Ordenadas de más reciente a más antigua.
      </p>

      <div className="grid gap-3">
        {visibleItems.map((item, index) => (
          <GradeCard
            key={String(item.id ?? item.calificacionId ?? index)}
            item={item}
          />
        ))}
      </div>

      {remainingCount > 0 ? (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setVisibleCount((current) => current + INITIAL_VISIBLE_GRADES)}
            className={cn(
              'inline-flex min-h-10 items-center justify-center rounded-xl border border-border/60 bg-background/70 px-4 text-sm font-semibold text-foreground transition-colors duration-200 ease-out hover:border-primary/25 hover:bg-primary/5',
              studentUi.focus,
            )}
          >
            Ver más calificaciones
            <span className="ml-1.5 text-xs font-medium text-muted-foreground">
              ({remainingCount})
            </span>
          </button>
        </div>
      ) : null}
    </section>
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

function SectionSkeleton() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-24 animate-pulse rounded-xl border border-border/60 bg-muted/20"
        />
      ))}
    </div>
  )
}

function AttendanceSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-4" aria-hidden="true">
      <div className="rounded-xl border border-border/60 bg-card/80 px-3.5 py-3 dark:bg-card/70">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-3 w-28 animate-pulse rounded-md bg-muted/35" />
            <div className="h-4 w-48 animate-pulse rounded-md bg-muted/30" />
          </div>
          <div className="h-7 w-14 animate-pulse rounded-lg bg-muted/35" />
        </div>
        <div className="mt-3 flex gap-4 border-t border-border/50 pt-2.5">
          <div className="h-4 w-20 animate-pulse rounded-md bg-muted/25" />
          <div className="h-4 w-20 animate-pulse rounded-md bg-muted/25" />
          <div className="h-4 w-20 animate-pulse rounded-md bg-muted/25" />
        </div>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-xl border border-border/60 bg-muted/20"
          />
        ))}
      </div>
    </div>
  )
}

function GradesSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-4" aria-hidden="true">
      <div className="rounded-xl border border-border/60 bg-card/80 px-3.5 py-3 dark:bg-card/70">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded-md bg-muted/35" />
            <div className="h-4 w-52 animate-pulse rounded-md bg-muted/30" />
          </div>
          <div className="h-7 w-12 animate-pulse rounded-lg bg-muted/35" />
        </div>
        <div className="mt-3 flex gap-4 border-t border-border/50 pt-2.5">
          <div className="h-4 w-24 animate-pulse rounded-md bg-muted/25" />
          <div className="h-4 w-36 animate-pulse rounded-md bg-muted/25" />
        </div>
      </div>

      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-xl border border-border/60 bg-muted/20"
          />
        ))}
      </div>
    </div>
  )
}

function EmptyPanel({
  text,
  description,
  icon: Icon = BookOpen,
  className,
}: {
  text: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <Card className={cn('rounded-xl border border-dashed border-border/70 bg-muted/15 shadow-none dark:bg-muted/10', className)}>
      <CardContent className="px-5 py-8 text-center">
        <StudentIconContainer icon={Icon} className="mx-auto size-10 rounded-lg border-transparent bg-primary/10 text-primary" />
        <p className="mt-3 text-sm font-semibold text-foreground">{text}</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          {description ?? 'Cuando haya novedades, las vas a ver organizadas acá.'}
        </p>
      </CardContent>
    </Card>
  )
}

function AttendanceEmptyState() {
  return (
    <div className={cn(studentUi.card.empty, 'mx-auto max-w-3xl px-5 py-8 text-center')}>
      <StudentIconContainer icon={CalendarCheck2} className="mx-auto size-10 border-transparent bg-primary/10 text-primary" />
      <p className="mt-3 text-sm font-semibold text-foreground">
        Todavía no hay asistencias registradas en este curso.
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Cuando tu profe tome asistencia, vas a poder seguir tu recorrido.
      </p>
    </div>
  )
}

function TaskFeedSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-2xl border border-border/60 bg-muted/25"
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
    <div className="mx-auto max-w-3xl space-y-3">
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
  if (state.loading && tab === 'attendance') return <AttendanceSkeleton />
  if (state.loading && tab === 'grades') return <GradesSkeleton />
  if (state.loading) return <SectionSkeleton />

  const constrainedPanelClassName =
    tab === 'tasks' || tab === 'attendance' || tab === 'grades'
      ? 'mx-auto max-w-3xl'
      : undefined

  if (state.error) {
    return (
      <EmptyPanel
        text={state.error}
        description="Intentá actualizar la página en unos segundos."
        icon={AlertCircle}
        className={constrainedPanelClassName}
      />
    )
  }

  const visibleItems = tab === 'grades'
    ? state.items.filter((item) => isVisibleGradeType(item.tipo))
    : state.items

  if (visibleItems.length === 0) {
    if (tab === 'attendance') return <AttendanceEmptyState />
    if (tab === 'tasks') {
      return (
        <EmptyPanel
          text="Todavía no hay publicaciones en el tablón."
          description="Cuando tu profe publique una tarea o anuncio, va a aparecer acá."
          icon={ClipboardList}
        />
      )
    }

    if (tab === 'grades') {
      return (
        <EmptyPanel
          text="Todavía no hay calificaciones cargadas."
          description="Cuando tu profe cargue notas, vas a poder revisarlas en esta pestaña."
          icon={CheckCircle2}
          className="mx-auto max-w-3xl"
        />
      )
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

  if (tab === 'grades') {
    return <GradesHistory items={visibleItems} summary={state.summary} />
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
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = getTabFromSlug(searchParams.get('tab'))
  const [sections, setSections] = useState<Record<string, SectionState>>({})
  const sectionPath = sectionPaths[tab]
  const sectionState = sections[tab] ?? initialSectionState

  useEffect(() => {
    if (!sectionPath || sectionState.loading || sectionState.loaded) return

    setSections((current) => ({
      ...current,
      [tab]: { ...initialSectionState, loading: true, loaded: false },
    }))

    loadSection(courseId, sectionPath)
      .then((payload) => {
        setSections((current) => ({
          ...current,
          [tab]: {
            loading: false,
            loaded: true,
            items: payload.items,
            summary: payload.summary ?? null,
            error: null,
          },
        }))
      })
      .catch((error) => {
        setSections((current) => ({
          ...current,
          [tab]: {
            loading: false,
            loaded: true,
            items: [],
            summary: null,
            error: error instanceof Error ? error.message : 'No pudimos cargar esta parte.',
          },
        }))
      })
  }, [courseId, sectionPath, sectionState.loaded, sectionState.loading, tab])

  const tabs = useMemo(
    () => ['tasks', 'attendance', 'grades', 'people'] as Tab[],
    []
  )

  const selectTab = (nextTab: Tab) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString())

    if (nextTab === 'tasks') {
      nextSearchParams.delete('tab')
    } else {
      nextSearchParams.set('tab', tabSlugs[nextTab])
    }

    const query = nextSearchParams.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const focusTab = (nextTab: Tab) => {
    window.requestAnimationFrame(() => {
      document.getElementById(`student-course-tab-${nextTab}`)?.focus()
    })
  }

  return (
    <>
      <div className="space-y-3.5 sm:space-y-4">
        <nav
          aria-label="Secciones del curso"
          role="tablist"
          aria-orientation="horizontal"
          className="-mx-1 flex overflow-x-auto border-b border-border/60 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((key) => {
            const tabConfig = tabStyles[key]
            const Icon = tabConfig.icon
            const active = tab === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => selectTab(key)}
                onKeyDown={(event) => {
                  const currentIndex = tabs.indexOf(key)
                  let nextIndex = currentIndex

                  if (event.key === 'ArrowRight') {
                    nextIndex = (currentIndex + 1) % tabs.length
                  } else if (event.key === 'ArrowLeft') {
                    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
                  } else if (event.key === 'Home') {
                    nextIndex = 0
                  } else if (event.key === 'End') {
                    nextIndex = tabs.length - 1
                  } else {
                    return
                  }

                  event.preventDefault()
                  const nextTab = tabs[nextIndex]
                  selectTab(nextTab)
                  focusTab(nextTab)
                }}
                role="tab"
                aria-selected={active}
                aria-controls={`student-course-panel-${key}`}
                id={`student-course-tab-${key}`}
                tabIndex={active ? 0 : -1}
                className={cn(
                  'group -mb-px inline-flex min-h-12 min-w-max items-center justify-center gap-2 border-b-2 px-3.5 text-sm font-medium transition-[border-color,color,background-color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 active:scale-[0.99] sm:px-5',
                  active
                    ? 'border-foreground font-semibold text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'size-4 shrink-0 transition-colors duration-150 ease-out',
                    active ? 'text-foreground' : 'text-muted-foreground/75',
                  )}
                />
                <span className="truncate">{tabConfig.label}</span>
              </button>
            )
          })}
        </nav>

        <section
          id={`student-course-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`student-course-tab-${tab}`}
          tabIndex={0}
          className="pt-0 focus-visible:outline-none"
        >
          <SectionList
            tab={tab}
            state={sectionState}
            courseId={courseId}
            currentStudentId={currentStudentId}
          />
        </section>
      </div>
    </>
  )
}
