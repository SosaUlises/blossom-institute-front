'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Archive,
  CalendarClock,
  Download,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Link as LinkIcon,
  Paperclip,
  Pencil,
  Search,
  ClipboardList,
  Megaphone,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/shared/user-avatar'
import { PersonAvatar } from '@/components/teacher/course-detail/course-people-ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { formatDateTime } from '@/lib/teacher/course-detail/formatters'
import type { SessionUser } from '@/lib/auth/session'
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

type FeedAuthor = Pick<
  SessionUser,
  'nombre' | 'apellido' | 'email' | 'avatarUrl'
>

type SubmissionSummaryLabel = {
  text: string
  tone: 'neutral' | 'attention' | 'complete'
}

function getAuthorName(author: FeedAuthor | null) {
  if (!author) return 'Docente'

  const fullName = `${author.nombre ?? ''} ${author.apellido ?? ''}`.trim()
  return fullName || author.email || 'Docente'
}

function normalizeDetailContent(value?: string | null) {
  return (
    value
      ?.replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim() || null
  )
}

function safeText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function formatBytes(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null
  }

  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

function formatPostDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return formatDateTime(value)

  const diffMs = Date.now() - date.getTime()
  const minuteMs = 60 * 1000
  const hourMs = 60 * minuteMs
  const dayMs = 24 * hourMs

  if (diffMs >= 0 && diffMs < 7 * dayMs) {
    if (diffMs < minuteMs) return 'Hace un momento'

    const minutes = Math.floor(diffMs / minuteMs)
    if (minutes < 60) {
      return minutes === 1 ? 'Hace 1 minuto' : `Hace ${minutes} minutos`
    }

    const hours = Math.floor(diffMs / hourMs)
    if (hours < 24) {
      return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`
    }

    const days = Math.floor(diffMs / dayMs)
    return days === 1 ? 'Hace 1 día' : `Hace ${days} días`
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatDueDateMeta(value?: string | null) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const datePart = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)

  const timePart = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)

  return `${datePart} · ${timePart}`
}

function getDueDateBadgeMeta(value?: string | null) {
  const formatted = formatDueDateMeta(value)

  if (!formatted || !value) return null

  const date = new Date(value)
  const isOverdue = !Number.isNaN(date.getTime()) && date.getTime() < Date.now()

  return {
    label: `${isOverdue ? 'Venció' : 'Vence'} ${formatted}`,
    className: 'border-border/60 bg-muted/45 text-muted-foreground',
  }
}

function getResourceIcon(resource: TeacherTaskDetail['recursos'][number]) {
  const contentType = safeText(resource.contentType)?.toLowerCase() ?? ''
  const name = safeText(resource.nombre)?.toLowerCase() ?? ''

  if (contentType.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/.test(name)) {
    return FileImage
  }

  if (contentType.startsWith('video/') || /\.(mp4|mov|webm)$/.test(name)) {
    return FileVideo
  }

  if (contentType.startsWith('audio/') || /\.(mp3|wav|ogg)$/.test(name)) {
    return FileAudio
  }

  if (
    contentType.includes('zip') ||
    contentType.includes('compressed') ||
    /\.(zip|rar|7z)$/.test(name)
  ) {
    return Archive
  }

  return resource.tipo === 1 ? LinkIcon : FileText
}

function isImageResource(resource: TeacherTaskDetail['recursos'][number]) {
  const contentType = safeText(resource.contentType)?.toLowerCase() ?? ''
  const name = safeText(resource.nombre)?.toLowerCase() ?? ''
  const url = safeText(resource.url)?.toLowerCase() ?? ''

  return (
    contentType.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/.test(name) ||
    /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/.test(url)
  )
}

function getSubmissionSummaryLabels(
  submissions: TeacherSubmissionListItem[],
): SubmissionSummaryLabel[] {
  if (submissions.length === 0) {
    return []
  }

  const pendingReviews = submissions.filter(
    (submission) => !submission.feedbackVigente,
  ).length

  if (pendingReviews > 0) {
    return [
      {
        text: `${submissions.length} ${
          submissions.length === 1 ? 'entrega recibida' : 'entregas recibidas'
        }`,
        tone: 'neutral',
      },
      {
        text: `${pendingReviews} ${
          pendingReviews === 1
            ? 'pendiente de corrección'
            : 'pendientes de corrección'
        }`,
        tone: 'attention',
      },
    ]
  }

  return [{ text: 'Todo corregido', tone: 'complete' }]
}

function getSubmissionSummaryClassName(tone: SubmissionSummaryLabel['tone']) {
  if (tone === 'attention') return 'text-amber-700 dark:text-amber-300'
  if (tone === 'complete') return 'text-emerald-700 dark:text-emerald-300'
  return 'text-muted-foreground'
}

function ResourceRow({
  resource,
}: {
  resource: TeacherTaskDetail['recursos'][number]
}) {
  const name = safeText(resource.nombre) ?? 'Recurso'
  const size = formatBytes(resource.sizeBytes)
  const isImage = isImageResource(resource)
  const Icon = getResourceIcon(resource)

  if (isImage) {
    return (
      <a
        href={resource.url}
        target="_blank"
        rel="noreferrer"
        className="group block overflow-hidden rounded-xl border border-border/60 bg-background/50 transition-colors hover:border-primary/25 dark:bg-background/35"
      >
        <img
          src={resource.url}
          alt={name}
          className="max-h-80 w-full bg-muted/20 object-contain transition-transform duration-200 group-hover:scale-[1.01]"
          loading="lazy"
        />
        <span className="flex items-center justify-between gap-3 border-t border-border/55 px-3 py-2">
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-5 text-foreground">
              {name}
            </span>
            <span className="block text-xs text-muted-foreground">
              {size ?? resource.contentType ?? 'Imagen'}
            </span>
          </span>
          <Download className="size-4 shrink-0 text-muted-foreground" />
        </span>
      </a>
    )
  }

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
            {name}
          </span>
          <span className="block text-xs text-muted-foreground">
            {resource.tipo === 1
              ? 'Link externo'
              : size ?? resource.contentType ?? 'Archivo adjunto'}
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
        label: 'Necesita cambios',
        className:
          'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        priority: 2,
      }
    default:
      return {
        label: 'Pendiente de corrección',
        className:
          'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
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
  const alumnoName = `${submission.alumnoNombre} ${submission.alumnoApellido}`.trim() || 'Alumno'
  const submittedOutOfTime =
    submission.estadoEntrega === EstadoEntrega.FueraDeTermino
  const submittedLabel = submittedOutOfTime
    ? `Entregó fuera de término el ${formatDateTime(submission.fechaEntregaUtc)}`
    : `Entregó el ${formatDateTime(submission.fechaEntregaUtc)}`
  const actionLabel = hasFeedback ? 'Ver corrección' : 'Corregir entrega'

  return (
    <article className="group min-w-0 rounded-xl border border-border/60 bg-background/55 px-3 py-3 transition-[background-color,border-color,box-shadow] duration-200 ease-out hover:border-primary/20 hover:bg-card hover:shadow-[0_3px_12px_rgba(15,23,42,0.025)] dark:bg-background/30 dark:hover:shadow-none sm:px-4">
      <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <PersonAvatar
            name={alumnoName}
            avatarUrl={submission.alumnoAvatarUrl}
            tone="student"
          />

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {alumnoName}
              </h3>
              <span
                className={`inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-4 ${reviewStatus.className}`}
              >
                {reviewStatus.label}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-4 text-muted-foreground">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5',
                  submittedOutOfTime && 'font-medium text-amber-700 dark:text-amber-300',
                )}
              >
                <CalendarClock className="size-3.5 shrink-0" />
                {submittedLabel}
              </span>

              {submission.tieneAdjuntos ? (
                <span className="inline-flex items-center gap-1.5">
                  <Paperclip className="size-3.5 shrink-0" />
                  Con adjuntos
                </span>
              ) : null}

              {submittedOutOfTime ? (
                <span className="font-medium text-amber-700 dark:text-amber-300">
                  {entregaEstado.label}
                </span>
              ) : null}

              {submission.feedbackVigente?.nota != null ? (
                <span className="font-semibold text-foreground">
                  Nota {submission.feedbackVigente.nota}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <Button
          variant={hasFeedback ? 'outline' : 'default'}
          className={cn(
            'h-9 w-full rounded-lg px-3 text-sm font-semibold shadow-none transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98] sm:w-fit md:justify-self-end',
            hasFeedback
              ? 'border-border/70 bg-background/70 text-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-primary'
              : '',
          )}
          onClick={onView}
        >
          {actionLabel}
        </Button>
      </div>
    </article>
  )
}

function TaskDetailSkeleton() {
  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">
        Cargando publicación.
      </p>
      <div aria-hidden="true" className="mx-auto max-w-5xl space-y-4">
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted/30" />

        <article className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:p-5">
          <div className="flex gap-3">
            <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted/40" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-4 w-36 animate-pulse rounded bg-muted/45" />
                  <div className="h-3 w-28 animate-pulse rounded bg-muted/30" />
                </div>
                <div className="h-8 w-8 animate-pulse rounded-lg bg-muted/25" />
              </div>

              <div className="mt-5 flex items-start justify-between gap-3">
                <div className="h-8 w-2/3 animate-pulse rounded-lg bg-muted/45" />
                <div className="hidden h-7 w-32 animate-pulse rounded-lg bg-muted/30 sm:block" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted/25" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-muted/25" />
              </div>
            </div>
          </div>
        </article>

        <section className="rounded-2xl border border-border/60 bg-card/95 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-5 w-44 animate-pulse rounded bg-muted/40" />
              <div className="h-4 w-36 animate-pulse rounded bg-muted/25" />
            </div>
            <div className="h-10 w-full animate-pulse rounded-xl bg-muted/25 sm:w-64" />
          </div>
          <div className="mt-4 space-y-2">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl border border-border/50 bg-background/45"
              />
            ))}
          </div>
        </section>
      </div>
    </>
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
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [author, setAuthor] = useState<FeedAuthor | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [submissionFilter, setSubmissionFilter] =
    useState<SubmissionFilter>('all')
  const [pageNumber, setPageNumber] = useState(1)
  const pageSize = 10

  useEffect(() => {
    let active = true

    const loadAuthor = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' })
        const result = (await response.json()) as Envelope<SessionUser>

        if (active && response.ok) {
          setAuthor(result.data ?? null)
        }
      } catch {
        if (active) setAuthor(null)
      }
    }

    void loadAuthor()

    return () => {
      active = false
    }
  }, [])

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

    try {
      setActionLoading('archive')
      setActionError(null)
      await archiveTeacherTask(courseId, taskId)
      setTask((current) =>
        current ? { ...current, estado: EstadoTarea.Archivada } : current,
      )
      setArchiveDialogOpen(false)
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
    if (submissions.length === 0) return 'Todavía no hay entregas'
    if (filteredSubmissions.length === 0) return 'Sin entregas con ese filtro'
    const start = (pageNumber - 1) * pageSize + 1
    const end = Math.min(pageNumber * pageSize, filteredSubmissions.length)

    return `Mostrando ${start}-${end} de ${filteredSubmissions.length} entregas`
  }, [
    filteredSubmissions.length,
    pageNumber,
    pageSize,
    submissions.length,
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
      <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-card/95 px-5 py-7 shadow-[0_1px_2px_rgba(15,23,42,0.025)]">
        <Empty className="border-0 p-0">
          <EmptyHeader>
            <EmptyTitle>No se encontró esta publicación</EmptyTitle>
            <EmptyDescription>
              Puede haber sido archivada o ya no estar disponible.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const authorName = getAuthorName(author)
  const content = normalizeDetailContent(task.consigna)
  const dueDateMeta = task.esAnuncio
    ? null
    : getDueDateBadgeMeta(task.fechaEntregaUtc)
  const submissionSummaryLabels = task.esAnuncio
    ? []
    : getSubmissionSummaryLabels(submissions)
  const TypeIcon = task.esAnuncio ? Megaphone : ClipboardList

  return (
    <div className="space-y-5">
      <div
        className={cn(
          'min-w-0 space-y-4',
          task.esAnuncio ? 'mx-auto max-w-3xl' : 'mx-auto max-w-5xl',
        )}
      >
        {actionError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {actionError}
          </div>
        ) : null}

        <article className="min-w-0 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90 sm:p-5">
          <div className="flex gap-3">
            <UserAvatar
              name={authorName}
              avatarUrl={author?.avatarUrl}
              size={42}
              className="mt-0.5 shrink-0 bg-primary/5"
              fallbackClassName="bg-primary/10 text-sm text-primary"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-5 text-foreground">
                    {authorName}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-4 text-muted-foreground">
                    <span>{formatPostDate(task.createdAtUtc)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <TypeIcon className="size-3.5" />
                      {task.esAnuncio ? 'Anuncio' : 'Tarea'}
                    </span>
                    {taskEstado && task.estado !== EstadoTarea.Publicada ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{taskEstado.label}</span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {task.estado === EstadoTarea.Borrador ? (
                    <Button
                      className="h-9 rounded-lg px-3 shadow-none"
                      disabled={actionLoading === 'publish'}
                      onClick={() => void handlePublish()}
                    >
                      {actionLoading === 'publish' ? 'Publicando...' : 'Publicar'}
                    </Button>
                  ) : null}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 rounded-lg text-muted-foreground transition-transform duration-150 ease-out hover:bg-muted/50 hover:text-foreground active:scale-[0.96]"
                        aria-label="Más acciones para esta publicación"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 rounded-xl">
                      <DropdownMenuItem
                        onSelect={() =>
                          router.push(
                            `/teacher/courses/${courseId}/tasks/${taskId}/edit`,
                          )
                        }
                      >
                        <Pencil className="size-4" />
                        Editar
                      </DropdownMenuItem>
                      {task.estado !== EstadoTarea.Archivada ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setArchiveDialogOpen(true)}
                          >
                            <Archive className="size-4" />
                            Archivar
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <h1 className="min-w-0 break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {task.titulo}
                </h1>

                {dueDateMeta ? (
                  <span
                    className={cn(
                      'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold leading-4',
                      dueDateMeta.className,
                    )}
                  >
                    <CalendarClock className="size-3.5" />
                    {dueDateMeta.label}
                  </span>
                ) : null}
              </div>

              {content ? (
                <p className="mt-3 break-words whitespace-pre-wrap text-[15px] leading-7 text-foreground/85">
                  {content}
                </p>
              ) : (
                <p className="mt-3 rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {task.esAnuncio
                    ? 'Este anuncio todavía no tiene contenido.'
                    : 'Esta tarea todavía no tiene consigna.'}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs leading-4">
                {submissionSummaryLabels.map((label) => (
                  <span
                    key={label.text}
                    className={cn(
                      'font-medium',
                      getSubmissionSummaryClassName(label.tone),
                    )}
                  >
                    {label.text}
                  </span>
                ))}
              </div>

              {task.recursos.length > 0 ? (
                <div className="mt-4 rounded-xl border border-border/60 bg-background/50 p-3 dark:bg-background/30">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Paperclip className="size-4 text-muted-foreground" />
                    Materiales
                  </div>

                  <div className="space-y-2">
                    {task.recursos.map((resource) => (
                      <ResourceRow key={resource.id} resource={resource} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </article>
      </div>

      {!task.esAnuncio && (
        <section className="mx-auto max-w-5xl rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:p-5">
          <div className="mb-4 space-y-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Entregas para corregir
                </h2>
                <p className="text-sm text-muted-foreground">
                  {submissions.length === 1
                    ? '1 trabajo recibido en esta tarea'
                    : `${submissions.length} trabajos recibidos en esta tarea`}
                </p>
              </div>

              <div className="relative w-full xl:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por alumno..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPageNumber(1)
                  }}
                  className="h-10 rounded-xl border-border/60 bg-background/75 pl-10 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { value: 'all', label: 'Todas' },
                { value: 'uncorrected', label: 'Sin corregir' },
                { value: 'approved', label: 'Aprobadas' },
                { value: 'changes', label: 'Necesita cambios' },
                { value: 'late', label: 'Fuera de término' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={submissionFilter === filter.value}
                  className={cn(
                    'min-h-9 rounded-full border px-3 py-1.5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15 active:scale-[0.98]',
                    submissionFilter === filter.value
                      ? 'border-transparent bg-secondary text-foreground dark:bg-muted/70'
                      : 'border-transparent bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:bg-muted/30',
                  )}
                  onClick={() => {
                    setSubmissionFilter(filter.value as SubmissionFilter)
                    setPageNumber(1)
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-5">
              <Empty className="border-0 p-0">
                <EmptyHeader>
                  <EmptyTitle>
                    {submissions.length === 0
                      ? 'Todavía no hay entregas'
                      : 'No hay entregas con ese filtro'}
                  </EmptyTitle>
                  <EmptyDescription>
                    {submissions.length === 0
                      ? 'Cuando los alumnos envíen sus trabajos, vas a poder revisarlos acá.'
                      : 'Probá con otra búsqueda o cambiá el filtro.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <div className="space-y-2">
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

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
            <p className="text-sm text-muted-foreground">{pageLabel}</p>

            <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex">
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

      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle>Archivar publicación</AlertDialogTitle>
            <AlertDialogDescription>
              "{task.titulo}" dejará de aparecer como publicación activa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading === 'archive'}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading === 'archive'}
              onClick={(event) => {
                event.preventDefault()
                void handleArchive()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading === 'archive' ? 'Archivando...' : 'Archivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
