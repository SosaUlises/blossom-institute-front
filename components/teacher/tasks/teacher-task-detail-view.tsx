'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  Link as LinkIcon,
  Paperclip,
  Search,
  ClipboardList,
  Megaphone,
  User,
  BadgeInfo,
  MessageSquareText,
  ChevronRight,
  Inbox,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RowActions } from '@/components/ui/row-actions'
import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { formatDateTime } from '@/lib/teacher/course-detail/formatters'
import type {
  TeacherTaskDetail,
  TeacherSubmissionsResponse,
  TeacherSubmissionListItem,
} from '@/lib/teacher/tasks/types'
import {
  getEstadoCorreccionConfig,
  getEstadoEntregaConfig,
  getEstadoTareaConfig,
} from '@/lib/teacher/tasks/utils'

type Props = {
  courseId: number
  taskId: number
}

type Envelope<T> = {
  message?: string
  data?: T
}

function DetailMetaCard({
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
      ? 'rounded-[24px] border border-primary/15 bg-primary/5 px-4 py-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]'
      : 'rounded-[24px] border border-border/60 bg-background/75 px-4 py-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]'

  const iconWrapClass =
    tone === 'highlight'
      ? 'bg-primary/10 text-primary'
      : 'bg-background text-muted-foreground'

  const labelClass = tone === 'highlight' ? 'text-primary/80' : 'text-muted-foreground'
  const valueClass = tone === 'highlight' ? 'text-primary' : 'text-foreground'

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-2">
        <div
          className={`flex size-9 items-center justify-center rounded-2xl ${iconWrapClass}`}
        >
          <Icon className="size-4" />
        </div>
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${labelClass}`}
        >
          {label}
        </span>
      </div>

      <p className={`mt-3 text-sm font-semibold leading-6 ${valueClass}`}>{value}</p>
    </div>
  )
}

function SubmissionCard({
  submission,
  courseId,
  taskId,
  onView,
}: {
  submission: TeacherSubmissionListItem
  courseId: number
  taskId: number
  onView: () => void
}) {
  const entregaEstado = getEstadoEntregaConfig(submission.estadoEntrega)
  const feedbackEstado = getEstadoCorreccionConfig(submission.feedbackVigente?.estado)

  return (
    <article className="relative rounded-[28px] border border-border/70 bg-card/95 p-5 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.16)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_24px_52px_-24px_rgba(30,42,68,0.22)] md:p-6">
      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.05),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.04),transparent_22%)]" />

      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <User className="size-3.5" />
                Alumno
              </div>

              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${entregaEstado.className}`}
              >
                {entregaEstado.label}
              </span>

              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${feedbackEstado.className}`}
              >
                {feedbackEstado.label}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {submission.alumnoNombre} {submission.alumnoApellido}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Seguimiento de entrega, adjuntos y estado de corrección.
              </p>
            </div>
          </div>

          <div className="pl-0 xl:pl-2">
            <RowActions
              actions={[
                {
                  label: 'Ver entrega',
                  icon: FileText,
                  onClick: onView,
                },
              ]}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">

          <DetailMetaCard
            icon={CalendarClock}
            label="Entrega"
            value={formatDateTime(submission.fechaEntregaUtc)}
            tone="highlight"
          />

          <DetailMetaCard
            icon={Paperclip}
            label="Adjuntos"
            value={submission.tieneAdjuntos ? 'Con archivos adjuntos' : 'Sin archivos adjuntos'}
          />
        </div>
      </div>
    </article>
  )
}

function TaskDetailSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border/70 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(30,42,68,0.24)] md:p-8">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="h-10 w-40 animate-pulse rounded-2xl bg-muted/35" />
            <div className="flex gap-2">
              <div className="h-7 w-20 animate-pulse rounded-full bg-muted/35" />
              <div className="h-7 w-24 animate-pulse rounded-full bg-muted/35" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded-lg bg-muted/30" />
            <div className="h-9 w-3/5 animate-pulse rounded-xl bg-muted/40" />
            <div className="h-4 w-4/5 animate-pulse rounded-lg bg-muted/30" />
            <div className="h-4 w-2/3 animate-pulse rounded-lg bg-muted/25" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
            <div className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
            <div className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted/30" />
          <div className="h-7 w-48 animate-pulse rounded-lg bg-muted/35" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
            <div className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
          </div>
        </div>
      </section>
    </div>
  )
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

        const taskResponse = await fetch(
          `/api/teacher/courses/${courseId}/tasks/${taskId}`,
          { cache: 'no-store' },
        )

        const taskResult = (await taskResponse.json()) as Envelope<TeacherTaskDetail>

        if (!taskResponse.ok) {
          throw new Error(taskResult.message || 'No se pudo obtener la publicación.')
        }

        const taskData = taskResult.data ?? null
        setTask(taskData)

        if (taskData && !taskData.esAnuncio) {
          const query = new URLSearchParams({
            pageNumber: String(pageNumber),
            pageSize: String(pageSize),
          })

          if (debouncedSearch.trim()) {
            query.set('search', debouncedSearch.trim())
          }

          const submissionsResponse = await fetch(
            `/api/teacher/courses/${courseId}/tasks/${taskId}/submissions?${query.toString()}`,
            { cache: 'no-store' },
          )

          const submissionsResult =
            (await submissionsResponse.json()) as Envelope<TeacherSubmissionsResponse>

          if (!submissionsResponse.ok) {
            throw new Error(
              submissionsResult.message || 'No se pudieron obtener las entregas.',
            )
          }

          setSubmissions(submissionsResult.data?.items ?? [])
          setTotal(submissionsResult.data?.total ?? 0)
        } else {
          setSubmissions([])
          setTotal(0)
        }
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
    [task],
  )

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pageLabel = useMemo(() => {
    if (task?.esAnuncio) return null
    if (total === 0) return 'Sin entregas'
    return `Página ${pageNumber} de ${totalPages} · ${total} entregas`
  }, [pageNumber, total, totalPages, task?.esAnuncio])

  if (loading) {
    return <TaskDetailSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (!task) {
    return (
      <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
        <CardContent className="px-6 py-14">
          <Empty className="border-0 p-0">
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No se encontró la publicación</EmptyTitle>
              <EmptyDescription>
                La tarea o anuncio que buscás no está disponible.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-border/60 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)] md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.06),transparent_28%)]" />

        <div className="relative space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              onClick={() => router.push(`/teacher/courses/${courseId}`)}
            >
              <ArrowLeft className="mr-2 size-4" />
              Volver al curso
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                  task.esAnuncio
                    ? 'border-amber-500/15 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    : 'border-primary/15 bg-primary/5 text-primary'
                }`}
              >
                {task.esAnuncio ? (
                  <Megaphone className="size-3.5" />
                ) : (
                  <ClipboardList className="size-3.5" />
                )}
                {task.esAnuncio ? 'Anuncio' : 'Tarea'}
              </div>

              {taskEstado && (
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${taskEstado.className}`}
                >
                  {taskEstado.label}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {task.esAnuncio ? 'Detalle del anuncio' : 'Detalle de la tarea'}
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {task.titulo}
            </h1>

            <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
              {task.consigna?.trim()
                ? task.consigna
                : task.esAnuncio
                  ? 'Publicación informativa para el curso.'
                  : 'Sin consigna cargada para esta tarea.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <DetailMetaCard
              icon={task.esAnuncio ? Megaphone : CalendarClock}
              label={task.esAnuncio ? 'Tipo' : 'Fecha de entrega'}
              value={
                task.esAnuncio
                  ? 'Anuncio'
                  : task.fechaEntregaUtc
                    ? formatDateTime(task.fechaEntregaUtc)
                    : 'Sin fecha definida'
              }
              tone="highlight"
            />

            <DetailMetaCard
              icon={CalendarClock}
              label="Publicación"
              value={formatDateTime(task.createdAtUtc)}
            />

            <DetailMetaCard
              icon={Paperclip}
              label="Recursos"
              value={
                task.recursos.length === 1
                  ? '1 recurso adjunto'
                  : `${task.recursos.length} recursos adjuntos`
              }
            />
          </div>
        </div>
      </section>

      {task.recursos.length > 0 && (
        <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
          <div className="mb-5 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Recursos
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
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
                className="group flex items-center gap-4 rounded-[24px] border border-border/60 bg-background/75 p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-background hover:shadow-md"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-[1.02]">
                  {resource.tipo === 1 ? (
                    <LinkIcon className="size-4.5" />
                  ) : (
                    <Paperclip className="size-4.5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {resource.nombre}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {resource.tipo === 1 ? 'Link externo' : 'Archivo adjunto'}
                  </p>
                </div>

                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </section>
      )}

      {!task.esAnuncio && (
        <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Entregas
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Entregas de alumnos
              </h2>
            </div>

            <div className="rounded-[24px] border border-border/60 bg-background/75 p-3 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
              <div className="relative min-w-[280px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por alumno..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPageNumber(1)
                  }}
                  className="h-11 rounded-2xl border border-border/70 bg-background/85 pl-10 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] focus:ring-4 focus:ring-primary/15"
                />
              </div>
            </div>
          </div>

          {submissions.length === 0 ? (
            <Card className="rounded-[28px] border border-border/60 bg-background/50 shadow-none">
              <CardContent className="px-6 py-14">
                <Empty className="border-0 p-0">
                  <EmptyMedia variant="icon">
                    <MessageSquareText />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>No hay entregas</EmptyTitle>
                    <EmptyDescription>
                      Todavía no se registraron entregas para esta tarea.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <SubmissionCard
                  key={submission.entregaId}
                  submission={submission}
                  courseId={courseId}
                  taskId={taskId}
                  onView={() =>
                    router.push(
                      `/teacher/courses/${courseId}/tasks/${taskId}/submissions/${submission.alumnoId}`,
                    )
                  }
                />
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">{pageLabel}</p>

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
                disabled={pageNumber >= totalPages || total === 0}
                onClick={() => setPageNumber((prev) => prev + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}