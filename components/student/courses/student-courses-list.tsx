'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Inbox,
  Search,
  UserRound,
  Users,
} from 'lucide-react'

import {
  CourseThemeBackground,
} from '@/components/teacher/course-detail/course-theme-background'
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

const ESTADO_CONFIG: Record<EstadoCurso, { label: string; pill: string }> = {
  [EstadoCurso.Activo]: {
    label: 'En curso',
    pill: '',
  },
  [EstadoCurso.Inactivo]: {
    label: 'Pausado',
    pill:
      'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  },
  [EstadoCurso.Archivado]: {
    label: 'Finalizado',
    pill:
      'border-slate-400/25 bg-slate-500/10 text-slate-700 dark:text-slate-300',
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
    'ProfesorPrincipal',
    'ProfesorNombreCompleto',
    'TeacherName',
  ])

  if (fullName) return fullName

  const firstName = getText(course, [
    'profesorNombre',
    'teacherFirstName',
    'ProfesorNombre',
    'TeacherFirstName',
  ])
  const lastName = getText(course, [
    'profesorApellido',
    'teacherLastName',
    'ProfesorApellido',
    'TeacherLastName',
  ])

  return [firstName, lastName].filter(Boolean).join(' ').trim() || null
}

function getCourseDescription(course: StudentCourseListItem) {
  return getText(course, [
    'descripcion',
    'description',
    'turno',
    'cursoDescripcion',
    'Descripcion',
    'Description',
    'Turno',
    'CursoDescripcion',
  ])
}

function getCourseTheme(course: StudentCourseListItem) {
  return getText(course, [
    'themeIcon',
    'theme',
    'tema',
    'themeName',
    'ThemeIcon',
    'Theme',
    'Tema',
    'ThemeName',
  ])
}

function getStudentsCount(course: StudentCourseListItem) {
  return getNumber(course, [
    'cantidadAlumnos',
    'alumnosCount',
    'studentsCount',
    'studentCount',
    'CantidadAlumnos',
    'AlumnosCount',
    'StudentsCount',
    'StudentCount',
  ])
}

function getCompanionsCount(course: StudentCourseListItem) {
  const directCount = getNumber(course, [
    'cantidadCompaneros',
    'companerosCount',
    'compañerosCount',
    'classmatesCount',
    'CantidadCompaneros',
    'CompanerosCount',
    'ClassmatesCount',
  ])

  if (directCount != null) return directCount

  const studentsCount = getStudentsCount(course)
  return studentsCount != null ? Math.max(0, studentsCount - 1) : null
}

function getPendingTasksCount(course: StudentCourseListItem) {
  return getNumber(course, [
    'tareasPendientes',
    'tareasPendientesCount',
    'pendingTasks',
    'pendingTasksCount',
    'TareasPendientes',
    'TareasPendientesCount',
    'PendingTasks',
    'PendingTasksCount',
  ])
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('T')[0].split('-').map(Number)

  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function formatNextClassDate(value: string) {
  const date = parseLocalDate(value)
  if (!date) return value

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (isSameDate(date, today)) return 'Hoy'
  if (isSameDate(date, tomorrow)) return 'Mañana'

  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function getNextClassLabel(course: StudentCourseListItem) {
  const date = getText(course, [
    'proximaClaseFecha',
    'nextClassDate',
    'ProximaClaseFecha',
    'NextClassDate',
  ])
  const start = getText(course, [
    'proximaClaseHoraInicio',
    'nextClassStart',
    'ProximaClaseHoraInicio',
    'NextClassStart',
  ])
  const fallback = getText(course, [
    'proximaClase',
    'nextClass',
    'ProximaClase',
    'NextClass',
  ])

  if (date && start) return `${formatNextClassDate(date)} · ${start.slice(0, 5)}`
  if (date) return formatNextClassDate(date)

  return fallback
}

function CourseStateChip({ estado }: { estado?: number }) {
  if (!estado || estado === EstadoCurso.Activo) return null

  const config = ESTADO_CONFIG[estado as EstadoCurso]
  if (!config) return null

  return (
    <span
      className={cn(
        'absolute right-3 top-3 z-10 rounded-md border px-2 py-1 text-xs font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-sm',
        config.pill,
      )}
    >
      {config.label}
    </span>
  )
}

function CourseCardSkeleton() {
  return (
    <li className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
      <div className="h-24 border-b border-border/40 bg-muted/20 sm:h-28">
        <div className="h-full w-full animate-pulse bg-muted/35" />
      </div>
      <div className="flex min-h-36 flex-col p-4 sm:p-5">
        <div className="space-y-2.5">
          <div className="h-5 w-40 animate-pulse rounded-md bg-muted/50" />
          <div className="h-4 w-48 max-w-full animate-pulse rounded-md bg-muted/35" />
        </div>
        <div className="mt-auto space-y-2 pt-5">
          <div className="h-4 w-36 animate-pulse rounded-md bg-muted/35" />
          <div className="h-4 w-28 animate-pulse rounded-md bg-muted/30" />
        </div>
      </div>
    </li>
  )
}

function CourseCard({ course }: { course: StudentCourseListItem }) {
  const courseId = getCourseId(course)
  const courseName = getCourseName(course)
  const teacherName = getTeacherName(course)
  const description = getCourseDescription(course)
  const theme = getCourseTheme(course)
  const nextClass = getNextClassLabel(course)
  const companionsCount = getCompanionsCount(course)
  const pendingTasks = getPendingTasksCount(course)

  return (
    <li>
      <Link
        href={`/student/courses/${courseId ?? 0}`}
        aria-label={`Abrir curso ${courseName}`}
        className="group block h-full rounded-2xl outline-none transition-transform duration-200 ease-out active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <article className="relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all duration-200 ease-out hover:border-border/70 hover:shadow-md">
          <div className="relative h-24 w-full overflow-hidden border-b border-border/40 bg-muted/20 sm:h-28">
            <CourseThemeBackground theme={theme} variant="card" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/20 to-transparent" />
            <CourseStateChip estado={course.estado} />
          </div>

          <div className="flex flex-1 flex-col p-4 sm:p-5">
            <div className="min-w-0">
              <h3 className="truncate text-xl font-bold leading-tight text-foreground transition-colors duration-200 group-hover:text-primary">
                {courseName}
              </h3>
              {description ? (
                <p className="mt-1 line-clamp-1 text-sm leading-5 text-muted-foreground">
                  {description}
                </p>
              ) : (
                <p className="mt-1 line-clamp-1 text-sm leading-5 text-muted-foreground">
                  {teacherName ? `Con ${teacherName}` : 'Aula de aprendizaje'}
                </p>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-2.5 pt-5 text-sm">
              {nextClass ? (
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
                    <CalendarClock className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="mr-1.5 text-xs font-normal text-muted-foreground">
                      Próxima clase
                    </span>
                    {nextClass}
                  </span>
                </div>
              ) : null}

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {teacherName && description ? (
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <UserRound className="size-4 shrink-0" />
                    <span className="truncate">Con {teacherName}</span>
                  </span>
                ) : null}

                {companionsCount != null ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-4 shrink-0" />
                    {companionsCount}{' '}
                    {companionsCount === 1 ? 'compañero' : 'compañeros'}
                  </span>
                ) : null}

                {pendingTasks != null && pendingTasks > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/8 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <ClipboardList className="size-3.5 shrink-0" />
                    {pendingTasks}{' '}
                    {pendingTasks === 1 ? 'tarea pendiente' : 'tareas pendientes'}
                  </span>
                ) : null}

                <span className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-muted-foreground transition-[border-color,background-color,color,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:border-primary/25 group-hover:bg-primary/8 group-hover:text-primary dark:bg-background/35">
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </div>
          </div>
        </article>
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
  const visibleCountLabel = useMemo(
    () =>
      `${items.length} ${
        items.length === 1 ? 'aula de aprendizaje' : 'aulas de aprendizaje'
      }`,
    [items.length],
  )

  return (
    <div className="space-y-4">
      <section className="mb-5 rounded-2xl border border-border/40 bg-card p-3 shadow-sm sm:p-3.5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_140px] lg:grid-cols-[1fr_140px_180px]">
          <div className="relative col-span-2 sm:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Buscar curso..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 rounded-xl border-border/60 bg-background/75 pl-10 text-sm shadow-none transition-colors duration-200 hover:border-border/80 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35 sm:h-10"
            />
          </div>

          <Input
            type="number"
            placeholder="Año"
            value={anio}
            min={2000}
            max={2100}
            onChange={(event) => setAnio(event.target.value)}
            className="h-11 rounded-xl border-border/60 bg-background/75 text-sm shadow-none transition-colors duration-200 hover:border-border/80 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35 sm:h-10"
          />

          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger className="h-11 rounded-xl border-border/60 bg-background/75 px-4 text-sm shadow-none transition-colors duration-200 hover:border-border/80 focus:ring-2 focus:ring-primary/15 data-[state=open]:border-primary/30 data-[state=open]:ring-2 data-[state=open]:ring-primary/10 dark:bg-background/35 sm:col-span-2 sm:h-10 lg:col-span-1">
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
      </section>

      {loading ? (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <Card className="rounded-xl border border-border/70 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90">
          <CardContent className="px-6 py-10">
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
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-sm text-muted-foreground">{visibleCountLabel}</p>
            {hasActiveFilters ? (
              <span className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">
                Filtros activos
              </span>
            ) : null}
          </div>

          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((course, index) => (
              <CourseCard key={getCourseId(course) ?? index} course={course} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
