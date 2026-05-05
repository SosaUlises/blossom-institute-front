'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  BookOpen,
  CalendarRange,
  ChevronRight,
  Clock,
  Inbox,
  Search,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getStudentCourses } from '@/lib/student/courses/api'
import {
  EstadoCurso,
  type StudentCourseListItem,
} from '@/lib/student/courses/types'
import { cn } from '@/lib/utils'

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

function getCourseId(course: StudentCourseListItem) {
  return course.id ?? course.cursoId ?? null
}

function getCourseName(course: StudentCourseListItem) {
  return course.nombre ?? course.cursoNombre ?? 'Curso'
}

function EstadoBadge({ estado }: { estado?: number }) {
  const config = ESTADO_CONFIG[estado as EstadoCurso] ?? {
    label: 'Desconocido',
    dot: 'bg-muted-foreground',
    pill: 'border-border/60 bg-muted/40 text-muted-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
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
    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/[0.22] px-3 py-1.5 text-xs font-medium text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      {children}
    </span>
  )
}

function CourseCardSkeleton() {
  return (
    <li className="rounded-[30px] border border-border/60 bg-card/95 p-5 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 animate-pulse rounded-[20px] bg-muted/60" />
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded-lg bg-muted/40" />
            <div className="h-8 w-40 animate-pulse rounded-lg bg-muted/60" />
          </div>
        </div>
        <div className="h-7 w-24 animate-pulse rounded-full bg-muted/50" />
      </div>

      <div className="mt-5 flex gap-2">
        <div className="h-8 w-24 animate-pulse rounded-full bg-muted/40" />
        <div className="h-8 w-28 animate-pulse rounded-full bg-muted/40" />
      </div>

      <div className="mt-6 h-16 animate-pulse rounded-[22px] bg-muted/40" />
    </li>
  )
}

function CourseCard({ course }: { course: StudentCourseListItem }) {
  const courseId = getCourseId(course)
  const courseName = getCourseName(course)

  return (
    <li>
      <Link
        href={`/student/courses/${courseId ?? 0}`}
        className="group block rounded-[30px] border border-border/60 bg-card/95 p-5 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.18)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-[20px] border border-primary/10 bg-primary/8 text-primary shadow-sm transition-all duration-300 group-hover:scale-[1.03] group-hover:bg-primary/10">
              <BookOpen className="size-6" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/75">
                Curso
              </p>
              <h3 className="mt-2 truncate text-[2rem] font-semibold leading-none tracking-tight text-foreground">
                {courseName}
              </h3>
            </div>
          </div>

          <EstadoBadge estado={course.estado} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {course.anio != null ? (
            <MetaPill icon={CalendarRange}>Año {course.anio}</MetaPill>
          ) : null}

          {typeof course.cantidadHorarios === 'number' &&
          course.cantidadHorarios > 0 ? (
            <MetaPill icon={Clock}>
              {course.cantidadHorarios}{' '}
              {course.cantidadHorarios === 1 ? 'horario' : 'horarios'}
            </MetaPill>
          ) : null}
        </div>

        <div className="mt-6 rounded-[22px] border border-border/60 bg-muted/[0.16] px-4 py-3.5 transition-all duration-200 group-hover:border-primary/15 group-hover:bg-primary/[0.04]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">Ver curso</p>

            <div className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground transition-all duration-200 group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary">
              <ChevronRight className="size-4" />
            </div>
          </div>
        </div>
      </Link>
    </li>
  )
}

export function StudentCoursesList() {
  const [items, setItems] = useState<StudentCourseListItem[]>([])
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
      const data = await getStudentCourses({
        pageNumber: 1,
        pageSize: 20,
        search: debouncedSearch,
        anio: anio ? Number(anio) : undefined,
        estado: estado !== SELECT_ALL ? Number(estado) : undefined,
      })

      setItems(Array.isArray(data.items) ? data.items : [])
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
      <div className="rounded-[28px] border border-border/60 bg-card/70 p-4 shadow-[0_16px_36px_-24px_rgba(15,23,42,0.14)] backdrop-blur-sm">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_0.7fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Buscar curso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-2xl border-border/60 bg-background/80 pl-10 text-sm shadow-[0_8px_18px_-14px_rgba(15,23,42,0.10)] transition-all duration-200 hover:border-border/80 focus-visible:ring-2 focus-visible:ring-primary/15"
            />
          </div>

          <Input
            type="number"
            placeholder="Año"
            value={anio}
            min={2000}
            max={2100}
            onChange={(e) => setAnio(e.target.value)}
            className="h-12 rounded-2xl border-border/60 bg-background/80 text-sm shadow-[0_8px_18px_-14px_rgba(15,23,42,0.10)] transition-all duration-200 hover:border-border/80 focus-visible:ring-2 focus-visible:ring-primary/15"
          />

          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-background/80 px-4 text-sm shadow-[0_8px_18px_-14px_rgba(15,23,42,0.10)] transition-all duration-200 hover:border-border/80 focus:ring-2 focus:ring-primary/15 data-[state=open]:border-primary/30 data-[state=open]:ring-2 data-[state=open]:ring-primary/10">
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
      </div>

      {loading ? (
        <ul className="grid gap-5 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <Card className="rounded-[30px] border border-border/60 bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
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
                    : 'Todavia no tenes cursos asignados.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-5 xl:grid-cols-2">
          {items.map((course, index) => (
            <CourseCard key={getCourseId(course) ?? index} course={course} />
          ))}
        </ul>
      )}
    </div>
  )
}
