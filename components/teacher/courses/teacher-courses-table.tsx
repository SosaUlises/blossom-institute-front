'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CalendarRange,
  Clock,
  Inbox,
  Search,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { getTeacherCourses } from '@/lib/teacher/courses/api'
import type { TeacherCourseListItem } from '@/lib/teacher/courses/types'
import { EstadoCurso } from '@/lib/teacher/dashboard/types'

// ─── Constantes ──────────────────────────────────────────────────────────────

const SELECT_ALL = 'all'

const ESTADO_OPTIONS = [
  { value: String(EstadoCurso.Activo), label: 'Activo' },
  { value: String(EstadoCurso.Inactivo), label: 'Inactivo' },
  { value: String(EstadoCurso.Archivado), label: 'Archivado' },
] as const


const ESTADO_BADGE: Record<
  EstadoCurso,
  { label: string; className: string }
> = {
  [EstadoCurso.Activo]: {
    label: 'Activo',
    className:
      'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400',
  },
  [EstadoCurso.Inactivo]: {
    label: 'Inactivo',
    className:
      'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  [EstadoCurso.Archivado]: {
    label: 'Archivado',
    className:
      'border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400',
  },
}

const ESTADO_BADGE_BASE =
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider'

function EstadoBadge({ estado }: { estado: EstadoCurso }) {
  const config = ESTADO_BADGE[estado] ?? {
    label: 'Desconocido',
    className: 'border-primary/20 bg-primary/10 text-primary',
  }

  return (
    <span className={`${ESTADO_BADGE_BASE} ${config.className}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function TeacherCourseCard({ course }: { course: TeacherCourseListItem }) {
  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_26px_56px_-26px_rgba(15,23,42,0.22)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.06),transparent_24%)]" />

      <CardContent className="relative flex flex-1 flex-col p-6">
        {/* Header: badge de estado + ícono */}
        <div className="flex items-start justify-between gap-4">
          <EstadoBadge estado={course.estado} />

          <div className="flex size-11 shrink-0 items-center justify-center rounded-[18px] bg-primary/10 text-primary shadow-sm transition-transform duration-200 group-hover:scale-[1.04]">
            <BookOpen className="size-5" />
          </div>
        </div>

        {/* Título */}
        <div className="mt-4 flex-1">
          <h3 className="line-clamp-2 text-xl font-semibold leading-snug tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
            {course.nombre}
          </h3>
        </div>

        {/* Chips de metadata */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <CalendarRange className="size-3.5 shrink-0" />
            Año {course.anio}
          </div>

          {course.cantidadHorarios > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <Clock className="size-3.5 shrink-0" />
              {course.cantidadHorarios}{' '}
              {course.cantidadHorarios === 1 ? 'horario' : 'horarios'}
            </div>
          )}
        </div>

        {/* Separador + acción */}
        <div className="mt-5 border-t border-border/30 pt-4">
          <Button
            asChild
            className="h-10 w-full rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
          >
            <Link href={`/teacher/courses/${course.id}`}>
              Abrir curso
              <ArrowRight className="gap-2 justify-center size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TeacherCourseCardSkeleton() {
  return (
    <div className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
      <div className="flex items-start justify-between gap-4">
        <div className="h-6 w-20 animate-pulse rounded-full bg-muted/50" />
        <div className="h-11 w-11 animate-pulse rounded-[18px] bg-muted/50" />
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-5 w-4/5 animate-pulse rounded-lg bg-muted/50" />
        <div className="h-5 w-3/5 animate-pulse rounded-lg bg-muted/50" />
      </div>

      <div className="mt-3 flex gap-2">
        <div className="h-6 w-24 animate-pulse rounded-full bg-muted/40" />
        <div className="h-6 w-24 animate-pulse rounded-full bg-muted/40" />
      </div>

      <div className="mt-6 border-t border-border/30 pt-5">
        <div className="h-10 w-full animate-pulse rounded-2xl bg-muted/50" />
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

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

  const hasActiveFilters = debouncedSearch || anio || estado !== SELECT_ALL

  const emptyStateText = hasActiveFilters
    ? 'No se encontraron cursos con esos filtros.'
    : 'Todavía no tenés cursos asignados.'

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
        <CardContent className="p-5">
          <div className="grid gap-4 xl:grid-cols-3">
            {/* Buscador */}
            <div className="relative min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar curso..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-2xl border-border/70 bg-card/85 pl-10 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
              />
            </div>

            {/* Filtro de año */}
            <Input
              type="number"
              placeholder="Filtrar por año (ej. 2025)"
              value={anio}
              min={2000}
              max={2100}
              onChange={(e) => setAnio(e.target.value)}
              className="h-11 rounded-2xl border-border/70 bg-card/85 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
            />

            {/* Filtro de estado */}
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-card/85 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus:ring-4 focus:ring-primary/15">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/70">
                <SelectItem value={SELECT_ALL}>Todos los estados</SelectItem>
                {ESTADO_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contenido */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TeacherCourseCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
          <CardContent className="px-6 py-14">
            <Empty className="border-0 p-0">
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>
                  {hasActiveFilters ? 'Sin resultados' : 'Sin cursos asignados'}
                </EmptyTitle>
                <EmptyDescription>{emptyStateText}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {items.map((course) => (
            <TeacherCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}