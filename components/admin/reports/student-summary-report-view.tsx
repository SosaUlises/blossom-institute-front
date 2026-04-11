'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  FileText,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  ClipboardCheck,
  BarChart3,
  Sparkles,
  CalendarRange,
  Filter,
  UserRound,
  Sigma,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCourses } from '@/lib/admin/courses/api'
import { getCursoAlumnos } from '@/lib/admin/courses/people-api'
import {
  getStudentSummaryExportPdfUrl,
  getStudentSummaryReport,
} from '@/lib/admin/reports/api'
import type { CursoListItem } from '@/lib/admin/courses/types'
import type {
  ReporteStudentSummaryResponse,
  ReporteStudentSummarySkillItem,
} from '@/lib/admin/reports/types'
import { cn } from '@/lib/utils'

interface CursoAlumnoOption {
  alumnoId: number
  nombre: string
  apellido: string
  email: string
  dni: number
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
  subvalue,
  icon: Icon,
  accent = 'blue',
  helper,
  highlight = false,
}: {
  title: string
  value: string | number
  subvalue?: string
  icon: React.ComponentType<{ className?: string }>
  accent?: 'blue' | 'emerald' | 'violet' | 'amber'
  helper?: string
  highlight?: boolean
}) {
  const accentStyles =
    accent === 'emerald'
      ? {
          card: highlight
            ? 'border-emerald-500/15 bg-emerald-500/[0.06]'
            : 'border-emerald-500/10 bg-emerald-500/[0.04]',
          icon: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
          label: 'text-emerald-700/80 dark:text-emerald-400/90',
        }
      : accent === 'violet'
        ? {
            card: highlight
              ? 'border-violet-500/15 bg-violet-500/[0.06]'
              : 'border-violet-500/10 bg-violet-500/[0.04]',
            icon: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
            label: 'text-violet-700/80 dark:text-violet-400/90',
          }
        : accent === 'amber'
          ? {
              card: highlight
                ? 'border-amber-500/15 bg-amber-500/[0.06]'
                : 'border-amber-500/10 bg-amber-500/[0.04]',
              icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
              label: 'text-amber-700/80 dark:text-amber-400/90',
            }
          : {
              card: highlight
                ? 'border-blue-600/15 bg-blue-600/[0.06]'
                : 'border-blue-600/10 bg-blue-600/[0.04]',
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
          <p className="mt-3 text-lg font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {subvalue ? (
            <p className="mt-1 text-sm text-muted-foreground">{subvalue}</p>
          ) : null}
          {helper ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{helper}</p>
          ) : null}
        </div>

        <div className={cn('flex size-11 items-center justify-center rounded-2xl', accentStyles.icon)}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}

function getMetricRowTone(label: string, rawValue: string | number, tone: 'default' | 'emerald' | 'violet' | 'amber') {
  const normalized = label.toLowerCase()
  const numericValue =
    typeof rawValue === 'number'
      ? rawValue
      : Number(String(rawValue).replace('%', '').replace(',', '.'))

  const isNumeric = !Number.isNaN(numericValue)

  if (normalized.includes('% asistencia') || normalized.includes('promedio')) {
    if (!isNumeric) return 'border-border/60 bg-background/70 text-foreground'
    if (numericValue >= 80) return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    if (numericValue >= 60) return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
    return 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400'
  }

  if (normalized.includes('ausentes') || normalized.includes('sin entregar')) {
    if (!isNumeric) return 'border-border/60 bg-background/70 text-foreground'
    if (numericValue === 0) return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    if (numericValue <= 2) return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
    return 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400'
  }

  if (normalized.includes('pend. corrección')) {
    if (!isNumeric) return 'border-border/60 bg-background/70 text-foreground'
    if (numericValue === 0) return 'border-emerald-500/15 bg-emerald-500/[0.07] text-emerald-700 dark:text-emerald-400'
    return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
  }

  if (
    normalized.includes('presentes') ||
    normalized.includes('entregadas') ||
    normalized.includes('aprobadas')
  ) {
    return 'border-emerald-500/15 bg-emerald-500/[0.07] text-emerald-700 dark:text-emerald-400'
  }

  if (normalized.includes('rehacer')) {
    return 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400'
  }

  if (tone === 'emerald') {
    return 'border-emerald-500/10 bg-emerald-500/[0.05] text-foreground'
  }

  if (tone === 'violet') {
    return 'border-violet-500/10 bg-violet-500/[0.05] text-foreground'
  }

  if (tone === 'amber') {
    return 'border-amber-500/10 bg-amber-500/[0.05] text-foreground'
  }

  return 'border-border/60 bg-background/70 text-foreground'
}

function MetricCard({
  title,
  icon: Icon,
  items,
  tone = 'default',
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: { label: string; value: string | number }[]
  tone?: 'default' | 'emerald' | 'violet' | 'amber'
}) {
  const toneClasses =
    tone === 'emerald'
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
      : tone === 'violet'
        ? 'bg-violet-500/10 text-violet-700 dark:text-violet-400'
        : tone === 'amber'
          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
          : 'bg-primary/10 text-primary'

  return (
    <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
      <div className="px-6 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div className={cn('flex size-11 items-center justify-center rounded-2xl', toneClasses)}>
            <Icon className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h3>
          </div>
        </div>
      </div>

      <CardContent className="space-y-3 pt-0">
        {items.map((item) => {
          const rowTone = getMetricRowTone(item.label, item.value, tone)

          return (
            <div
              key={item.label}
              className={cn(
                'flex items-center justify-between rounded-2xl border px-4 py-3 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md',
                rowTone,
              )}
            >
              <span className="text-sm">{item.label}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
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
          {helper ? (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>
          ) : null}
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

export function StudentSummaryReportView() {
  const [courses, setCourses] = useState<CursoListItem[]>([])
  const [students, setStudents] = useState<CursoAlumnoOption[]>([])

  const [cursoId, setCursoId] = useState('')
  const [alumnoId, setAlumnoId] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [term, setTerm] = useState('1')

  const [loadingSources, setLoadingSources] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingReport, setLoadingReport] = useState(false)
  const [report, setReport] = useState<ReporteStudentSummaryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await getCourses({ pageNumber: 1, pageSize: 100 })
        setCourses(coursesData.items)
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

  const selectedCourseName =
    courses.find((course) => String(course.id) === cursoId)?.nombre ?? 'Sin curso seleccionado'

  const selectedStudent = students.find((student) => String(student.alumnoId) === alumnoId)

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

    try {
      if (!cursoId) throw new Error('Seleccioná un curso.')
      if (!alumnoId) throw new Error('Seleccioná un alumno.')
      if (!year.trim()) throw new Error('Ingresá un año.')
      if (!term.trim()) throw new Error('Seleccioná un trimestre.')

      const data = await getStudentSummaryReport({
        cursoId: Number(cursoId),
        alumnoId: Number(alumnoId),
        year: Number(year),
        term: Number(term),
      })

      setReport(data)
    } catch (err: any) {
      const message = err?.message || ''

      if (message.includes('Status: 404')) {
        setError('No existe resumen para ese alumno en el curso y período seleccionados.')
      } else {
        setError(message || 'No se pudo cargar el reporte.')
      }

      setReport(null)
    } finally {
      setLoadingReport(false)
    }
  }

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
              Resumen del alumno
            </h2>

            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
              Consultá el resumen académico completo de un alumno por curso y trimestre desde una vista consolidada.
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
              Seleccioná curso, alumno, año y trimestre para generar el resumen académico consolidado.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
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
                  {loadingReport ? (
                    'Cargando...'
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" />
                      Generar reporte
                    </>
                  )}
                </Button>

                {report && cursoId && alumnoId && (
                  <a
                    href={getStudentSummaryExportPdfUrl({
                      cursoId: Number(cursoId),
                      alumnoId: Number(alumnoId),
                      year: Number(year),
                      term: Number(term),
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
                Identificación del alumno
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Alumno"
                value={`${report.alumnoNombre} ${report.alumnoApellido}`}
                subvalue={report.alumnoEmail ?? '-'}
                icon={GraduationCap}
                accent="blue"
              />
              <SummaryCard
                title="DNI"
                value={report.alumnoDni}
                icon={Sparkles}
                accent="amber"
              />
              <SummaryCard
                title="Curso"
                value={report.cursoNombre}
                subvalue={`${report.year}`}
                icon={BookOpen}
                accent="violet"
              />
              <SummaryCard
                title="Período"
                value={`Trimestre ${report.term}`}
                subvalue={`${report.from} → ${report.to}`}
                icon={CalendarRange}
                accent="emerald"
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Desempeño consolidado
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                Métricas académicas
              </h3>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <MetricCard
                title="Asistencia"
                icon={CalendarCheck2}
                tone="emerald"
                items={[
                  { label: 'Clases totales', value: report.attendance.clasesTotales },
                  { label: 'Presentes', value: report.attendance.presentes },
                  { label: 'Ausentes', value: report.attendance.ausentes },
                  {
                    label: '% Asistencia',
                    value: `${report.attendance.porcentajeAsistencia.toFixed(2)}%`,
                  },
                ]}
              />

              <MetricCard
                title="Homework"
                icon={ClipboardCheck}
                tone="amber"
                items={[
                  { label: 'Total', value: report.homework.homeworkTotal },
                  { label: 'Entregadas', value: report.homework.homeworkEntregadas },
                  { label: 'Sin entregar', value: report.homework.homeworkSinEntregar },
                  {
                    label: 'Pend. corrección',
                    value: report.homework.homeworkPendientesCorreccion,
                  },
                  { label: 'Rehacer', value: report.homework.homeworkRehacer },
                  { label: 'Aprobadas', value: report.homework.homeworkAprobadas },
                  {
                    label: 'Promedio',
                    value: report.homework.homeworkPromedio?.toFixed(2) ?? '-',
                  },
                ]}
              />

              <MetricCard
                title="Calificaciones"
                icon={BarChart3}
                tone="violet"
                items={[
                  { label: 'Cantidad de quizzes', value: report.marks.quizCount },
                  {
                    label: 'Promedio quizzes',
                    value: report.marks.quizPromedio?.toFixed(2) ?? '-',
                  },
                  { label: 'Cantidad de tests', value: report.marks.testCount },
                  {
                    label: 'Promedio tests',
                    value: report.marks.testPromedio?.toFixed(2) ?? '-',
                  },
                  { label: 'Total de calificaciones', value: report.marks.marksCount },
                  {
                    label: 'Promedio general',
                    value: report.marks.promedioGeneral?.toFixed(2) ?? '-',
                  },
                ]}
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
  <div className="border-b border-border/60 px-6 py-5">
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Skills
      </p>
      <h3 className="text-xl font-semibold tracking-tight text-foreground">
        Desglose por habilidad
      </h3>
      <p className="text-sm leading-6 text-muted-foreground">
        Resultado acumulado por skill para el período seleccionado.
      </p>
    </div>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full min-w-[820px] text-sm">
      <thead className="border-b border-border/60 bg-muted/20">
        <tr className="text-left">
          <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Skill
          </th>
          <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Evaluaciones
          </th>
          <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Obtenido
          </th>
          <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Máximo
          </th>
          <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Porcentaje
          </th>
        </tr>
      </thead>

      <tbody>
        {report.skills.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-6 py-14 text-center text-sm text-muted-foreground">
              No hay skills para mostrar.
            </td>
          </tr>
        ) : (
          report.skills.map((skill: ReporteStudentSummarySkillItem, index: number) => {
            const percentageTone =
              skill.porcentaje != null && skill.porcentaje >= 80
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : skill.porcentaje != null && skill.porcentaje >= 60
                  ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  : 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400'

            return (
              <tr
                key={`${skill.skill}-${index}`}
                className="border-b border-border/40 transition-colors duration-200 hover:bg-muted/15 last:border-0"
              >
                <td className="px-6 py-5">
                  <div className="inline-flex items-center rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-sm font-semibold text-foreground shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
                    {getSkillLabel(skill.skill)}
                  </div>
                </td>

                <td className="px-6 py-5 text-muted-foreground tabular-nums">
                  {skill.evaluacionesCount}
                </td>

                <td className="px-6 py-5 text-muted-foreground tabular-nums">
                  {skill.totalObtenido}
                </td>

                <td className="px-6 py-5 text-muted-foreground tabular-nums">
                  {skill.totalMaximo}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={cn(
                      'inline-flex min-w-[92px] justify-center rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]',
                      percentageTone,
                    )}
                  >
                    {skill.porcentaje?.toFixed(2) ?? '-'}%
                  </span>
                </td>
              </tr>
            )
          })
        )}
      </tbody>
    </table>
  </div>
</section>
        </>
      )}
    </div>
  )
}