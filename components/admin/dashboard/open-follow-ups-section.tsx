'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { DashboardOpenFollowUp } from '@/lib/admin/dashboard/types'
import { cn } from '@/lib/utils'

const VISIBLE_LIMIT = 8

type BadgeTone = 'amber' | 'rose' | 'neutral'

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return 'AL'

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

function getEntityLabel(item: DashboardOpenFollowUp) {
  return item.entityType === 'student' ? 'Alumno' : 'Curso'
}

function getEntityName(item: DashboardOpenFollowUp) {
  return item.entityType === 'student'
    ? item.alumnoNombre || 'Alumno'
    : item.cursoNombre || 'Curso'
}

function getHref(item: DashboardOpenFollowUp) {
  if (item.href) return item.href

  if (item.entityType === 'student' && item.alumnoId) {
    return `/admin/dashboard/students/${item.alumnoId}/profile`
  }

  if (item.cursoId) {
    return `/admin/dashboard/courses/${item.cursoId}/profile`
  }

  return '/admin/dashboard/reports'
}

function getActionLabel(item: DashboardOpenFollowUp) {
  return item.entityType === 'student' ? 'Ver alumno' : 'Ver curso'
}

function formatMetricValue(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)
}

function getSignalBadges(item: DashboardOpenFollowUp) {
  const badges: Array<{ label: string; tone: BadgeTone }> = []
  const source = item.source?.toLowerCase() ?? ''
  const hasAverage = typeof item.averageGrade === 'number'
  const hasAttendance = typeof item.attendancePercentage === 'number'
  const hasGradeAlerts = (item.gradeAlerts?.length ?? 0) > 0

  if (hasAverage && hasAttendance) {
    badges.push({ label: 'Riesgo combinado', tone: 'rose' })
  } else if (source.includes('average') || hasAverage) {
    badges.push({ label: 'Promedio bajo', tone: 'amber' })
  } else if (source.includes('attendance') || hasAttendance) {
    badges.push({ label: 'Baja asistencia', tone: 'amber' })
  } else if (source.includes('manual-grade') || hasGradeAlerts) {
    const hasCriticalGrade = item.gradeAlerts?.some((alert) => alert.nota < 50)
    badges.push({ label: 'Calificación baja', tone: hasCriticalGrade ? 'rose' : 'amber' })
  } else {
    badges.push({ label: 'Seguimiento', tone: 'neutral' })
  }

  if (item.entityType === 'course') {
    badges.push({ label: 'Curso', tone: 'neutral' })
  }

  return badges
}

function getMetricChips(item: DashboardOpenFollowUp) {
  const chips: Array<{ label: string; value: string; tone: 'amber' | 'rose' }> = []

  if (typeof item.averageGrade === 'number') {
    chips.push({
      label: item.entityType === 'course' ? 'Promedio grupal' : 'Promedio',
      value: formatMetricValue(item.averageGrade),
      tone: item.averageGrade < 60 ? 'rose' : 'amber',
    })
  }

  if (typeof item.attendancePercentage === 'number') {
    const isCritical = item.attendancePercentage < 70

    chips.push({
      label: item.entityType === 'course'
        ? 'Baja asistencia grupal'
        : isCritical
          ? 'Asistencia crítica'
          : 'Asistencia',
      value: `${formatMetricValue(item.attendancePercentage)}%`,
      tone: isCritical ? 'rose' : 'amber',
    })
  }

  return chips
}

function getGradeTypeLabel(tipo: number | string) {
  const normalizedType = Number(tipo)

  if (normalizedType === 2 || tipo === 'Quiz') return 'Quiz'
  if (normalizedType === 3 || tipo === 'Test') return 'Test'
  if (normalizedType === 4 || tipo === 'Participation') return 'Participación'
  if (normalizedType === 5 || tipo === 'Behaviour') return 'Comportamiento'

  return 'Evaluación'
}

function getGradeAlertTone(nota: number): 'amber' | 'rose' {
  return nota < 50 ? 'rose' : 'amber'
}

function getReasonLabel(item: DashboardOpenFollowUp) {
  const reason = item.reason?.trim()

  if (!reason) return 'Seguimiento académico pendiente'

  return reason
    .replace(new RegExp(`\\s+en\\s+${item.periodLabel}$`, 'i'), '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeReason(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getDisplayReasonLabel(item: DashboardOpenFollowUp) {
  const reason = getReasonLabel(item)
  const normalizedReason = normalizeReason(reason)
  const hasAverageMetric = typeof item.averageGrade === 'number'
  const hasAttendanceMetric = typeof item.attendancePercentage === 'number'
  const hasGradeAlerts = (item.gradeAlerts?.length ?? 0) > 0
  const duplicatesAverageChip =
    hasAverageMetric &&
    (normalizedReason.startsWith('promedio ') ||
      normalizedReason.startsWith('promedio grupal '))
  const duplicatesAttendanceChip =
    hasAttendanceMetric &&
    (normalizedReason.startsWith('asistencia ') ||
      normalizedReason.startsWith('asistencia critica ') ||
      normalizedReason.startsWith('baja asistencia '))

  if (hasGradeAlerts && item.source?.toLowerCase().includes('manual-grade')) return null
  if (duplicatesAverageChip || duplicatesAttendanceChip) return null

  return reason
}

function getPeriodLabel(item: DashboardOpenFollowUp) {
  if (item.quarterNumber > 0) return `Trimestre ${item.quarterNumber}`
  return item.periodLabel || 'Trimestre anterior'
}

function getBadgeClass(tone: BadgeTone) {
  if (tone === 'rose') {
    return 'bg-rose-500/10 text-rose-700 ring-rose-500/15 dark:text-rose-300'
  }

  if (tone === 'amber') {
    return 'bg-amber-500/10 text-amber-800 ring-amber-500/15 dark:text-amber-300'
  }

  return 'bg-muted/30 text-muted-foreground ring-border/35'
}

function SignalBadge({
  label,
  tone,
}: {
  label: string
  tone: BadgeTone
}) {
  return (
    <span className={cn(
      'rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1',
      getBadgeClass(tone),
    )}>
      {label}
    </span>
  )
}

function MetricChip({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'amber' | 'rose'
}) {
  return (
    <span className={cn(
      'inline-flex items-baseline gap-1 rounded-lg px-2 py-1 text-xs ring-1',
      tone === 'rose'
        ? 'bg-rose-500/10 text-rose-700 ring-rose-500/15 dark:text-rose-300'
        : 'bg-amber-500/10 text-amber-800 ring-amber-500/15 dark:text-amber-300',
    )}>
      <span className="font-medium">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </span>
  )
}

function GradeAlertItem({
  title,
  typeLabel,
  grade,
}: {
  title: string
  typeLabel: string
  grade: number
}) {
  const tone = getGradeAlertTone(grade)

  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-muted/15 px-2 py-1.5 ring-1 ring-border/30">
      <span className="min-w-0 truncate text-xs font-medium text-foreground/85">
        {typeLabel} · {title}
      </span>
      <span className={cn(
        'shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ring-1',
        tone === 'rose'
          ? 'bg-rose-500/10 text-rose-700 ring-rose-500/15 dark:text-rose-300'
          : 'bg-amber-500/10 text-amber-800 ring-amber-500/15 dark:text-amber-300',
      )}>
        Calificación {formatMetricValue(grade)}
      </span>
    </span>
  )
}

function FollowUpAvatar({ item }: { item: DashboardOpenFollowUp }) {
  if (item.entityType === 'student') {
    const name = getEntityName(item)
    const cleanAvatarUrl = item.alumnoAvatarUrl?.trim()

    return (
      <Avatar className="size-7 shrink-0 rounded-lg border border-border/40 bg-muted">
        {cleanAvatarUrl ? (
          <AvatarImage src={cleanAvatarUrl} alt={name} className="object-cover" />
        ) : null}
        <AvatarFallback className="rounded-lg bg-muted text-[11px] font-semibold text-muted-foreground">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/35 bg-muted/20 text-muted-foreground">
      <BookOpen className="size-3.5" />
    </span>
  )
}

function FollowUpRow({ item }: { item: DashboardOpenFollowUp }) {
  const href = getHref(item)
  const entityName = getEntityName(item)
  const badges = getSignalBadges(item)
  const metricChips = getMetricChips(item)
  const reasonLabel = getDisplayReasonLabel(item)
  const gradeAlerts = item.gradeAlerts ?? []
  const courseContext =
    item.entityType === 'student'
      ? [item.cursoNombre, item.cursoDescripcion].filter(Boolean).join(' · ')
      : item.cursoDescripcion

  return (
    <Link
      href={href}
      className="group grid min-w-0 gap-2 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
    >
      <span className="flex min-w-0 gap-2.5">
        <FollowUpAvatar item={item} />
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-muted/30 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/35">
              {getEntityLabel(item)}
            </span>
            {badges.map((badge) => (
              <SignalBadge key={`${item.id}-${badge.label}`} {...badge} />
            ))}
          </span>
          <span className="mt-1 block truncate text-sm font-semibold leading-5 text-foreground group-hover:text-primary">
            {entityName}
          </span>
          {courseContext ? (
            <span className="mt-0.5 block truncate text-xs leading-5 text-muted-foreground">
              {courseContext}
            </span>
          ) : null}
          {metricChips.length > 0 ? (
            <span className="mt-1 flex flex-wrap gap-1.5">
              {metricChips.map((chip) => (
                <MetricChip key={`${item.id}-${chip.label}`} {...chip} />
              ))}
            </span>
          ) : null}
          {gradeAlerts.length > 0 ? (
            <span className="mt-1.5 flex flex-col gap-1">
              {gradeAlerts.slice(0, 2).map((alert) => (
                <GradeAlertItem
                  key={`${item.id}-${alert.calificacionId}`}
                  title={alert.titulo}
                  typeLabel={getGradeTypeLabel(alert.tipo)}
                  grade={alert.nota}
                />
              ))}
              {gradeAlerts.length > 2 ? (
                <span className="px-2 text-[11px] font-medium text-muted-foreground">
                  +{gradeAlerts.length - 2} evaluaciones bajas más
                </span>
              ) : null}
            </span>
          ) : null}
          {reasonLabel ? (
            <span className="mt-1 block truncate text-xs leading-5 text-muted-foreground">
              {reasonLabel}
            </span>
          ) : null}
        </span>
      </span>
      <span className="inline-flex h-7 items-center justify-self-start rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors group-hover:bg-muted/35 group-hover:text-foreground sm:justify-self-end">
        {getActionLabel(item)}
      </span>
    </Link>
  )
}

function groupItems(items: DashboardOpenFollowUp[]) {
  return items.reduce<Array<{ key: string; label: string; items: DashboardOpenFollowUp[] }>>(
    (groups, item) => {
      const label = getPeriodLabel(item)
      const key = `${item.year}-${item.quarterNumber}-${label}`
      const existing = groups.find((group) => group.key === key)

      if (existing) {
        existing.items.push(item)
      } else {
        groups.push({
          key,
          label,
          items: [item],
        })
      }

      return groups
    },
    [],
  )
}

export function OpenFollowUpsSection({
  items,
}: {
  items: DashboardOpenFollowUp[]
}) {
  const [expanded, setExpanded] = useState(false)
  const visibleItems = useMemo(() => items.slice(0, VISIBLE_LIMIT), [items])
  const hiddenCount = Math.max(items.length - visibleItems.length, 0)
  const groups = useMemo(() => groupItems(visibleItems), [visibleItems])

  if (items.length === 0) return null

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded} asChild>
      <section className="rounded-2xl bg-muted/10 p-3.5 ring-1 ring-border/40 dark:bg-muted/[0.06] sm:p-4">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <CollapsibleTrigger className="group flex min-w-0 flex-1 items-start gap-2 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-background/70 text-muted-foreground ring-1 ring-border/30 transition-colors group-hover:bg-background group-hover:text-foreground">
              {expanded ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[17px] font-semibold tracking-tight text-foreground">
                  Casos a seguir
                </span>
                <span className="rounded-md bg-background/75 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground ring-1 ring-border/35">
                  {items.length}
                </span>
              </span>
              <span className="mt-1 block max-w-2xl text-sm leading-6 text-muted-foreground">
                Situaciones académicas con alertas relevantes durante el ciclo lectivo.
              </span>
            </span>
          </CollapsibleTrigger>

          <Link
            href="/admin/dashboard/reports"
            className="inline-flex h-8 shrink-0 self-start items-center rounded-lg px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/35 hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            Abrir reportes
            <ArrowRight className="ml-1 size-3.5" />
          </Link>
        </div>

        <CollapsibleContent>
          <div className="mt-3 space-y-3">
            {groups.map((group) => (
              <div key={group.key} className="grid gap-2 sm:grid-cols-[104px_minmax(0,1fr)]">
                <div className="pt-2 text-xs font-semibold text-muted-foreground">
                  {group.label}
                </div>
                <div className="relative min-w-0 border-l border-border/35 pl-2">
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <div key={item.id} className="relative">
                        <span className="absolute -left-[13px] top-4 size-1.5 rounded-full bg-border" />
                        <FollowUpRow item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hiddenCount > 0 ? (
            <p className="mt-2.5 text-xs leading-5 text-muted-foreground">
              Hay {hiddenCount} seguimiento{hiddenCount === 1 ? '' : 's'} más para revisar en reportes.
            </p>
          ) : null}
        </CollapsibleContent>
      </section>
    </Collapsible>
  )
}
