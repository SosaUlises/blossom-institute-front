'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  CalendarRange,
  Users,
  CalendarCheck2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCourses } from '@/lib/admin/courses/api'
import { getAttendanceRangeReport } from '@/lib/admin/reports/api'
import type { CursoListItem } from '@/lib/admin/courses/types'
import type { AsistenciaRangeItem, AsistenciaRangeResponse } from '@/lib/admin/reports/types'

function getDefaultFrom() {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return date.toISOString().split('T')[0]
}

function getDefaultTo() {
  return new Date().toISOString().split('T')[0]
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  accent = 'emerald',
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  accent?: 'blue' | 'emerald' | 'violet' | 'amber'
}) {
  const accentStyles =
    accent === 'blue'
      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
      : accent === 'violet'
        ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
        : accent === 'amber'
          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'

  return (
    <Card className="rounded-[24px] border border-border/60 bg-card/95 shadow-[0_14px_34px_-22px_rgba(15,23,42,0.14)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
          </div>

          <div className={`flex size-11 items-center justify-center rounded-2xl ${accentStyles}`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
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
      <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Filtros del reporte
          </CardTitle>
          <CardDescription className="text-sm leading-6 text-muted-foreground">
            Seleccioná curso y rango de fechas para generar el reporte.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr_0.9fr_1fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Curso</label>
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Desde</label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-11 rounded-2xl border-border/70 bg-card/85 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Hasta</label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-11 rounded-2xl border-border/70 bg-card/85 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Búsqueda</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Alumno"
                  className="h-11 rounded-2xl border-border/70 bg-card/85 pl-10 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleLoad}
              disabled={loadingReport}
              className="h-11 rounded-2xl bg-primary px-5 text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
            >
              {loadingReport ? 'Cargando...' : 'Generar reporte'}
            </Button>
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
              title="Total alumnos"
              value={report.totalAlumnos}
              icon={Users}
              accent="violet"
            />
            <SummaryCard
              title="Clases con asistencia"
              value={report.totalClasesConAsistencia}
              icon={CalendarCheck2}
              accent="emerald"
            />
            <SummaryCard
              title="Desde"
              value={report.from}
              icon={CalendarRange}
              accent="blue"
            />
            <SummaryCard
              title="Hasta"
              value={report.to}
              icon={CalendarRange}
              accent="blue"
            />
          </div>

          <Card className="overflow-hidden rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                Resultado del reporte
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-muted-foreground">
                Asistencia detallada por alumno en el rango seleccionado.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
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
                        presencia
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-14 text-center text-sm text-muted-foreground">
                          No hay resultados para mostrar.
                        </td>
                      </tr>
                    ) : (
                      report.items.map((item: AsistenciaRangeItem) => (
                        <tr
                          key={item.alumnoId}
                          className="border-b border-border/40 transition-colors duration-200 hover:bg-muted/10 last:border-0"
                        >
                          <td className="px-6 py-5 font-medium text-foreground">
                            {item.nombre} {item.apellido}
                          </td>
                          <td className="px-6 py-5 text-muted-foreground">{item.presentes}</td>
                          <td className="px-6 py-5 text-muted-foreground">{item.ausentes}</td>
                          <td className="px-6 py-5 text-muted-foreground">{item.totalRegistradas}</td>
                          <td className="px-6 py-5 font-semibold text-foreground">
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