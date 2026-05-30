'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Inbox,
  Mail,
  NotebookText,
  Phone,
  ShieldAlert,
  UserRound,
  Users,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getStudentAcademicSummary } from '@/lib/admin/students/api'
import type {
  StudentAcademicEnrollment,
  StudentAcademicSignal,
  StudentAcademicStatus,
  StudentAcademicSummary,
  StudentGradeSignal,
} from '@/lib/admin/students/types'
import { cn } from '@/lib/utils'

function formatNumber(value?: number | null, fallback = 'Sin datos') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(value)
}

function hasValue(value?: number | null): value is number {
  return value !== null && value !== undefined && !Number.isNaN(value)
}

function formatDate(value?: string | null) {
  if (!value) return null

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function normalizeCopy(value?: string | null) {
  if (!value) return ''

  return value
    .replace('Sin alertas academicas', 'Sin alertas académicas')
    .replace('Requiere intervencion prioritaria', 'Requiere intervención prioritaria')
    .replace('Ultima nota baja', 'Última nota baja')
}

function StatusBadge({ status }: { status: StudentAcademicStatus }) {
  if (status.level === 'critical') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
        <ShieldAlert className="size-3.5" />
        Crítico
      </span>
    )
  }

  if (status.level === 'follow-up') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
        <AlertCircle className="size-3.5" />
        {normalizeCopy(status.label)}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
      <CheckCircle2 className="size-3.5" />
      Sin seguimiento
    </span>
  )
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        active
          ? 'border-border/60 bg-muted/20 text-muted-foreground'
          : 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
      )}
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 px-5 py-8 text-center shadow-sm">
      <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </section>
  )
}

function InlineEmpty({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
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

function InlineMetric({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string
  value: string
  detail?: string | null
  tone?: 'neutral' | 'attention' | 'critical' | 'healthy'
}) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-background/60 p-3 dark:bg-background/25',
        tone === 'healthy' && 'border-emerald-500/20 bg-emerald-500/5',
        tone === 'attention' && 'border-amber-500/20 bg-amber-500/5',
        tone === 'critical' && 'border-rose-500/20 bg-rose-500/5',
        tone === 'neutral' && 'border-border/60',
      )}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      {detail ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p> : null}
    </div>
  )
}

function SectionPanel({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function SignalRow({
  signal,
  studentName,
  avatarUrl,
}: {
  signal: StudentAcademicSignal
  studentName: string
  avatarUrl?: string | null
}) {
  const formattedDate = formatDate(signal.date)
  const severity = signal.severity

  return (
    <article className="rounded-xl border border-border/60 bg-background/60 p-3 dark:bg-background/25">
      <div className="flex gap-3">
        <UserAvatar
          name={studentName}
          avatarUrl={avatarUrl}
          size={32}
          className="shrink-0"
          fallbackClassName="bg-primary/10 text-primary text-xs"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'inline-flex rounded-full border px-2 py-0.5 text-xs font-medium',
                    severity === 'critical' &&
                      'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
                    severity === 'attention' &&
                      'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
                    severity !== 'critical' &&
                      severity !== 'attention' &&
                      'border-border/60 bg-muted/25 text-muted-foreground',
                  )}
                >
                  {severity === 'critical'
                    ? 'Crítica'
                    : severity === 'attention'
                      ? 'Atención'
                      : 'Informativa'}
                </span>
                <h4 className="text-sm font-semibold text-foreground">{normalizeCopy(signal.title)}</h4>
              </div>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {normalizeCopy(signal.description)}
              </p>
            </div>
            {formattedDate ? (
              <span className="shrink-0 text-xs text-muted-foreground">{formattedDate}</span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

function GradeLine({ grade, label }: { grade: StudentGradeSignal; label: string }) {
  const formattedDate = formatDate(grade.date)

  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-3 dark:bg-background/25">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-foreground">{grade.title}</p>
        <span className="text-sm font-semibold text-foreground">{formatNumber(grade.grade)}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {grade.courseName}
        {formattedDate ? `, ${formattedDate}` : ''}
      </p>
    </div>
  )
}

function CourseRow({ enrollment }: { enrollment: StudentAcademicEnrollment }) {
  const statusLabel = enrollment.courseStatus ? normalizeCopy(enrollment.courseStatus) : null

  return (
    <article className="rounded-xl border border-border/60 bg-background/60 p-3 dark:bg-background/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">{enrollment.courseName}</h4>
            {enrollment.isMain ? (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Curso principal
              </span>
            ) : null}
            {statusLabel ? (
              <span className="rounded-full border border-border/60 bg-muted/20 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {statusLabel}
              </span>
            ) : null}
          </div>
          {enrollment.courseDescription ? (
            <p className="mt-1 text-sm text-muted-foreground">{enrollment.courseDescription}</p>
          ) : null}
        </div>
        {enrollment.teacherName ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserAvatar
              name={enrollment.teacherName}
              avatarUrl={enrollment.teacherAvatarUrl}
              size={28}
              fallbackClassName="bg-primary/10 text-primary text-xs"
            />
            <span>{enrollment.teacherName}</span>
          </div>
        ) : null}
      </div>
    </article>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border/60 bg-card/95 p-5 shadow-sm">
        <div className="flex gap-4">
          <div className="size-16 animate-pulse rounded-full bg-muted/40" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-56 animate-pulse rounded-lg bg-muted/40" />
            <div className="h-4 w-72 max-w-full animate-pulse rounded-lg bg-muted/30" />
            <div className="h-8 w-80 max-w-full animate-pulse rounded-xl bg-muted/25" />
          </div>
        </div>
      </section>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-muted/30" />
        ))}
      </div>
    </div>
  )
}

function AcademicProfileContent({ summary }: { summary: StudentAcademicSummary }) {
  const attendance = summary.attendanceSummary
  const grades = summary.gradesSummary
  const course = summary.currentCourse
  const periodLabel = [summary.period.label, summary.period.monthRangeLabel].filter(Boolean).join(', ')
  const phone = summary.student.phone ?? summary.student.telefono
  const hasAttendance =
    hasValue(attendance.attendancePercentage) ||
    hasValue(attendance.presentCount) ||
    hasValue(attendance.absentCount) ||
    hasValue(attendance.totalClasses) ||
    hasValue(attendance.consecutiveAbsences) ||
    attendance.isLowAttendance !== null &&
      attendance.isLowAttendance !== undefined
  const hasGrades =
    hasValue(grades.averageGrade) ||
    hasValue(grades.manualAverageGrade) ||
    hasValue(grades.lowGradesCount) ||
    Boolean(grades.latestGrade) ||
    Boolean(grades.latestLowGrade)
  const hasCourses = summary.currentEnrollments.length > 0
  const attendancePercentage = attendance.attendancePercentage
  const isLowAttendance =
    hasValue(attendancePercentage) ? attendancePercentage < 70 : attendance.isLowAttendance === true
  const isAttendanceUnderObservation =
    hasValue(attendancePercentage) && attendancePercentage >= 70 && attendancePercentage < 85
  const attendanceTone = isLowAttendance
    ? 'critical'
    : isAttendanceUnderObservation
      ? 'attention'
      : 'healthy'
  const gradeTone =
    hasValue(grades.averageGrade) && grades.averageGrade < 60
      ? 'critical'
      : hasValue(grades.averageGrade) && grades.averageGrade < 70
        ? 'attention'
        : 'healthy'
  const statusTone =
    summary.academicStatus.level === 'critical'
      ? 'critical'
      : summary.academicStatus.level === 'follow-up'
        ? 'attention'
        : 'healthy'
  const attendanceDetail =
    hasValue(attendance.presentCount) && hasValue(attendance.totalClasses)
      ? `${formatNumber(attendance.presentCount)} presentes de ${formatNumber(attendance.totalClasses)} clases`
      : null
  const visibleSignals = summary.recentSignals.slice(0, 3)

  const tabs = [
    { value: 'summary', label: 'Resumen' },
    ...(hasAttendance ? [{ value: 'attendance', label: 'Asistencia' }] : []),
    ...(hasGrades ? [{ value: 'grades', label: 'Calificaciones' }] : []),
    ...(hasCourses ? [{ value: 'courses', label: 'Cursos' }] : []),
    { value: 'admin', label: 'Datos administrativos' },
  ]

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <UserAvatar
              name={summary.student.fullName}
              avatarUrl={summary.student.avatarUrl}
              size={64}
              className="shrink-0"
              fallbackClassName="bg-primary/10 text-primary text-lg"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {summary.student.fullName}
                </h1>
                <ActiveBadge active={summary.student.active} />
                <StatusBadge status={summary.academicStatus} />
              </div>
              {summary.student.email ? (
                <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-4" />
                  <span>{summary.student.email}</span>
                </div>
              ) : null}
              <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                <BookOpen className="mt-0.5 size-4 shrink-0" />
                {course ? (
                  <p>
                    <span className="font-medium text-foreground">{course.courseName}</span>
                    {course.courseDescription ? `, ${course.courseDescription}` : ''}
                  </p>
                ) : (
                  <p className="font-medium text-foreground">Alumno sin curso asignado</p>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                <span>{periodLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="outline" className="h-10 rounded-xl shadow-none active:scale-[0.98]">
              <Link href="/admin/dashboard/students">
                <ArrowLeft className="mr-2 size-4" />
                Volver al listado
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-10 rounded-xl shadow-none active:scale-[0.98]">
              <Link href={`/admin/dashboard/students/${summary.student.id}`}>
                <Edit3 className="mr-2 size-4" />
                Editar datos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Tabs defaultValue="summary" className="space-y-3">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl border border-border/50 bg-background/60 p-1 dark:bg-background/25 sm:w-fit">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="rounded-lg px-3">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="summary" className="space-y-3">
          <SectionPanel
            title="Resumen académico"
            description="Lectura compacta del trimestre actual para decidir el próximo paso."
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <InlineMetric
                label="Estado académico"
                value={normalizeCopy(summary.academicStatus.label)}
                detail={summary.academicStatus.reasons[0] ? normalizeCopy(summary.academicStatus.reasons[0]) : null}
                tone={statusTone}
              />
              <InlineMetric
                label="Curso actual"
                value={course ? course.courseName : 'Sin curso asignado'}
                detail={course?.courseDescription ?? null}
                tone={course ? 'neutral' : 'attention'}
              />
              {hasValue(attendance.attendancePercentage) ? (
                <InlineMetric
                  label="Asistencia"
                  value={`${formatNumber(attendance.attendancePercentage)}%`}
                  detail={attendanceDetail}
                  tone={attendanceTone}
                />
              ) : null}
              {hasValue(grades.averageGrade) ? (
                <InlineMetric
                  label="Promedio"
                  value={formatNumber(grades.averageGrade)}
                  detail={
                    hasValue(grades.lowGradesCount)
                      ? `${formatNumber(grades.lowGradesCount)} calificaciones bajas`
                      : null
                  }
                  tone={gradeTone}
                />
              ) : null}
            </div>

            {summary.academicStatus.reasons.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {summary.academicStatus.reasons.slice(1).map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {normalizeCopy(reason)}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2">
                <NotebookText className="size-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold text-foreground">Últimas señales</h4>
              </div>
              {visibleSignals.length > 0 ? (
                <div className="space-y-2">
                  {visibleSignals.map((signal, index) => (
                    <SignalRow
                      key={`${signal.type}-${signal.title}-${index}`}
                      signal={signal}
                      studentName={summary.student.fullName}
                      avatarUrl={summary.student.avatarUrl}
                    />
                  ))}
                </div>
              ) : (
                <InlineEmpty
                  icon={CheckCircle2}
                  title="Sin señales recientes"
                  description="No se detectaron alertas académicas para este alumno en el resumen actual."
                />
              )}
            </div>
          </SectionPanel>

          {!course ? (
            <EmptyPanel
              icon={Users}
              title="Alumno sin curso asignado"
              description="Asigná el alumno desde la gestión de cursos para empezar a ver asistencia y desempeño por trimestre."
            />
          ) : null}

          {course && !hasGrades ? (
            <EmptyPanel
              icon={NotebookText}
              title="Sin calificaciones en el trimestre actual"
              description="Cuando se registren calificaciones de este trimestre, el promedio y la última nota van a aparecer en este perfil."
            />
          ) : null}
        </TabsContent>

        {hasAttendance ? (
          <TabsContent value="attendance">
            <SectionPanel
              title="Asistencia"
              description="Presentes, ausentes y señales de continuidad para el período seleccionado."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {hasValue(attendance.presentCount) ? (
                  <InlineMetric label="Presentes" value={formatNumber(attendance.presentCount)} />
                ) : null}
                {hasValue(attendance.absentCount) ? (
                  <InlineMetric label="Ausentes" value={formatNumber(attendance.absentCount)} />
                ) : null}
                {hasValue(attendance.totalClasses) ? (
                  <InlineMetric label="Total de clases" value={formatNumber(attendance.totalClasses)} />
                ) : null}
                {hasValue(attendance.attendancePercentage) ? (
                  <InlineMetric
                    label="Asistencia"
                    value={`${formatNumber(attendance.attendancePercentage)}%`}
                    tone={attendanceTone}
                  />
                ) : null}
                {hasValue(attendance.consecutiveAbsences) ? (
                  <InlineMetric
                    label="Ausencias consecutivas"
                    value={formatNumber(attendance.consecutiveAbsences)}
                    detail={
                      attendance.consecutiveAbsences >= 2
                        ? 'Señal inmediata de intervención'
                        : 'Sin racha crítica registrada'
                    }
                    tone={attendance.consecutiveAbsences >= 2 ? 'critical' : 'neutral'}
                  />
                ) : null}
                {hasValue(attendancePercentage) ||
                (attendance.isLowAttendance !== null && attendance.isLowAttendance !== undefined) ? (
                  <InlineMetric
                    label="Indicador de asistencia"
                    value={
                      isLowAttendance
                        ? 'Baja asistencia'
                        : isAttendanceUnderObservation
                          ? 'En observación'
                          : 'En rango'
                    }
                    tone={
                      isLowAttendance
                        ? 'critical'
                        : isAttendanceUnderObservation
                          ? 'attention'
                          : 'healthy'
                    }
                  />
                ) : null}
              </div>
            </SectionPanel>
          </TabsContent>
        ) : null}

        {hasGrades ? (
          <TabsContent value="grades">
            <SectionPanel
              title="Calificaciones"
              description="Promedios y últimas evaluaciones disponibles para el seguimiento académico."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {hasValue(grades.averageGrade) ? (
                  <InlineMetric
                    label="Promedio"
                    value={formatNumber(grades.averageGrade)}
                    tone={gradeTone}
                  />
                ) : null}
                {hasValue(grades.manualAverageGrade) ? (
                  <InlineMetric
                    label="Promedio manual"
                    value={formatNumber(grades.manualAverageGrade)}
                  />
                ) : null}
                {hasValue(grades.lowGradesCount) ? (
                  <InlineMetric
                    label="Calificaciones bajas"
                    value={formatNumber(grades.lowGradesCount)}
                    tone={grades.lowGradesCount > 0 ? 'attention' : 'healthy'}
                  />
                ) : null}
              </div>

              {grades.latestGrade || grades.latestLowGrade ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {grades.latestGrade ? (
                    <GradeLine grade={grades.latestGrade} label="Última calificación" />
                  ) : null}
                  {grades.latestLowGrade ? (
                    <GradeLine grade={grades.latestLowGrade} label="Última calificación baja" />
                  ) : null}
                </div>
              ) : null}
            </SectionPanel>
          </TabsContent>
        ) : null}

        {hasCourses ? (
          <TabsContent value="courses">
            <SectionPanel
              title="Cursos"
              description="Inscripciones actuales asociadas al alumno."
            >
              <div className="space-y-2">
                {summary.currentEnrollments.map((enrollment) => (
                  <CourseRow key={enrollment.courseId} enrollment={enrollment} />
                ))}
              </div>
            </SectionPanel>
          </TabsContent>
        ) : null}

        <TabsContent value="admin">
          <SectionPanel
            title="Datos administrativos"
            description="Información institucional mínima. La edición se conserva en la pantalla administrativa."
            action={
              <Button asChild variant="outline" size="sm" className="h-9 rounded-xl shadow-none active:scale-[0.98]">
                <Link href={`/admin/dashboard/students/${summary.student.id}`}>
                  <Edit3 className="mr-2 size-4" />
                  Editar datos
                </Link>
              </Button>
            }
          >
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border/60 bg-background/60 p-3 dark:bg-background/25">
                <p className="text-muted-foreground">DNI</p>
                <p className="mt-1 font-medium text-foreground">{summary.student.dni}</p>
              </div>
              {phone ? (
                <div className="rounded-xl border border-border/60 bg-background/60 p-3 dark:bg-background/25">
                  <p className="text-muted-foreground">Teléfono</p>
                  <p className="mt-1 flex items-center gap-1.5 font-medium text-foreground">
                    <Phone className="size-4 text-muted-foreground" />
                    {phone}
                  </p>
                </div>
              ) : null}
              {summary.student.email ? (
                <div className="rounded-xl border border-border/60 bg-background/60 p-3 dark:bg-background/25">
                  <p className="text-muted-foreground">Email</p>
                  <p className="mt-1 flex items-center gap-1.5 break-all font-medium text-foreground">
                    <Mail className="size-4 shrink-0 text-muted-foreground" />
                    {summary.student.email}
                  </p>
                </div>
              ) : null}
              <div className="rounded-xl border border-border/60 bg-background/60 p-3 dark:bg-background/25">
                <p className="text-muted-foreground">Estado</p>
                <p className="mt-1 font-medium text-foreground">
                  {summary.student.active ? 'Activo' : 'Inactivo'}
                </p>
              </div>
            </div>
          </SectionPanel>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function StudentAcademicProfile() {
  const params = useParams<{ id: string }>()
  const studentId = useMemo(() => Number(params.id), [params.id])
  const [summary, setSummary] = useState<StudentAcademicSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getStudentAcademicSummary(studentId)
        setSummary(data)
      } catch (err: any) {
        setError(err?.message || 'No se pudo cargar el perfil académico.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [studentId])

  return (
    <>
      <AppHeader title="Perfil académico" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
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
                    <Link href="/admin/dashboard/students">
                      <ArrowLeft className="mr-2 size-4" />
                      Volver al listado
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : summary ? (
            <AcademicProfileContent summary={summary} />
          ) : (
            <EmptyPanel
              icon={UserRound}
              title="Alumno no disponible"
              description="No se encontró información académica para el alumno seleccionado."
            />
          )}
        </div>
      </div>
    </>
  )
}
