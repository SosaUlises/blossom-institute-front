'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Archive,
  ArrowLeft,
  Pencil,
  Plus,
  Sparkles,
  ClipboardList,
  Inbox,
  FileCheck2,
  ChevronDown,
  CalendarRange,
  Users,
  ShieldCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PersonAvatar } from '@/components/teacher/course-detail/course-people-ui'
import { RowActions } from '@/components/ui/row-actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  getTeacherGrades,
  archiveTeacherGrade,
  getTeacherGradeDetail,
} from '@/lib/teacher/grades/api'
import type { GradeDetail, GradeListItem } from '@/lib/teacher/grades/types'
import { getTipoCalificacionLabel } from '@/lib/teacher/grades/utils'
import {
  formatQuarterMonthRange,
  getAttendanceTone,
  getAverageTone,
  getCurrentQuarterSummary,
  getTeacherCourseStudents,
  type AcademicMetricTone,
  type TeacherCourseStudent,
  type StudentQuarterSummary,
} from '@/lib/teacher/course-detail/students'
import { cn } from '@/lib/utils'

type Props = {
  courseId: number
  alumnoId: number
  alumnoNombre?: string
  alumnoApellido?: string
  alumnoAvatarUrl?: string | null
}

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(`${date}T00:00:00`))
  } catch {
    return date
  }
}

function getGradeTone(nota: number) {
  if (!Number.isFinite(nota)) {
    return {
      badge:
        'border-border/60 bg-background/70 text-muted-foreground dark:bg-background/35',
      score:
        'border-border/60 bg-background/70 text-muted-foreground dark:bg-background/35',
      label: 'Sin nota',
    }
  }

  if (nota >= 80) {
    return {
      badge:
        'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      score:
        'border-emerald-500/20 bg-emerald-500/[0.10] text-emerald-700 dark:text-emerald-300',
      label: 'Buen desempeño',
    }
  }

  if (nota >= 60) {
    return {
      badge:
        'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      score:
        'border-amber-500/20 bg-amber-500/[0.10] text-amber-700 dark:text-amber-300',
      label: 'En progreso',
    }
  }

  return {
    badge:
      'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    score:
      'border-rose-500/20 bg-rose-500/[0.10] text-rose-700 dark:text-rose-300',
    label: 'Necesita refuerzo',
  }
}

function normalizeTipoLabel(label: string) {
  return label.trim().toLowerCase()
}

function getGradeTypeVisual(tipoLabel: string) {
  const normalized = normalizeTipoLabel(tipoLabel)

  if (normalized.includes('test')) {
    return {
      icon: FileCheck2,
      badge:
        'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400',
      title: 'Evaluación tipo test',
      description:
        'Instancia de evaluación estructurada con respuestas definidas.',
    }
  }

  if (normalized.includes('quiz')) {
    return {
      icon: ClipboardList,
      badge:
        'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400',
      title: 'Quiz breve',
      description: 'Actividad corta para medir comprensión puntual.',
    }
  }

  if (normalized.includes('particip')) {
    return {
      icon: Users,
      badge:
        'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
      title: 'Participación',
      description: 'Registro del involucramiento y la intervención en clase.',
    }
  }

  if (normalized.includes('comport')) {
    return {
      icon: ShieldCheck,
      badge:
        'border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400',
      title: 'Comportamiento',
      description: 'Observación vinculada a actitud, convivencia y conducta.',
    }
  }

  return {
    icon: Sparkles,
    badge:
      'border-border/60 bg-background/70 text-muted-foreground dark:bg-background/35',
    title: 'Calificación registrada',
    description: 'Registro manual de evaluación para seguimiento académico.',
  }
}

function getSkillLabel(skill: number) {
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
      return 'Habilidad'
  }
}

function isSkillBasedGrade(tipo: number) {
  return tipo === 2 || tipo === 3
}

function getSkillTone(percentage: number) {
  if (percentage >= 80) {
    return {
      label: 'Fortaleza',
      text: 'text-emerald-700 dark:text-emerald-300',
      bar: 'bg-emerald-500',
    }
  }

  if (percentage >= 60) {
    return {
      label: 'En progreso',
      text: 'text-amber-700 dark:text-amber-300',
      bar: 'bg-amber-500',
    }
  }

  return {
    label: 'A reforzar',
    text: 'text-rose-700 dark:text-rose-300',
    bar: 'bg-rose-500',
  }
}

function GradeScore({ nota }: { nota: number }) {
  const tone = getGradeTone(nota)

  return (
    <div className="flex items-center gap-2 sm:justify-end">
      <span
        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tone.badge}`}
      >
        {tone.label}
      </span>
      <span
        className={`inline-flex min-w-14 justify-center rounded-xl border px-3 py-2 text-base font-semibold tracking-tight ${tone.score}`}
      >
        {Number.isFinite(nota) ? nota.toFixed(2) : '-'}
      </span>
    </div>
  )
}

function getAcademicMetricClass(tone: AcademicMetricTone) {
  return cn(
    'inline-flex min-w-14 items-center justify-center rounded-md border px-2 py-1 text-sm font-semibold tabular-nums',
    tone === 'neutral' &&
      'border-border/50 bg-background/55 text-muted-foreground',
    tone === 'healthy' &&
      'border-emerald-500/15 bg-emerald-500/[0.07] text-emerald-700 dark:text-emerald-400',
    tone === 'attention' &&
      'border-amber-500/15 bg-amber-500/[0.08] text-amber-700 dark:text-amber-400',
    tone === 'critical' &&
      'border-rose-500/15 bg-rose-500/[0.08] text-rose-700 dark:text-rose-400',
  )
}

function QuarterJourneyItem({
  summary,
  current,
}: {
  summary: StudentQuarterSummary
  current: boolean
}) {
  const averageTone = getAverageTone(summary.promedio)
  const attendanceTone = getAttendanceTone(summary.asistencia)
  const monthRange = formatQuarterMonthRange(summary)

  return (
    <div
      className={cn(
        'min-w-0 px-3 py-3 sm:px-4',
        current && 'bg-primary/[0.035] dark:bg-primary/[0.06]',
      )}
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {summary.label}
          </h3>
          {current ? (
            <span className="rounded-md border border-primary/15 bg-primary/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-primary">
              Actual
            </span>
          ) : null}
        </div>
        {monthRange ? (
          <p className="text-[11px] text-muted-foreground">{monthRange}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-[11px] font-medium text-muted-foreground">
            Promedio Quiz/Test
          </p>
          <span className={getAcademicMetricClass(averageTone)}>
            {summary.promedio?.toFixed(1) ?? '—'}
          </span>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-medium text-muted-foreground">
            Asistencia
          </p>
          <span className={getAcademicMetricClass(attendanceTone)}>
            {summary.asistencia != null
              ? `${summary.asistencia.toFixed(1)}%`
              : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

function AcademicJourney({
  student,
  loading,
}: {
  student: TeacherCourseStudent | null
  loading: boolean
}) {
  if (loading) {
    return (
      <section className="rounded-xl border border-border/60 bg-background/45 p-3">
        <div className="mb-3 h-5 w-44 animate-pulse rounded-md bg-muted/40" />
        <div className="grid gap-2 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-lg bg-muted/30" />
          ))}
        </div>
      </section>
    )
  }

  if (!student?.promediosTrimestrales?.length) return null

  const currentQuarter = getCurrentQuarterSummary(student.promediosTrimestrales)

  return (
    <section className="overflow-hidden rounded-xl border border-border/60 bg-background/45">
      <div className="flex items-start gap-2.5 border-b border-border/50 px-3 py-3 sm:px-4">
        <CalendarRange className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Recorrido académico
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Promedio de Quiz y Test, y asistencia por trimestre.
          </p>
        </div>
      </div>

      <div className="divide-y divide-border/50 sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {student.promediosTrimestrales.map((summary) => (
          <QuarterJourneyItem
            key={summary.quarter}
            summary={summary}
            current={summary.quarter === currentQuarter?.quarter}
          />
        ))}
      </div>
    </section>
  )
}



function GradeSkillsDetail({
  detalles,
}: {
  detalles: Array<{
    skill: number
    puntajeObtenido: number
    puntajeMaximo: number
  }>
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (!detalles.length) return null

  return (
    <div className="border-t border-border/60 pt-3">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2"
      >
        <div className="flex min-w-0 items-center gap-2">
          <ClipboardList className="size-4 shrink-0 text-muted-foreground" />
          <span>
            {isOpen ? 'Ocultar detalle por habilidades' : 'Ver detalle por habilidades'}
          </span>
        </div>

        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen ? (
        <div className="mt-3 space-y-3 rounded-xl border border-border/60 bg-background/55 p-3 animate-in fade-in-0 slide-in-from-top-1 duration-200 dark:border-border/70 dark:bg-background/25">
          {detalles.map((detalle, index) => {
            const percentage =
              detalle.puntajeMaximo > 0
                ? (detalle.puntajeObtenido / detalle.puntajeMaximo) * 100
                : 0
            const clampedPercentage = Math.min(100, Math.max(0, percentage))
            const tone = getSkillTone(clampedPercentage)

            return (
              <div key={`${detalle.skill}-${index}`} className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                  <span className="font-medium text-foreground">
                    {getSkillLabel(detalle.skill)}
                  </span>
                  <span className={`text-xs font-medium ${tone.text}`}>
                    {detalle.puntajeObtenido} / {detalle.puntajeMaximo} · {tone.label}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted/70">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${tone.bar}`}
                    style={{ width: `${clampedPercentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function GradeCardSkeleton() {
  return (
    <article className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted/35" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted/30" />
          </div>
          <div className="h-5 w-2/3 animate-pulse rounded-lg bg-muted/40" />
          <div className="h-4 w-4/5 animate-pulse rounded-lg bg-muted/30" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-28 animate-pulse rounded-full bg-muted/30" />
          <div className="h-9 w-16 animate-pulse rounded-xl bg-muted/35" />
          <div className="h-9 w-9 animate-pulse rounded-xl bg-muted/30" />
        </div>
      </div>
    </article>
  )
}

function GradeCard({
  grade,
  courseId,
  alumnoId,
  onArchive,
}: {
  grade: GradeListItem
  courseId: number
  alumnoId: number
  onArchive: (gradeId: number) => void
}) {
  const router = useRouter()
  const tipoLabel = getTipoCalificacionLabel(grade.tipo)
  const visual = getGradeTypeVisual(tipoLabel)
  const TipoIcon = visual.icon

  const [detail, setDetail] = useState<GradeDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadDetail() {
      if (!isSkillBasedGrade(grade.tipo)) return

      try {
        setDetailLoading(true)
        const result = await getTeacherGradeDetail(courseId, alumnoId, grade.id)

        if (!cancelled) {
          setDetail(result)
        }
      } catch {
        if (!cancelled) {
          setDetail(null)
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false)
        }
      }
    }

    loadDetail()

    return () => {
      cancelled = true
    }
  }, [courseId, alumnoId, grade.id, grade.tipo])

  return (
    <article className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-colors duration-200 hover:border-primary/25 hover:bg-card focus-within:border-primary/25 dark:border-border/60 dark:hover:border-primary/25">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${visual.badge}`}
              >
                <TipoIcon className="size-3.5" />
                {tipoLabel}
              </span>
              <time>{formatDate(grade.fecha)}</time>
            </div>

            <h3 className="mt-3 text-base font-semibold leading-6 tracking-tight text-foreground sm:text-lg">
              {grade.titulo}
            </h3>

            {grade.descripcion?.trim() ? (
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                {grade.descripcion}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-self-end">
            <GradeScore nota={grade.nota} />

            <RowActions
              actions={[
                {
                  label: 'Editar',
                  icon: Pencil,
                  onClick: () =>
                    router.push(
                      `/teacher/courses/${courseId}/students/${alumnoId}/grades/${grade.id}/edit`,
                    ),
                },
                {
                  label: 'Archivar',
                  icon: Archive,
                  destructive: true,
                  onClick: () => onArchive(grade.id),
                },
              ]}
            />
          </div>
        </div>

        {isSkillBasedGrade(grade.tipo) && (
          <>
            {detailLoading ? (
              <div className="rounded-xl border border-border/60 bg-background/55 p-3 dark:bg-background/25">
                <div className="grid gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="space-y-2"
                    >
                      <div className="h-4 w-full animate-pulse rounded-md bg-muted/35" />
                      <div className="h-2 w-full animate-pulse rounded-full bg-muted/30" />
                    </div>
                  ))}
                </div>
              </div>
            ) : detail?.tieneDetalleSkills && detail.detalles?.length ? (
              <GradeSkillsDetail detalles={detail.detalles} />
            ) : null}
          </>
        )}
      </div>
    </article>
  )
}

export function TeacherStudentGrades({
  courseId,
  alumnoId,
  alumnoNombre,
  alumnoApellido,
  alumnoAvatarUrl,
}: Props) {
  const router = useRouter()

  const [data, setData] = useState<GradeListItem[]>([])
  const [studentContext, setStudentContext] = useState<GradeListItem | null>(null)
  const [academicSummary, setAcademicSummary] =
    useState<TeacherCourseStudent | null>(null)
  const [academicSummaryLoading, setAcademicSummaryLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gradeToArchive, setGradeToArchive] = useState<GradeListItem | null>(null)
  const [archiving, setArchiving] = useState(false)

  const [pageNumber, setPageNumber] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const alumnoContext = useMemo(() => {
    const first = studentContext ?? data[0]

    return {
      nombre: alumnoNombre || academicSummary?.nombre || first?.alumnoNombre || '',
      apellido:
        alumnoApellido || academicSummary?.apellido || first?.alumnoApellido || '',
      avatarUrl:
        alumnoAvatarUrl ??
        academicSummary?.avatarUrl ??
        first?.alumnoAvatarUrl ??
        null,
    }
  }, [
    data,
    studentContext,
    academicSummary,
    alumnoNombre,
    alumnoApellido,
    alumnoAvatarUrl,
  ])

  const alumnoFullName =
    `${alumnoContext.nombre} ${alumnoContext.apellido}`.trim() || 'Alumno'
  const courseName = (studentContext ?? data[0])?.cursoNombre?.trim() || 'Curso actual'
  const visibleGradesLabel =
    data.length === 0
      ? 'Sin calificaciones'
      : `${data.length} ${data.length === 1 ? 'calificación mostrada' : 'calificaciones mostradas'}`
  const pageLabel =
    data.length === 0
      ? 'Sin calificaciones'
      : `Página ${pageNumber} de ${totalPages} · ${data.length} ${
          data.length === 1 ? 'calificación mostrada' : 'calificaciones mostradas'
        }`

  const loadGrades = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await getTeacherGrades(
        courseId,
        alumnoId,
        pageNumber,
        pageSize,
      )

      const rawItems = result.items ?? []
      const filtered = rawItems.filter((item) => item.tipo !== 1)

      setStudentContext(rawItems[0] ?? null)
      setData(filtered)
      setTotal(result.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGrades()
  }, [courseId, alumnoId, pageNumber])

  useEffect(() => {
    let cancelled = false

    async function loadAcademicSummary() {
      try {
        setAcademicSummaryLoading(true)
        const students = await getTeacherCourseStudents(courseId)

        if (!cancelled) {
          setAcademicSummary(
            students.find((student) => student.alumnoId === alumnoId) ?? null,
          )
        }
      } catch {
        if (!cancelled) setAcademicSummary(null)
      } finally {
        if (!cancelled) setAcademicSummaryLoading(false)
      }
    }

    loadAcademicSummary()

    return () => {
      cancelled = true
    }
  }, [courseId, alumnoId])

  const handleArchive = async () => {
    if (!gradeToArchive) return
    try {
      setArchiving(true)
      setError(null)
      await archiveTeacherGrade(courseId, alumnoId, gradeToArchive.id)

      setData((prev) => prev.filter((item) => item.id !== gradeToArchive.id))
      setTotal((prev) => Math.max(0, prev - 1))
      setGradeToArchive(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error.')
    } finally {
      setArchiving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GradeCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <Button
            variant="ghost"
            onClick={() => router.push(`/teacher/courses/${courseId}`)}
            className="-ml-3 h-9 rounded-lg px-3 text-muted-foreground hover:bg-primary/5 hover:text-primary"
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver al curso
          </Button>

          <div className="flex min-w-0 items-center gap-3">
            <PersonAvatar
              name={alumnoFullName}
              avatarUrl={alumnoContext.avatarUrl}
              tone="student"
            />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {alumnoFullName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {courseName} · {visibleGradesLabel}
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() =>
            router.push(
              `/teacher/courses/${courseId}/students/${alumnoId}/grades/create`,
            )
          }
          className="h-10 rounded-xl px-4 shadow-none transition-colors duration-200 sm:shrink-0"
        >
          <Plus className="mr-2 size-4" />
          Crear calificación
        </Button>
      </section>

      <AcademicJourney
        student={academicSummary}
        loading={academicSummaryLoading}
      />

      {data.length === 0 ? (
        <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:border-border/70">
          <CardContent className="px-5 py-6">
            <Empty className="border-0 p-0">
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>Todavía no hay calificaciones</EmptyTitle>
                <EmptyDescription>
                  Todavía no cargaste calificaciones para este alumno.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((grade) => (
            <GradeCard
              key={grade.id}
              grade={grade}
              courseId={courseId}
              alumnoId={alumnoId}
              onArchive={(gradeId) =>
                setGradeToArchive(
                  data.find((item) => item.id === gradeId) ?? null,
                )
              }
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <p className="text-sm text-muted-foreground">{pageLabel}</p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-xl border-border/70 bg-background/70 transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40"
            disabled={pageNumber === 1}
            onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
          >
            Anterior
          </Button>

          <Button
            variant="outline"
            className="h-10 rounded-xl border-border/70 bg-background/70 transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40"
            disabled={pageNumber >= totalPages || total === 0}
            onClick={() => setPageNumber((prev) => prev + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <AlertDialog
        open={gradeToArchive !== null}
        onOpenChange={(open) => {
          if (!open && !archiving) setGradeToArchive(null)
        }}
      >
        <AlertDialogContent className="rounded-2xl border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle>Archivar calificación</AlertDialogTitle>
            <AlertDialogDescription>
              {gradeToArchive
                ? `“${gradeToArchive.titulo}” dejará de aparecer entre las calificaciones activas.`
                : 'La calificación dejará de aparecer como activa.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={archiving}
              onClick={(event) => {
                event.preventDefault()
                void handleArchive()
              }}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {archiving ? 'Archivando...' : 'Archivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
