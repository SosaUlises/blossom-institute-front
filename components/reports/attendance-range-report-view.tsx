'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCourses } from '@/lib/courses/api'
import { getAttendanceRangeReport } from '@/lib/reports/api'
import type { CursoListItem } from '@/lib/courses/types'
import type { AsistenciaRangeResponse } from '@/lib/reports/types'

function getDefaultFrom() {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return date.toISOString().split('T')[0]
}

function getDefaultTo() {
  return new Date().toISOString().split('T')[0]
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

  const handleLoad = async () => {
    setError(null)
    setLoadingReport(true)

    try {
      if (!cursoId) throw new Error('Seleccioná un curso.')
      if (!from) throw new Error('Ingresá la fecha desde.')
      if (!to) throw new Error('Ingresá la fecha hasta.')
      if (to < from) throw new Error('El rango de fechas es inválido.')

      const data = await getAttendanceRangeReport({
        cursoId: Number(cursoId),
        from,
        to,
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
              <label className="text-sm font-medium text-foreground">Desde</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Hasta</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Búsqueda</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Alumno"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleLoad} disabled={loadingReport}>
              {loadingReport ? 'Cargando...' : 'Generar reporte'}
            </Button>
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
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
       
            <Card className="border-border/70 bg-card/95">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total alumnos</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {report.totalAlumnos}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Clases con asistencia</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {report.totalClasesConAsistencia}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Rango</p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {report.from}  al  {report.to}
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
                      <th className="px-5 py-4 font-medium">Presentes</th>
                      <th className="px-5 py-4 font-medium">Ausentes</th>
                      <th className="px-5 py-4 font-medium">Total registradas</th>
                      <th className="px-5 py-4 font-medium">% presencia</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
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
                                {item.nombre} {item.apellido}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-muted-foreground">{item.presentes}</td>
                          <td className="px-5 py-4 text-muted-foreground">{item.ausentes}</td>
                          <td className="px-5 py-4 text-muted-foreground">{item.totalRegistradas}</td>
                          <td className="px-5 py-4 font-medium text-foreground">
                            {item.porcentajePresencia.toFixed(2)}%
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