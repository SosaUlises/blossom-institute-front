'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  FileText,
  BookOpen,
  CircleHelp,
  ClipboardCheck,
  HandHelping,
  ShieldAlert,
  GraduationCap,
  ListChecks,
  Sparkles,
  CalendarRange,
  Filter,
  UserRound,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCourses } from '@/lib/admin/courses/api'
import { getCursoAlumnos } from '@/lib/admin/courses/people-api'
import {
  getStudentAssessmentDetailExportPdfUrl,
  getStudentAssessmentDetailReport,
} from '@/lib/admin/reports/api'
import type { CursoListItem } from '@/lib/admin/courses/types'
import type {
  ReporteStudentAssessmentDetailItem,
  ReporteStudentAssessmentDetailResponse,
} from '@/lib/admin/reports/types'
import { cn } from '@/lib/utils'

interface CursoAlumnoOption {
  alumnoId: number
  nombre: string
  apellido: string
  email: string
  dni: number
}

function getTipoCardClass(tipo: number) {
  switch (tipo) {
    case 1:
      return 'border-blue-200/60 bg-[linear-gradient(180deg,rgba(59,88,170,0.05)_0%,rgba(255,255,255,0)_100%)] dark:border-blue-900/40 dark:bg-[linear-gradient(180deg,rgba(59,88,170,0.10)_0%,rgba(255,255,255,0)_100%)]'
    case 2:
      return 'border-violet-200/60 bg-[linear-gradient(180deg,rgba(139,92,246,0.05)_0%,rgba(255,255,255,0)_100%)] dark:border-violet-900/40 dark:bg-[linear-gradient(180deg,rgba(139,92,246,0.10)_0%,rgba(255,255,255,0)_100%)]'
    case 3:
      return 'border-emerald-200/60 bg-[linear-gradient(180deg,rgba(16,185,129,0.05)_0%,rgba(255,255,255,0)_100%)] dark:border-emerald-900/40 dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.10)_0%,rgba(255,255,255,0)_100%)]'
    case 4:
      return 'border-amber-200/60 bg-[linear-gradient(180deg,rgba(245,158,11,0.05)_0%,rgba(255,255,255,0)_100%)] dark:border-amber-900/40 dark:bg-[linear-gradient(180deg,rgba(245,158,11,0.10)_0%,rgba(255,255,255,0)_100%)]'
    case 5:
      return 'border-rose-200/60 bg-[linear-gradient(180deg,rgba(244,63,94,0.05)_0%,rgba(255,255,255,0)_100%)] dark:border-rose-900/40 dark:bg-[linear-gradient(180deg,rgba(244,63,94,0.10)_0%,rgba(255,255,255,0)_100%)]'
    default:
      return 'border-border/60 bg-card/95'
  }
}

function getTipoAccentClass(tipo: number) {
  switch (tipo) {
    case 1:
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    case 2:
      return 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
    case 3:
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    case 4:
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
    case 5:
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
  }
}

function getTipoIcon(tipo: number) {
  switch (tipo) {
    case 1:
      return BookOpen
    case 2:
      return CircleHelp
    case 3:
      return ClipboardCheck
    case 4:
      return HandHelping
    case 5:
      return ShieldAlert
    default:
      return FileText
  }
}

function getTipoLabel(tipo: number) {
  switch (tipo) {
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
      return `Tipo ${tipo}`
  }
}

function getTipoBadgeClass(tipo: number) {
  switch (tipo) {
    case 1:
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    case 2:
      return 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
    case 3:
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    case 4:
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
    case 5:
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
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
      return `Skill ${skill}`
  }
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  accent = 'blue',
  subvalue,
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  accent?: 'blue' | 'emerald' | 'violet' | 'amber'
  subvalue?: string
}) {
  const accentStyles =
    accent === 'emerald'
      ? {
          card: 'border-emerald-500/10 bg-emerald-500/[0.04]',
          icon: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
          label: 'text-emerald-700/80 dark:text-emerald-400/90',
        }
      : accent === 'violet'
        ? {
            card: 'border-violet-500/10 bg-violet-500/[0.04]',
            icon: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
            label: 'text-violet-700/80 dark:text-violet-400/90',
          }
        : accent === 'amber'
          ? {
              card: 'border-amber-500/10 bg-amber-500/[0.04]',
              icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
              label: 'text-amber-700/80 dark:text-amber-400/90',
            }
          : {
              card: 'border-blue-600/10 bg-blue-600/[0.04]',
              icon: 'bg-blue-600/10 text-blue-700 dark:text-blue-400',
              label: 'text-blue-700/80 dark:text-blue-400/90',
            }

  return (
    <div
      className={cn(
        'rounded-[24px] border p-5 shadow-[0_14px_34px_-22px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_18px_38px_-24px_rgba(15,23,42,0.18)]',
        accentStyles.card,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={cn('text-[11px] font-semibold uppercase tracking-[0.16em]', accentStyles.label)}>
            {title}
          </p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {subvalue ? <p className="mt-1 text-sm text-muted-foreground">{subvalue}</p> : null}
        </div>

        <div className={cn('flex size-11 items-center justify-center rounded-2xl', accentStyles.icon)}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}

function ReportMetaCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  helper?: string
  tone?: 'default' | 'highlight'
}) {
  return (
    <div
      className={cn(
        'rounded-[24px] border p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md',
        tone === 'highlight'
          ? 'border-primary/15 bg-primary/5'
          : 'border-border/60 bg-background/75',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-2xl',
            tone === 'highlight'
              ? 'bg-primary/10 text-primary'
              : 'bg-background text-muted-foreground',
          )}
        >
          <Icon className="size-4.5" />
        </div>

        <div className="min-w-0">
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.14em]',
              tone === 'highlight' ? 'text-primary/80' : 'text-muted-foreground',
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              'mt-2 text-sm font-semibold leading-6',
              tone === 'highlight' ? 'text-primary' : 'text-foreground',
            )}
          >
            {value}
          </p>
          {helper ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p> : null}
        </div>
      </div>
    </div>
  )
}

function FilterField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2.5">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {children}
    </div>
  )
}

function getSkillPercentageTone(value?: number | null) {
  if (value == null) {
    return 'border-border/60 bg-background/70 text-foreground'
  }

  if (value >= 80) {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
  }

  if (value >= 60) {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
  }

  return 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400'
}

function getGradeTone(value?: number | null) {
  if (value == null) {
    return 'border-border/60 bg-background/70 text-foreground'
  }

  if (value >= 80) {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
  }

  if (value >= 60) {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
  }

  return 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400'
}

function ItemCard({
  item,
  expanded,
  onToggle,
}: {
  item: ReporteStudentAssessmentDetailItem
  expanded: boolean
  onToggle: () => void
}) {
  const TipoIcon = getTipoIcon(item.tipo)

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[24px] border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-22px_rgba(15,23,42,0.18)]',
        getTipoCardClass(item.tipo),
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
      >
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                getTipoBadgeClass(item.tipo),
              )}
            >
              {getTipoLabel(item.tipo)}
            </span>

            <span className="text-xs text-muted-foreground">
              {new Date(item.fecha).toLocaleDateString()}
            </span>

            {item.tipo === 1 && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">Desde homework</span>
              </>
            )}
          </div>

          <div className="flex items-start gap-3">
            <div
              className={cn(
                'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl',
                getTipoAccentClass(item.tipo),
              )}
            >
              <TipoIcon className="size-5" />
            </div>

            <div className="min-w-0 space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                {item.titulo}
              </h3>

              {item.descripcion ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.descripcion}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Nota
            </p>
            <span
              className={cn(
                'mt-1 inline-flex rounded-full border px-3 py-1 text-sm font-semibold',
                getGradeTone(item.nota),
              )}
            >
              {item.nota}
            </span>
          </div>

          <div className="mt-1 text-muted-foreground">
            {expanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/50 bg-background/55 px-5 pb-5 pt-4">
          {item.skills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
              Esta calificación no tiene detalle de skills.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/60 bg-background/75">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="border-b border-border/60 bg-muted/20">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Skill</th>
                    <th className="px-4 py-3 font-medium">Obtenido</th>
                    <th className="px-4 py-3 font-medium">Máximo</th>
                    <th className="px-4 py-3 font-medium">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {item.skills.map((skill, index) => (
                    <tr
                      key={`${skill.skill}-${index}`}
                      className="border-b border-border/40 transition-colors duration-200 hover:bg-muted/10 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {getSkillLabel(skill.skill)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {skill.puntajeObtenido}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {skill.puntajeMaximo}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex min-w-[92px] justify-center rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums',
                            getSkillPercentageTone(skill.porcentaje),
                          )}
                        >
                          {skill.porcentaje?.toFixed(2) ?? '-'}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function StudentAssessmentsDetailReportView() {
  const [courses, setCourses] = useState<CursoListItem[]>([])
  const [students, setStudents] = useState<CursoAlumnoOption[]>([])

  const [cursoId, setCursoId] = useState('')
  const [alumnoId, setAlumnoId] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [term, setTerm] = useState('1')
  const [tipo, setTipo] = useState('')

  const [loadingSources, setLoadingSources] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingReport, setLoadingReport] = useState(false)
  const [report, setReport] = useState<ReporteStudentAssessmentDetailResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<number[]>([])

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses({ pageNumber: 1, pageSize: 100 })
        setCourses(data.items)
      } finally {
        setLoadingSources(false)
      }
    }

    loadCourses()
  }, [])

  useEffect(() => {
    const loadStudentsByCourse = async () => {
      if (!cursoId) {
        setStudents([])
        setAlumnoId('')
        return
      }

      setLoadingStudents(true)
      setAlumnoId('')
      setStudents([])

      try {
        const data = await getCursoAlumnos(Number(cursoId))
        setStudents(data.items ?? [])
      } catch {
        setStudents([])
      } finally {
        setLoadingStudents(false)
      }
    }

    loadStudentsByCourse()
  }, [cursoId])

  const selectedStudent = useMemo(
    () => students.find((x) => x.alumnoId === Number(alumnoId)) ?? null,
    [students, alumnoId]
  )

  const selectedCourseName =
    courses.find((course) => String(course.id) === cursoId)?.nombre ?? 'Sin curso seleccionado'

  const selectedStudentName = selectedStudent
    ? `${selectedStudent.nombre} ${selectedStudent.apellido}`
    : 'Sin alumno seleccionado'

  const termLabel = useMemo(() => {
    if (term === '1') return 'Trimestre 1'
    if (term === '2') return 'Trimestre 2'
    return 'Trimestre 3'
  }, [term])

  const handleLoad = async () => {
    setError(null)
    setLoadingReport(true)
    setExpandedIds([])

    try {
      if (!cursoId) throw new Error('Seleccioná un curso.')
      if (!alumnoId) throw new Error('Seleccioná un alumno.')
      if (!year.trim()) throw new Error('Ingresá un año.')
      if (!term.trim()) throw new Error('Seleccioná un trimestre.')

      const data = await getStudentAssessmentDetailReport({
        cursoId: Number(cursoId),
        alumnoId: Number(alumnoId),
        year: Number(year),
        term: Number(term),
        tipo: tipo !== '' ? Number(tipo) : undefined,
      })

      setReport(data)
    } catch (err: any) {
      const message = err?.message || ''

      if (message.includes('Status: 404')) {
        setError('No existe detalle de evaluaciones para el alumno en el curso y período seleccionados.')
      } else {
        setError(message || 'No se pudo cargar el reporte.')
      }

      setReport(null)
    } finally {
      setLoadingReport(false)
    }
  }

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const totalWithSkills =
    report?.items.filter((x) => x.skills.length > 0).length ?? 0

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 px-6 py-7 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:px-7 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.05),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(72,99,180,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.08),transparent_26%)]" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 h-[3px] w-12 rounded-full bg-primary" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              Centro de reportes
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.45rem]">
              Detalle de evaluaciones del alumno
            </h2>

            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
              Consultá el detalle cronológico de evaluaciones por alumno, incluyendo homework, quiz, test y skills por calificación.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[440px]">
            <ReportMetaCard
              icon={UserRound}
              label="Alumno"
              value={selectedStudentName}
              helper="Se actualiza según la selección."
              tone="highlight"
            />
            <ReportMetaCard
              icon={CalendarRange}
              label="Período"
              value={`${year || '—'} · ${termLabel}`}
              helper="Año y trimestre del reporte."
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
        <div className="flex flex-col gap-6">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Configuración
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Generar reporte
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Seleccioná curso, alumno, año, trimestre y tipo para generar el detalle cronológico de evaluaciones.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <FilterField label="Curso">
                <select
                  value={cursoId}
                  onChange={(e) => setCursoId(e.target.value)}
                  disabled={loadingSources}
                  className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
                >
                  <option value="">Seleccionar curso</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.nombre}
                    </option>
                  ))}
                </select>
              </FilterField>

              <FilterField label="Alumno">
                <select
                  value={alumnoId}
                  onChange={(e) => setAlumnoId(e.target.value)}
                  disabled={!cursoId || loadingStudents}
                  className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
                >
                  <option value="">
                    {!cursoId
                      ? 'Primero seleccioná un curso'
                      : loadingStudents
                        ? 'Cargando alumnos...'
                        : 'Seleccionar alumno'}
                  </option>

                  {students.map((student) => (
                    <option key={student.alumnoId} value={student.alumnoId}>
                      {student.nombre} {student.apellido}
                    </option>
                  ))}
                </select>
              </FilterField>

              <FilterField label="Año">
                <Input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                  className="h-11 rounded-2xl border-border/70 bg-card/85 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                />
              </FilterField>

              <FilterField label="Trimestre">
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
                >
                  <option value="1">Trimestre 1</option>
                  <option value="2">Trimestre 2</option>
                  <option value="3">Trimestre 3</option>
                </select>
              </FilterField>

              <FilterField label="Tipo">
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
                >
                  <option value="">Todos</option>
                  <option value="1">Homework</option>
                  <option value="2">Quiz</option>
                  <option value="3">Test</option>
                  <option value="4">Participación</option>
                  <option value="5">Comportamiento</option>
                </select>
              </FilterField>
            </div>

            <div className="rounded-[24px] border border-primary/15 bg-primary/5 p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Filter className="size-4.5" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                    Acción disponible
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primary">
                    Generar y exportar reporte
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleLoad}
                  disabled={loadingReport}
                  className="h-11 w-full rounded-2xl bg-primary px-5 text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
                >
                  {loadingReport ? 'Cargando...' : 'Generar reporte'}
                </Button>

                {report && cursoId && alumnoId && (
                  <a
                    href={getStudentAssessmentDetailExportPdfUrl({
                      cursoId: Number(cursoId),
                      alumnoId: Number(alumnoId),
                      year: Number(year),
                      term: Number(term),
                      tipo: tipo !== '' ? Number(tipo) : undefined,
                    })}
                  >
                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-2xl border-border/70 bg-background/75 text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card hover:text-foreground hover:shadow-md"
                    >
                      <FileText className="mr-2 size-4" />
                      Exportar PDF
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </section>

      {report && (
        <>
          <section className="space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Resumen ejecutivo
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                Contexto del reporte
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Alumno"
                value={`${report.alumnoNombre} ${report.alumnoApellido}`}
                subvalue={selectedStudent?.email ?? report.alumnoEmail ?? '-'}
                icon={GraduationCap}
                accent="blue"
              />
              <SummaryCard
                title="Curso"
                value={report.cursoNombre}
                subvalue={`Trimestre ${report.term} · ${report.year}`}
                icon={BookOpen}
                accent="violet"
              />
              <SummaryCard
                title="Total evaluaciones"
                value={report.total}
                icon={ListChecks}
                accent="emerald"
              />
              <SummaryCard
                title="Con skills"
                value={totalWithSkills}
                icon={Sparkles}
                accent="amber"
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
            <div className="border-b border-border/60 px-6 py-5">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Historial
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Evaluaciones cronológicas
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Expandí cada evaluación para ver el detalle de skills y su composición interna.
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6">
              {report.items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                  No hay evaluaciones para mostrar en ese filtro.
                </div>
              ) : (
                report.items.map((item) => (
                  <ItemCard
                    key={item.calificacionId}
                    item={item}
                    expanded={expandedIds.includes(item.calificacionId)}
                    onToggle={() => toggleExpanded(item.calificacionId)}
                  />
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}