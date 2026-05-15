'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Archive,
  CalendarClock,
  ClipboardList,
  Clock3,
  Eye,
  Inbox,
  Megaphone,
  Pencil,
  Plus,
  Search,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  TeacherTaskListItem,
  TeacherTaskListResponse,
} from '@/lib/teacher/tasks/types'
import { EstadoTarea } from '@/lib/teacher/tasks/types'
import { getEstadoTareaConfig } from '@/lib/teacher/tasks/utils'
import { archiveTeacherTask } from '@/lib/teacher/tasks/task-api'
import { cn } from '@/lib/utils'

type Envelope<T> = {
  message?: string
  data?: T
}

const SELECT_ALL = 'all'

function FeedSkeleton() {
  return (
    <article className="rounded-xl border border-border/70 bg-card/95 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90 sm:p-4">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="size-9 animate-pulse rounded-lg bg-muted/40" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted/35" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-muted/35" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-2/3 animate-pulse rounded-lg bg-muted/40" />
          <div className="h-4 w-4/5 animate-pulse rounded-lg bg-muted/30" />
          <div className="flex gap-2">
            <div className="h-5 w-28 animate-pulse rounded-full bg-muted/30" />
            <div className="h-5 w-32 animate-pulse rounded-full bg-muted/30" />
          </div>
          <div className="flex gap-2 border-t border-border/50 pt-2.5">
            <div className="h-8 w-24 animate-pulse rounded-lg bg-muted/30" />
            <div className="h-8 w-20 animate-pulse rounded-lg bg-muted/30" />
          </div>
        </div>
      </div>
    </article>
  )
}

function MetaBadge({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground dark:bg-background/30">
      <Icon className="size-3" />
      {children}
    </span>
  )
}

function getPreview(task: TeacherTaskListItem) {
  if (task.esAnuncio) {
    return 'Comunicacion publicada para el curso.'
  }

  return task.fechaEntregaUtc
    ? 'Actividad con fecha de entrega definida.'
    : 'Actividad sin fecha de entrega definida.'
}

function FeedPost({
  task,
  courseId,
  onArchive,
}: {
  task: TeacherTaskListItem
  courseId: number
  onArchive: (taskId: number) => void
}) {
  const estadoConfig = getEstadoTareaConfig(task.estado)
  const Icon = task.esAnuncio ? Megaphone : ClipboardList

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-colors duration-200 hover:bg-card dark:bg-card/90',
        task.esAnuncio
          ? 'border-violet-200/70 hover:border-violet-300/70 dark:border-violet-500/15 dark:hover:border-violet-500/25'
          : 'border-border/70 hover:border-primary/20',
      )}
    >
      {!task.esAnuncio ? (
        <div className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-primary/70" />
      ) : null}

      <div className={cn('p-3.5 sm:p-4', !task.esAnuncio && 'pl-5 sm:pl-6')}>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg border',
              task.esAnuncio
                ? 'border-violet-200 bg-violet-50/70 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300'
                : 'border-primary/15 bg-primary/10 text-primary',
            )}
          >
            <Icon className="size-4" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                task.esAnuncio
                  ? 'border-violet-200/70 bg-violet-50/70 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300'
                  : 'border-primary/15 bg-primary/5 text-primary',
              )}
            >
              {task.esAnuncio ? 'Anuncio' : 'Tarea'}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                estadoConfig.className,
              )}
            >
              {estadoConfig.label}
            </span>
          </div>
        </div>

        <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-6 tracking-tight text-foreground sm:text-lg">
          {task.titulo}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
          {getPreview(task)}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {!task.esAnuncio ? (
            <MetaBadge icon={CalendarClock}>
              {task.fechaEntregaUtc
                ? `Entrega ${formatDateTime(task.fechaEntregaUtc)}`
                : 'Sin entrega definida'}
            </MetaBadge>
          ) : null}
          <MetaBadge icon={Clock3}>
            Publicada {formatDateTime(task.createdAtUtc)}
          </MetaBadge>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/55 pt-2.5">
          <Button
            asChild
            variant="ghost"
            className="h-8 rounded-lg px-2.5 text-xs font-semibold text-foreground hover:bg-primary/5 hover:text-primary"
          >
            <Link href={`/teacher/courses/${courseId}/tasks/${task.id}`}>
              <Eye className="mr-1.5 size-3.5" />
              Ver detalles
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="h-8 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          >
            <Link href={`/teacher/courses/${courseId}/tasks/${task.id}/edit`}>
              <Pencil className="mr-1.5 size-3.5" />
              Editar
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => onArchive(task.id)}
            className="h-8 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400"
          >
            <Archive className="mr-1.5 size-3.5" />
            Archivar
          </Button>
        </div>
      </div>
    </article>
  )
}

export function TeacherCourseTasks({ courseId }: { courseId: number }) {
  const router = useRouter()
  const [data, setData] = useState<TeacherTaskListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [estado, setEstado] = useState(SELECT_ALL)
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
        setError(err instanceof Error ? err.message : 'Ocurrio un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId, debouncedSearch, estado, pageNumber])

  const handleArchive = async (taskId: number) => {
    const confirmed = window.confirm('Queres archivar esta publicacion?')
    if (!confirmed) return

    try {
      setError(null)
      await archiveTeacherTask(courseId, taskId)

      setData((prev) =>
        prev.map((item) =>
          item.id === taskId ? { ...item, estado: EstadoTarea.Archivada } : item,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrio un error.')
    }
  }

  const hasActiveFilters = !!debouncedSearch || estado !== SELECT_ALL
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const pageLabel = useMemo(() => {
    if (total === 0) return 'Sin publicaciones'
    return `Pagina ${pageNumber} de ${totalPages} - ${total} publicaciones`
  }, [pageNumber, totalPages, total])

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border/70 bg-card/85 p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-2.5 md:grid-cols-[minmax(260px,1fr)_180px]">
            <div className="relative min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar en el tablon..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPageNumber(1)
                }}
                className="h-10 rounded-xl border-border/60 bg-background/75 pl-10 text-sm shadow-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
              />
            </div>

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

          <Button
            onClick={() => router.push(`/teacher/courses/${courseId}/tasks/create`)}
            className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90"
          >
            <Plus className="mr-2 size-4" />
            Crear publicación
          </Button>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mx-auto max-w-[900px] space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <FeedSkeleton key={index} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <Card className="rounded-xl border border-border/70 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90">
          <CardContent className="px-6 py-14">
            <Empty className="border-0 p-0">
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>
                  {hasActiveFilters ? 'Sin resultados' : 'Sin publicaciones'}
                </EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? 'No se encontraron publicaciones con esos filtros.'
                    : 'Todavia no hay tareas ni anuncios en este curso.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="mx-auto max-w-[900px] space-y-3">
          {data.map((task) => (
            <FeedPost
              key={task.id}
              task={task}
              courseId={courseId}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
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
