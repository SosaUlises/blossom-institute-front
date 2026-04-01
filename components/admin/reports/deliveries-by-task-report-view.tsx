'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Paperclip,
  MessageSquare,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ClipboardCheck,
  BookOpen,
  ListChecks,
  PlusCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCourses } from '@/lib/admin/courses/api'
import { getDeliveriesByTaskReport } from '@/lib/admin/reports/api'
import { EstadoEntregaReporte, type DeliveriesByTaskItem, type DeliveriesByTaskResponse } from '@/lib/admin/reports/types'
import type { CursoListItem } from '@/lib/admin/courses/types'
import { getTasksByCourse } from '@/lib/admin/tasks/api'
import { EstadoTarea, type CursoTareaListItem } from '@/lib/admin/tasks/types'

function getEstadoLabel(estado: EstadoEntregaReporte) {
  switch (estado) {
    case EstadoEntregaReporte.SinEntregar:
      return 'Sin entregar'
    case EstadoEntregaReporte.EntregadoEnTermino:
      return 'Entregado en término'
    case EstadoEntregaReporte.EntregadoFueraDeTermino:
      return 'Entregado fuera de término'
    default:
      return 'Desconocido'
  }
}

function getEstadoBadgeClass(estado: EstadoEntregaReporte) {
  switch (estado) {
    case EstadoEntregaReporte.SinEntregar:
      return 'border-slate-500/15 bg-slate-500/10 text-slate-600 dark:text-slate-400'
    case EstadoEntregaReporte.EntregadoEnTermino:
      return 'border-green-500/15 bg-green-500/10 text-green-600 dark:text-green-400'
    case EstadoEntregaReporte.EntregadoFueraDeTermino:
      return 'border-amber-500/15 bg-amber-500/10 text-amber-700 dark:text-amber-400'
    default:
      return 'border-slate-500/15 bg-slate-500/10 text-slate-600 dark:text-slate-400'
  }
}

function formatTaskOption(task: CursoTareaListItem) {
  const due =
    task.fechaEntregaUtc
      ? new Date(task.fechaEntregaUtc).toLocaleDateString()
      : 'Sin fecha'

  return `${task.titulo} — ${due}`
}

function formatTaskStatus(status: EstadoTarea) {
  switch (status) {
    case EstadoTarea.Borrador:
      return 'Borrador'
    case EstadoTarea.Publicada:
      return 'Publicada'
    case EstadoTarea.Archivada:
      return 'Archivada'
    default:
      return 'Desconocido'
  }
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  accent = 'blue',
}: {
  title: string
  value: string | number
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

export function DeliveriesByTaskReportView() {
  const [courses, setCourses] = useState<CursoListItem[]>([])
  const [tasks, setTasks] = useState<CursoTareaListItem[]>([])

  const [cursoId, setCursoId] = useState('')
  const [tareaId, setTareaId] = useState('')
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')
  const [pendienteCorreccion, setPendienteCorreccion] = useState('')

  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [loadingReport, setLoadingReport] = useState(false)
  const [report, setReport] = useState<DeliveriesByTaskResponse | null>(null)
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

  useEffect(() => {
    const loadTasks = async () => {
      if (!cursoId) {
        setTasks([])
        setTareaId('')
        return
      }

      setLoadingTasks(true)
      setTasks([])
      setTareaId('')

      try {
        const data = await getTasksByCourse({
          cursoId: Number(cursoId),
          pageNumber: 1,
          pageSize: 100,
        })

        setTasks(data.items)
      } catch {
        setTasks([])
      } finally {
        setLoadingTasks(false)
      }
    }

    loadTasks()
  }, [cursoId])

  const selectedTask = useMemo(
    () => tasks.find((x) => x.id === Number(tareaId)) ?? null,
    [tasks, tareaId]
  )

  const handleLoad = async () => {
    setError(null)
    setLoadingReport(true)

    try {
      if (!cursoId) throw new Error('Seleccioná un curso.')
      if (!tareaId) throw new Error('Seleccioná una tarea.')

      const data = await getDeliveriesByTaskReport({
        cursoId: Number(cursoId),
        tareaId: Number(tareaId),
        pageNumber: 1,
        pageSize: 100,
        search,
        estado: estado !== '' ? Number(estado) : undefined,
        pendienteCorreccion:
          pendienteCorreccion === ''
            ? undefined
            : pendienteCorreccion === 'true',
      })

      setReport(data)
    } catch (err: any) {
      setError(err?.message || 'No se pudo cargar el reporte.')
      setReport(null)
    } finally {
      setLoadingReport(false)
    }
  }

  const totalEntregadas =
    report?.items.filter((x) => x.estado !== EstadoEntregaReporte.SinEntregar).length ?? 0

  const totalPendientes =
    report?.items.filter(
      (x) => x.feedbackVigente?.nota == null && x.estado !== EstadoEntregaReporte.SinEntregar
    ).length ?? 0

  const totalConAdjuntos =
    report?.items.filter((x) => x.tieneAdjuntos).length ?? 0

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
          <div className="grid gap-4 xl:grid-cols-5">
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

            <div className="space-y-2 xl:col-span-2">
              <label className="text-sm font-medium text-foreground">Tarea</label>
              <select
                value={tareaId}
                onChange={(e) => setTareaId(e.target.value)}
                disabled={!cursoId || loadingTasks}
                className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-3 py-2 text-sm shadow-sm"
              >
                <option value="">
                  {!cursoId
                    ? 'Primero seleccioná un curso'
                    : loadingTasks
                    ? 'Cargando tareas...'
                    : 'Seleccionar tarea'}
                </option>

                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {formatTaskOption(task)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-3 py-2 text-sm shadow-sm"
              >
                <option value="">Todos</option>
                <option value={EstadoEntregaReporte.SinEntregar}>Sin entregar</option>
                <option value={EstadoEntregaReporte.EntregadoEnTermino}>Entregado en término</option>
                <option value={EstadoEntregaReporte.EntregadoFueraDeTermino}>
                  Entregado fuera de término
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Pend. corrección</label>
              <select
                value={pendienteCorreccion}
                onChange={(e) => setPendienteCorreccion(e.target.value)}
                className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-3 py-2 text-sm shadow-sm"
              >
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,360px)_auto] xl:items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Búsqueda</label>
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Alumno o DNI"
                  className="h-11 rounded-2xl border-border/70 bg-card/80 pl-10 shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleLoad}
                disabled={loadingReport}
                className="h-11 rounded-2xl bg-primary/90 px-5 text-primary-foreground shadow-[0_14px_30px_-18px_rgba(36,59,123,0.42)] transition-all hover:-translate-y-[1px] hover:bg-primary hover:shadow-[0_18px_36px_-18px_rgba(36,59,123,0.50)]"
              >
                {loadingReport ? 'Cargando...' : 'Generar reporte'}
              </Button>
            </div>
          </div>

          {selectedTask && (
            <div className="rounded-[24px] border border-border/70 bg-muted/20 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Tarea seleccionada
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {selectedTask.titulo}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Estado: {formatTaskStatus(selectedTask.estado)} · Fecha de entrega:{' '}
                {selectedTask.fechaEntregaUtc
                  ? new Date(selectedTask.fechaEntregaUtc).toLocaleString()
                  : 'Sin fecha'}
              </p>
            </div>
          )}

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
              title="Total registros"
              value={report.total}
              icon={ListChecks}
              accent="blue"
            />
            <SummaryCard
              title="Entregadas"
              value={totalEntregadas}
              icon={ClipboardCheck}
              accent="emerald"
            />
            <SummaryCard
              title="Pend. corrección"
              value={totalPendientes}
              icon={AlertCircle}
              accent="amber"
            />
            <SummaryCard
              title="Con adjuntos"
              value={totalConAdjuntos}
              icon={PlusCircle}
              accent="violet"
            />
          </div>

          <Card className="overflow-hidden rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight">
                Resultado del reporte
              </CardTitle>
              <CardDescription>
                Estado de entrega por alumno para la tarea seleccionada.
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
                        Estado
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Entrega
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Adjuntos
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Feedback
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Nota
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Rehacer
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.items.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-14 text-center text-sm text-muted-foreground">
                          No hay resultados para mostrar.
                        </td>
                      </tr>
                    ) : (
                      report.items.map((item: DeliveriesByTaskItem) => (
                        <tr
                          key={item.alumnoId}
                          className="border-b border-border/60 transition-colors hover:bg-muted/15 last:border-0"
                        >
                          <td className="px-6 py-4 font-medium text-foreground">
                            {item.alumnoNombre} {item.alumnoApellido}
                          </td>

                          <td className="px-6 py-4 text-muted-foreground">{item.alumnoDni}</td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getEstadoBadgeClass(item.estado)}`}
                            >
                              {getEstadoLabel(item.estado)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-muted-foreground">
                            {item.fechaEntregaUtc
                              ? new Date(item.fechaEntregaUtc).toLocaleString()
                              : '-'}
                          </td>

                          <td className="px-6 py-4 text-muted-foreground">
                            <div className="inline-flex items-center gap-2">
                              <Paperclip className="size-4" />
                              <span>{item.tieneAdjuntos ? 'Sí' : 'No'}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-muted-foreground">
                            <div className="inline-flex items-center gap-2">
                              <MessageSquare className="size-4" />
                              <span>{item.feedbackVigente?.comentario ? 'Sí' : 'No'}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {item.feedbackVigente?.nota != null ? (
                              <div className="inline-flex items-center gap-2 font-semibold text-foreground">
                                <CheckCircle2 className="size-4 text-green-500" />
                                {item.feedbackVigente.nota}
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 text-muted-foreground">
                                <Clock3 className="size-4" />
                                Pendiente
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {item.feedbackVigente?.requiereRehacer ? (
                              <div className="inline-flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                                <AlertCircle className="size-4" />
                                Sí
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No</span>
                            )}
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