'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  BookOpen,
  CalendarRange,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Inbox,
  Megaphone,
  Search,
  UserRound,
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
  { value: String(EstadoCurso.Activo), label: 'En curso' },
  { value: String(EstadoCurso.Inactivo), label: 'Pausado' },
  { value: String(EstadoCurso.Archivado), label: 'Finalizado' },
] as const

const ESTADO_CONFIG: Record<
  EstadoCurso,
  { label: string; dot: string; pill: string }
> = {
  [EstadoCurso.Activo]: {
    label: 'En curso',
    dot: 'bg-emerald-500',
    pill:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  [EstadoCurso.Inactivo]: {
    label: 'Pausado',
    dot: 'bg-amber-500',
    pill:
      'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  [EstadoCurso.Archivado]: {
    label: 'Finalizado',
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

function getText(course: StudentCourseListItem, keys: string[]) {
  for (const key of keys) {
    const value = course[key]

    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }

  return null
}

function getNumber(course: StudentCourseListItem, keys: string[]) {
  for (const key of keys) {
    const value = course[key]
    const numberValue =
      typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim()
          ? Number(value)
          : Number.NaN

    if (Number.isFinite(numberValue)) return numberValue
  }

  return null
}

function getTeacherName(course: StudentCourseListItem) {
  const fullName = getText(course, [
    'profesorPrincipal',
    'profesorNombreCompleto',
    'teacherName',
  ])

  if (fullName) return fullName

  const firstName = getText(course, ['profesorNombre', 'teacherFirstName'])
  const lastName = getText(course, ['profesorApellido', 'teacherLastName'])

  return [firstName, lastName].filter(Boolean).join(' ').trim() || null
}

function getAcademicHighlights(course: StudentCourseListItem) {
  const pendingTasks = getNumber(course, [
    'tareasPendientes',
    'tareasPendientesCount',
    'pendingTasks',
  ])
  const nextClass = getText(course, [
    'proximaClase',
    'proximaClaseFecha',
    'nextClass',
    'nextClassDate',
  ])
  const latestPost = getText(course, [
    'ultimaPublicacion',
    'ultimaNovedad',
    'lastPost',
    'lastAnnouncement',
  ])
  const attendance = getText(course, ['asistencia', 'porcentajeAsistencia'])

  const highlights: Array<{
    icon: React.ComponentType<{ className?: string }>
    label: string
    tone: string
  }> = []

  if (pendingTasks != null) {
    highlights.push({
      icon: ClipboardList,
      label:
        pendingTasks > 0
          ? `${pendingTasks} ${pendingTasks === 1 ? 'tarea para entregar' : 'tareas para entregar'}`
          : 'Sin tareas pendientes',
      tone:
        pendingTasks > 0
          ? 'border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300'
          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    })
  }

  if (nextClass) {
    highlights.push({
      icon: CalendarClock,
      label: `Próxima clase: ${nextClass}`,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    })
  }

  if (latestPost) {
    highlights.push({
      icon: Megaphone,
      label: `Última novedad: ${latestPost}`,
      tone: 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    })
  }

  if (highlights.length === 0 && attendance) {
    highlights.push({
      icon: CalendarRange,
      label: `Asistencia: ${attendance}`,
      tone: 'border-border/60 bg-muted/25 text-muted-foreground',
    })
  }

  return highlights.slice(0, 2)
}

function EstadoBadge({ estado }: { estado?: number }) {
  const config = ESTADO_CONFIG[estado as EstadoCurso] ?? {
    label: 'Sin estado',
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

function AcademicPill({
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

function CourseCard({ course }: { course: StudentCourseListItem }) {
  const courseId = getCourseId(course)
  const courseName = getCourseName(course)
  const teacherName = getTeacherName(course)
  const highlights = getAcademicHighlights(course)

  return (
    <li>
      <Link
        href={`/student/courses/${courseId ?? 0}`}
        className="group block rounded-xl border border-border/70 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-colors duration-200 ease-out hover:border-primary/20 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 dark:bg-card/90 sm:p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/8 text-primary shadow-[0_1px_1px_rgba(15,23,42,0.04)] transition-colors duration-200 group-hover:bg-primary/10">
              <BookOpen className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
                {courseName}
              </h3>
              {teacherName ? (
                <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <UserRound className="size-3.5 shrink-0" />
                  <span className="truncate">Con {teacherName}</span>
                </p>
              ) : (
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  Tu aula del curso
                </p>
              )}
            </div>
          </div>

          <EstadoBadge estado={course.estado} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {course.anio != null ? (
            <MetaPill icon={CalendarRange}>Año {course.anio}</MetaPill>
          ) : null}

          {highlights.map((highlight) => (
            <AcademicPill
              key={highlight.label}
              icon={highlight.icon}
              label={highlight.label}
              tone={highlight.tone}
            />
          ))}

          {highlights.length === 0 ? (
            <AcademicPill
              icon={BookOpen}
              label="Aula lista para entrar"
              tone="border-border/60 bg-muted/25 text-muted-foreground"
            />
          ) : null}
        </div>

        <div className="mt-4 rounded-lg border border-border/60 bg-muted/[0.12] px-4 py-3 transition-colors duration-200 ease-out group-hover:border-primary/20 group-hover:bg-primary/[0.05] dark:bg-background/30">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Seguir aprendiendo
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Ver tablón, clases y tareas
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
      <div className="rounded-xl border border-border/70 bg-card/80 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.035)] backdrop-blur-sm dark:bg-card/70">
        <div className="grid gap-2.5 sm:grid-cols-[1fr_140px] lg:grid-cols-[1fr_140px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Buscar un aula..."
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
              <SelectValue placeholder="Todos los cursos" />
            </SelectTrigger>

            <SelectContent className="rounded-xl border-border/70 bg-card/98 shadow-[0_18px_40px_-26px_rgba(15,23,42,0.18)]">
              <SelectItem value={SELECT_ALL}>Todos los cursos</SelectItem>
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
                  {hasActiveFilters ? 'No encontramos cursos' : 'Todavía no tenés cursos'}
                </EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? 'Probá cambiar la búsqueda o los filtros para encontrar tu aula.'
                    : 'Cuando te sumen a un curso, tu aula de aprendizaje va a aparecer acá.'}
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
