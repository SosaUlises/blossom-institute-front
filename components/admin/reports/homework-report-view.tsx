'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  FileText,
  Search,
  ClipboardCheck,
  Users,
  BookOpen,
  Sigma,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  ClipboardX,
  CalendarRange,
  Filter,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCourses } from '@/lib/admin/courses/api'
import { getCursoAlumnos } from '@/lib/admin/courses/people-api'
import {
  getHomeworkExportExcelUrl,
  getHomeworkExportPdfUrl,
  getHomeworkReport,
} from '@/lib/admin/reports/api'
import type { CursoListItem } from '@/lib/admin/courses/types'
import type { ReporteHomeworkResponse } from '@/lib/admin/reports/types'
import { cn } from '@/lib/utils'
import {
  buildStudentAvatarLookup,
  buildReportFilename,
  CourseReportHero,
  getCourseProfileHref,
  getStudentProfileHref,
  ReportHeroContext,
  ReportEntityLink,
  ReportEmptyTableRow,
  ReportExportButton,
  ReportExportSection,
  ReportFilterPanel,
  ReportLoadingState,
  ReportPersonLink,
  ReportResultsSection,
  ReportSummarySection,
} from './report-sections'

function SummaryCard({
  title,
  value,
  icon: Icon,
  accent = 'amber',
  helper,
  highlight = false,
}: {
  title: string
  value: React.ReactNode
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
        'rounded-2xl border p-5 shadow-[0_14px_34px_-22px_rgba(15,23,42,0.14)] transition duration-200 hover:-translate-y-[1px] hover:shadow-[0_18px_38px_-24px_rgba(15,23,42,0.18)]',
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

function getHomeworkAverageTone(value?: number | null) {
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

export function HomeworkReportView() {
  const [courses, setCourses] = useState<CursoListItem[]>([])
  const [cursoId, setCursoId] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [term, setTerm] = useState('1')
  const [search, setSearch] = useState('')

  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingReport, setLoadingReport] = useState(false)
  const [report, setReport] = useState<ReporteHomeworkResponse | null>(null)
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
    courses.find((course) => String(course.id) === cursoId)?.nombre

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

      const [data, courseStudents] = await Promise.all([
        getHomeworkReport({
          cursoId: Number(cursoId),
          year: Number(year),
          term: Number(term),
          pageNumber: 1,
          pageSize: 100,
          search,
        }),
        getCursoAlumnos(Number(cursoId)).catch(() => null),
      ])

      const studentAvatarLookup = buildStudentAvatarLookup(courseStudents?.items)

      setReport({
        ...data,
        items: data.items.map((item) => ({
          ...item,
          alumnoAvatarUrl:
            item.alumnoAvatarUrl ??
            item.avatarUrl ??
            studentAvatarLookup.get(item.alumnoId) ??
            null,
        })),
      })
    } catch (err: any) {
      setError(err?.message || 'No se pudo cargar el reporte.')
      setReport(null)
    } finally {
      setLoadingReport(false)
    }
  }

  return (
    <CourseReportHero
      title="Tareas por trimestre"
      description="Consultá entregas, pendientes, rehacer, aprobadas y promedio por curso y trimestre desde una vista consolidada."
      context={
        <ReportHeroContext
          items={[
            {
              icon: BookOpen,
              label: 'Curso',
              value: selectedCourseName,
              helper: 'Se actualiza según la selección.',
              tone: 'highlight',
              visible: Boolean(cursoId),
            },
            {
              icon: CalendarRange,
              label: 'Período',
              value: `${year || '-'} · ${termLabel}`,
              helper: 'Año y trimestre del reporte.',
              visible: Boolean(cursoId && year && term),
            },
          ]}
        />
      }
    >
      <ReportFilterPanel
        description="Seleccioná curso, año, trimestre y búsqueda opcional para generar el análisis de tareas."
        error={error}
        action={
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Filter className="size-4.5" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                  Acción disponible
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  Generar reporte
                </p>
              </div>
            </div>

            <Button
              onClick={handleLoad}
              disabled={loadingReport}
              className="h-11 w-full rounded-2xl bg-primary px-5 text-primary-foreground shadow-sm transition duration-150 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
            >
              {loadingReport ? (
                'Generando...'
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  Generar reporte
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          <FilterField label="Curso">
            <select
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              disabled={loadingCourses}
              className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
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
              className="h-11 rounded-2xl border-border/70 bg-card/85 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
            />
          </FilterField>

          <FilterField label="Trimestre">
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
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
                className="h-11 rounded-2xl border-border/70 bg-card/85 pl-10 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
              />
            </div>
          </FilterField>
        </div>
      </ReportFilterPanel>
      {loadingReport && !report ? <ReportLoadingState /> : null}
      {report && (
        <>
          <ReportSummarySection description="Indicadores del reporte">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <SummaryCard
                title="Curso seleccionado"
                value={
                  <ReportEntityLink
                    href={getCourseProfileHref(report.resumen.cursoId)}
                    label={report.resumen.cursoNombre}
                  />
                }
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
                title="Homework total"
                value={report.resumen.totalHomework}
                icon={ClipboardCheck}
                accent="amber"
                helper="Cantidad total de homework en el período."
              />
              <SummaryCard
                title="Entregadas"
                value={report.resumen.totalEntregas}
                icon={CheckCircle2}
                accent="emerald"
                helper="Entregas registradas correctamente."
              />
              <SummaryCard
                title="Promedio del curso"
                value={report.resumen.promedioHomeworkCurso?.toFixed(2) ?? '-'}
                icon={Sigma}
                accent="amber"
                helper="Promedio general del homework."
                highlight
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Sin entregar"
                value={report.resumen.totalSinEntregar}
                icon={ClipboardX}
                accent="rose"
                helper="Homework aún no entregado."
              />
              <SummaryCard
                title="Pend. corrección"
                value={report.resumen.totalPendientesCorreccion}
                icon={AlertCircle}
                accent="amber"
                helper="Esperando revisión docente."
              />
              <SummaryCard
                title="Rehacer"
                value={report.resumen.totalRehacer}
                icon={RotateCcw}
                accent="violet"
                helper="Entregas con solicitud de rehacer."
              />
              <SummaryCard
                title="Aprobadas"
                value={report.resumen.totalAprobadas}
                icon={CheckCircle2}
                accent="emerald"
                helper="Homework ya aprobadas."
              />
            </div>
          </ReportSummarySection>

          <ReportResultsSection
            title="Detalle por alumno"
            description="Situación de tareas por alumno para el período seleccionado."
          >

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1220px] text-sm">
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
                      Total HW
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Entregadas
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Sin entregar
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Pend. corrección
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Rehacer
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Aprobadas
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Promedio
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {report.items.length === 0 ? (
                    <ReportEmptyTableRow
                      colSpan={10}
                      title="Sin tareas"
                      description="No encontramos tareas o entregas para este curso y período."
                    />
                  ) : (
                    report.items.map((item) => (
                      <tr
                        key={item.alumnoId}
                        className="border-b border-border/40 transition-colors duration-200 hover:bg-muted/10 last:border-0"
                      >
                        <td className="px-6 py-5">
                          <ReportPersonLink
                            href={getStudentProfileHref(item.alumnoId)}
                            name={`${item.alumnoNombre} ${item.alumnoApellido}`}
                            avatarUrl={item.alumnoAvatarUrl ?? item.avatarUrl}
                          />
                        </td>

                        <td className="px-6 py-5 text-muted-foreground">{item.alumnoDni}</td>

                        <td className="px-6 py-5 text-muted-foreground">
                          {item.alumnoEmail ?? '-'}
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-foreground">
                            {item.homeworkTotal}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            {item.homeworkEntregadas}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-400">
                            {item.homeworkSinEntregar}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                            {item.homeworkPendientesCorreccion}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-400">
                            {item.homeworkRehacer}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            {item.homeworkAprobadas}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={cn(
                              'inline-flex rounded-full border px-3 py-1 text-xs font-semibold',
                              getHomeworkAverageTone(item.homeworkPromedio),
                            )}
                          >
                            {item.homeworkPromedio?.toFixed(2) ?? '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ReportResultsSection>

          <ReportExportSection
            details={[
              { label: 'Curso', value: report.resumen.cursoNombre },
              { label: 'Período', value: `${report.resumen.year} · Trimestre ${report.resumen.term}` },
              { label: 'Registros', value: report.items.length },
            ]}
          >
            <div className="grid w-full gap-2 sm:grid-cols-2 sm:min-w-[260px]">
              <ReportExportButton
                label="Excel"
                icon={<FileSpreadsheet className="mr-2 size-4" />}
                filename={buildReportFilename(
                  ['tareas', report.resumen.cursoNombre, report.resumen.year, `t${report.resumen.term}`],
                  'xlsx'
                )}
                href={
                  report && cursoId
                    ? getHomeworkExportExcelUrl({
                        cursoId: Number(cursoId),
                        year: Number(year),
                        term: Number(term),
                        search,
                      })
                    : undefined
                }
                disabled={!report || !cursoId}
              />

              <ReportExportButton
                label="PDF"
                icon={<FileText className="mr-2 size-4" />}
                filename={buildReportFilename(
                  ['tareas', report.resumen.cursoNombre, report.resumen.year, `t${report.resumen.term}`],
                  'pdf'
                )}
                href={
                  report && cursoId
                    ? getHomeworkExportPdfUrl({
                        cursoId: Number(cursoId),
                        year: Number(year),
                        term: Number(term),
                        search,
                      })
                    : undefined
                }
                disabled={!report || !cursoId}
              />
            </div>
          </ReportExportSection>
        </>
      )}
    </CourseReportHero>
  )
}



