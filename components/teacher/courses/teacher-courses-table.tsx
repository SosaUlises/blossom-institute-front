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
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        config.pill,
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

function CourseCardSkeleton() {
  return (
    <li className="rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.14)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-muted/60" />
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-4 w-40 animate-pulse rounded-lg bg-muted/40" />
          </div>
        </div>

        <div className="h-6 w-20 animate-pulse rounded-full bg-muted/50" />
      </div>

      <div className="mt-5 border-t border-border/40 pt-4">
        <div className="h-4 w-32 animate-pulse rounded-lg bg-muted/40" />
      </div>
    </li>
  )
}

function CourseCard({ course }: { course: TeacherCourseListItem }) {
  return (
    <li>
      <Link
        href={`/teacher/courses/${course.id}`}
        className="group block rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-border/80 hover:bg-card hover:shadow-[0_18px_38px_-20px_rgba(15,23,42,0.18)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
              <BookOpen className="size-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[17px] font-semibold tracking-tight text-foreground">
                {course.nombre}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarRange className="size-3.5 shrink-0" />
                  Año {course.anio}
                </span>

                {course.cantidadHorarios > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 shrink-0" />
                    {course.cantidadHorarios}{' '}
                    {course.cantidadHorarios === 1 ? 'horario' : 'horarios'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <EstadoBadge estado={course.estado} />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            Ver detalle del curso
          </span>

          <div className="flex size-9 items-center justify-center rounded-full bg-muted/45 text-muted-foreground transition-all duration-200 group-hover:bg-primary/10 group-hover:text-primary">
            <ChevronRight className="size-4" />
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
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-2xl border-border/60 bg-card/95 pl-9 text-sm shadow-[0_8px_18px_-14px_rgba(15,23,42,0.12)] transition-all duration-200 hover:border-border/80 hover:bg-card focus-visible:ring-2 focus-visible:ring-primary/15"
          />
        </div>

        <Input
          type="number"
          placeholder="Año (ej. 2026)"
          value={anio}
          min={2000}
          max={2100}
          onChange={(e) => setAnio(e.target.value)}
          className="h-11 rounded-2xl border-border/60 bg-card/95 text-sm shadow-[0_8px_18px_-14px_rgba(15,23,42,0.12)] transition-all duration-200 hover:border-border/80 hover:bg-card focus-visible:ring-2 focus-visible:ring-primary/15"
        />

        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="h-11 rounded-2xl border-border/60 bg-card/95 px-4 text-sm shadow-[0_8px_18px_-14px_rgba(15,23,42,0.12)] transition-all duration-200 hover:border-border/80 hover:bg-card focus:ring-2 focus:ring-primary/15 data-[state=open]:border-primary/30 data-[state=open]:ring-2 data-[state=open]:ring-primary/10">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>

          <SelectContent className="rounded-2xl border-border/60 bg-card/98 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
            <SelectItem value={SELECT_ALL}>Todos los estados</SelectItem>
            {ESTADO_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
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
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </ul>
      )}
    </div>
  )
}