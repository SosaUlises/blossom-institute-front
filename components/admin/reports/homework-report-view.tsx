'use client'

import { useEffect, useState } from 'react'
import {
  Download,
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
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCourses } from '@/lib/admin/courses/api'
import {
  getHomeworkExportExcelUrl,
  getHomeworkExportPdfUrl,
  getHomeworkReport,
} from '@/lib/admin/reports/api'
import type { CursoListItem } from '@/lib/admin/courses/types'
import type { ReporteHomeworkResponse } from '@/lib/admin/reports/types'

function SummaryCard({
  title,
  value,
  icon: Icon,
  accent = 'amber',
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  accent?: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose'
}) {
  const accentStyles =
    accent === 'blue'
      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
      : accent === 'emerald'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : accent === 'violet'
      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
      : accent === 'rose'
      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'

  return (
    <Card className="rounded-[24px] border border-border/70 bg-card/95 shadow-[0_14px_34px_-22px_rgba(30,42,68,0.16)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
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

  const handleLoad = async () => {
    setError(null)
    setLoadingReport(true)

    try {
      if (!cursoId) throw new Error('Seleccioná un curso.')
      if (!year.trim()) throw new Error('Ingresá un año.')
      if (!term.trim()) throw new Error('Seleccioná un trimestre.')

      const data = await getHomeworkReport({
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
          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.7fr_0.7fr_1fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Curso</label>
              <select
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
                disabled={loadingCourses}
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Búsqueda</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Alumno, email o DNI"
                  className="h-11 rounded-2xl border-border/70 bg-card/80 pl-10 shadow-sm"
                />
              </div>
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

            {report && cursoId && (
              <>
                <a
                  href={getHomeworkExportExcelUrl({
                    cursoId: Number(cursoId),
                    year: Number(year),
                    term: Number(term),
                    search,
                  })}
                >
                  <Button
                    variant="outline"
                    className="h-11 rounded-2xl border-border/70 bg-background/70 shadow-sm transition-all hover:-translate-y-[1px] hover:bg-card hover:shadow-md"
                  >
                    <Download className="mr-2 size-4" />
                    Exportar Excel
                  </Button>
                </a>

                <a
                  href={getHomeworkExportPdfUrl({
                    cursoId: Number(cursoId),
                    year: Number(year),
                    term: Number(term),
                    search,
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
              </>
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              title="Curso"
              value={report.resumen.cursoNombre}
              icon={BookOpen}
              accent="blue"
            />
            <SummaryCard
              title="Alumnos"
              value={report.resumen.totalAlumnos}
              icon={Users}
              accent="violet"
            />
            <SummaryCard
              title="Homework total"
              value={report.resumen.totalHomework}
              icon={ClipboardCheck}
              accent="amber"
            />
            <SummaryCard
              title="Entregadas"
              value={report.resumen.totalEntregas}
              icon={CheckCircle2}
              accent="emerald"
            />
            <SummaryCard
              title="Promedio curso"
              value={report.resumen.promedioHomeworkCurso?.toFixed(2) ?? '-'}
              icon={Sigma}
              accent="amber"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Sin entregar"
              value={report.resumen.totalSinEntregar}
              icon={ClipboardX}
              accent="rose"
            />
            <SummaryCard
              title="Pend. corrección"
              value={report.resumen.totalPendientesCorreccion}
              icon={AlertCircle}
              accent="amber"
            />
            <SummaryCard
              title="Rehacer"
              value={report.resumen.totalRehacer}
              icon={RotateCcw}
              accent="violet"
            />
            <SummaryCard
              title="Aprobadas"
              value={report.resumen.totalAprobadas}
              icon={CheckCircle2}
              accent="emerald"
            />
          </div>

          <Card className="overflow-hidden rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight">
                Resultado del reporte
              </CardTitle>
              <CardDescription>
                Situación de homework por alumno para el período seleccionado.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1220px] text-sm">
                  <thead className="border-b border-border/70 bg-muted/25">
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
                      <tr>
                        <td colSpan={10} className="px-6 py-14 text-center text-sm text-muted-foreground">
                          No hay resultados para mostrar.
                        </td>
                      </tr>
                    ) : (
                      report.items.map((item) => (
                        <tr
                          key={item.alumnoId}
                          className="border-b border-border/60 transition-colors hover:bg-muted/15 last:border-0"
                        >
                          <td className="px-6 py-4 font-medium text-foreground">
                            {item.alumnoNombre} {item.alumnoApellido}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{item.alumnoDni}</td>
                          <td className="px-6 py-4 text-muted-foreground">{item.alumnoEmail ?? '-'}</td>
                          <td className="px-6 py-4 text-muted-foreground">{item.homeworkTotal}</td>
                          <td className="px-6 py-4 text-muted-foreground">{item.homeworkEntregadas}</td>
                          <td className="px-6 py-4 text-muted-foreground">{item.homeworkSinEntregar}</td>
                          <td className="px-6 py-4 text-muted-foreground">{item.homeworkPendientesCorreccion}</td>
                          <td className="px-6 py-4 text-muted-foreground">{item.homeworkRehacer}</td>
                          <td className="px-6 py-4 text-muted-foreground">{item.homeworkAprobadas}</td>
                          <td className="px-6 py-4 font-semibold text-foreground">
                            {item.homeworkPromedio?.toFixed(2) ?? '-'}
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