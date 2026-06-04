'use client'

import type { ComponentType, ReactNode } from 'react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Inbox,
  Pencil,
  Percent,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { AdminBreadcrumbs } from '@/components/layout/breadcrumbs'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCourseAcademicProfile } from '@/lib/admin/courses/api'
import type { CourseHealth } from '@/lib/admin/courses/course-health'
import type {
  CourseAcademicProfile as CourseAcademicProfileData,
  CourseAcademicProfileHealth,
  CourseAcademicProfileSignal,
} from '@/lib/admin/courses/types'
import { cn } from '@/lib/utils'

type HealthLevel = 'normal' | 'follow-up' | 'critical'
type MetricTone = 'neutral' | 'healthy' | 'attention' | 'critical'

const STATUS_OPTIONS: Array<{
  level: HealthLevel
  label: string
  fallbackReasons: string[]
  icon: ComponentType<{ className?: string }>
}> = [
  {
    level: 'normal',
    label: 'Normal',
    fallbackReasons: ['Sin señales académicas prioritarias.'],
    icon: CheckCircle2,
  },
  {
    level: 'follow-up',
    label: 'Seguimiento',
    fallbackReasons: ['Asistencia, promedio o correcciones requieren monitoreo.'],
    icon: AlertCircle,
  },
  {
    level: 'critical',
    label: 'Crítico',
    fallbackReasons: ['Riesgo académico alto o acumulación de señales urgentes.'],
    icon: ShieldAlert,
  },
]

const NORMAL_COURSE_HEALTH: CourseHealth = {
  level: 'normal',
  label: 'Normal',
  reasons: ['Sin alertas en el trimestre actual'],
  color: 'emerald',
}

function normalizeCourseHealth(health?: CourseAcademicProfileHealth | null): CourseHealth {
  const level =
    health?.level === 'critical' || health?.level === 'follow-up' ? health.level : 'normal'
  const color =
    health?.color === 'rose' || health?.color === 'amber' || health?.color === 'emerald'
      ? health.color
      : level === 'critical'
        ? 'rose'
        : level === 'follow-up'
          ? 'amber'
          : 'emerald'

  return {
    level,
    label: health?.label || NORMAL_COURSE_HEALTH.label,
    reasons:
      health?.reasons && health.reasons.length > 0
        ? health.reasons
        : NORMAL_COURSE_HEALTH.reasons,
    color,
  }
}

function normalizeCopy(value?: string | null) {
  if (!value) return ''

  return value
    .replace(/Critico/g, 'Crítico')
    .replace(/critico/g, 'crítico')
    .replace(/academico/g, 'académico')
    .replace(/Academico/g, 'Académico')
    .replace(/academica/g, 'académica')
    .replace(/Academica/g, 'Académica')
    .replace(/senales/g, 'señales')
    .replace(/Senales/g, 'Señales')
    .replace(/revision/g, 'revisión')
    .replace(/Revision/g, 'Revisión')
    .replace(/Atencion/g, 'Atención')
    .replace(/atencion/g, 'atención')
    .replace(/intervencion/g, 'intervención')
    .replace(/Intervencion/g, 'Intervención')
}

function formatNumber(value?: number | null, fallback = '0') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback

  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDecimal(value?: number | null, fallback = 'Sin datos') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback

  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 1,
  }).format(value)
}

function formatPercent(value?: number | null, fallback = 'Sin datos') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback

  return `${formatDecimal(value)}%`
}

function hasNumber(value?: number | null): value is number {
  return value !== null && value !== undefined && Number.isFinite(value)
}

function normalizeHealthLevel(level?: string | null): HealthLevel {
  if (level === 'critical') return 'critical'
  if (level === 'follow-up') return 'follow-up'

  return 'normal'
}

function getMetricTone(kind: 'average' | 'attendance' | 'count', value?: number | null): MetricTone {
  if (!hasNumber(value)) return 'neutral'

  if (kind === 'attendance') {
    if (value < 70) return 'critical'
    if (value < 85) return 'attention'
    return 'healthy'
  }

  if (kind === 'average') {
    if (value < 60) return 'critical'
    if (value < 75) return 'attention'
    return 'healthy'
  }

  return value > 0 ? 'attention' : 'healthy'
}

function getHealthTone(level: HealthLevel): MetricTone {
  if (level === 'critical') return 'critical'
  if (level === 'follow-up') return 'attention'

  return 'healthy'
}

function getSeverityTone(severity?: string | null): MetricTone {
  if (severity === 'critical') return 'critical'
  if (severity === 'attention') return 'attention'

  return 'neutral'
}

function severityWeight(signal: CourseAcademicProfileSignal) {
  if (signal.severity === 'critical') return 0
  if (signal.severity === 'attention') return 1

  return 2
}

function HealthBadge({ health }: { health: CourseHealth }) {
  const level = normalizeHealthLevel(health.level)

  if (level === 'critical') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
        <ShieldAlert className="size-3.5" />
        {normalizeCopy(health.label || 'Crítico')}
      </span>
    )
  }

  if (level === 'follow-up') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
        <AlertCircle className="size-3.5" />
        {normalizeCopy(health.label || 'Seguimiento')}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
      <CheckCircle2 className="size-3.5" />
      {normalizeCopy(health.label || 'Normal')}
    </span>
  )
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-6 text-center dark:bg-background/25">
      <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function SectionPanel({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm sm:p-5">
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function InlineMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  detail?: string | null
  tone?: MetricTone
}) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card/95 p-3 shadow-sm',
        tone === 'healthy' && 'border-emerald-500/20 bg-emerald-500/5',
        tone === 'attention' && 'border-amber-500/20 bg-amber-500/5',
        tone === 'critical' && 'border-rose-500/20 bg-rose-500/5',
        tone === 'neutral' && 'border-border/60',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold leading-tight text-foreground tabular-nums">
            {value}
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/70 text-muted-foreground ring-1 ring-border/50 dark:bg-background/25">
          <Icon className="size-4.5" />
        </div>
      </div>
      {detail ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p> : null}
    </div>
  )
}

function StatusCard({
  option,
  active,
  health,
}: {
  option: (typeof STATUS_OPTIONS)[number]
  active: boolean
  health: CourseHealth
}) {
  const Icon = option.icon
  const tone = active ? getHealthTone(option.level) : 'neutral'
  const reasons = active && health.reasons.length > 0 ? health.reasons : option.fallbackReasons

  return (
    <article
      className={cn(
        'rounded-xl border bg-background/60 p-3 dark:bg-background/25',
        tone === 'healthy' && 'border-emerald-500/20 bg-emerald-500/5',
        tone === 'attention' && 'border-amber-500/20 bg-amber-500/5',
        tone === 'critical' && 'border-rose-500/20 bg-rose-500/5',
        tone === 'neutral' && 'border-border/60',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card/80 text-muted-foreground ring-1 ring-border/50">
            <Icon className="size-4" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">{option.label}</h4>
        </div>
        {active ? (
          <span className="rounded-full border border-border/60 bg-card/80 px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Actual
          </span>
        ) : null}
      </div>
      <div className="mt-3 space-y-2">
        {reasons.map((reason) => (
          <p key={reason} className="text-sm leading-5 text-muted-foreground">
            {normalizeCopy(reason)}
          </p>
        ))}
      </div>
    </article>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const tone = getSeverityTone(severity)

  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-0.5 text-xs font-medium',
        tone === 'critical' &&
          'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
        tone === 'attention' &&
          'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        tone === 'neutral' && 'border-border/60 bg-muted/25 text-muted-foreground',
      )}
    >
      {tone === 'critical' ? 'Crítica' : tone === 'attention' ? 'Atención' : 'Informativa'}
    </span>
  )
}

function SignalRow({ signal }: { signal: CourseAcademicProfileSignal }) {
  const tone = getSeverityTone(signal.severity)

  return (
    <article
      className={cn(
        'rounded-xl border bg-background/60 p-3 dark:bg-background/25',
        tone === 'critical' && 'border-rose-500/25',
        tone === 'attention' && 'border-amber-500/25',
        tone === 'neutral' && 'border-border/60',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/35 text-muted-foreground',
            tone === 'critical' && 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
            tone === 'attention' && 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
          )}
        >
          {tone === 'critical' ? (
            <ShieldAlert className="size-4" />
          ) : tone === 'attention' ? (
            <AlertTriangle className="size-4" />
          ) : (
            <BookOpen className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={signal.severity} />
            <h4 className="text-sm font-semibold text-foreground">{normalizeCopy(signal.title)}</h4>
          </div>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {normalizeCopy(signal.description)}
          </p>
        </div>
      </div>
    </article>
  )
}

function StudentFollowUpRow({
  student,
}: {
  student: CourseAcademicProfileData['studentsRequiringFollowUp'][number]
}) {
  return (
    <article className="rounded-xl border border-border/60 bg-background/60 p-3 dark:bg-background/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <UserAvatar
            name={student.fullName}
            avatarUrl={student.avatarUrl}
            size={40}
            className="shrink-0"
            fallbackClassName="bg-primary/10 text-primary text-sm"
          />
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-foreground">
              {student.fullName}
            </h4>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {normalizeCopy(student.reason)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/60 bg-card/80 px-2 py-0.5">
                Asistencia {formatPercent(student.attendancePercentage)}
              </span>
              <span className="rounded-full border border-border/60 bg-card/80 px-2 py-0.5">
                Promedio {formatDecimal(student.averageGrade)}
              </span>
            </div>
          </div>
        </div>

        <Button asChild className="h-9 shrink-0 rounded-xl px-3 text-sm shadow-none transition-[transform,background-color] duration-200 ease-out active:scale-[0.98]">
          <Link href={`/admin/dashboard/students/${student.id}/profile`}>
            Ver alumno
            <ArrowUpRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </article>
  )
}

function PendingFollowUpRow({
  item,
}: {
  item: NonNullable<CourseAcademicProfileData['pendingFollowUp']>[number]
}) {
  const fullName = `${item.alumnoNombre ?? ''} ${item.alumnoApellido ?? ''}`.trim()
  const studentName = fullName || 'Alumno en seguimiento'
  const level = normalizeHealthLevel(item.level)
  const periodLabel = item.periodLabel || `${item.quarterNumber}º trimestre`

  return (
    <article className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <UserAvatar
            name={studentName}
            avatarUrl={item.avatarUrl}
            size={40}
            className="shrink-0"
            fallbackClassName="bg-amber-500/10 text-amber-700 dark:text-amber-300 text-sm"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate text-sm font-semibold text-foreground">
                {studentName}
              </h4>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-xs font-medium',
                  level === 'critical' &&
                    'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
                  level === 'follow-up' &&
                    'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
                  level === 'normal' && 'border-border/60 bg-card/80 text-muted-foreground',
                )}
              >
                {level === 'critical'
                  ? `Crítico en ${periodLabel}`
                  : level === 'follow-up'
                    ? `Seguimiento en ${periodLabel}`
                    : periodLabel}
              </span>
            </div>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {normalizeCopy(item.description || item.reason)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/60 bg-card/80 px-2 py-0.5">
                Promedio {formatDecimal(item.averageValue)}
              </span>
              <span className="rounded-full border border-border/60 bg-card/80 px-2 py-0.5">
                Asistencia {formatPercent(item.attendanceValue)}
              </span>
            </div>
          </div>
        </div>

        {item.alumnoId ? (
          <Button asChild className="h-9 shrink-0 rounded-xl px-3 text-sm shadow-none transition-[transform,background-color] duration-200 ease-out active:scale-[0.98]">
            <Link href={`/admin/dashboard/students/${item.alumnoId}/profile`}>
              Ver alumno
              <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </article>
  )
}

function TeacherRow({
  teacher,
}: {
  teacher: CourseAcademicProfileData['teachers'][number]
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 p-3 dark:bg-background/25">
      <UserAvatar
        name={teacher.fullName}
        avatarUrl={teacher.avatarUrl}
        size={38}
        className="shrink-0"
        fallbackClassName="bg-primary/10 text-primary text-sm"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{teacher.fullName}</p>
        <p className="text-xs text-muted-foreground">Docente asignado</p>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border/60 bg-card/95 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="size-14 animate-pulse rounded-xl bg-muted/35" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-7 w-64 animate-pulse rounded-lg bg-muted/35" />
              <div className="h-4 w-full max-w-xl animate-pulse rounded-lg bg-muted/25" />
              <div className="h-6 w-28 animate-pulse rounded-full bg-muted/25" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 animate-pulse rounded-xl bg-muted/25" />
            <div className="h-10 w-32 animate-pulse rounded-xl bg-muted/35" />
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl border border-border/60 bg-card/95" />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="h-64 animate-pulse rounded-2xl border border-border/60 bg-card/95" />
          <div className="h-72 animate-pulse rounded-2xl border border-border/60 bg-card/95" />
        </div>
        <div className="space-y-5">
          <div className="h-56 animate-pulse rounded-2xl border border-border/60 bg-card/95" />
          <div className="h-56 animate-pulse rounded-2xl border border-border/60 bg-card/95" />
        </div>
      </div>
    </div>
  )
}

function CourseProfileContent({ profile }: { profile: CourseAcademicProfileData }) {
  const metrics = profile.metricsCurrent ?? profile.academicMetrics
  const attendanceAverage =
    metrics.attendanceAverage ?? metrics.asistenciaActual ?? profile.academicMetrics.attendanceAverage
  const academicAverage =
    metrics.academicAverage ?? metrics.promedioActual ?? profile.academicMetrics.academicAverage
  const studentsAtRiskCurrentCount =
    metrics.studentsAtRiskCurrentCount ??
    profile.studentsAtRiskCurrentCount ??
    profile.academicMetrics.studentsAtRiskCurrentCount ??
    profile.academicMetrics.studentsAtRiskCount
  const pendingCorrectionsCount =
    metrics.pendingCorrectionsCount ?? profile.academicMetrics.pendingCorrectionsCount
  const health = normalizeCourseHealth(profile.academicStatusCurrent ?? profile.health)
  const healthLevel = normalizeHealthLevel(health.level)
  const studentsCount = profile.students.studentsCount
  const teachersCount = profile.teachers.length
  const affectedStudentsCurrent =
    profile.affectedStudentsCurrent ?? profile.studentsRequiringFollowUp
  const pendingFollowUp = profile.pendingFollowUp ?? []
  const pendingFollowUpCount =
    profile.pendingFollowUpCount ?? metrics.pendingFollowUpCount ?? pendingFollowUp.length
  const sortedSignals = [...profile.academicSignals].sort(
    (first, second) => severityWeight(first) - severityWeight(second),
  )

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <BookOpen className="size-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {profile.course.name}
                </h1>
                <HealthBadge health={health} />
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {profile.course.description?.trim() || 'Sin descripción cargada.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 dark:bg-background/25">
                  Estado {normalizeCopy(profile.course.status)}
                </span>
                <span className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 dark:bg-background/25">
                  {formatNumber(studentsCount)} alumnos
                </span>
                <span className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 dark:bg-background/25">
                  {formatNumber(teachersCount)} docentes
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="outline" className="h-10 rounded-xl shadow-none active:scale-[0.98]">
              <Link href="/admin/dashboard/courses">
                <ArrowLeft className="mr-2 size-4" />
                Volver al listado
              </Link>
            </Button>
            <Button asChild className="h-10 rounded-xl shadow-none transition-[transform,background-color] duration-200 ease-out active:scale-[0.98]">
              <Link href={`/admin/dashboard/courses/${profile.course.id}`}>
                <Pencil className="mr-2 size-4" />
                Ajustes
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <InlineMetric
          icon={Percent}
          label="Asistencia"
          value={formatPercent(attendanceAverage)}
          detail="Trimestre actual"
          tone={getMetricTone('attendance', attendanceAverage)}
        />
        <InlineMetric
          icon={TrendingUp}
          label="Promedio académico"
          value={formatDecimal(academicAverage)}
          detail="Trimestre actual"
          tone={getMetricTone('average', academicAverage)}
        />
        <InlineMetric
          icon={Users}
          label="Alumnos"
          value={formatNumber(studentsCount)}
          detail="Matrícula asociada"
        />
        <InlineMetric
          icon={UserCheck}
          label="Docentes"
          value={formatNumber(teachersCount)}
          detail="Equipo asignado"
          tone={teachersCount > 0 ? 'neutral' : 'attention'}
        />
        <InlineMetric
          icon={ShieldAlert}
          label="Alumnos en riesgo"
          value={formatNumber(studentsAtRiskCurrentCount)}
          detail={
            studentsAtRiskCurrentCount > 0
              ? 'Alertas del trimestre actual'
              : 'Sin alertas en el trimestre actual'
          }
          tone={getMetricTone('count', studentsAtRiskCurrentCount)}
        />
        <InlineMetric
          icon={ClipboardCheck}
          label="Correcciones pendientes"
          value={formatNumber(pendingCorrectionsCount)}
          detail={pendingCorrectionsCount > 0 ? 'Pendientes de revisión' : 'Sin pendientes'}
          tone={getMetricTone('count', pendingCorrectionsCount)}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <SectionPanel
            title="Alertas del trimestre actual"
            description="Lectura operacional calculada solo con datos del trimestre actual."
          >
            <div className="grid gap-3 md:grid-cols-3">
              {STATUS_OPTIONS.map((option) => (
                <StatusCard
                  key={option.level}
                  option={option}
                  active={option.level === healthLevel}
                  health={health}
                />
              ))}
            </div>
          </SectionPanel>

          <SectionPanel
            title="Señales del trimestre actual"
            description="Alertas académicas actuales ordenadas por prioridad."
          >
            {sortedSignals.length > 0 ? (
              <div className="space-y-2">
                {sortedSignals.map((signal, index) => (
                  <SignalRow key={`${signal.type}-${signal.title}-${index}`} signal={signal} />
                ))}
              </div>
            ) : (
              <EmptyPanel
                icon={CheckCircle2}
                title="Sin alertas en el trimestre actual"
                description="No hay señales académicas actuales para este curso."
              />
            )}
          </SectionPanel>
        </div>

        <div className="space-y-5">
          <SectionPanel
            title="Alumnos afectados actuales"
            description="Alumnos con alertas del trimestre actual."
          >
            {affectedStudentsCurrent.length > 0 ? (
              <div className="space-y-2">
                {affectedStudentsCurrent.map((student) => (
                  <StudentFollowUpRow key={student.id} student={student} />
                ))}
              </div>
            ) : (
              <EmptyPanel
                icon={GraduationCap}
                title="Sin alertas en el trimestre actual"
                description="No hay alumnos marcados para intervención actual en este curso."
              />
            )}
          </SectionPanel>

          <SectionPanel
            title="Seguimiento pendiente"
            description="Señales heredadas de trimestres anteriores, separadas del estado actual."
          >
            {pendingFollowUpCount > 0 ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-800 dark:text-amber-200">
                  Con seguimiento pendiente del trimestre anterior
                </div>
                {pendingFollowUp.length > 0 ? (
                  <div className="space-y-2">
                    {pendingFollowUp.map((item, index) => (
                      <PendingFollowUpRow
                        key={`${item.alumnoId ?? 'alumno'}-${item.periodLabel}-${index}`}
                        item={item}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyPanel
                icon={CheckCircle2}
                title="Sin seguimiento pendiente"
                description="No hay señales heredadas de trimestres anteriores para este curso."
              />
            )}
          </SectionPanel>

          <SectionPanel
            title="Docentes"
            description="Equipo asignado al curso."
          >
            {profile.teachers.length > 0 ? (
              <div className="space-y-2">
                {profile.teachers.map((teacher) => (
                  <TeacherRow key={teacher.id} teacher={teacher} />
                ))}
              </div>
            ) : (
              <EmptyPanel
                icon={UserCheck}
                title="Sin docentes asignados"
                description="Asignar docentes permite consolidar asistencia, tareas y correcciones."
              />
            )}
          </SectionPanel>
        </div>
      </div>
    </div>
  )
}

export function CourseAcademicProfile() {
  const params = useParams<{ id: string }>()
  const courseId = useMemo(() => Number(params.id), [params.id])
  const [profile, setProfile] = useState<CourseAcademicProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      setLoading(true)
      setError(null)

      try {
        if (!Number.isFinite(courseId) || courseId <= 0) {
          throw new Error('El identificador del curso no es válido.')
        }

        const data = await getCourseAcademicProfile(courseId)
        if (mounted) setProfile(data)
      } catch (err: any) {
        if (mounted) setError(err?.message || 'No se pudo cargar el perfil académico del curso.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [courseId])

  return (
    <>
      <AppHeader title="Seguimiento del curso" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <AdminBreadcrumbs
            items={[
              { label: 'Cursos', href: '/admin/dashboard/courses' },
              { label: profile?.course.name ?? 'Seguimiento del curso' },
            ]}
          />
          {loading ? (
            <ProfileSkeleton />
          ) : error ? (
            <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
              <CardContent className="px-6 py-14">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Inbox className="size-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">
                    No se pudo cargar el perfil
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    {error}
                  </p>
                  <Button asChild variant="outline" className="mt-5 rounded-xl shadow-none">
                    <Link href="/admin/dashboard/courses">
                      <ArrowLeft className="mr-2 size-4" />
                      Volver al listado
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : profile ? (
            <CourseProfileContent profile={profile} />
          ) : (
            <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
              <CardContent className="px-6 py-14">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Inbox className="size-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">
                    Curso no disponible
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    No se encontró información académica para el curso seleccionado.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
