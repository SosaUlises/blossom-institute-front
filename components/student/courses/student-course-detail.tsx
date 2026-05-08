'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
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
    throw new Error(result?.message || 'No se pudo cargar la seccion.')
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
  if (typeof value === 'boolean') return value ? 'Si' : 'No'

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
      return 'Participation'
    case 5:
      return 'Behaviour'
    default:
      return displayValue(value) ?? 'Nota'
  }
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

function getAttendanceBadgeClass(value: unknown) {
  const label = getEstadoLabel(value)?.toLowerCase()

  if (label === 'presente') return badgeStyles.emerald
  if (label === 'ausente') return badgeStyles.rose
  if (label === 'tarde') return badgeStyles.amber
  return badgeStyles.neutral
}

function getTaskBadgeClass(item: StudentCourseSectionItem) {
  const status = getTaskBadgeLabel(item)

  if (status === 'Rehacer') {
    return 'border-amber-400/35 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'
  }

  if (status === 'Entregada') {
    return 'border-emerald-500/15 bg-transparent text-emerald-700 dark:text-emerald-400'
  }

  if (status === 'Vencida') {
    return 'border-rose-500/20 bg-rose-50/60 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
  }

  return 'border-border/60 bg-muted/25 text-muted-foreground'
}

function getTaskBadgeLabel(item: StudentCourseSectionItem) {
  const hasDueDate = hasTaskDueDate(item)

  if (item.feedbackPendienteAccion === true) return 'Rehacer'
  if (item.tieneEntrega === true) return 'Entregada'
  if (item.vencida === true && !item.tieneEntrega) return 'Vencida'
  if (hasDueDate) return 'Pendiente'
  return 'Anuncio'
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
      label: `Vencida · ${dueDate}`,
      className: 'text-rose-700 dark:text-rose-400',
    }
  }

  return {
    label: `Vence el ${dueDate}`,
    className: 'text-amber-700 dark:text-amber-400',
  }
}

function getPersonBadgeClass(role?: string | null) {
  if (role === 'Profesor') return badgeStyles.violet
  return badgeStyles.neutral
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
  const title = getValue(item, ['titulo', 'nombre', 'tareaTitulo']) ?? 'Sin titulo'
  const description = getValue(item, ['descripcion', 'consigna'])
  const taskId = item.tareaId ?? item.id
  const status = getTaskBadgeLabel(item)
  const dueMeta = getTaskDueMeta(item)
  const createdAt = formatCompactDate(item.createdAtUtc)
  const resourceLabel = getResourceLabel(item)

  if (!announcement) {
    return (
      <article className="rounded-xl border border-border/60 bg-muted/30 transition-colors hover:border-border hover:bg-muted/40">
        <div className="flex flex-col gap-3.5 p-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground">
            <FileText className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-5 text-muted-foreground">
              {teacherName} publicó una nueva tarea
            </p>
            <p className="truncate text-[15px] font-semibold leading-6 text-foreground">
              {title}
            </p>

            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {createdAt ? <time>{createdAt}</time> : null}
              {createdAt ? <span aria-hidden="true">·</span> : null}
              <span className={cn('inline-flex items-center gap-1.5 font-medium', dueMeta.className)}>
                <CalendarCheck2 className="size-3.5" />
                {dueMeta.label}
              </span>
              {resourceLabel ? (
                <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Paperclip className="size-3.5" />
                  {resourceLabel}
                </span>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
            <span
              className={cn(
                'inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
                getTaskBadgeClass(item),
              )}
            >
              {status}
            </span>

            {taskId != null ? (
              <Link
                href={`/student/courses/${courseId}/tasks/${taskId}`}
                className="inline-flex h-8 w-fit items-center justify-center rounded-full border border-border/70 bg-background/70 px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/20 hover:bg-muted/50 hover:text-primary"
              >
                Ver detalle
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="rounded-2xl border border-border/70 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-colors hover:border-primary/20">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-primary/10 text-xs font-semibold text-primary">
              {getInitials(teacherName) || '?'}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-5 text-muted-foreground">
                {teacherName} publicó {announcement ? 'un anuncio' : 'una tarea'}
              </p>
              {createdAt ? (
                <time className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                  {createdAt}
                </time>
              ) : null}
            </div>
          </div>

          <span
            className={cn(
              'inline-flex w-fit shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium',
              getTaskBadgeClass(item),
            )}
          >
            <Megaphone className="mr-1 size-3" />
            {status}
          </span>
        </div>

        <div className="mt-4 sm:ml-12">
          <h3 className="text-[15px] font-semibold leading-6 text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {!announcement ? (
              <span className={cn('inline-flex items-center gap-1.5 font-medium', dueMeta.className)}>
                <CalendarCheck2 className="size-4" />
                {dueMeta.label}
              </span>
            ) : null}
            {resourceLabel ? (
              <span className="inline-flex items-center gap-1.5">
                <Paperclip className="size-4" />
                {resourceLabel}
              </span>
            ) : null}
          </div>

          {taskId != null ? (
            <Link
              href={`/student/courses/${courseId}/tasks/${taskId}`}
                className="inline-flex h-8 w-fit items-center justify-center rounded-full border border-border/70 bg-background/70 px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/20 hover:bg-muted/50 hover:text-primary"
            >
              Ver detalle
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function AttendanceRow({ item }: { item: StudentCourseSectionItem }) {
  const estado = getEstadoLabel(item.estado) ?? getEstadoLabel(item.estadoClase)
  const fecha =
    formatDate(item.fecha) ??
    formatDate(item.fechaClase) ??
    formatDate(item.claseFecha) ??
    'Sin fecha'
  const description = getValue(item, ['descripcionClase']) ?? 'Clase registrada'
  

  return (
    <article className="flex flex-col gap-3 rounded-[22px] border border-border/60 bg-card/90 p-4 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted/25 text-muted-foreground">
        <CalendarCheck2 className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <time className="block text-xs font-medium leading-5 text-muted-foreground">
          {fecha}
        </time>
        <p className="mt-1 text-sm font-medium leading-6 text-foreground">
          {description}
        </p>
      </div>

      {estado ? (
        <span
          className={cn(
            'inline-flex w-fit shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium sm:ml-auto',
            getAttendanceBadgeClass(estado),
          )}
        >
          {estado}
        </span>
      ) : null}
    </article>
  )
}

function PersonCard({ name, role }: { name: string; role: string }) {
  return (
    <article className="rounded-[24px] border border-border/60 bg-background/75 p-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/20 hover:bg-card hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-primary/8 text-sm font-semibold text-primary shadow-sm">
            {getInitials(name) || '?'}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-tight text-foreground">
              {name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Integrante del curso
            </p>
          </div>
        </div>

        <span
          className={cn(
            'shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
            getPersonBadgeClass(role),
          )}
        >
          {role}
        </span>
      </div>
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
    return (
      <SectionCard
        title={safeText(item.titulo) ?? 'Sin titulo'}
        badge={item.nota != null ? `Nota ${displayValue(item.nota)}` : null}
        badgeClassName={getGradeBadgeClass(item.nota)}
        description={safeText(item.descripcion)}
        meta={[
          safeText(item.cursoNombre),
          getGradeTypeLabel(item.tipo),
          formatDate(item.fecha),
        ]}
      />
    )
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

  if (tab === 'people') {
    const source = getValue(item, ['__source'])
    const role =
      getValue(item, ['rol']) ??
      (source === 'profesores' || source === 'teachers'
        ? 'Profesor'
        : source === 'companeros' || source === 'alumnos' || source === 'students'
          ? 'Compañero'
          : undefined)

    return (
      <PersonCard name={getFullName(item) ?? 'Sin nombre'} role={role ?? 'Compañero'} />
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
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-5 py-8 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        Todavía no hay clases registradas para este curso.
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
}: {
  tab: Tab
  state: SectionState
  courseId: number
}) {
  if (state.loading && tab === 'tasks') return <TaskFeedSkeleton />
  if (state.loading) return <SectionSkeleton />

  if (state.error) {
    return <EmptyPanel text={state.error} />
  }

  if (state.items.length === 0) {
    if (tab === 'attendance') return <AttendanceEmptyState />
    if (tab === 'tasks') {
      return <EmptyPanel text="Todavía no hay publicaciones en el tablón." />
    }

    return <EmptyPanel text="No hay registros para mostrar." />
  }

  if (tab === 'attendance') {
    return (
      <div className="space-y-3">
        {state.items.map((item, index) => (
          <AttendanceRow
            key={String(item.id ?? item.asistenciaId ?? item.claseId ?? index)}
            item={item}
          />
        ))}
      </div>
    )
  }

  if (tab === 'tasks') {
    return <TaskFeed items={state.items} courseId={courseId} />
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {state.items.map((item, index) => (
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
}: {
  courseId: number
}) {
  const [tab, setTab] = useState<Tab>('tasks')
  const [sections, setSections] = useState<Record<string, SectionState>>({})
  const currentTab = tabStyles[tab]
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
          <SectionList tab={tab} state={sectionState} courseId={courseId} />
        ) : (
          <div className="rounded-[30px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
            {tab !== 'attendance' ? (
              <div className="border-b border-border/60 px-6 py-5">
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                  {currentTab.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentTab.description}
                </p>
              </div>
            ) : null}

            <div className={cn(tab === 'attendance' ? 'p-4' : 'p-6')}>
            <SectionList tab={tab} state={sectionState} courseId={courseId} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
