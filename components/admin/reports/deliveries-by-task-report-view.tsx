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
  ListChecks,
  BookOpen,
  Filter,
  Sparkles,
  FileText,
  CalendarRange,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCourses } from '@/lib/admin/courses/api'
import { getDeliveriesByTaskReport } from '@/lib/admin/reports/api'
import {
  EstadoEntregaReporte,
  type DeliveriesByTaskItem,
  type DeliveriesByTaskResponse,
} from '@/lib/admin/reports/types'
import type { CursoListItem } from '@/lib/admin/courses/types'
import { getTasksByCourse } from '@/lib/admin/tasks/api'
import { EstadoTarea, type CursoTareaListItem } from '@/lib/admin/tasks/types'
import { cn } from '@/lib/utils'

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
      return 'border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    case EstadoEntregaReporte.EntregadoFueraDeTermino:
      return 'border-amber-500/15 bg-amber-500/10 text-amber-700 dark:text-amber-400'
    default:
      return 'border-slate-500/15 bg-slate-500/10 text-slate-600 dark:text-slate-400'
  }
}

function formatTaskOption(task: CursoTareaListItem) {
  const due = task.fechaEntregaUtc
    ? new Date(task.fechaEntregaUtc).toLocaleDateString('es-AR')
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

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-AR')
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  accent = 'blue',
  helper,
  highlight = false,
}: {
  title: string
  value: string | number
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
        'rounded-[24px] border p-5 shadow-[0_14px_34px_-22px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_18px_38px_-24px_rgba(15,23,42,0.18)]',
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

function ReportMetaCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  helper?: string
  tone?: 'default' | 'highlight'
}) {
  return (
    <div
      className={cn(
        'rounded-[24px] border p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md',
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
          {helper ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p> : null}
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

function getNoteTone(value?: number | null) {
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

      const deliverableTasks = data.items.filter(
        (task) => task.fechaEntregaUtc != null
      )

      setTasks(deliverableTasks)
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

  const selectedCourseName =
    courses.find((course) => String(course.id) === cursoId)?.nombre ?? 'Sin curso seleccionado'

  const taskStatusLabel = selectedTask ? formatTaskStatus(selectedTask.estado) : 'Sin tarea seleccionada'

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

  const totalRehacer =
    report?.items.filter((x) => x.feedbackVigente?.requiereRehacer).length ?? 0

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 px-6 py-7 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:px-7 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.05),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(72,99,180,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.08),transparent_26%)]" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 h-[3px] w-12 rounded-full bg-primary" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              Centro de reportes
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.45rem]">
              Entregas por tarea
            </h2>

            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
              Consultá el estado de las entregas de una tarea específica por curso desde una vista consolidada.
            </p>
          </div>

          <div className="grid min-w-0 gap-3 lg:w-[460px] xl:grid-cols-2">
            <ReportMetaCard
              icon={BookOpen}
              label="Curso"
              value={selectedCourseName}
              helper="Se actualiza según la selección."
              tone="highlight"
            />
            <ReportMetaCard
              icon={ClipboardCheck}
              label="Tarea"
              value={selectedTask?.titulo ?? 'Sin tarea seleccionada'}
              helper={selectedTask ? `Estado: ${taskStatusLabel}` : 'Seleccioná una tarea para continuar.'}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
        <div className="flex flex-col gap-6">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Configuración
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Generar reporte
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Seleccioná curso, tarea y filtros adicionales para generar el detalle consolidado de entregas.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <FilterField label="Curso">
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
              </FilterField>

              <FilterField label="Tarea">
                <select
                  value={tareaId}
                  onChange={(e) => setTareaId(e.target.value)}
                  disabled={!cursoId || loadingTasks}
                  className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
                >
                  <option value="">
                  {!cursoId
                    ? 'Primero seleccioná un curso'
                    : loadingTasks
                      ? 'Cargando tareas...'
                      : tasks.length === 0
                        ? 'No hay tareas entregables'
                        : 'Seleccionar tarea'}
                </option>

                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {formatTaskOption(task)}
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
                    placeholder="Alumno o DNI"
                    className="h-11 rounded-2xl border-border/70 bg-card/85 pl-10 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                  />
                </div>
              </FilterField>

              <FilterField label="Estado">
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
                >
                  <option value="">Todos</option>
                  <option value={EstadoEntregaReporte.SinEntregar}>Sin entregar</option>
                  <option value={EstadoEntregaReporte.EntregadoEnTermino}>Entregado en término</option>
                  <option value={EstadoEntregaReporte.EntregadoFueraDeTermino}>
                    Entregado fuera de término
                  </option>
                </select>
              </FilterField>

              <FilterField label="Pend. corrección">
                <select
                  value={pendienteCorreccion}
                  onChange={(e) => setPendienteCorreccion(e.target.value)}
                  className="flex h-11 w-full rounded-2xl border border-border/70 bg-card/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </FilterField>
            </div>

            <div className="rounded-[24px] border border-primary/15 bg-primary/5 p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
              <div className="mb-4 flex items-start gap-3">
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
                className="h-11 w-full rounded-2xl bg-primary px-5 text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
              >
                {loadingReport ? (
                  'Cargando...'
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Generar reporte
                  </>
                )}
              </Button>

              {selectedTask && (
                <div className="mt-4 rounded-[18px] border border-border/60 bg-background/70 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Fecha de entrega
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {selectedTask.fechaEntregaUtc
                      ? formatDateTime(selectedTask.fechaEntregaUtc)
                      : 'Sin fecha'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </section>

      {report && (
        <>
          <section className="space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Resumen ejecutivo
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                Indicadores del reporte
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Total registros"
                value={report.total}
                icon={ListChecks}
                accent="blue"
                helper="Alumnos incluidos en la consulta."
              />
              <SummaryCard
                title="Entregadas"
                value={totalEntregadas}
                icon={ClipboardCheck}
                accent="emerald"
                helper="Entregas realizadas."
              />
              <SummaryCard
                title="Pend. corrección"
                value={totalPendientes}
                icon={AlertCircle}
                accent="amber"
                helper="Sin nota vigente cargada."
              />
              <SummaryCard
                title="Con adjuntos"
                value={totalConAdjuntos}
                icon={Paperclip}
                accent="violet"
                helper="Entregas con archivos adjuntos."
                highlight
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Rehacer"
                value={totalRehacer}
                icon={AlertCircle}
                accent="amber"
                helper="Solicitudes activas de rehacer."
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
            <div className="border-b border-border/60 px-6 py-5">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Resultado
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Estado por alumno
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Estado de entrega y feedback por alumno para la tarea seleccionada.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1220px] text-sm">
                <thead className="border-b border-border/60 bg-muted/20">
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
                        className="border-b border-border/40 transition-colors duration-200 hover:bg-muted/10 last:border-0"
                      >
                        <td className="px-6 py-5 font-medium text-foreground">
                          {item.alumnoNombre} {item.alumnoApellido}
                        </td>

                        <td className="px-6 py-5 text-muted-foreground tabular-nums">
                          {item.alumnoDni}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={cn(
                              'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                              getEstadoBadgeClass(item.estado),
                            )}
                          >
                            {getEstadoLabel(item.estado)}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-muted-foreground">
                          {item.fechaEntregaUtc ? formatDateTime(item.fechaEntregaUtc) : '-'}
                        </td>

                        <td className="px-6 py-5">
                          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-foreground">
                            <Paperclip className="size-3.5" />
                            <span>{item.tieneAdjuntos ? 'Sí' : 'No'}</span>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-foreground">
                            <MessageSquare className="size-3.5" />
                            <span>{item.feedbackVigente?.comentario ? 'Sí' : 'No'}</span>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          {item.feedbackVigente?.nota != null ? (
                            <span
                              className={cn(
                                'inline-flex rounded-full border px-3 py-1 text-xs font-semibold',
                                getNoteTone(item.feedbackVigente.nota),
                              )}
                            >
                              {item.feedbackVigente.nota}
                            </span>
                          ) : (
                            <div className="inline-flex items-center gap-2 text-muted-foreground">
                              <Clock3 className="size-4" />
                              Pendiente
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          {item.feedbackVigente?.requiereRehacer ? (
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                              <AlertCircle className="size-3.5" />
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
          </section>
        </>
      )}
    </div>
  )
}