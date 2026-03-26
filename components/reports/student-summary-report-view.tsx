'use client'

import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCourses } from '@/lib/courses/api'
import { getCursoAlumnos } from '@/lib/courses/people-api'
import { getStudentSummaryExportPdfUrl, getStudentSummaryReport } from '@/lib/reports/api'
import type { CursoListItem } from '@/lib/courses/types'
import type { ReporteStudentSummaryResponse } from '@/lib/reports/types'

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
      <Card className="border-border/70 bg-card/95">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">
            Filtros del reporte
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Curso</label>
              <select
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
                disabled={loadingSources}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
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
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
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
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Term</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="1">Term 1</option>
                <option value="2">Term 2</option>
                <option value="3">Term 3</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleLoad} disabled={loadingReport}>
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
                <Button variant="outline">
                  <FileText className="mr-2 size-4" />
                  Exportar PDF
                </Button>
              </a>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {report && (
        <>
          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">
                Alumno
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Nombre</p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {report.alumnoNombre} {report.alumnoApellido}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">DNI</p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {report.alumnoDni}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {report.alumnoEmail ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Curso</p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {report.cursoNombre}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="border-border/70 bg-card/95">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Attendance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Clases totales</span>
                  <span className="font-medium text-foreground">{report.attendance.clasesTotales}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Presentes</span>
                  <span className="font-medium text-foreground">{report.attendance.presentes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ausentes</span>
                  <span className="font-medium text-foreground">{report.attendance.ausentes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">% asistencia</span>
                  <span className="font-medium text-foreground">
                    {report.attendance.porcentajeAsistencia.toFixed(2)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Homework</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-medium text-foreground">{report.homework.homeworkTotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Entregadas</span>
                  <span className="font-medium text-foreground">{report.homework.homeworkEntregadas}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sin entregar</span>
                  <span className="font-medium text-foreground">{report.homework.homeworkSinEntregar}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pend. corrección</span>
                  <span className="font-medium text-foreground">{report.homework.homeworkPendientesCorreccion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rehacer</span>
                  <span className="font-medium text-foreground">{report.homework.homeworkRehacer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Aprobadas</span>
                  <span className="font-medium text-foreground">{report.homework.homeworkAprobadas}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Promedio</span>
                  <span className="font-medium text-foreground">
                    {report.homework.homeworkPromedio?.toFixed(2) ?? '-'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Marks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quiz count</span>
                  <span className="font-medium text-foreground">{report.marks.quizCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Prom. quiz</span>
                  <span className="font-medium text-foreground">
                    {report.marks.quizPromedio?.toFixed(2) ?? '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Test count</span>
                  <span className="font-medium text-foreground">{report.marks.testCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Prom. test</span>
                  <span className="font-medium text-foreground">
                    {report.marks.testPromedio?.toFixed(2) ?? '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total marks</span>
                  <span className="font-medium text-foreground">{report.marks.marksCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Prom. general</span>
                  <span className="font-medium text-foreground">
                    {report.marks.promedioGeneral?.toFixed(2) ?? '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-sm">
                  <thead className="border-b border-border/70 bg-muted/30">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-5 py-4 font-medium">Skill</th>
                      <th className="px-5 py-4 font-medium">Evaluaciones</th>
                      <th className="px-5 py-4 font-medium">Obtenido</th>
                      <th className="px-5 py-4 font-medium">Máximo</th>
                      <th className="px-5 py-4 font-medium">Porcentaje</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.skills.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                          No hay skills para mostrar.
                        </td>
                      </tr>
                    ) : (
                      report.skills.map((skill, index) => (
                        <tr
                          key={`${skill.skill}-${index}`}
                          className="border-b border-border/60 transition hover:bg-muted/20"
                        >
                          <td className="px-5 py-4 font-medium text-foreground">
                            {getSkillLabel(skill.skill)}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {skill.evaluacionesCount}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {skill.totalObtenido}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {skill.totalMaximo}
                          </td>
                          <td className="px-5 py-4 font-medium text-foreground">
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