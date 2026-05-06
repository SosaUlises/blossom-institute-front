'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  Users,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import {
  EstadoCurso,
  type StudentCourseDetail as StudentCourseDetailType,
  type StudentCourseSectionItem,
} from '@/lib/student/courses/types'
import { cn } from '@/lib/utils'

type Tab =
  | 'tasks'
  | 'grades'
  | 'attendance'
  | 'deliveries'
  | 'people'

type SectionState = {
  loading: boolean
  items: StudentCourseSectionItem[]
  error: string | null
}

const initialSectionState: SectionState = {
  loading: false,
  items: [],
  error: null,
}

const tabStyles: Record<
  Tab,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    activeClass: string
    idleIconClass: string
    title: string
    description: string
  }
> = {
  tasks: {
    label: 'Tareas',
    icon: ClipboardList,
    activeClass:
      'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-sm',
    idleIconClass: 'text-amber-600/80 dark:text-amber-400/80',
    title: 'Tareas del curso',
    description: 'Actividades asignadas para este curso.',
  },
  grades: {
    label: 'Calificaciones',
    icon: CheckCircle2,
    activeClass:
      'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400 shadow-sm',
    idleIconClass: 'text-violet-600/80 dark:text-violet-400/80',
    title: 'Calificaciones',
    description: 'Notas registradas para este curso.',
  },
  attendance: {
    label: 'Asistencia',
    icon: CalendarCheck2,
    activeClass:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm',
    idleIconClass: 'text-emerald-600/80 dark:text-emerald-400/80',
    title: 'Asistencia',
    description: 'Registros de asistencia asociados al curso.',
  },
  deliveries: {
    label: 'Entregas',
    icon: FileCheck2,
    activeClass:
      'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400 shadow-sm',
    idleIconClass: 'text-sky-600/80 dark:text-sky-400/80',
    title: 'Entregas',
    description: 'Entregas realizadas y estado de seguimiento.',
  },
  people: {
    label: 'Personas',
    icon: Users,
    activeClass:
      'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400 shadow-sm',
    idleIconClass: 'text-rose-600/80 dark:text-rose-400/80',
    title: 'Personas',
    description: 'Equipo docente y personas vinculadas al curso.',
  },
}

const sectionPaths: Partial<Record<Tab, string>> = {
  tasks: 'tasks',
  grades: 'grades',
  attendance: 'attendance',
  deliveries: 'deliveries',
  people: 'people',
}

const estadoLabels: Record<number, string> = {
  [EstadoCurso.Activo]: 'Activo',
  [EstadoCurso.Inactivo]: 'Inactivo',
  [EstadoCurso.Archivado]: 'Archivado',
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

function getCourseName(course: StudentCourseDetailType) {
  return course.nombre ?? course.cursoNombre ?? 'Curso'
}

function getCourseYear(course: StudentCourseDetailType) {
  return typeof course.anio === 'number' ? course.anio : null
}

function getEstadoClass(estado?: number) {
  if (estado === EstadoCurso.Activo) {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
  }

  if (estado === EstadoCurso.Inactivo) {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
  }

  if (estado === EstadoCurso.Archivado) {
    return 'border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-400'
  }

  return 'border-border/60 bg-muted/40 text-muted-foreground'
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

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
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
  if (normalized === '3') return 'Tarde'

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
  const vencida = item.vencida === true
  const estado = displayValue(item.estado)?.toLowerCase() ?? ''
  const tieneEntrega = item.tieneEntrega === true

  if (vencida || estado.includes('venc')) return badgeStyles.rose
  if (tieneEntrega || estado.includes('entreg')) return badgeStyles.emerald
  return badgeStyles.amber
}

function getTaskBadgeLabel(item: StudentCourseSectionItem) {
  const estado = displayValue(item.estado)

  if (item.vencida === true) return 'Vencida'
  if (item.tieneEntrega === true) return 'Entregada'
  return estado ?? 'Pendiente'
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
}: {
  title: string
  meta: Array<string | null | undefined>
  badge?: string | null
  badgeClassName?: string
  description?: string | null
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

function renderSectionCard(item: StudentCourseSectionItem, tab: Tab) {
  if (tab === 'tasks') {
    const badge = getTaskBadgeLabel(item)

    return (
      <SectionCard
        title={getValue(item, ['titulo', 'nombre', 'tareaTitulo']) ?? 'Sin titulo'}
        badge={badge}
        badgeClassName={getTaskBadgeClass(item)}
        description={getValue(item, ['descripcion', 'consigna'])}
        meta={[
          formatDate(item.fechaEntregaUtc)
            ? `Entrega ${formatDate(item.fechaEntregaUtc)}`
            : null,
        ]}
      />
    )
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

  if (tab === 'deliveries') {
    return (
      <SectionCard
        title={
          getValue(item, ['titulo', 'tareaTitulo', 'nombre']) ?? 'Sin titulo'
        }
        badge={getValue(item, ['estado'])}
        badgeClassName={badgeStyles.sky}
        meta={[
          formatDate(item.fechaEntregaUtc) ?? formatDate(item.fechaEntregadaUtc),
          getValue(item, ['requiereRehacer'])
            ? `Rehacer: ${getValue(item, ['requiereRehacer'])}`
            : null,
        ]}
        description={getValue(item, ['feedback', 'feedbackVigente', 'feedbacks'])}
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

function SectionList({
  tab,
  state,
}: {
  tab: Tab
  state: SectionState
}) {
  if (state.loading) return <SectionSkeleton />

  if (state.error) {
    return <EmptyPanel text={state.error} />
  }

  if (state.items.length === 0) {
    return <EmptyPanel text="No hay registros para mostrar." />
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {state.items.map((item, index) => (
        <div
          key={String(item.id ?? item.tareaId ?? item.calificacionId ?? index)}
        >
          {renderSectionCard(item, tab)}
        </div>
      ))}
    </div>
  )
}

export function StudentCourseDetail({
  course,
  courseId,
}: {
  course: StudentCourseDetailType
  courseId: number
}) {
  const [tab, setTab] = useState<Tab>('grades')
  const [sections, setSections] = useState<Record<string, SectionState>>({})
  const requestedTabsRef = useRef<Set<Tab>>(new Set())
  const currentTab = tabStyles[tab]
  const estado = typeof course.estado === 'number' ? course.estado : undefined
  const sectionPath = sectionPaths[tab]
  const sectionState = sections[tab] ?? initialSectionState

  useEffect(() => {
    if (!sectionPath || requestedTabsRef.current.has(tab)) return

    let cancelled = false
    requestedTabsRef.current.add(tab)

    setSections((current) => ({
      ...current,
      [tab]: { ...initialSectionState, loading: true },
    }))

    loadSection(courseId, sectionPath)
      .then((items) => {
        if (cancelled) return
        setSections((current) => ({
          ...current,
          [tab]: { loading: false, items, error: null },
        }))
      })
      .catch((error) => {
        if (cancelled) return
        setSections((current) => ({
          ...current,
          [tab]: {
            loading: false,
            items: [],
            error: error instanceof Error ? error.message : 'No se pudo cargar.',
          },
        }))
      })

    return () => {
      cancelled = true
    }
  }, [courseId, sectionPath, tab])

  const tabs = useMemo(() => Object.keys(tabStyles) as Tab[], [])

  return (
    <>
      <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card/95 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.22)] backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(135deg,rgba(36,59,123,0.92),rgba(91,110,225,0.82))] dark:bg-[linear-gradient(135deg,rgba(36,59,123,0.72),rgba(91,110,225,0.56))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_24%),radial-gradient(circle_at_left,rgba(255,255,255,0.04),transparent_28%)]" />

        <div className="relative p-4 sm:p-5 lg:p-6">
          <div className="rounded-[30px] border border-border/60 bg-card/92 p-6 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.24)] backdrop-blur-md sm:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex size-16 items-center justify-center rounded-[22px] bg-primary/10 text-primary shadow-sm">
                <BookOpen className="size-7" />
              </div>

              <span
                className={cn(
                  'inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]',
                  getEstadoClass(estado),
                )}
              >
                {estado ? estadoLabels[estado] ?? 'Desconocido' : 'Desconocido'}
              </span>

              {getCourseYear(course) != null ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  Año {getCourseYear(course)}
                </span>
              ) : null}
            </div>

            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                Espacio del curso
              </p>
              <h1 className="mt-3 text-[2.2rem] font-semibold leading-[1.02] tracking-tight text-foreground sm:text-[2.6rem] lg:text-[3rem]">
                {getCourseName(course)}
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">
                {course.descripcion?.trim()
                  ? course.descripcion
                  : 'Consulta tareas, calificaciones, asistencia y entregas de este curso.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-5">
        <div className="rounded-[26px] border border-border/60 bg-card/90 p-2 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.16)] backdrop-blur-sm">
          <div className="flex flex-wrap gap-2">
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
                    'group inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all',
                    active
                      ? tabConfig.activeClass
                      : 'border-transparent bg-transparent text-muted-foreground hover:border-border/60 hover:bg-background/80 hover:text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-xl border',
                      active
                        ? 'border-current/15 bg-white/40 dark:bg-white/5'
                        : 'border-border/60 bg-background/70',
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-4',
                        active ? 'text-current' : tabConfig.idleIconClass,
                      )}
                    />
                  </span>
                  <span>{tabConfig.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-[30px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
          <div className="border-b border-border/60 px-6 py-5">
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              {currentTab.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {currentTab.description}
            </p>
          </div>

          <div className="p-6">
            <SectionList tab={tab} state={sectionState} />
          </div>
        </div>
      </div>
    </>
  )
}
