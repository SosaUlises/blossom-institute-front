'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Archive,
  CalendarClock,
  ClipboardList,
  FileText,
  Inbox,
  Megaphone,
  MoreHorizontal,
  Paperclip,
  Pencil,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { UserAvatar } from '@/components/shared/user-avatar'
import type { SessionUser } from '@/lib/auth/session'
import { formatDateTime } from '@/lib/teacher/course-detail/formatters'
import type {
  TeacherTaskListItem,
  TeacherTaskListResponse,
} from '@/lib/teacher/tasks/types'
import { EstadoTarea } from '@/lib/teacher/tasks/types'
import { getEstadoTareaConfig } from '@/lib/teacher/tasks/utils'
import { archiveTeacherTask } from '@/lib/teacher/tasks/task-api'
import { cn } from '@/lib/utils'
import {
  CourseTabEmptyState,
  CourseTabErrorState,
  CourseTabSearchField,
  CourseTabSkeletonList,
} from './course-tab-ui'

type Envelope<T> = {
  message?: string
  data?: T
}

const SELECT_ALL = 'all'
const DEFAULT_ESTADO = String(EstadoTarea.Publicada)
const FEED_WIDTH = 'max-w-3xl'
const publicationTone = {
  announcement: {
    card: 'bg-card border-border/60 hover:border-border transition-colors',
    rail: 'bg-slate-400/80 dark:bg-slate-500/65',
    iconBox: 'text-slate-500 dark:text-slate-300',
    badge: 'bg-muted/40 text-muted-foreground border-border/60',
    cta: 'bg-primary text-primary-foreground hover:bg-primary/90',
  },
  task: {
    card: 'bg-card border-border/60 hover:border-border transition-colors',
    rail: 'bg-primary',
    iconBox: 'text-primary',
    badge: 'bg-primary/10 text-primary border-primary/20',
    cta: 'bg-primary text-primary-foreground hover:bg-primary/90',
  },
} as const
const STATUS_FILTERS = [
  { value: DEFAULT_ESTADO, label: 'Publicadas' },
  { value: SELECT_ALL, label: 'Todas' },
  { value: String(EstadoTarea.Borrador), label: 'Borradores' },
  { value: String(EstadoTarea.Archivada), label: 'Archivadas' },
] as const

type FeedAuthor = Pick<
  SessionUser,
  'nombre' | 'apellido' | 'email' | 'avatarUrl'
>

type TaskPreviewFields = TeacherTaskListItem & {
  consigna?: string | null
  descripcion?: string | null
  contenido?: string | null
  body?: string | null
  recursos?: unknown[] | null
  recursosCount?: number | null
  tieneRecursos?: boolean | null
  entregasRecibidasCount?: number | null
  entregasPendientesCorreccionCount?: number | null
  pendientesCorreccionCount?: number | null
}

type TaskResourceMeta = {
  total: number
  links: number
  files: number
  pdfs: number
  summary?: string | null
}

type TaskActivityLabel = {
  text: string
  tone: 'neutral' | 'attention' | 'complete'
}

type PublicationType = keyof typeof publicationTone

type PublicationAttachment = {
  id?: number | string | null
  tipo?: number | string | null
  url: string
  nombre: string
  contentType?: string | null
  sizeBytes?: number | null
}

function getAuthorName(author: FeedAuthor | null) {
  if (!author) return 'Blossom Institute'

  const fullName = `${author.nombre ?? ''} ${author.apellido ?? ''}`.trim()
  return fullName || author.email || 'Blossom Institute'
}

function normalizePreviewText(value?: string | null) {
  return (
    value
      ?.replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || null
  )
}

function getTaskPreview(task: TeacherTaskListItem, fallback?: string | null) {
  const previewTask = task as TaskPreviewFields

  return (
    normalizePreviewText(previewTask.contentPreview) ||
    normalizePreviewText(previewTask.consigna) ||
    normalizePreviewText(previewTask.descripcion) ||
    normalizePreviewText(previewTask.contenido) ||
    normalizePreviewText(previewTask.body) ||
    normalizePreviewText(fallback)
  )
}

function getTaskResourceCount(
  task: TeacherTaskListItem,
  fallback?: number | null,
) {
  const previewTask = task as TaskPreviewFields

  if (Array.isArray(previewTask.recursos)) return previewTask.recursos.length

  const feedCount = Number(previewTask.resourcesCount)
  if (Number.isFinite(feedCount) && feedCount >= 0) return feedCount

  const count = Number(previewTask.recursosCount)
  if (Number.isFinite(count) && count >= 0) return count

  if (previewTask.tieneRecursos === false) return 0

  if (typeof fallback === 'number') return fallback

  return null
}

function getResourceCountLabel(count: number) {
  return `${count} ${count === 1 ? 'recurso adjunto' : 'recursos adjuntos'}`
}

function formatAttachmentSize(value?: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return null
  }

  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

function isImageAttachment(attachment: PublicationAttachment) {
  const contentType = attachment.contentType?.toLowerCase() ?? ''
  const name = attachment.nombre.toLowerCase()

  return (
    contentType.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|svg)$/.test(name)
  )
}

function getPublicationAttachments(task: TeacherTaskListItem) {
  const previewTask = task as TaskPreviewFields
  if (!Array.isArray(previewTask.recursos)) return []

  return previewTask.recursos
    .map((resource): PublicationAttachment | null => {
      const record = resource as unknown as Record<string, unknown>
      const url = String(record.url ?? '').trim()

      if (!url) return null

      return {
        id: (record.id as number | string | null | undefined) ?? url,
        tipo: (record.tipo as number | string | null | undefined) ?? null,
        url,
        nombre: String(record.nombre ?? 'Adjunto').trim() || 'Adjunto',
        contentType:
          typeof record.contentType === 'string' ? record.contentType : null,
        sizeBytes:
          typeof record.sizeBytes === 'number' ? record.sizeBytes : null,
      }
    })
    .filter(
      (attachment): attachment is PublicationAttachment => attachment !== null,
    )
}

function getResourceMetaFromResources(resources?: unknown[] | null): TaskResourceMeta | null {
  if (!Array.isArray(resources)) return null

  return resources.reduce<TaskResourceMeta>(
    (meta, resource) => {
      const record = resource as Record<string, unknown>
      const tipo = Number(record.tipo)
      const name = String(record.nombre ?? '').toLowerCase()
      const contentType = String(record.contentType ?? '').toLowerCase()
      const isPdf = contentType.includes('pdf') || name.endsWith('.pdf')

      return {
        total: meta.total + 1,
        links: meta.links + (tipo === 1 ? 1 : 0),
        files: meta.files + (tipo === 2 ? 1 : 0),
        pdfs: meta.pdfs + (isPdf ? 1 : 0),
      }
    },
    { total: 0, links: 0, files: 0, pdfs: 0 },
  )
}

function getTaskResourceMeta(
  task: TeacherTaskListItem,
  fallback?: TaskResourceMeta | null,
) {
  const previewTask = task as TaskPreviewFields
  const feedCount = getTaskResourceCount(task)

  if (feedCount !== null && previewTask.resourceSummary) {
    return {
      total: feedCount,
      links: 0,
      files: 0,
      pdfs: 0,
      summary: previewTask.resourceSummary,
    }
  }

  const resourceMeta = getResourceMetaFromResources(previewTask.recursos)

  if (resourceMeta) return resourceMeta

  if (fallback && fallback.total > 0) return fallback

  const count = getTaskResourceCount(task)

  if (count !== null) {
    return {
      total: count,
      links: 0,
      files: 0,
      pdfs: 0,
    }
  }

  return null
}

function getResourceMetaLabel(meta: TaskResourceMeta) {
  if (meta.total <= 0) return null

  if (meta.summary) return meta.summary

  if (meta.links > 0 || meta.files > 0 || meta.pdfs > 0) {
    const parts = []

    if (meta.links > 0) {
      parts.push(`${meta.links} ${meta.links === 1 ? 'enlace' : 'enlaces'}`)
    }

    if (meta.pdfs > 0) {
      parts.push(
        `${meta.pdfs} ${meta.pdfs === 1 ? 'archivo PDF' : 'archivos PDF'}`,
      )
    }

    const otherFiles = Math.max(0, meta.files - meta.pdfs)
    if (otherFiles > 0) {
      parts.push(
        `${otherFiles} ${otherFiles === 1 ? 'archivo' : 'archivos'}`,
      )
    }

    if (parts.length > 0) return parts.join(' · ')
  }

  return getResourceCountLabel(meta.total)
}

function getOptionalNumberField(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (!(key in record)) continue

    const value = Number(record[key])
    if (Number.isFinite(value) && value >= 0) return value
  }

  return null
}

function getTaskActivityLabels(task: TeacherTaskListItem) {
  const record = task as unknown as Record<string, unknown>
  const receivedCount = getOptionalNumberField(record, [
    'submissionsCount',
    'entregasRecibidasCount',
    'entregasRecibidas',
    'totalEntregas',
  ])
  const pendingReviewCount = getOptionalNumberField(record, [
    'pendingReviewsCount',
    'entregasPendientesCorreccionCount',
    'entregasPendientesCorreccion',
    'pendientesCorreccionCount',
    'pendingCorrectionsCount',
  ])

  const labels: TaskActivityLabel[] = []

  if (receivedCount === null) return labels

  if (receivedCount === 0) {
    labels.push({ text: 'Aún sin entregas', tone: 'neutral' })
    return labels
  }

  labels.push({
    text: `${receivedCount} ${receivedCount === 1 ? 'entrega recibida' : 'entregas recibidas'}`,
    tone: 'neutral',
  })

  if (pendingReviewCount !== null && pendingReviewCount > 0) {
    labels.push({
      text: `${pendingReviewCount} ${pendingReviewCount === 1 ? 'pendiente de corrección' : 'pendientes de corrección'}`,
      tone: 'attention',
    })
  } else if (pendingReviewCount === 0) {
    labels.push({ text: 'Todo corregido', tone: 'complete' })
  }

  return labels
}

function getTaskActivityClassName(tone: TaskActivityLabel['tone']) {
  if (tone === 'attention') {
    return 'font-medium text-amber-700 dark:text-amber-300'
  }

  if (tone === 'complete') {
    return 'font-medium text-emerald-700 dark:text-emerald-300'
  }

  return 'text-muted-foreground'
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

function isAnnouncementPost(task: TeacherTaskListItem) {
  const publicationType = task.publicationType?.toLowerCase()

  if (publicationType === 'announcement') return true
  if (publicationType === 'task') return false

  return task.esAnuncio
}

function getDueDateValue(task: TeacherTaskListItem) {
  return task.dueDateUtc ?? task.fechaEntregaUtc
}

function getTaskAuthor(task: TeacherTaskListItem, fallback: FeedAuthor | null) {
  return {
    name: task.authorName || getAuthorName(fallback),
    avatarUrl: task.authorAvatarUrl ?? fallback?.avatarUrl ?? null,
  }
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

function getTaskCorrectionBadge(task: TeacherTaskListItem) {
  const record = task as unknown as Record<string, unknown>
  const receivedCount = getOptionalNumberField(record, [
    'submissionsCount',
    'entregasRecibidasCount',
    'entregasRecibidas',
    'totalEntregas',
  ])
  const pendingReviewCount = getOptionalNumberField(record, [
    'pendingReviewsCount',
    'entregasPendientesCorreccionCount',
    'entregasPendientesCorreccion',
    'pendientesCorreccionCount',
    'pendingCorrectionsCount',
  ])

  if (pendingReviewCount !== null && pendingReviewCount > 0) {
    return {
      text: `${pendingReviewCount} ${pendingReviewCount === 1 ? 'pendiente de corrección' : 'pendientes de corrección'}`,
      className:
        'border-amber-500/20 bg-amber-500/[0.06] text-amber-700 dark:text-amber-300',
    }
  }

  if (receivedCount === 0) {
    return {
      text: 'Aún sin entregas',
      className:
        'border-border/60 bg-muted/40 text-muted-foreground dark:bg-muted/25',
    }
  }

  if (pendingReviewCount === 0 && receivedCount !== null && receivedCount > 0) {
    return {
      text: 'Todo corregido',
      className:
        'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-300',
    }
  }

  return null
}

function getPublicationViewModel(task: TeacherTaskListItem) {
  const type: PublicationType = isAnnouncementPost(task) ? 'announcement' : 'task'
  const pendingReviewsCount = Number(task.pendingReviewsCount)
  const hasPendingReviews =
    Number.isFinite(pendingReviewsCount) && pendingReviewsCount > 0

  if (type === 'announcement') {
    return {
      type,
      tone: publicationTone.announcement,
      label: 'Anuncio',
      icon: Megaphone,
      primaryActionLabel: 'Ver anuncio',
      badgeCorreccion: null,
    }
  }

  return {
    type,
    tone: publicationTone.task,
    label: 'Tarea',
    icon: ClipboardList,
    primaryActionLabel: hasPendingReviews
      ? 'Corregir entregas'
      : 'Revisar entregas',
    badgeCorreccion: getTaskCorrectionBadge(task),
  }
}

function CourseFeedSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90"
    >
      <div className="p-3 sm:p-3.5">
        <div className="flex gap-2.5">
          <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted/40" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="space-y-1.5">
              <div className="h-4 w-32 animate-pulse rounded-md bg-muted/40" />
              <div className="h-3 w-52 animate-pulse rounded-md bg-muted/30" />
            </div>
            <div className="h-5 w-2/3 animate-pulse rounded-md bg-muted/45" />
            <div className="space-y-1.5">
              <div className="h-3 w-full animate-pulse rounded-md bg-muted/25" />
              <div className="h-3 w-3/4 animate-pulse rounded-md bg-muted/20" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="h-9 w-32 animate-pulse rounded-lg bg-muted/30" />
              <div className="size-9 animate-pulse rounded-lg bg-muted/25" />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function CourseFeedActionBar({
  courseId,
  search,
  onSearchChange,
  estado,
  onEstadoChange,
}: {
  courseId: number
  search: string
  onSearchChange: (value: string) => void
  estado: string
  onEstadoChange: (value: string) => void
}) {
  return (
    <div className={cn('mx-auto mb-6 flex flex-col border-b border-border/60 pb-4', FEED_WIDTH)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <CourseTabSearchField
          className="w-full max-w-sm"
          placeholder="Buscar publicaciones..."
          ariaLabel="Buscar publicaciones del curso"
          value={search}
          onChange={onSearchChange}
        />

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            asChild
            variant="outline"
            className="h-10 justify-center rounded-lg border-border/70 bg-background/70 px-3 text-sm font-semibold shadow-none transition-[border-color,background-color,transform] duration-150 ease-out hover:border-primary/25 hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
          >
            <Link
              href={`/teacher/courses/${courseId}/tasks/create?type=announcement`}
            >
              <Megaphone className="mr-2 size-4" />
              Crear anuncio
            </Link>
          </Button>
          <Button
            asChild
            className="h-10 justify-center rounded-lg px-3 text-sm font-semibold shadow-none transition-transform duration-150 ease-out active:scale-[0.98]"
          >
            <Link href={`/teacher/courses/${courseId}/tasks/create?type=task`}>
              <ClipboardList className="mr-2 size-4" />
              Crear tarea
            </Link>
          </Button>
        </div>
      </div>

      <FeedStatusFilter value={estado} onChange={onEstadoChange} />
    </div>
  )
}

function PublicationAttachments({
  attachments,
}: {
  attachments: PublicationAttachment[]
}) {
  if (attachments.length === 0) return null

  const images = attachments.filter(isImageAttachment)
  const documents = attachments.filter((attachment) => !isImageAttachment(attachment))

  return (
    <div className="mt-3 space-y-2.5">
      {images.length > 0 ? (
        <div
          className={cn(
            'grid gap-2',
            images.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
          )}
        >
          {images.slice(0, 4).map((attachment) => (
            <a
              key={String(attachment.id ?? attachment.url)}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-xl border border-border/60 bg-background/50 transition-colors hover:border-border"
            >
              <img
                src={attachment.url}
                alt={attachment.nombre}
                className={cn(
                  'w-full transition-transform duration-200 group-hover:scale-[1.01]',
                  images.length === 1
                    ? 'max-h-[420px] bg-muted/20 object-contain'
                    : 'h-52 object-cover sm:h-64',
                )}
                loading="lazy"
              />
            </a>
          ))}
        </div>
      ) : null}

      {documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((attachment) => {
            const size = formatAttachmentSize(attachment.sizeBytes)

            return (
              <a
                key={String(attachment.id ?? attachment.url)}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-14 w-full max-w-md items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-3 transition-colors hover:bg-muted/50"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground">
                  <FileText className="size-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold leading-5 text-foreground capitalize">
                    {attachment.nombre}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {size ?? attachment.contentType ?? 'Documento adjunto'}
                  </span>
                </span>
              </a>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function CourseFeedPost({
  task,
  courseId,
  onRequestArchive,
  author,
}: {
  task: TeacherTaskListItem
  courseId: number
  onRequestArchive: (task: TeacherTaskListItem) => void
  author: FeedAuthor | null
}) {
  const estadoConfig = getEstadoTareaConfig(task.estado)
  const showEstado = task.estado !== EstadoTarea.Publicada
  const postAuthor = getTaskAuthor(task, author)
  const preview = getTaskPreview(task)
  const attachments = getPublicationAttachments(task)
  const resourceMeta = getTaskResourceMeta(task)
  const resourceMetaLabel =
    attachments.length === 0 && resourceMeta ? getResourceMetaLabel(resourceMeta) : null
  const viewModel = getPublicationViewModel(task)
  const TypeIcon = viewModel.icon
  const isAnnouncement = viewModel.type === 'announcement'
  const dueDateValue = isAnnouncement ? null : getDueDateValue(task)
  const dueDateMeta = formatDueDateMeta(dueDateValue)
  const titleId = `course-feed-post-${task.id}-title`

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        'group relative overflow-hidden rounded-2xl border shadow-sm transition-colors duration-200 ease-out',
        viewModel.tone.card,
      )}
    >
      <div
        aria-hidden="true"
        className={cn('absolute inset-y-0 left-0 w-1', viewModel.tone.rail)}
      />

      <div className="p-3 pl-5 sm:p-4 sm:pl-6">
        <header className="flex items-start gap-3">
          <UserAvatar
            name={postAuthor.name}
            avatarUrl={postAuthor.avatarUrl}
            size={38}
            className="shrink-0 bg-background/80"
            fallbackClassName="bg-background/90 text-sm text-foreground"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-5 text-foreground">
                  {postAuthor.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-4 text-muted-foreground">
                  <time dateTime={task.createdAtUtc}>
                    Publicado {formatPostDate(task.createdAtUtc)}
                  </time>
                  <span aria-hidden="true">•</span>
                  <span className="inline-flex items-center gap-1">
                    <TypeIcon
                      className={cn('size-3.5', viewModel.tone.iconBox)}
                    />
                    {viewModel.label}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-9 rounded-lg border border-border/60 bg-background/80 text-muted-foreground shadow-none transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`Más acciones para la publicación ${task.titulo}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top">Más acciones</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-52 rounded-xl">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Acciones de la publicación
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/teacher/courses/${courseId}/tasks/${task.id}/edit`}
                    >
                      <Pencil className="size-4" />
                      Editar publicación
                    </Link>
                  </DropdownMenuItem>
                  {task.estado !== EstadoTarea.Archivada ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-amber-700 focus:text-amber-700 dark:text-amber-400 dark:focus:text-amber-400"
                        onSelect={() => onRequestArchive(task)}
                      >
                        <Archive className="size-4" />
                        Archivar publicación
                      </DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="mt-3 min-w-0">
          <h3
            id={titleId}
            className="line-clamp-2 min-w-0 break-words text-base font-semibold leading-6 text-foreground sm:text-[17px]"
          >
            {task.titulo}
          </h3>

          {preview ? (
            <p className="mt-1 line-clamp-3 break-words whitespace-pre-line text-sm leading-5 text-foreground/85">
              {preview}
            </p>
          ) : null}

          {attachments.length > 0 ? (
            <PublicationAttachments attachments={attachments} />
          ) : resourceMetaLabel ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/70 px-2 py-1 text-xs font-medium leading-4 text-muted-foreground">
                <Paperclip className="size-3.5 shrink-0" />
                {resourceMetaLabel}
              </span>
            </div>
          ) : null}
        </div>

        {!isAnnouncement ? (
          <footer className="mt-3 flex flex-col gap-3 border-t border-border/40 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {showEstado ? (
              <span
                className={cn(
                  'inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold leading-4',
                  estadoConfig.className,
                )}
              >
                {estadoConfig.label}
              </span>
            ) : null}

            {dueDateMeta && dueDateValue ? (
              <time
                dateTime={dueDateValue}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-background/70 px-2.5 py-1.5 text-xs font-semibold leading-4 text-muted-foreground"
              >
                <CalendarClock className="size-3.5" />
                Vence {dueDateMeta}
              </time>
            ) : null}

            {viewModel.badgeCorreccion ? (
              <span
                className={cn(
                  'inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold leading-4',
                  viewModel.badgeCorreccion.className,
                )}
              >
                {viewModel.badgeCorreccion.text}
              </span>
            ) : null}
          </div>

          <Button
            asChild
            className={cn(
              'h-10 w-full rounded-lg px-4 text-sm font-semibold shadow-none transition-colors active:scale-[0.98] sm:w-auto',
              viewModel.tone.cta,
            )}
          >
            <Link href={`/teacher/courses/${courseId}/tasks/${task.id}`}>
              {viewModel.primaryActionLabel}
            </Link>
          </Button>
          </footer>
        ) : null}
      </div>
    </article>
  )
}

function FeedStatusFilter({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div
      role="group"
      aria-label="Filtrar publicaciones por estado"
      className="mt-4 flex w-fit max-w-full min-w-0 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {STATUS_FILTERS.map((filter) => {
        const active = value === filter.value

        return (
          <button
            key={filter.value}
            type="button"
            aria-pressed={active}
            aria-label={`Mostrar ${filter.label.toLowerCase()}`}
            onClick={() => onChange(filter.value)}
            className={cn(
              'min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15 active:scale-[0.98]',
              active
                ? 'border-transparent bg-secondary text-foreground font-medium dark:bg-muted/70'
                : 'border-transparent bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:bg-muted/30',
            )}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}

export function TeacherCourseTasks({
  courseId,
}: {
  courseId: number
  courseName: string
}) {
  const [data, setData] = useState<TeacherTaskListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [estado, setEstado] = useState(DEFAULT_ESTADO)
  const [pageNumber, setPageNumber] = useState(1)
  const [total, setTotal] = useState(0)
  const [taskToArchive, setTaskToArchive] = useState<TeacherTaskListItem | null>(
    null,
  )
  const [archiving, setArchiving] = useState(false)
  const [author, setAuthor] = useState<FeedAuthor | null>(null)
  const [feedAnnouncement, setFeedAnnouncement] = useState('')

  const pageSize = 10
  const isInitialLoading = loading && pageNumber === 1
  const isLoadingMore = loading && pageNumber > 1

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

        const query = new URLSearchParams({
          pageNumber: String(pageNumber),
          pageSize: String(pageSize),
        })

        if (debouncedSearch.trim()) query.set('search', debouncedSearch.trim())
        if (estado !== SELECT_ALL) query.set('estado', estado)

        const response = await fetch(
          `/api/teacher/courses/${courseId}/tasks?${query.toString()}`,
          { cache: 'no-store' },
        )

        const result = (await response.json()) as Envelope<TeacherTaskListResponse>

        if (!response.ok) {
          throw new Error(result.message || 'No se pudieron obtener las publicaciones.')
        }

        const nextItems = result.data?.items ?? []

        setData((prev) => {
          if (pageNumber === 1) return nextItems

          const seen = new Set(prev.map((item) => item.id))
          const uniqueNextItems = nextItems.filter((item) => !seen.has(item.id))

          return [...prev, ...uniqueNextItems]
        })
        setTotal(result.data?.total ?? 0)
        if (pageNumber > 1) {
          setFeedAnnouncement(
            nextItems.length === 1
              ? 'Se cargó 1 publicación más.'
              : nextItems.length > 1
                ? `Se cargaron ${nextItems.length} publicaciones más.`
                : 'No hay más publicaciones para cargar.',
          )
        } else {
          setFeedAnnouncement('')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId, debouncedSearch, estado, pageNumber])

  const handleArchive = async () => {
    if (!taskToArchive) return
    try {
      setArchiving(true)
      setError(null)
      await archiveTeacherTask(courseId, taskToArchive.id)

      if (estado === DEFAULT_ESTADO) {
        setData((prev) => prev.filter((item) => item.id !== taskToArchive.id))
        setTotal((prev) => Math.max(0, prev - 1))
      } else {
        setData((prev) =>
          prev.map((item) =>
            item.id === taskToArchive.id
              ? { ...item, estado: EstadoTarea.Archivada }
              : item,
          ),
        )
      }
      setTaskToArchive(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error.')
    } finally {
      setArchiving(false)
    }
  }

  const hasActiveFilters = !!debouncedSearch || estado !== DEFAULT_ESTADO
  const hasMorePosts = data.length < total
  const visibleCount = Math.min(data.length, total)
  const feedCountLabel =
    total === 0
      ? 'Sin publicaciones'
      : `Mostrando ${visibleCount} de ${total} publicaciones`

  return (
    <div className="space-y-2.5 sm:space-y-3" aria-busy={loading}>
      <CourseFeedActionBar
        courseId={courseId}
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPageNumber(1)
        }}
        estado={estado}
        onEstadoChange={(value) => {
          setEstado(value)
          setPageNumber(1)
        }}
      />

      {error ? (
        <CourseTabErrorState className={cn('mx-auto', FEED_WIDTH)}>
          {error}
        </CourseTabErrorState>
      ) : null}

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isLoadingMore ? 'Cargando más publicaciones.' : feedAnnouncement}
      </p>

      {isInitialLoading ? (
        <CourseTabSkeletonList
          className={cn('mx-auto', FEED_WIDTH)}
          label="Cargando publicaciones del curso."
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <CourseFeedSkeleton key={index} />
          ))}
        </CourseTabSkeletonList>
      ) : data.length === 0 ? (
        <CourseTabEmptyState
          className={cn('mx-auto', FEED_WIDTH)}
          icon={Inbox}
          title={
            hasActiveFilters
              ? 'No hay publicaciones con ese filtro'
              : 'Todavía no hay publicaciones activas'
          }
          description={
            hasActiveFilters
              ? 'Probá con otra búsqueda o cambiá el filtro.'
              : 'Podés crear un anuncio o una tarea para empezar.'
          }
        />
      ) : (
        <div
          id="course-feed-posts"
          role="region"
          aria-label="Publicaciones del curso"
          aria-busy={loading}
          className={cn('mx-auto space-y-2.5 sm:space-y-3', FEED_WIDTH)}
        >
          {data.map((task) => (
            <CourseFeedPost
              key={task.id}
              task={task}
              courseId={courseId}
              onRequestArchive={setTaskToArchive}
              author={author}
            />
          ))}
        </div>
      )}

      {total > 0 ? (
        <div
          className={cn(
            'mx-auto flex flex-col items-center gap-2 pt-1 sm:flex-row sm:justify-between',
            FEED_WIDTH,
          )}
        >
          <p className="text-xs text-muted-foreground">{feedCountLabel}</p>

          {hasMorePosts ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-lg border-border/70 bg-background/70 px-3 text-sm font-semibold shadow-none transition-[border-color,background-color,transform] duration-150 ease-out hover:border-primary/25 hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
              disabled={isLoadingMore}
              aria-busy={isLoadingMore}
              aria-controls="course-feed-posts"
              aria-label={
                isLoadingMore
                  ? 'Cargando más publicaciones'
                  : 'Ver más publicaciones'
              }
              onClick={() => setPageNumber((prev) => prev + 1)}
            >
              {isLoadingMore ? 'Cargando...' : 'Ver más publicaciones'}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              No hay más publicaciones.
            </p>
          )}
        </div>
      ) : null}

      <AlertDialog
        open={taskToArchive !== null}
        onOpenChange={(open) => {
          if (!open && !archiving) setTaskToArchive(null)
        }}
      >
        <AlertDialogContent className="rounded-2xl border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle>Archivar publicación</AlertDialogTitle>
            <AlertDialogDescription>
              {taskToArchive
                ? `“${taskToArchive.titulo}” dejará de aparecer como publicación activa.`
                : 'La publicación dejará de aparecer como activa.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={archiving}
              onClick={(event) => {
                event.preventDefault()
                void handleArchive()
              }}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {archiving ? 'Archivando...' : 'Archivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


