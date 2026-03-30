'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CalendarRange,
  Search,
  Sparkles,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getTeacherCourses } from '@/lib/teacher/courses/api'
import type { TeacherCourseListItem } from '@/lib/teacher/courses/types'
import { EstadoCurso } from '@/lib/teacher/dashboard/types'

const estadoLabels: Record<number, string> = {
  [EstadoCurso.Activo]: 'Activo',
  [EstadoCurso.Inactivo]: 'Inactivo',
  [EstadoCurso.Archivado]: 'Archivado',
}

function getEstadoCursoBadgeClass(estado: number) {
  switch (estado) {
    case EstadoCurso.Activo:
      return 'inline-flex rounded-full border border-green-500/15 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400'
    case EstadoCurso.Inactivo:
      return 'inline-flex rounded-full border border-amber-500/15 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400'
    case EstadoCurso.Archivado:
      return 'inline-flex rounded-full border border-slate-500/15 bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400'
    default:
      return 'inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary'
  }
}

function TeacherCourseCard({ course }: { course: TeacherCourseListItem }) {
  return (
    <Card className="group relative overflow-hidden rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)] transition-all hover:-translate-y-[2px] hover:shadow-[0_26px_56px_-26px_rgba(30,42,68,0.24)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.08),transparent_24%)]" />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-[22px] bg-primary/10 text-primary shadow-sm">
            <BookOpen className="size-6" />
          </div>

          <span className={getEstadoCursoBadgeClass(course.estado)}>
            {estadoLabels[course.estado]}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="size-3.5" />
            Curso asignado
          </div>

          <div className="space-y-3">
            <h3 className="line-clamp-2 text-[1.9rem] font-bold leading-[1.05] tracking-tight text-foreground">
              {course.nombre}
            </h3>

            <div className="inline-flex items-center gap-2 text-[15px] text-muted-foreground">
              <CalendarRange className="size-4.5" />
              <span>Año {course.anio}</span>
            </div>
          </div>
        </div>

        <div className="mt-7">
          <Link href={`/teacher/courses/${course.id}`}>
            <Button
              className="h-11 rounded-2xl px-5 text-sm font-semibold shadow-[0_14px_28px_-16px_rgba(36,59,123,0.40)] transition-all hover:-translate-y-[1px] hover:shadow-[0_18px_36px_-18px_rgba(36,59,123,0.46)]"
            >
              Abrir curso
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function TeacherCourseCardSkeleton() {
  return (
    <div className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="h-14 w-14 animate-pulse rounded-[22px] bg-muted/40" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-muted/40" />
        </div>

        <div className="space-y-4">
          <div className="h-6 w-32 animate-pulse rounded-full bg-muted/40" />
          <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-muted/40" />
          <div className="h-5 w-24 animate-pulse rounded-xl bg-muted/40" />
        </div>

        <div className="pt-2">
          <div className="h-11 w-36 animate-pulse rounded-2xl bg-muted/40" />
        </div>
      </div>
    </div>
  )
}
export function TeacherCoursesTable() {
  const [items, setItems] = useState<TeacherCourseListItem[]>([])
  const [search, setSearch] = useState('')
  const [anio, setAnio] = useState('')
  const [estado, setEstado] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(timeout)
  }, [search])

  const loadCourses = async () => {
    setLoading(true)

    try {
      const data = await getTeacherCourses({
        pageNumber: 1,
        pageSize: 50,
        search: debouncedSearch,
        anio: anio.trim() ? Number(anio) : undefined,
        estado: estado.trim() ? Number(estado) : undefined,
      })

      setItems(data.items)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [debouncedSearch, anio, estado])

  const emptyStateText = useMemo(() => {
    if (debouncedSearch.trim() || anio.trim() || estado.trim()) {
      return 'No se encontraron cursos con esos filtros.'
    }

    return 'Todavía no tenés cursos asignados.'
  }, [debouncedSearch, anio, estado])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar curso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-2xl border-border/70 bg-card/80 pl-10 shadow-sm"
            />
          </div>

          <Input
            placeholder="Filtrar por año"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            className="h-11 rounded-2xl border-border/70 bg-card/80 shadow-sm"
          />

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="flex h-11 rounded-2xl border border-border/70 bg-card/80 px-3 py-2 text-sm shadow-sm outline-none"
          >
            <option value="">Todos los estados</option>
            <option value={EstadoCurso.Activo}>Activo</option>
            <option value={EstadoCurso.Inactivo}>Inactivo</option>
            <option value={EstadoCurso.Archivado}>Archivado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <TeacherCourseCardSkeleton key={index} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
          <CardContent className="px-6 py-14 text-center text-sm text-muted-foreground">
            {emptyStateText}
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