'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Paperclip,
  MessageSquare,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCourses } from '@/lib/courses/api'
import { getDeliveriesByTaskReport } from '@/lib/reports/api'
import { EstadoEntregaReporte, type DeliveriesByTaskResponse } from '@/lib/reports/types'
import type { CursoListItem } from '@/lib/courses/types'
import { getTasksByCourse } from '@/lib/tasks/api'
import { EstadoTarea, type CursoTareaListItem } from '@/lib/tasks/types'

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
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
    case EstadoEntregaReporte.EntregadoEnTermino:
      return 'bg-green-500/10 text-green-600 dark:text-green-400'
    case EstadoEntregaReporte.EntregadoFueraDeTermino:
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
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
      <Card className="border-border/70 bg-card/95">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">
            Filtros del reporte
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-5">
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

            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium text-foreground">Tarea</label>
              <select
                value={tareaId}
                onChange={(e) => setTareaId(e.target.value)}
                disabled={!cursoId || loadingTasks}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
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
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
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
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_auto] lg:items-end">
           <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Búsqueda</label>
            <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Alumno o DNI"
                className="pl-10"
                />
            </div>
            </div>

            <div className="flex items-end">
              <Button onClick={handleLoad} disabled={loadingReport}>
                {loadingReport ? 'Cargando...' : 'Generar reporte'}
              </Button>
            </div>
          </div>

          {selectedTask && (
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {report && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-border/70 bg-card/95">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total registros
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">{report.total}</p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Entregadas</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{totalEntregadas}</p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Pend. corrección
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">{totalPendientes}</p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Con adjuntos
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">{totalConAdjuntos}</p>
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
                <table className="w-full min-w-[1180px] text-sm">
                  <thead className="border-b border-border/70 bg-muted/30">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-5 py-4 font-medium">Alumno</th>
                      <th className="px-5 py-4 font-medium">DNI</th>
                      <th className="px-5 py-4 font-medium">Estado</th>
                      <th className="px-5 py-4 font-medium">Entrega</th>
                      <th className="px-5 py-4 font-medium">Adjuntos</th>
                      <th className="px-5 py-4 font-medium">Feedback</th>
                      <th className="px-5 py-4 font-medium">Nota</th>
                      <th className="px-5 py-4 font-medium">Rehacer</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.items.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
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

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getEstadoBadgeClass(item.estado)}`}
                            >
                              {getEstadoLabel(item.estado)}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-muted-foreground">
                            {item.fechaEntregaUtc
                              ? new Date(item.fechaEntregaUtc).toLocaleString()
                              : '-'}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Paperclip className="size-4" />
                              <span>{item.tieneAdjuntos ? 'Sí' : 'No'}</span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="size-4" />
                              <span>{item.feedbackVigente?.comentario ? 'Sí' : 'No'}</span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {item.feedbackVigente?.nota != null ? (
                              <div className="flex items-center gap-2 font-medium text-foreground">
                                <CheckCircle2 className="size-4 text-green-500" />
                                {item.feedbackVigente.nota}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock3 className="size-4" />
                                Pendiente
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {item.feedbackVigente?.requiereRehacer ? (
                              <div className="flex items-center gap-2 font-medium text-yellow-700 dark:text-yellow-400">
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