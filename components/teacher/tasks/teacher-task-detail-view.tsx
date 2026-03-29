'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarClock,
  Clock3,
  ClipboardList,
  Eye,
  FileText,
  Link as LinkIcon,
  Paperclip,
  Search,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RowActions } from '@/components/ui/row-actions'
import { formatDateTime } from '@/lib/teacher/course-detail/formatters'
import type {
  TeacherTaskDetail,
  TeacherSubmissionsResponse,
  TeacherSubmissionListItem,
} from '@/lib/teacher/tasks/types'
import { getEstadoCorreccionConfig, getEstadoEntregaConfig, getEstadoTareaConfig } from '@/lib/teacher/tasks/utils'

type Props = {
  courseId: number
  taskId: number
}

type Envelope<T> = {
  message?: string
  data?: T
}

export function TeacherTaskDetailView({ courseId, taskId }: Props) {
  const router = useRouter()

  const [task, setTask] = useState<TeacherTaskDetail | null>(null)
  const [submissions, setSubmissions] = useState<TeacherSubmissionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
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

        const [taskResponse, submissionsResponse] = await Promise.all([
          fetch(`/api/teacher/courses/${courseId}/tasks/${taskId}`, {
            cache: 'no-store',
          }),
          fetch(
            `/api/teacher/courses/${courseId}/tasks/${taskId}/submissions?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(
              debouncedSearch
            )}`,
            { cache: 'no-store' }
          ),
        ])

        const taskResult = (await taskResponse.json()) as Envelope<TeacherTaskDetail>
        const submissionsResult = (await submissionsResponse.json()) as Envelope<TeacherSubmissionsResponse>

        if (!taskResponse.ok) {
          throw new Error(taskResult.message || 'No se pudo obtener la tarea.')
        }

        if (!submissionsResponse.ok) {
          throw new Error(submissionsResult.message || 'No se pudieron obtener las entregas.')
        }

        setTask(taskResult.data ?? null)
        setSubmissions(submissionsResult.data?.items ?? [])
        setTotal(submissionsResult.data?.total ?? 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId, taskId, pageNumber, debouncedSearch])

  const taskEstado = useMemo(
    () => (task ? getEstadoTareaConfig(task.estado) : null),
    [task]
  )

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando tarea...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (!task) {
    return <p className="text-sm text-muted-foreground">No se encontró la tarea.</p>
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-border/70 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(30,42,68,0.24)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_28%)]" />

        <div className="relative space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => router.push(`/teacher/courses/${courseId}`)}
            >
              <ArrowLeft className="mr-2 size-4" />
              Volver al curso
            </Button>

            {taskEstado && (
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${taskEstado.className}`}
              >
                {taskEstado.label}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <ClipboardList className="size-3.5" />
              Task detail
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {task.titulo}
            </h1>

            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {task.consigna?.trim()
                ? task.consigna
                : 'Sin consigna cargada para esta tarea.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarClock className="size-4" />
                <span className="text-xs font-medium uppercase tracking-[0.14em]">
                  Fecha de entrega
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {formatDateTime(task.fechaEntregaUtc)}
              </p>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock3 className="size-4" />
                <span className="text-xs font-medium uppercase tracking-[0.14em]">
                  Publicación
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {formatDateTime(task.createdAtUtc)}
              </p>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ClipboardList className="size-4" />
                <span className="text-xs font-medium uppercase tracking-[0.14em]">
                  Recursos
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {task.recursos.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {task.recursos.length > 0 && (
        <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Resources
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Recursos adjuntos
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {task.recursos.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-[22px] border border-border/70 bg-background/75 p-4 transition hover:bg-background"
              >
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {resource.tipo === 1 ? (
                    <LinkIcon className="size-4.5" />
                  ) : (
                    <Paperclip className="size-4.5" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {resource.nombre}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {resource.tipo === 1 ? 'Link' : 'Archivo'}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Submissions
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Entregas de alumnos
            </h2>
          </div>

          <div className="relative min-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por alumno..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPageNumber(1)
              }}
              className="h-11 rounded-2xl border-border/70 bg-background/80 pl-10 shadow-sm"
            />
          </div>
        </div>

        {submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay entregas para esta tarea.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const entregaEstado = getEstadoEntregaConfig(submission.estadoEntrega)
              const feedbackEstado = getEstadoCorreccionConfig(submission.feedbackVigente?.estado)

              return (
                <article
                  key={submission.entregaId}
                  className="rounded-[26px] border border-border/70 bg-background/75 p-4 shadow-sm transition hover:-translate-y-[1px] hover:bg-background hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-foreground">
                          {submission.alumnoNombre} {submission.alumnoApellido}
                        </p>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${entregaEstado.className}`}
                        >
                          {entregaEstado.label}
                        </span>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${feedbackEstado.className}`}
                        >
                          {feedbackEstado.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>DNI: {submission.alumnoDni}</span>
                        <span>Entrega: {formatDateTime(submission.fechaEntregaUtc)}</span>
                        <span>{submission.tieneAdjuntos ? 'Con adjuntos' : 'Sin adjuntos'}</span>
                      </div>
                    </div>

                    <RowActions
                      actions={[
                        {
                          label: 'Ver entrega',
                          icon: Eye,
                          onClick: () =>
                            router.push(
                              `/teacher/courses/${courseId}/tasks/${taskId}/submissions/${submission.alumnoId}`
                            ),
                        },
                      ]}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Página {pageNumber} · {total} entregas en total
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              disabled={pageNumber === 1}
              onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </Button>

            <Button
              variant="outline"
              className="rounded-2xl"
              disabled={pageNumber * pageSize >= total}
              onClick={() => setPageNumber((prev) => prev + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}