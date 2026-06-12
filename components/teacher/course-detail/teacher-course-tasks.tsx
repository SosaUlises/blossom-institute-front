'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Archive,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  Clock3,
  Inbox,
  Megaphone,
  MoreHorizontal,
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

function FeedSkeleton() {
  return (
    <article className="rounded-xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="h-4 w-20 animate-pulse rounded-md bg-muted/35" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted/30" />
        </div>
        <div className="h-6 w-2/3 animate-pulse rounded-md bg-muted/45" />
        <div className="h-4 w-40 animate-pulse rounded-md bg-muted/25" />
        <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
          <div className="h-8 w-28 animate-pulse rounded-lg bg-muted/30" />
          <div className="size-8 animate-pulse rounded-lg bg-muted/25" />
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
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="size-3" />
      {children}
    </span>
  )
}

function FeedPost({
  task,
  courseId,
  onRequestArchive,
}: {
  task: TeacherTaskListItem
  courseId: number
  onRequestArchive: (task: TeacherTaskListItem) => void
}) {
  const estadoConfig = getEstadoTareaConfig(task.estado)
  const Icon = task.esAnuncio ? Megaphone : ClipboardList
  const showEstado = task.estado !== EstadoTarea.Publicada

  return (
    <article className="group rounded-xl border border-border/60 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.025)] transition-[border-color,background-color] duration-200 ease-out hover:border-border hover:bg-card dark:bg-card/90">
      <div className="p-4 sm:p-5">
        <div className="grid gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Icon
                  className={cn(
                    'size-3.5 shrink-0',
                    task.esAnuncio ? 'text-muted-foreground' : 'text-primary',
                  )}
                />

                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      task.esAnuncio ? 'text-muted-foreground' : 'text-primary',
                    )}
                  >
                    {task.esAnuncio ? 'Anuncio' : 'Tarea'}
                  </span>
                  {showEstado ? (
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                        estadoConfig.className,
                      )}
                    >
                      {estadoConfig.label}
                    </span>
                  ) : null}
                </div>
              </div>

              {!task.esAnuncio ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                  <CalendarClock className="size-3.5 text-primary" />
                  {task.fechaEntregaUtc
                    ? `Entrega ${formatDateTime(task.fechaEntregaUtc)}`
                    : 'Sin fecha de entrega'}
                </span>
              ) : null}
            </div>

            <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-6 text-foreground sm:text-xl sm:leading-7">
              {task.titulo}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <MetaBadge icon={Clock3}>
                Publicada {formatDateTime(task.createdAtUtc)}
              </MetaBadge>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
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
                  <Link href={`/teacher/courses/${courseId}/tasks/${task.id}/edit`}>
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
      <CourseTabToolbar className="mx-auto max-w-[900px]">
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
        <CourseTabErrorState className="mx-auto max-w-[900px]">
          {error}
        </CourseTabErrorState>
      ) : null}

      {loading ? (
        <CourseTabSkeletonList className="mx-auto max-w-[900px]">
          {Array.from({ length: 3 }).map((_, index) => (
            <FeedSkeleton key={index} />
          ))}
        </CourseTabSkeletonList>
      ) : data.length === 0 ? (
        <CourseTabEmptyState
          className="mx-auto max-w-[900px]"
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
        <div className="mx-auto max-w-[900px] space-y-2.5">
          {data.map((task) => (
            <FeedPost
              key={task.id}
              task={task}
              courseId={courseId}
              onRequestArchive={setTaskToArchive}
            />
          ))}
        </div>
      )}

      {total > 0 ? (
        <CourseTabPagination
          className="mx-auto max-w-[900px]"
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
