'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  BookOpen,
  CalendarRange,
  Clock,
  Inbox,
  Search,
  ChevronRight,
} from 'lucide-react'

import { cn } from '@/lib/utils'
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
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { getTeacherCourses } from '@/lib/teacher/courses/api'
import type { TeacherCourseListItem } from '@/lib/teacher/courses/types'
import { EstadoCurso } from '@/lib/teacher/courses/types'

const SELECT_ALL = 'all'

const ESTADO_OPTIONS = [
  { value: String(EstadoCurso.Activo), label: 'Activo' },
  { value: String(EstadoCurso.Inactivo), label: 'Inactivo' },
  { value: String(EstadoCurso.Archivado), label: 'Archivado' },
] as const

const ESTADO_CONFIG: Record<
  EstadoCurso,
  { label: string; dot: string; pill: string }
> = {
  [EstadoCurso.Activo]: {
    label: 'Activo',
    dot: 'bg-emerald-500',
    pill:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  [EstadoCurso.Inactivo]: {
    label: 'Inactivo',
    dot: 'bg-amber-500',
    pill:
      'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  [EstadoCurso.Archivado]: {
    label: 'Archivado',
    dot: 'bg-slate-400',
    pill:
      'border-slate-400/20 bg-slate-500/10 text-slate-600 dark:text-slate-400',
  },
}

function EstadoBadge({ estado }: { estado: EstadoCurso }) {
  const config = ESTADO_CONFIG[estado] ?? {
    label: 'Desconocido',
    dot: 'bg-muted-foreground',
    pill: 'border-border/60 bg-muted/40 text-muted-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        config.pill,
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

function MetaPill({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/[0.18] px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      {children}
    </span>
  )
}

function CourseSignalPill({
  icon: Icon,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  tone: string
}) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold leading-5',
        tone,
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </span>
  )
}

function CourseCardSkeleton() {
  return (
    <li className="rounded-xl border border-border/70 bg-card/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 animate-pulse rounded-lg bg-muted/60" />
          <div className="space-y-2">
            <div className="h-7 w-44 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-4 w-32 animate-pulse rounded-lg bg-muted/40" />
          </div>
        </div>

        <div className="h-7 w-24 animate-pulse rounded-full bg-muted/50" />
      </div>

      <div className="mt-5 flex gap-2">
        <div className="h-8 w-24 animate-pulse rounded-full bg-muted/40" />
        <div className="h-8 w-28 animate-pulse rounded-full bg-muted/40" />
      </div>

      <div className="mt-5 h-10 animate-pulse rounded-lg bg-muted/40" />
    </li>
  )
}

function CourseCard({ course }: { course: TeacherCourseListItem }) {
  const hasSchedules = course.cantidadHorarios > 0

  return (
    <li>
      <Link
        href={`/teacher/courses/${course.id}`}
        className="group block rounded-xl border border-border/70 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-colors duration-200 ease-out hover:border-primary/20 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 dark:bg-card/90 sm:p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/8 text-primary shadow-[0_1px_1px_rgba(15,23,42,0.04)] transition-colors duration-200 group-hover:bg-primary/10">
              <BookOpen className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
                {course.nombre}
              </h3>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Aula docente
              </p>
            </div>
          </div>

          <EstadoBadge estado={course.estado} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <MetaPill icon={CalendarRange}>Año {course.anio}</MetaPill>

        </div>

        <div className="mt-4 rounded-lg border border-border/60 bg-muted/[0.12] px-4 py-3 transition-colors duration-200 ease-out group-hover:border-primary/20 group-hover:bg-primary/[0.05] dark:bg-background/30">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Abrir espacio de trabajo
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Gestionar clases, tareas y alumnos
              </p>
            </div>

            <div className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:border-primary/25 group-hover:bg-primary/10 group-hover:text-primary dark:bg-background/35">
              <ChevronRight className="size-4" />
            </div>
          </div>
        </div>
      </Link>
    </li>
  )
}

export function TeacherCoursesTable() {
  const [items, setItems] = useState<TeacherCourseListItem[]>([])
  const [search, setSearch] = useState('')
  const [anio, setAnio] = useState('')
  const [estado, setEstado] = useState(SELECT_ALL)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(timeout)
  }, [search])

  const loadCourses = useCallback(async () => {
    setLoading(true)

    try {
      const data = await getTeacherCourses({
        pageNumber: 1,
        pageSize: 50,
        search: debouncedSearch,
        anio: anio ? Number(anio) : undefined,
        estado: estado !== SELECT_ALL ? Number(estado) : undefined,
      })

      setItems(data.items)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, anio, estado])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  const hasActiveFilters = !!debouncedSearch || !!anio || estado !== SELECT_ALL

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border/70 bg-card/80 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.035)] backdrop-blur-sm dark:bg-card/70">
        <div className="grid gap-2.5 sm:grid-cols-[1fr_140px] lg:grid-cols-[1fr_140px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Buscar curso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl border-border/60 bg-background/75 pl-10 text-sm shadow-none transition-colors duration-200 hover:border-border/80 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
            />
          </div>

          <Input
            type="number"
            placeholder="Año"
            value={anio}
            min={2000}
            max={2100}
            onChange={(e) => setAnio(e.target.value)}
            className="h-10 rounded-xl border-border/60 bg-background/75 text-sm shadow-none transition-colors duration-200 hover:border-border/80 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
          />

          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger className="h-10 rounded-xl border-border/60 bg-background/75 px-4 text-sm shadow-none transition-colors duration-200 hover:border-border/80 focus:ring-2 focus:ring-primary/15 data-[state=open]:border-primary/30 data-[state=open]:ring-2 data-[state=open]:ring-primary/10 dark:bg-background/35 sm:col-span-2 lg:col-span-1">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>

            <SelectContent className="rounded-2xl border-border/60 bg-card/98 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
              <SelectItem value={SELECT_ALL}>Todos los estados</SelectItem>
              {ESTADO_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <ul className="grid gap-5 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <Card className="rounded-xl border border-border/70 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90">
          <CardContent className="px-6 py-14">
            <Empty className="border-0 p-0">
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>
                  {hasActiveFilters ? 'Sin resultados' : 'Sin cursos asignados'}
                </EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? 'No se encontraron cursos con esos filtros.'
                    : 'Todavía no tenés cursos asignados.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'curso' : 'cursos'} para revisar
            </p>
            {hasActiveFilters ? (
              <span className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">
                Filtros activos
              </span>
            ) : null}
          </div>

          <ul className="grid gap-5 xl:grid-cols-2">
            {items.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
