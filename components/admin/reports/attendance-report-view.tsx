'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  FileText,
  Search,
  CalendarCheck2,
  Users,
  BookOpen,
  CheckCircle2,
  Percent,
  CalendarRange,
  Filter,
  Sparkles,
  FileSpreadsheet,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCourses } from '@/lib/admin/courses/api'
import {
  getAttendanceExportExcelUrl,
  getAttendanceExportPdfUrl,
  getAttendanceReport,
} from '@/lib/admin/reports/api'
import type { CursoListItem } from '@/lib/admin/courses/types'
import type { ReporteAttendanceResponse } from '@/lib/admin/reports/types'
import { cn } from '@/lib/utils'

function SummaryCard({
  title,
  value,
  icon: Icon,
  accent = 'emerald',
  helper,
  highlight = false,
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  accent?: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose'
  helper?: string
  highlight?: boolean
}) {
  const accentStyles =
    accent === 'blue'
      ? {
          card: highlight
            ? 'border-blue-600/15 bg-blue-600/[0.06]'
            : 'border-blue-600/10 bg-blue-600/[0.04]',
          icon: 'bg-blue-600/10 text-blue-700 dark:text-blue-400',
          label: 'text-blue-700/80 dark:text-blue-400/90',
        }
      : accent === 'emerald'
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
          : accent === 'rose'
            ? {
                card: highlight
                  ? 'border-rose-500/15 bg-rose-500/[0.06]'
                  : 'border-rose-500/10 bg-rose-500/[0.04]',
                icon: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
                label: 'text-rose-700/80 dark:text-rose-400/90',
              }
            : {
                card: highlight
                  ? 'border-amber-500/15 bg-amber-500/[0.06]'
                  : 'border-amber-500/10 bg-amber-500/[0.04]',
                icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                label: 'text-amber-700/80 dark:text-amber-400/90',
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
          <p className="mt-3 text-[1.9rem] font-semibold leading-none tracking-tight text-foreground">
            {value}
          </p>
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

function getAttendanceTone(value?: number | null) {
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

export function AttendanceReportView() {
  const [courses, setCourses] = useState<CursoListItem[]>([])
  const [cursoId, setCursoId] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [term, setTerm] = useState('1')
  const [search, setSearch] = useState('')

  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingReport, setLoadingReport] = useState(false)
  const [report, setReport] = useState<ReporteAttendanceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses({ pageNumber: 1, pageSize: 100 })
        setCourses(data.items)
      } finally {
        setLoadingCourses(false)
      }
    }

    loadCourses()
  }, [])

  const selectedCourseName =
    courses.find((course) => String(course.id) === cursoId)?.nombre ?? 'Sin curso seleccionado'

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
      if (!year.trim()) throw new Error('Ingresá un año.')
      if (!term.trim()) throw new Error('Seleccioná un trimestre.')

      const data = await getAttendanceReport({
        cursoId: Number(cursoId),
        year: Number(year),
        term: Number(term),
        pageNumber: 1,
        pageSize: 100,
        search,
      })

      setReport(data)
    } catch (err: any) {
      setError(err?.message || 'No se pudo cargar el reporte.')
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
              Reports center
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.45rem]">
            Asistencia por trimestre
          </h2>

            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
              Analizá la asistencia consolidada por curso y trimestre con métricas detalladas por alumno.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[440px]">
            <ReportMetaCard
              icon={BookOpen}
              label="Curso"
              value={selectedCourseName}
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
              Seleccioná curso, año, trimestre y búsqueda opcional para generar el análisis de asistencia.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              <FilterField label="Curso">
                <select
                  value={cursoId}
                  onChange={(e) => setCursoId(e.target.value)}
                  disabled={loadingCourses}
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

              <FilterField label="Búsqueda">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Alumno, email o DNI"
                    className="h-11 rounded-2xl border-border/70 bg-card/85 pl-10 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                  />
                </div>
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

                <div className="grid gap-2 sm:grid-cols-2">
                  <a
                    href={
                      report && cursoId
                        ? getAttendanceExportExcelUrl({
                            cursoId: Number(cursoId),
                            year: Number(year),
                            term: Number(term),
                            search,
                          })
                        : undefined
                    }
                    className={cn(!report || !cursoId ? 'pointer-events-none opacity-50' : '')}
                  >
                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-2xl border-border/70 bg-background/75 text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card hover:text-foreground hover:shadow-md"
                    >
                      <FileSpreadsheet className="mr-2 size-4" />
                      Excel
                    </Button>
                  </a>

                  <a
                    href={
                      report && cursoId
                        ? getAttendanceExportPdfUrl({
                            cursoId: Number(cursoId),
                            year: Number(year),
                            term: Number(term),
                            search,
                          })
                        : undefined
                    }
                    className={cn(!report || !cursoId ? 'pointer-events-none opacity-50' : '')}
                  >
                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-2xl border-border/70 bg-background/75 text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card hover:text-foreground hover:shadow-md"
                    >
                      <FileText className="mr-2 size-4" />
                      PDF
                    </Button>
                  </a>
                </div>
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
                Indicadores del reporte
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <SummaryCard
                title="Curso seleccionado"
                value={report.resumen.cursoNombre}
                icon={BookOpen}
                accent="blue"
                helper="Curso incluido en el análisis."
              />
              <SummaryCard
                title="Alumnos incluidos"
                value={report.resumen.totalAlumnos}
                icon={Users}
                accent="violet"
                helper="Cantidad total con datos en el reporte."
              />
              <SummaryCard
                title="Clases analizadas"
                value={report.resumen.totalClases}
                icon={CalendarCheck2}
                accent="emerald"
                helper="Clases consideradas en el período."
              />
              <SummaryCard
                title="Presentes"
                value={report.resumen.totalPresentes}
                icon={CheckCircle2}
                accent="emerald"
                helper="Total de asistencias registradas."
              />
              <SummaryCard
                title="Asistencia del curso"
                value={`${report.resumen.porcentajeAsistenciaCurso?.toFixed(2) ?? '-'}%`}
                icon={Percent}
                accent="amber"
                helper="Promedio general de asistencia."
                highlight
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
            <div className="border-b border-border/60 px-6 py-5">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Resultado
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Detalle por alumno
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Vista consolidada de asistencia individual para el período seleccionado.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="border-b border-border/60 bg-muted/20">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Alumno
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      DNI
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Email
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Clases totales
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Presentes
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Ausentes
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      % asistencia
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {report.items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-14 text-center text-sm text-muted-foreground">
                        No hay resultados para mostrar.
                      </td>
                    </tr>
                  ) : (
                    report.items.map((item) => (
                      <tr
                        key={item.alumnoId}
                        className="border-b border-border/40 transition-colors duration-200 hover:bg-muted/10 last:border-0"
                      >
                        <td className="px-6 py-5">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">
                              {item.alumnoNombre} {item.alumnoApellido}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-muted-foreground">{item.alumnoDni}</td>

                        <td className="px-6 py-5 text-muted-foreground">
                          {item.alumnoEmail ?? '-'}
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-foreground">
                            {item.clasesTotales}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            {item.presentes}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-400">
                            {item.ausentes}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={cn(
                              'inline-flex rounded-full border px-3 py-1 text-xs font-semibold',
                              getAttendanceTone(item.porcentajeAsistencia),
                            )}
                          >
                            {item.porcentajeAsistencia.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))
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