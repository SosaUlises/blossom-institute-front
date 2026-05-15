'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Archive,
  ArrowLeft,
  CalendarClock,
  Clock3,
  FileText,
  Link as LinkIcon,
  Paperclip,
  Pencil,
  Search,
  ClipboardList,
  Megaphone,
  MessageSquareText,
  ChevronRight,
  Inbox,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  getEstadoEntregaConfig,
  getEstadoTareaConfig,
} from '@/lib/teacher/tasks/utils'
import { archiveTeacherTask, updateTeacherTask } from '@/lib/teacher/tasks/task-api'
import { EstadoCorreccion, EstadoEntrega, EstadoTarea } from '@/lib/teacher/tasks/types'
import { cn } from '@/lib/utils'

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
      ? 'rounded-2xl border border-primary/15 bg-primary/5 px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)]'
      : 'rounded-2xl border border-border/60 bg-background/75 px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)]'

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

function InlineMetaChip({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/65 px-2.5 py-1 text-xs font-medium text-muted-foreground dark:bg-background/35">
      <Icon className="size-3.5" />
      {children}
    </span>
  )
}

function ResourceRow({
  resource,
}: {
  resource: TeacherTaskDetail['recursos'][number]
}) {
  const Icon = resource.tipo === 1 ? LinkIcon : Paperclip

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noreferrer"
      className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2 transition-colors duration-200 hover:border-primary/25 hover:bg-primary/5 dark:bg-background/35"
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>

        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold leading-5 text-foreground">
            {resource.nombre || 'Recurso'}
          </span>
          <span className="block text-xs text-muted-foreground">
            {resource.tipo === 1 ? 'Link externo' : 'Archivo adjunto'}
          </span>
        </span>
      </span>

      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
    </a>
  )
}

type SubmissionFilter =
  | 'all'
  | 'uncorrected'
  | 'approved'
  | 'changes'
  | 'late'

function getSubmissionReviewStatus(submission: TeacherSubmissionListItem) {
  switch (submission.feedbackVigente?.estado) {
    case EstadoCorreccion.Aprobado:
      return {
        label: 'Aprobada',
        className:
          'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        priority: 3,
      }
    case EstadoCorreccion.Rehacer:
      return {
        label: 'Pedir cambios',
        className:
          'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        priority: 2,
      }
    default:
      return {
        label: 'Sin corregir',
        className:
          'border-border/60 bg-background/70 text-foreground dark:bg-background/35',
        priority: 0,
      }
  }
}

function getSubmissionSortPriority(submission: TeacherSubmissionListItem) {
  const reviewStatus = getSubmissionReviewStatus(submission)

  if (reviewStatus.priority === 0) return 0
  if (submission.estadoEntrega === EstadoEntrega.FueraDeTermino) return 1
  return reviewStatus.priority + 1
}

function SubmissionRow({
  submission,
  onView,
}: {
  submission: TeacherSubmissionListItem
  courseId: number
  taskId: number
  onView: () => void
}) {
  const entregaEstado = getEstadoEntregaConfig(submission.estadoEntrega)
  const reviewStatus = getSubmissionReviewStatus(submission)
  const hasFeedback = Boolean(submission.feedbackVigente)

  return (
    <article className="min-w-0 rounded-xl border border-border/60 bg-background/60 px-3 py-3 transition-colors duration-200 hover:border-primary/20 hover:bg-card dark:bg-background/35 sm:px-4">
      <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.45fr)_minmax(0,0.65fr)_108px] xl:items-center">
        <div className="order-1 min-w-0 xl:order-none">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {submission.alumnoNombre} {submission.alumnoApellido}
          </h3>
        </div>

        <div className="order-3 min-w-0 space-y-1 xl:order-none xl:space-y-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground xl:hidden">
            Entrega
          </p>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${entregaEstado.className}`}
          >
            {entregaEstado.label}
          </span>
        </div>

        <div className="order-4 min-w-0 space-y-1 text-sm text-muted-foreground xl:order-none xl:space-y-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] xl:hidden">
            Fecha
          </p>
          <p className="truncate">{formatDateTime(submission.fechaEntregaUtc)}</p>
        </div>

        <div className="order-5 min-w-0 space-y-1 xl:order-none xl:space-y-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground xl:hidden">
            Corrección
          </p>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${reviewStatus.className}`}
          >
            {reviewStatus.label}
          </span>
        </div>

        <div className="order-6 min-w-0 space-y-1 text-sm font-semibold text-foreground xl:order-none xl:space-y-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground xl:hidden">
            Nota
          </p>
          <p>{submission.feedbackVigente?.nota ?? '—'}</p>
        </div>

        <div className="order-7 min-w-0 space-y-1 text-sm text-muted-foreground xl:order-none xl:space-y-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] xl:hidden">
            Adjuntos
          </p>
          <span className="inline-flex items-center gap-1.5">
            <Paperclip className="size-3.5" />
            {submission.tieneAdjuntos ? 'Sí' : 'No'}
          </span>
        </div>

        <Button
          variant={hasFeedback ? 'outline' : 'default'}
          className={cn(
            'order-2 h-9 w-full rounded-lg px-3 text-sm shadow-none xl:order-none xl:w-fit',
            hasFeedback
              ? 'border-border/70 bg-background/70 hover:border-primary/25 hover:bg-primary/5 hover:text-primary'
              : '',
          )}
          onClick={onView}
        >
          {hasFeedback ? 'Ver entrega' : 'Corregir'}
        </Button>
      </div>
    </article>
  )
}

function TaskDetailSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/70 bg-card/95 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.035)] md:p-8">
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
            <div className="h-24 animate-pulse rounded-2xl bg-muted/30" />
            <div className="h-24 animate-pulse rounded-2xl bg-muted/30" />
            <div className="h-24 animate-pulse rounded-2xl bg-muted/30" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card/95 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted/30" />
          <div className="h-7 w-48 animate-pulse rounded-lg bg-muted/35" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-24 animate-pulse rounded-2xl bg-muted/30" />
            <div className="h-24 animate-pulse rounded-2xl bg-muted/30" />
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
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<'publish' | 'archive' | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [submissionFilter, setSubmissionFilter] =
    useState<SubmissionFilter>('all')
  const [pageNumber, setPageNumber] = useState(1)
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
          const batchSize = 100
          const fetchPage = async (targetPage: number) => {
            const query = new URLSearchParams({
              pageNumber: String(targetPage),
              pageSize: String(batchSize),
            })

            const response = await fetch(
              `/api/teacher/courses/${courseId}/tasks/${taskId}/submissions?${query.toString()}`,
              { cache: 'no-store' },
            )
            const result =
              (await response.json()) as Envelope<TeacherSubmissionsResponse>

            if (!response.ok) {
              throw new Error(result.message || 'No se pudieron obtener las entregas.')
            }

            return result.data
          }

          const firstPage = await fetchPage(1)
          const firstItems = firstPage?.items ?? []
          const totalItems = firstPage?.total ?? firstItems.length
          const totalRemotePages = Math.max(1, Math.ceil(totalItems / batchSize))

          const remainingPages =
            totalRemotePages > 1
              ? await Promise.all(
                  Array.from({ length: totalRemotePages - 1 }, (_, index) =>
                    fetchPage(index + 2),
                  ),
                )
              : []

          const allItems = [
            ...firstItems,
            ...remainingPages.flatMap((page) => page?.items ?? []),
          ]

          setSubmissions(allItems)
        } else {
          setSubmissions([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId, taskId])

  const taskEstado = useMemo(
    () => (task ? getEstadoTareaConfig(task.estado) : null),
    [task],
  )

  const handlePublish = async () => {
    if (!task) return

    try {
      setActionLoading('publish')
      setActionError(null)

      await updateTeacherTask(courseId, taskId, {
        titulo: task.titulo,
        consigna: task.consigna ?? null,
        fechaEntregaUtc: task.fechaEntregaUtc,
        estado: EstadoTarea.Publicada,
        recursos: task.recursos.map((resource) => ({
          tipo: resource.tipo,
          url: resource.url,
          nombre: resource.nombre ?? null,
          storageProvider: resource.storageProvider ?? null,
          storageKey: resource.storageKey ?? null,
          contentType: resource.contentType ?? null,
          sizeBytes: resource.sizeBytes ?? null,
        })),
      })

      setTask((current) =>
        current ? { ...current, estado: EstadoTarea.Publicada } : current,
      )
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo publicar.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleArchive = async () => {
    if (!task) return

    const confirmed = window.confirm('¿Querés archivar esta publicación?')
    if (!confirmed) return

    try {
      setActionLoading('archive')
      setActionError(null)
      await archiveTeacherTask(courseId, taskId)
      setTask((current) =>
        current ? { ...current, estado: EstadoTarea.Archivada } : current,
      )
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo archivar.')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredSubmissions = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase()

    return submissions
      .filter((submission) => {
        if (
          normalizedSearch &&
          !`${submission.alumnoNombre} ${submission.alumnoApellido} ${submission.alumnoDni}`
            .toLowerCase()
            .includes(normalizedSearch)
        ) {
          return false
        }

        switch (submissionFilter) {
          case 'uncorrected':
            return !submission.feedbackVigente
          case 'approved':
            return submission.feedbackVigente?.estado === EstadoCorreccion.Aprobado
          case 'changes':
            return submission.feedbackVigente?.estado === EstadoCorreccion.Rehacer
          case 'late':
            return submission.estadoEntrega === EstadoEntrega.FueraDeTermino
          default:
            return true
        }
      })
      .sort((a, b) => {
        const priorityDiff =
          getSubmissionSortPriority(a) - getSubmissionSortPriority(b)
        if (priorityDiff !== 0) return priorityDiff

        return (
          new Date(b.fechaEntregaUtc).getTime() -
          new Date(a.fechaEntregaUtc).getTime()
        )
      })
  }, [debouncedSearch, submissionFilter, submissions])

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / pageSize))
  const visibleSubmissions = useMemo(() => {
    const start = (pageNumber - 1) * pageSize
    return filteredSubmissions.slice(start, start + pageSize)
  }, [filteredSubmissions, pageNumber])

  const pageLabel = useMemo(() => {
    if (task?.esAnuncio) return null
    if (submissions.length === 0) return 'Sin entregas'
    if (filteredSubmissions.length === 0) return 'Sin resultados'
    return `Página ${pageNumber} de ${totalPages} · ${filteredSubmissions.length} entregas`
  }, [
    filteredSubmissions.length,
    pageNumber,
    submissions.length,
    totalPages,
    task?.esAnuncio,
  ])

  if (loading) {
    return <TaskDetailSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (!task) {
    return (
      <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
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
      <div
        className={cn(
          'min-w-0 space-y-4',
          task.esAnuncio ? 'mx-auto max-w-3xl' : 'mx-auto max-w-5xl',
        )}
      >
        <header className="space-y-4 border-b border-border/60 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="ghost"
              className="h-9 w-fit justify-start rounded-lg px-2 text-muted-foreground hover:text-foreground"
              onClick={() => router.push(`/teacher/courses/${courseId}`)}
            >
              <ArrowLeft className="mr-2 size-4" />
              Volver al curso
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="h-9 rounded-lg border-border/70 bg-background/70 px-3"
                onClick={() =>
                  router.push(`/teacher/courses/${courseId}/tasks/${taskId}/edit`)
                }
              >
                <Pencil className="mr-2 size-4" />
                Editar
              </Button>

              {task.estado === EstadoTarea.Borrador ? (
                <Button
                  className="h-9 rounded-lg px-3 shadow-none"
                  disabled={actionLoading === 'publish'}
                  onClick={() => void handlePublish()}
                >
                  {actionLoading === 'publish' ? 'Publicando...' : 'Publicar'}
                </Button>
              ) : null}

              {task.estado !== EstadoTarea.Archivada ? (
                <Button
                  variant="outline"
                  className="h-9 rounded-lg border-border/70 bg-background/70 px-3 text-muted-foreground hover:border-amber-500/25 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300"
                  disabled={actionLoading === 'archive'}
                  onClick={() => void handleArchive()}
                >
                  <Archive className="mr-2 size-4" />
                  {actionLoading === 'archive' ? 'Archivando...' : 'Archivar'}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                  task.esAnuncio
                    ? 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                    : 'border-primary/15 bg-primary/5 text-primary',
                )}
              >
                {task.esAnuncio ? (
                  <Megaphone className="size-3.5" />
                ) : (
                  <ClipboardList className="size-3.5" />
                )}
                {task.esAnuncio ? 'Anuncio' : 'Tarea'}
              </span>

              {taskEstado ? (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
                    taskEstado.className,
                  )}
                >
                  {taskEstado.label}
                </span>
              ) : null}
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {task.titulo}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <InlineMetaChip icon={Clock3}>
                  {task.estado === EstadoTarea.Borrador ? 'Creada' : 'Publicada'}{' '}
                  {formatDateTime(task.createdAtUtc)}
                </InlineMetaChip>

                {!task.esAnuncio ? (
                  <InlineMetaChip icon={CalendarClock}>
                    {task.fechaEntregaUtc
                      ? `Entrega ${formatDateTime(task.fechaEntregaUtc)}`
                      : 'Sin fecha de entrega'}
                  </InlineMetaChip>
                ) : null}

                <InlineMetaChip icon={Paperclip}>
                  {task.recursos.length === 1
                    ? '1 recurso'
                    : `${task.recursos.length} recursos`}
                </InlineMetaChip>
              </div>
            </div>
          </div>
        </header>

        {actionError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {actionError}
          </div>
        ) : null}

        <section className="min-w-0 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5">
          <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
            <FileText className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {task.esAnuncio ? 'Publicación' : 'Consigna'}
            </h2>
          </div>

          {task.consigna?.trim() ? (
            <p className="whitespace-pre-wrap text-base leading-8 text-foreground/85">
              {task.consigna}
            </p>
          ) : (
            <p className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-3 text-sm leading-6 text-muted-foreground dark:bg-muted/10">
              {task.esAnuncio
                ? 'Esta publicación todavía no tiene contenido.'
                : 'Esta tarea todavía no tiene consigna.'}
            </p>
          )}
        </section>

        {task.recursos.length > 0 ? (
          <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
              <Paperclip className="size-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Materiales
              </h2>
            </div>

            <div className="space-y-2">
              {task.recursos.map((resource) => (
                <ResourceRow key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {!task.esAnuncio && (
        <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5">
          <div className="mb-4 space-y-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Entregas
                </h2>
                <p className="text-sm text-muted-foreground">
                  {submissions.length === 1
                    ? '1 entrega registrada'
                    : `${submissions.length} entregas registradas`}
                </p>
              </div>

              <div className="relative w-full xl:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar alumno..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPageNumber(1)
                  }}
                  className="h-10 rounded-xl border-border/60 bg-background/75 pl-10 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Todas' },
                { value: 'uncorrected', label: 'Sin corregir' },
                { value: 'approved', label: 'Aprobadas' },
                { value: 'changes', label: 'Pedir cambios' },
                { value: 'late', label: 'Fuera de término' },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  type="button"
                  variant={submissionFilter === filter.value ? 'default' : 'outline'}
                  className={cn(
                    'h-9 rounded-lg px-3 text-sm shadow-none',
                    submissionFilter !== filter.value &&
                      'border-border/70 bg-background/70 text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-primary',
                  )}
                  onClick={() => {
                    setSubmissionFilter(filter.value as SubmissionFilter)
                    setPageNumber(1)
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <Card className="rounded-2xl border border-border/60 bg-background/50 shadow-none">
              <CardContent className="px-5 py-8">
                <Empty className="border-0 p-0">
                  <EmptyMedia variant="icon">
                    <MessageSquareText />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>
                      {submissions.length === 0
                        ? 'Sin entregas todavía'
                        : 'Sin resultados'}
                    </EmptyTitle>
                    <EmptyDescription>
                      {submissions.length === 0
                        ? 'Cuando los alumnos entreguen, las vas a ver acá.'
                        : 'No hay entregas que coincidan con la búsqueda o el filtro.'}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              <div className="hidden min-w-0 grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.45fr)_minmax(0,0.65fr)_108px] gap-3 px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground xl:grid">
                <span>Alumno</span>
                <span>Entrega</span>
                <span>Fecha</span>
                <span>Corrección</span>
                <span>Nota</span>
                <span>Adjuntos</span>
                <span>Acción</span>
              </div>

              {visibleSubmissions.map((submission) => (
                <SubmissionRow
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
                className="rounded-lg border-border/70 bg-background/70 transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40"
                disabled={pageNumber === 1}
                onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </Button>

              <Button
                variant="outline"
                className="rounded-lg border-border/70 bg-background/70 transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40"
                disabled={pageNumber >= totalPages || filteredSubmissions.length === 0}
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
