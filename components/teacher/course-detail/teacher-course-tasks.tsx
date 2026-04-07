'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarClock,
  Clock3,
  ClipboardList,
  Eye,
  Pencil,
  Archive,
  Search,
  Plus,
} from 'lucide-react'

import { RowActions } from '@/components/ui/row-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDateTime } from '@/lib/teacher/course-detail/formatters'
import type { TeacherTaskListResponse, TeacherTaskListItem } from '@/lib/teacher/tasks/types'
import { EstadoTarea } from '@/lib/teacher/tasks/types'
import { getEstadoTareaConfig } from '@/lib/teacher/tasks/utils'
import { archiveTeacherTask } from '@/lib/teacher/tasks/task-api'

type Envelope<T> = {
  message?: string
  data?: T
}

function TaskMetaItem({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  tone?: 'default' | 'highlight'
}) {
  const containerClass =
    tone === 'highlight'
      ? 'rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 shadow-sm'
      : 'rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-sm'

  const iconWrapClass =
    tone === 'highlight'
      ? 'bg-primary/10 text-primary'
      : 'bg-background text-muted-foreground'

  const labelClass =
    tone === 'highlight'
      ? 'text-primary/80'
      : 'text-muted-foreground'

  const valueClass =
    tone === 'highlight'
      ? 'text-primary'
      : 'text-foreground'

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-2">
        <div className={`flex size-8 items-center justify-center rounded-xl ${iconWrapClass}`}>
          <Icon className="size-4" />
        </div>
        <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${labelClass}`}>
          {label}
        </span>
      </div>

      <p className={`mt-2 text-sm font-semibold ${valueClass}`}>{value}</p>
    </div>
  )
}

export function TeacherCourseTasks({ courseId }: { courseId: number }) {
  const router = useRouter()

  const [data, setData] = useState<TeacherTaskListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [estado, setEstado] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const query = new URLSearchParams({
          pageNumber: String(pageNumber),
          pageSize: String(pageSize),
        })

        if (debouncedSearch.trim()) query.set('search', debouncedSearch.trim())
        if (estado.trim()) query.set('estado', estado)

        const response = await fetch(
          `/api/teacher/courses/${courseId}/tasks?${query.toString()}`,
          {
            cache: 'no-store',
          }
        )

        const result = (await response.json()) as Envelope<TeacherTaskListResponse>

        if (!response.ok) {
          throw new Error(result.message || 'No se pudieron obtener las tareas.')
        }

        setData(result.data?.items ?? [])
        setTotal(result.data?.total ?? 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId, debouncedSearch, estado, pageNumber])

  const handleArchive = async (taskId: number) => {
    const confirmed = window.confirm('¿Querés archivar esta tarea?')
    if (!confirmed) return

    try {
      setError(null)
      await archiveTeacherTask(courseId, taskId)

      setData((prev) =>
        prev.map((item) =>
          item.id === taskId
            ? { ...item, estado: EstadoTarea.Archivada }
            : item
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error.')
    }
  }

  if (loading) {
    return (
      <div className="rounded-[24px] border border-border/60 bg-background/60 px-6 py-10 text-sm text-muted-foreground">
        Cargando tareas...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Tasks
          </p>
        </div>

        <Button
          onClick={() => router.push(`/teacher/courses/${courseId}/tasks/create`)}
          className="h-10 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
        >
          <Plus className="mr-2 size-4" />
          Crear tarea
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-[24px] border border-border/60 bg-card/90 p-4 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tarea..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPageNumber(1)
              }}
              className="h-11 rounded-2xl border-border/70 bg-background/85 pl-10 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
            />
          </div>

          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value)
              setPageNumber(1)
            }}
            className="flex h-11 rounded-2xl border border-border/70 bg-background/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
          >
            <option value="">Todos los estados</option>
            <option value={EstadoTarea.Borrador}>Borrador</option>
            <option value={EstadoTarea.Publicada}>Publicada</option>
            <option value={EstadoTarea.Archivada}>Archivada</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-sm"
            onClick={() => {
              setSearch('')
              setDebouncedSearch('')
              setEstado('')
              setPageNumber(1)
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-border/70 bg-background/60 px-6 py-12 text-center text-sm text-muted-foreground">
          Sin tareas.
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((task) => {
            const estadoConfig = getEstadoTareaConfig(task.estado)

            return (
              <article
                key={task.id}
                className="relative rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_24px_52px_-24px_rgba(15,23,42,0.20)] md:p-6"
              >
                <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.06),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.05),transparent_22%)]" />

                <div className="relative space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                        <ClipboardList className="size-3.5" />
                        Tarea
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${estadoConfig.className}`}
                      >
                        {estadoConfig.label}
                      </span>
                    </div>

                    <div className="pl-2">
                      <RowActions
                        actions={[
                          {
                            label: 'Ver entregas',
                            icon: Eye,
                            onClick: () =>
                              router.push(`/teacher/courses/${courseId}/tasks/${task.id}`),
                          },
                          {
                            label: 'Editar',
                            icon: Pencil,
                            onClick: () =>
                              router.push(`/teacher/courses/${courseId}/tasks/${task.id}/edit`),
                          },
                          {
                            label: 'Archivar',
                            icon: Archive,
                            destructive: true,
                            onClick: () => handleArchive(task.id),
                          },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-start">
                    <div className="min-w-0 space-y-2">
                      <h3 className="text-xl font-semibold tracking-tight text-foreground">
                        {task.titulo}
                      </h3>

                      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        Gestioná entregas, edición y estado de la actividad.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <TaskMetaItem
                        icon={CalendarClock}
                        label="Entrega"
                        value={formatDateTime(task.fechaEntregaUtc)}
                        tone="highlight"
                      />

                      <TaskMetaItem
                        icon={Clock3}
                        label="Publicación"
                        value={formatDateTime(task.createdAtUtc)}
                      />
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-sm text-muted-foreground">
          Página {pageNumber} · {total} tareas en total
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40 disabled:hover:translate-y-0"
            disabled={pageNumber === 1}
            onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
          >
            Anterior
          </Button>

          <Button
            variant="outline"
            className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40 disabled:hover:translate-y-0"
            disabled={pageNumber * pageSize >= total}
            onClick={() => setPageNumber((prev) => prev + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}