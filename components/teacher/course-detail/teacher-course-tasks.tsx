'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Archive,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  Inbox,
  Megaphone,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserAvatar } from '@/components/shared/user-avatar'
import type { SessionUser } from '@/lib/auth/session'
import { formatDateTime } from '@/lib/teacher/course-detail/formatters'
import type {
  TeacherTaskListItem,
  TeacherTaskListResponse,
} from '@/lib/teacher/tasks/types'
import { EstadoTarea } from '@/lib/teacher/tasks/types'
import { getEstadoTareaConfig } from '@/lib/teacher/tasks/utils'
import {
  archiveTeacherTask,
  getTeacherTaskDetail,
} from '@/lib/teacher/tasks/task-api'
import { cn } from '@/lib/utils'
import {
  CourseTabEmptyState,
  CourseTabErrorState,
  CourseTabPagination,
  CourseTabSearchField,
  CourseTabSkeletonList,
  CourseTabToolbar,
} from './course-tab-ui'

type Envelope<T> = {
  message?: string
  data?: T
}

const SELECT_ALL = 'all'
const DEFAULT_ESTADO = String(EstadoTarea.Publicada)
const FEED_WIDTH = 'max-w-3xl'

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

  const count = Number(previewTask.recursosCount)
  if (Number.isFinite(count) && count >= 0) return count

  if (previewTask.tieneRecursos === false) return 0

  if (typeof fallback === 'number') return fallback

  return null
}

function getResourceCountLabel(count: number) {
  return `${count} ${count === 1 ? 'recurso adjunto' : 'recursos adjuntos'}`
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

  if (meta.links > 0 || meta.files > 0 || meta.pdfs > 0) {
    const parts = []

    if (meta.links > 0) {
      parts.push(`${meta.links} ${meta.links === 1 ? 'enlace' : 'enlaces'}`)
    }

    if (meta.pdfs > 0) {
      parts.push(`${meta.pdfs} ${meta.pdfs === 1 ? 'archivo PDF' : 'archivos PDF'}`)
    }

    const otherFiles = Math.max(0, meta.files - meta.pdfs)
    if (otherFiles > 0) {
      parts.push(`${otherFiles} ${otherFiles === 1 ? 'archivo' : 'archivos'}`)
    }

    if (parts.length > 0) return parts.join(' · ')
  }

  return getResourceCountLabel(meta.total)
}

function getNumberField(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = Number(record[key])
    if (Number.isFinite(value) && value > 0) return value
  }

  return 0
}

function getTaskActivityLabels(task: TeacherTaskListItem) {
  const record = task as unknown as Record<string, unknown>
  const receivedCount = getNumberField(record, [
    'entregasRecibidasCount',
    'entregasRecibidas',
    'submissionsCount',
    'totalEntregas',
  ])
  const pendingReviewCount = getNumberField(record, [
    'entregasPendientesCorreccionCount',
    'entregasPendientesCorreccion',
    'pendientesCorreccionCount',
    'pendingCorrectionsCount',
  ])

  return [
    receivedCount > 0
      ? `${receivedCount} ${receivedCount === 1 ? 'entrega recibida' : 'entregas recibidas'}`
      : null,
    pendingReviewCount > 0
      ? `${pendingReviewCount} ${pendingReviewCount === 1 ? 'pendiente de corrección' : 'pendientes de corrección'}`
      : null,
  ].filter(Boolean) as string[]
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

function CourseFeedSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90">
      <div className="p-3.5 sm:p-4">
        <div className="flex gap-3">
          <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted/40" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="space-y-1.5">
              <div className="h-4 w-32 animate-pulse rounded-md bg-muted/40" />
              <div className="h-3 w-52 animate-pulse rounded-md bg-muted/30" />
            </div>
            <div className="h-5 w-2/3 animate-pulse rounded-md bg-muted/45" />
            <div className="space-y-1.5">
              <div className="h-3 w-full animate-pulse rounded-md bg-muted/25" />
              <div className="h-3 w-3/4 animate-pulse rounded-md bg-muted/20" />
            </div>
            <div className="flex items-center justify-between gap-3 pt-0.5">
              <div className="h-9 w-32 animate-pulse rounded-lg bg-muted/30" />
              <div className="size-9 animate-pulse rounded-lg bg-muted/25" />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function CourseFeedPost({
  task,
  courseId,
  onRequestArchive,
  author,
  previewOverride,
  resourceMetaOverride,
}: {
  task: TeacherTaskListItem
  courseId: number
  onRequestArchive: (task: TeacherTaskListItem) => void
  author: FeedAuthor | null
  previewOverride?: string | null
  resourceMetaOverride?: TaskResourceMeta | null
}) {
  const estadoConfig = getEstadoTareaConfig(task.estado)
  const showEstado = task.estado !== EstadoTarea.Publicada
  const authorName = getAuthorName(author)
  const preview = getTaskPreview(task, previewOverride)
  const resourceMeta = getTaskResourceMeta(task, resourceMetaOverride)
  const resourceMetaLabel = resourceMeta ? getResourceMetaLabel(resourceMeta) : null
  const activityLabels = task.esAnuncio ? [] : getTaskActivityLabels(task)
  const dueDateMeta = task.esAnuncio
    ? null
    : formatDueDateMeta(task.fechaEntregaUtc)
  const authorAction = task.esAnuncio
    ? 'publicó un anuncio'
    : 'publicó una tarea'

  return (
    <article className="group overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.025)] transition-[border-color,background-color,box-shadow] duration-200 ease-out hover:border-border hover:bg-card hover:shadow-[0_6px_18px_rgba(15,23,42,0.03)] dark:bg-card/90">
      <div className="p-3 sm:p-3.5">
        <div className="flex gap-2.5">
          <UserAvatar
            name={authorName}
            avatarUrl={author?.avatarUrl}
            size={38}
            className="mt-0.5 shrink-0 bg-primary/5"
            fallbackClassName="bg-primary/10 text-sm text-primary"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0">
                <p className="truncate text-[13px] leading-5 text-foreground">
                  <span className="font-semibold">{authorName}</span>{' '}
                  <span className="text-foreground/80">{authorAction}</span>
                </p>
                <p className="text-[11px] leading-4 text-muted-foreground">
                  {formatDateTime(task.createdAtUtc)}
                </p>
              </div>
              {showEstado ? (
                <span
                  className={cn(
                    'mt-0.5 inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                    estadoConfig.className,
                  )}
                >
                  {estadoConfig.label}
                </span>
              ) : null}
            </div>

            <div className="mt-2.5 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <h3 className="line-clamp-2 min-w-0 text-base font-semibold leading-5 text-foreground sm:text-[17px]">
                {task.titulo}
              </h3>
              {dueDateMeta ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-muted/35 px-2 py-1 text-[11px] font-semibold leading-4 text-foreground/70 shadow-none sm:mt-0.5 dark:bg-muted/20 dark:text-foreground/75">
                  <CalendarClock className="size-3 text-muted-foreground" />
                  Vence {dueDateMeta}
                </span>
              ) : null}
            </div>

            {preview ? (
              <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm leading-5 text-foreground/80">
                {preview}
              </p>
            ) : null}

            {resourceMetaLabel ? (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium leading-4 text-muted-foreground">
                <Paperclip className="size-3.5 shrink-0" />
                <span>{resourceMetaLabel}</span>
              </div>
            ) : null}

            {activityLabels.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium leading-4 text-muted-foreground">
                {activityLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            ) : null}

            <div className="mt-2.5 flex items-center justify-between gap-2">
              <Button
                asChild
                variant={task.esAnuncio ? 'outline' : 'default'}
                className={cn(
                  'h-9 rounded-lg px-3 text-sm font-semibold shadow-none transition-transform duration-150 ease-out active:scale-[0.98]',
                  task.esAnuncio &&
                    'border-border/70 bg-background/70 hover:border-primary/25 hover:bg-primary/5 hover:text-primary',
                )}
              >
                <Link href={`/teacher/courses/${courseId}/tasks/${task.id}`}>
                  {task.esAnuncio ? 'Abrir publicación' : 'Revisar entregas'}
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-lg text-muted-foreground transition-transform duration-150 ease-out hover:bg-muted/50 hover:text-foreground active:scale-[0.96]"
                    aria-label={`Más acciones para ${task.titulo}`}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/teacher/courses/${courseId}/tasks/${task.id}/edit`}
                    >
                      <Pencil className="size-4" />
                      Editar
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
                        Archivar
                      </DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export function TeacherCourseTasks({ courseId }: { courseId: number }) {
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
  const [previewByTaskId, setPreviewByTaskId] = useState<Record<number, string>>(
    {},
  )
  const [resourceMetaByTaskId, setResourceMetaByTaskId] = useState<
    Record<number, TaskResourceMeta>
  >({})

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
    const missingDetailTasks = data.filter(
      (task) =>
        (getTaskPreview(task) === null &&
          previewByTaskId[task.id] === undefined) ||
        (getTaskResourceMeta(task, resourceMetaByTaskId[task.id]) === null &&
          resourceMetaByTaskId[task.id] === undefined),
    )

    if (missingDetailTasks.length === 0) return

    let active = true

    const loadDetails = async () => {
      const entries = await Promise.all(
        missingDetailTasks.map(async (task) => {
          try {
            const detail = await getTeacherTaskDetail(courseId, task.id)
            return [
              task.id,
              getTaskPreview(detail) ?? '',
              getResourceMetaFromResources(detail.recursos) ?? {
                total: 0,
                links: 0,
                files: 0,
                pdfs: 0,
              },
            ] as const
          } catch {
            return [
              task.id,
              '',
              {
                total: 0,
                links: 0,
                files: 0,
                pdfs: 0,
              },
            ] as const
          }
        }),
      )

      if (!active) return

      setPreviewByTaskId((previous) => {
        const next = { ...previous }
        for (const [taskId, preview] of entries) {
          next[taskId] = preview
        }
        return next
      })

      setResourceMetaByTaskId((previous) => {
        const next = { ...previous }
        for (const [taskId, , resourceMeta] of entries) {
          next[taskId] = resourceMeta
        }
        return next
      })
    }

    void loadDetails()

    return () => {
      active = false
    }
  }, [courseId, data, previewByTaskId, resourceMetaByTaskId])

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
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const pageLabel = useMemo(() => {
    if (total === 0) return 'Sin publicaciones'
    return `Página ${pageNumber} de ${totalPages} · ${total} publicaciones`
  }, [pageNumber, totalPages, total])

  return (
    <div className="space-y-3">
      <CourseTabToolbar
        className={cn('mx-auto border-0 bg-transparent p-0', FEED_WIDTH)}
      >
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-2.5 md:grid-cols-[minmax(260px,1fr)_180px]">
            <CourseTabSearchField
              className="min-w-0"
              placeholder="Buscar en el tablón..."
              value={search}
              onChange={(value) => {
                setSearch(value)
                setPageNumber(1)
              }}
            />

            <Select
              value={estado}
              onValueChange={(value) => {
                setEstado(value)
                setPageNumber(1)
              }}
            >
              <SelectTrigger className="h-10 rounded-xl border-border/60 bg-background/75 text-sm shadow-none transition-colors duration-200 focus:ring-2 focus:ring-primary/15 dark:bg-background/35">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/60">
                <SelectItem value={SELECT_ALL}>Todos los estados</SelectItem>
                <SelectItem value={String(EstadoTarea.Borrador)}>Borrador</SelectItem>
                <SelectItem value={String(EstadoTarea.Publicada)}>Publicada</SelectItem>
                <SelectItem value={String(EstadoTarea.Archivada)}>Archivada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-none transition-[background-color,transform] duration-150 ease-out hover:bg-primary/90 active:scale-[0.98]">
                <Plus className="size-4" />
                Crear publicación
                <ChevronDown className="size-3.5 opacity-75" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 rounded-xl border-border/60 p-1.5"
            >
              <DropdownMenuItem asChild className="items-start gap-3 rounded-lg p-2.5">
                <Link href={`/teacher/courses/${courseId}/tasks/create?type=task`}>
                  <ClipboardList className="mt-0.5 size-4 text-primary" />
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">
                      Crear tarea
                    </span>
                    <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                      Para actividades con fecha de entrega.
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="items-start gap-3 rounded-lg p-2.5">
                <Link
                  href={`/teacher/courses/${courseId}/tasks/create?type=announcement`}
                >
                  <Megaphone className="mt-0.5 size-4 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">
                      Crear anuncio
                    </span>
                    <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                      Para comunicar información sin entregas.
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CourseTabToolbar>

      {error ? (
        <CourseTabErrorState className={cn('mx-auto', FEED_WIDTH)}>
          {error}
        </CourseTabErrorState>
      ) : null}

      {loading ? (
        <CourseTabSkeletonList className={cn('mx-auto', FEED_WIDTH)}>
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
              ? 'No se encontraron publicaciones'
              : 'Todavía no hay publicaciones activas'
          }
          description={
            hasActiveFilters
              ? 'Probá con otra búsqueda o cambiá el estado.'
              : 'Las publicaciones del curso van a aparecer acá.'
          }
        />
      ) : (
        <div className={cn('mx-auto space-y-3', FEED_WIDTH)}>
          {data.map((task) => (
            <CourseFeedPost
              key={task.id}
              task={task}
              courseId={courseId}
              onRequestArchive={setTaskToArchive}
              author={author}
              previewOverride={previewByTaskId[task.id] ?? null}
              resourceMetaOverride={resourceMetaByTaskId[task.id] ?? null}
            />
          ))}
        </div>
      )}

      {total > 0 ? (
        <CourseTabPagination
          className={cn('mx-auto', FEED_WIDTH)}
          label={pageLabel}
          page={pageNumber}
          totalPages={totalPages}
          onPrevious={() => setPageNumber((prev) => Math.max(1, prev - 1))}
          onNext={() => setPageNumber((prev) => prev + 1)}
        />
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
