'use client'

import { useEffect, useState } from 'react'
import {
  FileText,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  ClipboardCheck,
  BarChart3,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCourses } from '@/lib/admin/courses/api'
import { getCursoAlumnos } from '@/lib/admin/courses/people-api'
import { getStudentSummaryExportPdfUrl, getStudentSummaryReport } from '@/lib/admin/reports/api'
import type { CursoListItem } from '@/lib/admin/courses/types'
import type { ReporteStudentSummaryResponse, ReporteStudentSummarySkillItem } from '@/lib/admin/reports/types'

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
}: {
  title: string
  value: string | number
  subvalue?: string
  icon: React.ComponentType<{ className?: string }>
  accent?: 'blue' | 'emerald' | 'violet' | 'amber'
}) {
  const accentStyles =
    accent === 'emerald'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : accent === 'violet'
      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
      : accent === 'amber'
      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'

  return (
    <Card className="rounded-[24px] border border-border/70 bg-card/95 shadow-[0_14px_34px_-22px_rgba(30,42,68,0.16)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 text-lg font-bold tracking-tight text-foreground">
              {value}
            </p>
            {subvalue && (
              <p className="mt-1 text-sm text-muted-foreground">{subvalue}</p>
            )}
          </div>

          <div className={`flex size-11 items-center justify-center rounded-2xl ${accentStyles}`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricCard({
  title,
  icon: Icon,
  items,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: { label: string; value: string | number }[]
}) {
  return (
    <Card className="rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_40px_-22px_rgba(30,42,68,0.18)]">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <CardTitle className="text-lg font-semibold tracking-tight">{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/15 px-4 py-3"
          >
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="font-semibold text-foreground">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
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
    <div className="space-y-6">
      <Card className="rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_40px_-22px_rgba(30,42,68,0.18)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Filtros del reporte
          </CardTitle>
          <CardDescription>
            Realizá el filtrado necesario para generar el reporte.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Curso</label>
              <select
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
                disabled={loadingSources}
                className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-3 py-2 text-sm shadow-sm"
              >
                <option value="">Seleccionar curso</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Alumno</label>
              <select
                value={alumnoId}
                onChange={(e) => setAlumnoId(e.target.value)}
                disabled={!cursoId || loadingStudents}
                className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-3 py-2 text-sm shadow-sm"
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Año</label>
              <Input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
                className="h-11 rounded-2xl border-border/70 bg-card/80 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Term</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-3 py-2 text-sm shadow-sm"
              >
                <option value="1">Term 1</option>
                <option value="2">Term 2</option>
                <option value="3">Term 3</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleLoad}
              disabled={loadingReport}
              className="h-11 rounded-2xl bg-primary/90 px-5 text-primary-foreground shadow-[0_14px_30px_-18px_rgba(36,59,123,0.42)] transition-all hover:-translate-y-[1px] hover:bg-primary hover:shadow-[0_18px_36px_-18px_rgba(36,59,123,0.50)]"
            >
              {loadingReport ? 'Cargando...' : 'Generar reporte'}
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
                  className="h-11 rounded-2xl border-border/70 bg-background/70 shadow-sm transition-all hover:-translate-y-[1px] hover:bg-card hover:shadow-md"
                >
                  <FileText className="mr-2 size-4" />
                  Exportar PDF
                </Button>
              </a>
            )}
          </div>

          {error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {report && (
        <>
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
              subvalue={`Term ${report.term} · ${report.year}`}
              icon={BookOpen}
              accent="violet"
            />
            <SummaryCard
              title="Período"
              value={`${report.from} → ${report.to}`}
              icon={BookOpen}
              accent="emerald"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <MetricCard
              title="Attendance"
              icon={CalendarCheck2}
              items={[
                { label: 'Clases totales', value: report.attendance.clasesTotales },
                { label: 'Presentes', value: report.attendance.presentes },
                { label: 'Ausentes', value: report.attendance.ausentes },
                {
                  label: '% asistencia',
                  value: `${report.attendance.porcentajeAsistencia.toFixed(2)}%`,
                },
              ]}
            />

            <MetricCard
              title="Homework"
              icon={ClipboardCheck}
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
              title="Marks"
              icon={BarChart3}
              items={[
                { label: 'Quiz count', value: report.marks.quizCount },
                {
                  label: 'Prom. quiz',
                  value: report.marks.quizPromedio?.toFixed(2) ?? '-',
                },
                { label: 'Test count', value: report.marks.testCount },
                {
                  label: 'Prom. test',
                  value: report.marks.testPromedio?.toFixed(2) ?? '-',
                },
                { label: 'Total marks', value: report.marks.marksCount },
                {
                  label: 'Prom. general',
                  value: report.marks.promedioGeneral?.toFixed(2) ?? '-',
                },
              ]}
            />
          </div>

          <Card className="overflow-hidden rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight">
                Skills
              </CardTitle>
              <CardDescription>
                Desglose acumulado por skill para el período seleccionado.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="border-b border-border/70 bg-muted/25">
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
                      report.skills.map((skill: ReporteStudentSummarySkillItem, index: number) => (
                        <tr
                          key={`${skill.skill}-${index}`}
                          className="border-b border-border/60 transition-colors hover:bg-muted/15 last:border-0"
                        >
                          <td className="px-6 py-4 font-medium text-foreground">
                            {getSkillLabel(skill.skill)}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {skill.evaluacionesCount}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {skill.totalObtenido}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {skill.totalMaximo}
                          </td>
                          <td className="px-6 py-4 font-semibold text-foreground">
                            {skill.porcentaje?.toFixed(2) ?? '-'}%
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}