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
import {
  buildReportFilename,
  getCourseProfileHref,
  getStudentProfileHref,
  ReportEntityLink,
  ReportEmptyTableRow,
  ReportExportButton,
  ReportExportSection,
  ReportFilterPanel,
  ReportLoadingState,
  ReportPageShell,
  ReportPersonLink,
  ReportResultsSection,
  ReportSummarySection,
} from './report-sections'

interface CursoAlumnoOption {
  alumnoId: number
  nombre: string
  apellido: string
  email: string
  alumnoAvatarUrl?: string | null
  avatarUrl?: string | null
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
  value: React.ReactNode
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
        'rounded-2xl border p-5 shadow-[0_14px_34px_-22px_rgba(15,23,42,0.14)] transition duration-200 hover:-translate-y-[1px] hover:shadow-[0_18px_38px_-24px_rgba(15,23,42,0.18)]',
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
    <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
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
                'flex items-center justify-between rounded-2xl border px-4 py-3 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition duration-200 hover:-translate-y-[1px] hover:shadow-sm',
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
  value: React.ReactNode
  helper?: string
  tone?: 'default' | 'highlight'
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition duration-200 hover:-translate-y-[1px] hover:shadow-sm',
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
    <ReportPageShell
      title="Resumen del alumno"
      description="Consultá el resumen académico completo de un alumno por curso y trimestre desde una vista consolidada."
      meta={
        <>
          <ReportMetaCard
            icon={UserRound}
            label="Alumno"
            value={
              alumnoId ? (
                <ReportPersonLink
                  href={getStudentProfileHref(alumnoId)}
                  name={selectedStudentName}
                  avatarUrl={selectedStudent?.alumnoAvatarUrl ?? selectedStudent?.avatarUrl}
                />
              ) : (
                selectedStudentName
              )
            }
            helper="Se actualiza según la selección."
            tone="highlight"
          />
          <ReportMetaCard
            icon={BookOpen}
            label="Curso"
            value={
              cursoId ? (
                <ReportEntityLink
                  href={getCourseProfileHref(cursoId)}
                  label={selectedCourseName}
                />
              ) : (
                selectedCourseName
              )
            }
            helper="Curso utilizado para consultar alumnos."
          />
          <ReportMetaCard
            icon={CalendarRange}
            label="Período"
            value={`${year || '-'} · ${termLabel}`}
            helper="Año y trimestre del reporte."
          />
        </>
      }
    >
      <ReportFilterPanel
        description="Seleccioná curso, alumno, año y trimestre para generar el resumen académico consolidado."
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
              disabled={loadingSources}
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

          <FilterField label="Alumno">
            <select
              value={alumnoId}
              onChange={(e) => setAlumnoId(e.target.value)}
              disabled={!cursoId || loadingStudents}
              className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
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
        </div>
      </ReportFilterPanel>
      {loadingReport && !report ? <ReportLoadingState /> : null}
      {report && (
        <>
          <ReportSummarySection description="Identificación y desempeño consolidado del estudiante.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Alumno"
                value={
                  <ReportPersonLink
                    href={getStudentProfileHref(report.alumnoId)}
                    name={`${report.alumnoNombre} ${report.alumnoApellido}`}
                    avatarUrl={
                      report.alumnoAvatarUrl ??
                      selectedStudent?.alumnoAvatarUrl ??
                      selectedStudent?.avatarUrl
                    }
                  />
                }
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
                value={
                  <ReportEntityLink
                    href={getCourseProfileHref(report.cursoId)}
                    label={report.cursoNombre}
                  />
                }
                subvalue={`${report.year}`}
                icon={BookOpen}
                accent="violet"
              />
              <SummaryCard
                title="Período"
                value={`Trimestre ${report.term}`}
                subvalue={`${report.from} a ${report.to}`}
                icon={CalendarRange}
                accent="emerald"
              />
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
          </ReportSummarySection>

          <ReportResultsSection
            title="Desglose por habilidad"
            description="Resultado acumulado por skill para el período seleccionado."
          >

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
          <ReportEmptyTableRow
            colSpan={5}
            title="Sin habilidades"
            description="No encontramos detalle de skills para este alumno en el período."
          />
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
          </ReportResultsSection>

          <ReportExportSection
            description="Este reporte individual está disponible en PDF para conservar su lectura académica completa."
            details={[
              { label: 'Curso', value: report.cursoNombre },
              { label: 'Período', value: `${report.year} · Trimestre ${report.term}` },
              { label: 'Registros', value: report.skills.length },
            ]}
          >
            <div className="w-full sm:min-w-[220px]">
              <ReportExportButton
                label="Exportar PDF"
                icon={<FileText className="mr-2 size-4" />}
                filename={buildReportFilename(
                  [
                    'resumen-alumno',
                    report.alumnoNombre,
                    report.alumnoApellido,
                    report.cursoNombre,
                    report.year,
                    `t${report.term}`,
                  ],
                  'pdf'
                )}
              href={
                report && cursoId && alumnoId
                  ? getStudentSummaryExportPdfUrl({
                      cursoId: Number(cursoId),
                      alumnoId: Number(alumnoId),
                      year: Number(year),
                      term: Number(term),
                    })
                  : undefined
              }
                disabled={!report || !cursoId || !alumnoId}
              />
            </div>
          </ReportExportSection>
        </>
      )}
    </ReportPageShell>
  )
}



