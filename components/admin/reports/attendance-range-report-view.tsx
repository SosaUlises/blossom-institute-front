'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  CalendarRange,
  Users,
  CalendarCheck2,
  BookOpen,
  Filter,
  Sparkles,
  Percent,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCourses } from '@/lib/admin/courses/api'
import { getCursoAlumnos } from '@/lib/admin/courses/people-api'
import { getAttendanceRangeReport } from '@/lib/admin/reports/api'
import type { CursoListItem } from '@/lib/admin/courses/types'
import type { AsistenciaRangeItem, AsistenciaRangeResponse } from '@/lib/admin/reports/types'
import { cn } from '@/lib/utils'
import {
  buildStudentAvatarLookup,
  CourseReportHero,
  getCourseProfileHref,
  getStudentProfileHref,
  ReportEntityLink,
  ReportEmptyTableRow,
  ReportExportUnavailable,
  ReportExportSection,
  ReportFilterPanel,
  ReportHeroContext,
  ReportLoadingState,
  ReportPersonLink,
  ReportResultsSection,
  ReportSummarySection,
} from './report-sections'

function getDefaultFrom() {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return date.toISOString().split('T')[0]
}

function getDefaultTo() {
  return new Date().toISOString().split('T')[0]
}

function formatDateLabel(value: string) {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatShortDateLabel(value: string) {
  if (!value) return '-'

  const date = new Date(`${value}T00:00:00`)

  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  accent = 'emerald',
  helper,
  highlight = false,
}: {
  title: string
  value: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  accent?: 'blue' | 'emerald' | 'violet' | 'amber'
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
                ? 'border-emerald-500/15 bg-emerald-500/[0.06]'
                : 'border-emerald-500/10 bg-emerald-500/[0.04]',
              icon: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
              label: 'text-emerald-700/80 dark:text-emerald-400/90',
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

function getPresenceTone(value?: number | null) {
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

export function AttendanceRangeReportView() {
  const [courses, setCourses] = useState<CursoListItem[]>([])
  const [cursoId, setCursoId] = useState('')
  const [from, setFrom] = useState(getDefaultFrom())
  const [to, setTo] = useState(getDefaultTo())
  const [search, setSearch] = useState('')

  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingReport, setLoadingReport] = useState(false)
  const [report, setReport] = useState<AsistenciaRangeResponse | null>(null)
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

  const averagePresence = useMemo(() => {
    if (!report || report.items.length === 0) return null
    const total = report.items.reduce((acc, item) => acc + item.porcentajePresencia, 0)
    return total / report.items.length
  }, [report])

  const handleLoad = async () => {
    setError(null)
    setLoadingReport(true)

    try {
      if (!cursoId) throw new Error('Seleccioná un curso.')
      if (!from) throw new Error('Ingresá la fecha desde.')
      if (!to) throw new Error('Ingresá la fecha hasta.')
      if (to < from) throw new Error('El rango de fechas es inválido.')

      const [data, courseStudents] = await Promise.all([
        getAttendanceRangeReport({
          cursoId: Number(cursoId),
          from,
          to,
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
      title="Asistencia por período personalizado"
      description="Consultá la asistencia consolidada por curso dentro de un rango de fechas desde una vista centralizada."
      context={
        <ReportHeroContext
          items={[
            {
              icon: BookOpen,
              label: 'Curso',
              value: cursoId ? (
                <ReportEntityLink
                  href={getCourseProfileHref(cursoId)}
                  label={selectedCourseName ?? 'Curso seleccionado'}
                />
              ) : undefined,
              helper: 'Se actualiza según la selección.',
              tone: 'highlight',
              visible: Boolean(cursoId),
            },
            {
              icon: CalendarRange,
              label: 'Rango',
              value: `${formatShortDateLabel(from)} a ${formatShortDateLabel(to)}`,
              helper: 'Fechas aplicadas al análisis.',
              visible: Boolean(cursoId && from && to),
            },
          ]}
        />
      }
    >
      <ReportFilterPanel
        description="Seleccioná curso, rango de fechas y búsqueda opcional para generar el análisis."
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

          <FilterField label="Búsqueda">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Alumno"
                className="h-11 rounded-2xl border-border/70 bg-card/85 pl-10 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
              />
            </div>
          </FilterField>

          <FilterField label="Desde">
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-11 rounded-2xl border-border/70 bg-card/85 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
            />
          </FilterField>

          <FilterField label="Hasta">
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-11 rounded-2xl border-border/70 bg-card/85 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
            />
          </FilterField>
        </div>
      </ReportFilterPanel>
      {loadingReport && !report ? <ReportLoadingState /> : null}
      {report && (
        <>
          <ReportSummarySection description="Indicadores del reporte">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Total alumnos"
                value={report.totalAlumnos}
                icon={Users}
                accent="violet"
                helper="Alumnos incluidos en el rango."
              />
              <SummaryCard
                title="Clases con asistencia"
                value={report.totalClasesConAsistencia}
                icon={CalendarCheck2}
                accent="emerald"
                helper="Registros detectados en el período."
              />
              <SummaryCard
                title="Desde"
                value={formatDateLabel(report.from)}
                icon={CalendarRange}
                accent="blue"
                helper="Fecha inicial del reporte."
              />
              <SummaryCard
                title="Presencia promedio"
                value={averagePresence != null ? `${averagePresence.toFixed(2)}%` : '-'}
                icon={Percent}
                accent="amber"
                helper="Promedio general del rango."
                highlight
              />
            </div>
          </ReportSummarySection>

          <ReportResultsSection
            title="Detalle por alumno"
            description="Asistencia detallada por alumno dentro del rango seleccionado."
          >

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="border-b border-border/60 bg-muted/20">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Alumno
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Presentes
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Ausentes
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Total registradas
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Presencia
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {report.items.length === 0 ? (
                    <ReportEmptyTableRow
                      colSpan={5}
                      title="Sin registros en el rango"
                      description="No encontramos asistencia para las fechas y filtros seleccionados."
                    />
                  ) : (
                    report.items.map((item: AsistenciaRangeItem) => (
                      <tr
                        key={item.alumnoId}
                        className="border-b border-border/40 transition-colors duration-200 hover:bg-muted/10 last:border-0"
                      >
                        <td className="px-6 py-5 font-medium text-foreground">
                          <ReportPersonLink
                            href={getStudentProfileHref(item.alumnoId)}
                            name={`${item.nombre} ${item.apellido}`}
                            avatarUrl={item.alumnoAvatarUrl ?? item.avatarUrl}
                          />
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

                        <td className="px-6 py-5 text-muted-foreground tabular-nums">
                          {item.totalRegistradas}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={cn(
                              'inline-flex rounded-full border px-3 py-1 text-xs font-semibold tabular-nums',
                              getPresenceTone(item.porcentajePresencia),
                            )}
                          >
                            {item.porcentajePresencia.toFixed(2)}%
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
            description="Este reporte todavía no tiene exportación configurada porque el backend no expone endpoint PDF ni Excel para asistencia por rango."
            details={[
              { label: 'Curso', value: selectedCourseName ?? 'Curso seleccionado' },
              { label: 'Período', value: `${formatShortDateLabel(report.from)} a ${formatShortDateLabel(report.to)}` },
              { label: 'Registros', value: report.items.length },
            ]}
          >
            <ReportExportUnavailable message="Sin exportación disponible para asistencia por rango." />
          </ReportExportSection>
        </>
      )}
    </CourseReportHero>
  )
}



