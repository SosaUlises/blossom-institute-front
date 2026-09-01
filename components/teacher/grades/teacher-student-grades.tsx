'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Archive,
  Pencil,
  Plus,
  Sparkles,
  ClipboardList,
  Inbox,
  FileCheck2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  Users,
  ShieldCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
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
    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
      <span
        className={`inline-flex min-w-16 justify-center rounded-xl border px-3 py-2 text-lg font-semibold tracking-tight ${tone.score}`}
      >
        {Number.isFinite(nota) ? nota.toFixed(1) : '-'}
      </span>
      <span
        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tone.badge}`}
      >
        {tone.label}
      </span>
    </div>
  )
}

function getAcademicMetricClass(tone: AcademicMetricTone) {
  return cn(
    'inline-flex min-w-12 items-center justify-center rounded-lg border px-2 py-1 text-sm font-semibold tabular-nums',
    (tone === 'neutral' || tone === 'healthy') &&
      'border-border/55 bg-background/65 text-foreground dark:bg-background/35',
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
    <article
      className={cn(
        'min-w-0 rounded-xl border border-border/55 bg-background/60 px-3 py-3 dark:bg-background/30',
        current &&
          'border-primary/25 bg-primary/[0.045] dark:bg-primary/[0.075]',
      )}
    >
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
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
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {monthRange}
            </p>
          ) : null}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <dt className="mb-1 text-[11px] font-medium text-muted-foreground">
            Promedio
          </dt>
          <span className={getAcademicMetricClass(averageTone)}>
            {summary.promedio?.toFixed(1) ?? '—'}
          </span>
        </div>
        <div className="min-w-0">
          <dt className="mb-1 text-[11px] font-medium text-muted-foreground">
            Asistencia
          </dt>
          <span className={getAcademicMetricClass(attendanceTone)}>
            {summary.asistencia != null
              ? `${summary.asistencia.toFixed(1)}%`
              : '—'}
          </span>
        </div>
      </dl>
    </article>
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
      <section className="rounded-2xl border border-border/60 bg-card/95 p-3.5 shadow-sm dark:bg-card/90 sm:p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="size-8 animate-pulse rounded-xl bg-muted/40" />
          <div>
            <div className="mb-1.5 h-4 w-40 animate-pulse rounded-md bg-muted/40" />
            <div className="h-3 w-56 animate-pulse rounded-md bg-muted/30" />
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-xl bg-muted/30" />
          ))}
        </div>
      </section>
    )
  }

  if (!student?.promediosTrimestrales?.length) return null

  const currentQuarter = getCurrentQuarterSummary(student.promediosTrimestrales)

  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 p-3.5 shadow-sm dark:bg-card/90 sm:p-4">
      <div className="mb-3 flex items-start gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border/55 bg-background/65 text-muted-foreground">
          <CalendarRange className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Recorrido académico
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Promedio Quiz/Test y asistencia por trimestre.
          </p>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
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
    <div className="rounded-xl border border-border/55 bg-background/45 p-2.5 dark:bg-background/25">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex w-full items-center justify-between gap-3 rounded-lg px-1.5 py-1 text-left transition-colors duration-200 hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-card/80 text-muted-foreground">
            <ClipboardList className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Habilidades evaluadas
            </p>
            <p className="text-xs text-muted-foreground">
              {detalles.length} {detalles.length === 1 ? 'área' : 'áreas'} con detalle
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">
          {isOpen ? 'Ocultar' : 'Ver detalle'}
          <ChevronDown
            className={cn(
              'size-4 transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        </span>
      </button>

      {isOpen ? (
        <div className="mt-2 space-y-2 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {detalles.map((detalle, index) => {
            const percentage =
              detalle.puntajeMaximo > 0
                ? (detalle.puntajeObtenido / detalle.puntajeMaximo) * 100
                : 0
            const clampedPercentage = Math.min(100, Math.max(0, percentage))
            const tone = getSkillTone(clampedPercentage)

            return (
              <div
                key={`${detalle.skill}-${index}`}
                className="space-y-1.5 rounded-lg bg-card/65 px-3 py-2 dark:bg-card/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                  <span className="font-medium text-foreground">
                    {getSkillLabel(detalle.skill)}
                  </span>
                  <span className={`text-xs font-medium ${tone.text}`}>
                    {detalle.puntajeObtenido} / {detalle.puntajeMaximo} · {tone.label}
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-muted/70">
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

function TeacherStudentGradesSkeleton() {
  return (
    <div aria-busy="true" className="space-y-5">
      <p className="sr-only">Cargando seguimiento del alumno.</p>

      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="size-10 animate-pulse rounded-full bg-muted/40" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-5 w-44 animate-pulse rounded-lg bg-muted/45" />
              <div className="h-4 w-56 max-w-full animate-pulse rounded-lg bg-muted/30" />
            </div>
          </div>
          <div className="h-10 w-full animate-pulse rounded-xl bg-muted/35 sm:w-40" />
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/95 p-3.5 shadow-sm dark:bg-card/90 sm:p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="size-8 animate-pulse rounded-xl bg-muted/40" />
          <div>
            <div className="mb-1.5 h-4 w-40 animate-pulse rounded-md bg-muted/40" />
            <div className="h-3 w-56 animate-pulse rounded-md bg-muted/30" />
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-xl bg-muted/30" />
          ))}
        </div>
      </section>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GradeCardSkeleton key={i} />
        ))}
      </div>
    </div>
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
    <article className="rounded-2xl border border-border/60 bg-card/95 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] transition-colors duration-200 hover:border-primary/25 hover:bg-card focus-within:border-primary/25 dark:bg-card/90 sm:p-4">
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${visual.badge}`}
              >
                <TipoIcon className="size-3.5" />
                {tipoLabel}
              </span>
              <time>{formatDate(grade.fecha)}</time>
            </div>

            <h3 className="text-base font-semibold leading-6 tracking-tight text-foreground sm:text-lg">
              {grade.titulo}
            </h3>

            {grade.descripcion?.trim() ? (
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {grade.descripcion}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-start gap-2 sm:justify-self-end">
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
  const hasPagination = total > pageSize
  const firstVisibleItem = total === 0 ? 0 : (pageNumber - 1) * pageSize + 1
  const lastVisibleItem = Math.min(pageNumber * pageSize, total)
  const paginationLabel = `Mostrando ${firstVisibleItem}-${lastVisibleItem} de ${total}`

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
    return <TeacherStudentGradesSkeleton />
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
      >
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
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
        </div>
      </section>

      <AcademicJourney
        student={academicSummary}
        loading={academicSummaryLoading}
      />

      {data.length === 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-border/60 bg-background/35 px-4 py-4">
          <Inbox className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              Todavía no hay calificaciones
            </p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Cuando cargues una calificación, va a aparecer en el seguimiento de este alumno.
            </p>
          </div>
        </div>
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

      {hasPagination ? (
        <nav
          aria-label="Paginación de calificaciones"
          className="flex flex-col gap-2 rounded-xl border border-border/55 bg-background/35 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-xs font-medium text-muted-foreground">
            {paginationLabel}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-9 rounded-xl border-border/65 bg-card/70 px-3 text-xs transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40"
              disabled={pageNumber === 1}
              onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="mr-1 size-3.5" />
              Anterior
            </Button>

            <Button
              variant="outline"
              className="h-9 rounded-xl border-border/65 bg-card/70 px-3 text-xs transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40"
              disabled={pageNumber >= totalPages || total === 0}
              onClick={() => setPageNumber((prev) => prev + 1)}
            >
              Siguiente
              <ChevronRight className="ml-1 size-3.5" />
            </Button>
          </div>
        </nav>
      ) : null}

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
