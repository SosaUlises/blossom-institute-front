'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarClock,
  Clock3,
  ClipboardList,
  Eye,
  ClipboardCheck,
  Pencil,
  Archive,
} from 'lucide-react'

import { RowActions } from '@/components/ui/row-actions'
import { formatDateTime } from '@/lib/teacher/course-detail/formatters'
import { getEstadoTareaConfig } from '@/lib/teacher/course-detail/status'

type Task = {
  id: number
  titulo: string
  fechaEntregaUtc?: string | null
  createdAtUtc?: string | null
  estado: number
}

type Envelope<T> = {
  message?: string
  data?: {
    items?: T[]
  }
}

function TaskMetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function TeacherCourseTasks({ courseId }: { courseId: number }) {
  const router = useRouter()

  const [data, setData] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/teacher/courses/${courseId}/tasks`, {
          cache: 'no-store',
        })

        const result = (await response.json()) as Envelope<Task>

        if (!response.ok) {
          throw new Error(result.message || 'No se pudieron obtener las tareas.')
        }

        setData(result.data?.items ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando tareas...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin tareas.</p>
  }

  return (
    <div className="space-y-4">
      {data.map((task) => {
        const estado = getEstadoTareaConfig(task.estado)

        return (
          <article
            key={task.id}
            className="relative rounded-[28px] border border-border/70 bg-card/95 p-5 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.16)] transition-all hover:-translate-y-[1px] hover:shadow-[0_24px_52px_-24px_rgba(30,42,68,0.22)] md:p-6"
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
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${estado.className}`}
                  >
                    {estado.label}
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
                        label: 'Corregir',
                        icon: ClipboardCheck,
                        onClick: () =>
                          router.push(`/teacher/courses/${courseId}/tasks/${task.id}/review`),
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
                        onClick: () => {
                          console.log('Archivar tarea', task.id)
                        },
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
                    Seguimiento de publicación y entrega de la actividad asignada al curso.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <TaskMetaItem
                    icon={CalendarClock}
                    label="Fecha de entrega"
                    value={formatDateTime(task.fechaEntregaUtc)}
                  />

                  <TaskMetaItem
                    icon={Clock3}
                    label="Fecha de publicación"
                    value={formatDateTime(task.createdAtUtc)}
                  />
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}