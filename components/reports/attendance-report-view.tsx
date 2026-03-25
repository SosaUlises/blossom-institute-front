'use client'

import { useEffect, useState } from 'react'
import { Download, FileText, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCourses } from '@/lib/courses/api'
import {
  getAttendanceExportExcelUrl,
  getAttendanceExportPdfUrl,
  getAttendanceReport,
} from '@/lib/reports/api'
import type { CursoListItem } from '@/lib/courses/types'
import type { ReporteAttendanceResponse } from '@/lib/reports/types'

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
                disabled={loadingCourses}
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
              <label className="text-sm font-medium text-foreground">Año</label>
              <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2026" />
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Búsqueda</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Alumno, email o DNI"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleLoad} disabled={loadingReport}>
              {loadingReport ? 'Cargando...' : 'Generar reporte'}
            </Button>

            {report && cursoId && (
              <>
                <a
                  href={getAttendanceExportExcelUrl({
                    cursoId: Number(cursoId),
                    year: Number(year),
                    term: Number(term),
                    search,
                  })}
                >
                  <Button variant="outline">
                    <Download className="mr-2 size-4" />
                    Exportar Excel
                  </Button>
                </a>

                <a
                  href={getAttendanceExportPdfUrl({
                    cursoId: Number(cursoId),
                    year: Number(year),
                    term: Number(term),
                    search,
                  })}
                >
                  <Button variant="outline">
                    <FileText className="mr-2 size-4" />
                    Exportar PDF
                  </Button>
                </a>
              </>
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Card className="border-border/70 bg-card/95">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Curso</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {report.resumen.cursoNombre}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Alumnos</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {report.resumen.totalAlumnos}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Clases</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {report.resumen.totalClases}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Presentes</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {report.resumen.totalPresentes}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Asistencia curso</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {report.resumen.porcentajeAsistenciaCurso?.toFixed(2) ?? '-'}%
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">
                Resultado del reporte
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="border-b border-border/70 bg-muted/30">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-5 py-4 font-medium">Alumno</th>
                      <th className="px-5 py-4 font-medium">DNI</th>
                      <th className="px-5 py-4 font-medium">Email</th>
                      <th className="px-5 py-4 font-medium">Clases totales</th>
                      <th className="px-5 py-4 font-medium">Presentes</th>
                      <th className="px-5 py-4 font-medium">Ausentes</th>
                      <th className="px-5 py-4 font-medium">% asistencia</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                          No hay resultados para mostrar.
                        </td>
                      </tr>
                    ) : (
                      report.items.map((item) => (
                        <tr
                          key={item.alumnoId}
                          className="border-b border-border/60 transition hover:bg-muted/20"
                        >
                          <td className="px-5 py-4">
                            <div className="space-y-0.5">
                              <p className="font-medium text-foreground">
                                {item.alumnoNombre} {item.alumnoApellido}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-muted-foreground">{item.alumnoDni}</td>
                          <td className="px-5 py-4 text-muted-foreground">{item.alumnoEmail ?? '-'}</td>
                          <td className="px-5 py-4 text-muted-foreground">{item.clasesTotales}</td>
                          <td className="px-5 py-4 text-muted-foreground">{item.presentes}</td>
                          <td className="px-5 py-4 text-muted-foreground">{item.ausentes}</td>
                          <td className="px-5 py-4 font-medium text-foreground">
                            {item.porcentajeAsistencia.toFixed(2)}%
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