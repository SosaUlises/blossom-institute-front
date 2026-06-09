'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Edit3,
  Eye,
  Mail,
  MoreHorizontal,
  Power,
  Search,
  ShieldAlert,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'

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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/shared/user-avatar'
import {
  activateTeacher,
  deactivateTeacher,
  getTeachers,
} from '@/lib/admin/teachers/api'
import {
  hasRelevantTeacherPendingCorrections,
  requiresTeacherOperationalFollowUp,
} from '@/lib/admin/teachers/follow-up'
import type { Profesor } from '@/lib/admin/teachers/types'
import { cn } from '@/lib/utils'

type RosterFilter =
  | 'all'
  | 'active'
  | 'without-courses'
  | 'critical-courses'
  | 'pending-corrections'
  | 'inactive'

const PAGE_SIZE = 20

const filters: Array<{ value: RosterFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'without-courses', label: 'Sin cursos asignados' },
  { value: 'critical-courses', label: 'Con cursos críticos' },
  { value: 'pending-corrections', label: 'Correcciones acumuladas' },
  { value: 'inactive', label: 'Inactivos' },
]

function getFullName(teacher: Profesor) {
  return `${teacher.nombre} ${teacher.apellido}`.trim()
}

function formatNumber(value?: number | null, fallback = '0') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback

  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 0,
  }).format(value)
}

function getCoursesCount(teacher: Profesor) {
  return teacher.assignedCoursesCount ?? teacher.assignedCourses?.length ?? 0
}

function getMainCourseLabel(teacher: Profesor) {
  const courses = teacher.assignedCourses ?? []

  if (courses.length === 0) return 'Sin cursos asignados'

  const [firstCourse, ...rest] = courses
  if (rest.length === 0) return firstCourse.name

  return `${firstCourse.name} y ${rest.length} más`
}

function getSignalTone(teacher: Profesor) {
  if ((teacher.coursesAtRiskCount ?? 0) > 0) return 'critical'
  if ((teacher.unloadedAttendanceCount ?? 0) > 0) return 'attention'
  if (
    hasRelevantTeacherPendingCorrections({
      pendingCorrectionsCount: teacher.pendingCorrectionsCount,
      studentsCount: teacher.studentsCount,
    })
  ) {
    return 'attention'
  }

  return 'healthy'
}

function ActiveStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        active
          ? 'border-border/60 bg-muted/20 text-muted-foreground'
          : 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
      )}
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

function SignalBadge({ teacher }: { teacher: Profesor }) {
  const tone = getSignalTone(teacher)
  const label = teacher.mainSignal || 'Sin señales pendientes'

  if (tone === 'critical') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
        <ShieldAlert className="size-3.5" />
        {label}
      </span>
    )
  }

  if (tone === 'attention') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
        <AlertCircle className="size-3.5" />
        {label}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
      <CheckCircle2 className="size-3.5" />
      {label}
    </span>
  )
}

function MetricPill({
  label,
  value,
  tone = 'muted',
}: {
  label: string
  value: string
  tone?: 'healthy' | 'attention' | 'critical' | 'muted'
}) {
  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-medium',
        tone === 'healthy' &&
          'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        tone === 'attention' &&
          'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        tone === 'critical' &&
          'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
        tone === 'muted' &&
          'border-border/60 bg-muted/25 text-muted-foreground',
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </span>
  )
}

function TeachersToolbar({
  search,
  setSearch,
  activeFilter,
  setActiveFilter,
}: {
  search: string
  setSearch: (value: string) => void
  activeFilter: RosterFilter
  setActiveFilter: (value: RosterFilter) => void
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 p-3 shadow-sm">
      <div className="grid gap-3 xl:grid-cols-[minmax(260px,0.75fr)_minmax(0,1.25fr)] xl:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            placeholder="Buscar por nombre o correo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 rounded-xl border-border/60 bg-background/75 pl-10 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto rounded-xl border border-border/50 bg-background/60 p-1 dark:bg-background/25">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={cn(
                'min-h-8 shrink-0 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors active:scale-[0.98]',
                activeFilter === filter.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'hover:bg-card/60 hover:text-foreground',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function TeacherRosterRow({
  teacher,
  actionLoadingId,
  onRequestToggleActive,
}: {
  teacher: Profesor
  actionLoadingId: number | null
  onRequestToggleActive: (teacher: Profesor) => void
}) {
  const fullName = getFullName(teacher)
  const coursesCount = getCoursesCount(teacher)
  const studentsCount = teacher.studentsCount ?? 0
  const requiresFollowUp = requiresTeacherOperationalFollowUp({
    pendingCorrectionsCount: teacher.pendingCorrectionsCount,
    studentsCount,
    coursesAtRiskCount: teacher.coursesAtRiskCount,
    unloadedAttendanceCount: teacher.unloadedAttendanceCount,
  })

  return (
    <article className="rounded-2xl border border-border/60 bg-card/95 px-4 py-4 shadow-sm transition-colors hover:border-primary/20 sm:px-5">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.9fr)_minmax(240px,0.75fr)_auto] xl:items-center">
        <div className="flex min-w-0 gap-3">
          <UserAvatar
            name={fullName}
            avatarUrl={teacher.avatarUrl}
            size={44}
            className="shrink-0"
            fallbackClassName="bg-primary/10 text-primary"
          />

          <div className="min-w-0">
            <h3 className="min-w-0 text-[15px] font-semibold leading-6 text-foreground">
              {fullName}
            </h3>
            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate" title={teacher.email}>
                {teacher.email}
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <MetricPill
              label="Cursos"
              value={coursesCount === 1 ? '1 asignado' : `${coursesCount} asignados`}
              tone="muted"
            />
            <MetricPill
              label="Alumnos"
              value={studentsCount === 1 ? '1 alumno' : `${formatNumber(studentsCount)} alumnos`}
            />
          </div>
          <div className="flex min-w-0 items-start gap-2 text-sm">
            <BookOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="min-w-0 text-muted-foreground">
              <span className="font-medium text-foreground">{getMainCourseLabel(teacher)}</span>
            </p>
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <SignalBadge teacher={teacher} />
            <ActiveStatusBadge active={teacher.activo} />
          </div>
          <p className="text-sm leading-5 text-muted-foreground">
            <span className="font-medium text-foreground">Seguimiento:</span>{' '}
            {requiresFollowUp ? 'requiere revisión' : 'sin acciones pendientes'}
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center xl:justify-end">
          <Button
            asChild
            size="sm"
            className="h-9 w-full justify-start rounded-xl px-3 shadow-none active:scale-[0.98] sm:w-auto sm:justify-center"
          >
            <Link href={`/admin/dashboard/teachers/${teacher.id}/profile`}>
              <Eye className="mr-2 size-4" />
              Ver seguimiento
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-9 w-full justify-start rounded-xl border-border/70 bg-background/70 px-3 shadow-none hover:border-primary/25 hover:bg-primary/5 hover:text-primary active:scale-[0.98] sm:w-auto sm:justify-center"
          >
            <Link href={`/admin/dashboard/teachers/${teacher.id}`}>
              <Edit3 className="mr-2 size-4" />
              Editar datos
            </Link>
          </Button>

          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => onRequestToggleActive(teacher)}
            disabled={actionLoadingId === teacher.id}
            className={cn(
              'h-9 w-full justify-start rounded-xl border px-3 shadow-none active:scale-[0.98] sm:w-auto sm:justify-center',
              teacher.activo
                ? 'border-border/70 bg-background/70 text-muted-foreground hover:border-rose-500/25 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300'
                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300',
            )}
          >
            {teacher.activo ? (
              <>
                <Power className="mr-2 size-4" />
                Desactivar
              </>
            ) : (
              <>
                <UserCheck className="mr-2 size-4" />
                Activar
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  )
}

function TeachersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border/60 bg-card/95 px-4 py-4 shadow-sm"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.9fr)_minmax(240px,0.75fr)_auto]">
            <div className="flex gap-3">
              <div className="size-11 animate-pulse rounded-full bg-muted/45" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-44 animate-pulse rounded-lg bg-muted/45" />
                <div className="h-4 w-56 animate-pulse rounded-lg bg-muted/30" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-72 max-w-full animate-pulse rounded-xl bg-muted/30" />
              <div className="h-4 w-64 max-w-full animate-pulse rounded-lg bg-muted/25" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-64 max-w-full animate-pulse rounded-xl bg-muted/30" />
              <div className="h-4 w-52 max-w-full animate-pulse rounded-lg bg-muted/25" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-28 animate-pulse rounded-xl bg-muted/30" />
              <div className="h-9 w-24 animate-pulse rounded-xl bg-muted/25" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyTeachersState({ text }: { text: string }) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
      <CardContent className="px-6 py-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <h4 className="mt-4 text-base font-semibold tracking-tight text-foreground">
            Sin docentes para mostrar
          </h4>
          <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            {text}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function PaginationFooter({
  pageNumber,
  pageSize,
  total,
  visibleCount,
  filteredCount,
  hasFilter,
  onPrevious,
  onNext,
}: {
  pageNumber: number
  pageSize: number
  total: number
  visibleCount: number
  filteredCount: number
  hasFilter: boolean
  onPrevious: () => void
  onNext: () => void
}) {
  const from = total === 0 ? 0 : (pageNumber - 1) * pageSize + 1
  const to = Math.min(pageNumber * pageSize, total)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/95 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div>
        <span className="font-medium text-foreground">
          {from}-{to}
        </span>{' '}
        de {total} docentes
        {hasFilter ? (
          <span className="ml-2 text-muted-foreground">
            {filteredCount} coinciden en esta página
          </span>
        ) : (
          <span className="ml-2 text-muted-foreground">{visibleCount} visibles</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={pageNumber <= 1}
          className="h-9 rounded-xl border-border/70 bg-background/70 shadow-none active:scale-[0.98]"
        >
          <ArrowLeft className="mr-2 size-4" />
          Anterior
        </Button>
        <span className="min-w-20 text-center text-xs">
          Página {pageNumber} de {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={pageNumber >= totalPages}
          className="h-9 rounded-xl border-border/70 bg-background/70 shadow-none active:scale-[0.98]"
        >
          Siguiente
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}

export function TeachersTable() {
  const [items, setItems] = useState<Profesor[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<RosterFilter>('all')
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [total, setTotal] = useState(0)
  const [pendingToggleTeacher, setPendingToggleTeacher] = useState<Profesor | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
      setPageNumber(1)
    }, 350)

    return () => clearTimeout(timeout)
  }, [search])

  const loadTeachers = async () => {
    setLoading(true)

    try {
      const data = await getTeachers({
        pageNumber,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
      })

      setItems(data.items)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeachers()
  }, [debouncedSearch, pageNumber])

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      if (activeFilter === 'active') return item.activo
      if (activeFilter === 'inactive') return !item.activo
      if (activeFilter === 'without-courses') return getCoursesCount(item) === 0
      if (activeFilter === 'critical-courses') return (item.coursesAtRiskCount ?? 0) > 0
      if (activeFilter === 'pending-corrections') {
        return hasRelevantTeacherPendingCorrections({
          pendingCorrectionsCount: item.pendingCorrectionsCount,
          studentsCount: item.studentsCount,
        })
      }

      return true
    })
  }, [items, activeFilter])

  const emptyStateText = useMemo(() => {
    if (debouncedSearch.trim() || activeFilter !== 'all') {
      return 'No se encontraron docentes con esos filtros en esta página.'
    }

    return 'Todavía no hay docentes cargados en el sistema.'
  }, [debouncedSearch, activeFilter])

  const hasClientFilter = activeFilter !== 'all'

  const handleConfirmToggleActive = async () => {
    if (!pendingToggleTeacher) return

    setActionLoadingId(pendingToggleTeacher.id)

    try {
      if (pendingToggleTeacher.activo) {
        await deactivateTeacher(pendingToggleTeacher.id)
      } else {
        await activateTeacher(pendingToggleTeacher.id)
      }

      await loadTeachers()
      setPendingToggleTeacher(null)
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <TeachersToolbar
        search={search}
        setSearch={setSearch}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MoreHorizontal className="size-4" />
          <span>
            {hasClientFilter
              ? 'Filtros académicos aplicados sobre la página actual.'
              : 'Vista del equipo docente con señales académicas y operativas.'}
          </span>
        </div>
        <span className="hidden sm:inline">{PAGE_SIZE} por página</span>
      </div>

      {loading ? (
        <TeachersSkeleton />
      ) : visibleItems.length === 0 ? (
        <EmptyTeachersState text={emptyStateText} />
      ) : (
        <div className="space-y-2">
          {visibleItems.map((teacher) => (
            <TeacherRosterRow
              key={teacher.id}
              teacher={teacher}
              actionLoadingId={actionLoadingId}
              onRequestToggleActive={setPendingToggleTeacher}
            />
          ))}
        </div>
      )}

      {!loading ? (
        <PaginationFooter
          pageNumber={pageNumber}
          pageSize={PAGE_SIZE}
          total={total}
          visibleCount={visibleItems.length}
          filteredCount={visibleItems.length}
          hasFilter={hasClientFilter}
          onPrevious={() => setPageNumber((current) => Math.max(1, current - 1))}
          onNext={() => setPageNumber((current) => current + 1)}
        />
      ) : null}

      <AlertDialog
        open={pendingToggleTeacher !== null}
        onOpenChange={(open) => {
          if (!open) setPendingToggleTeacher(null)
        }}
      >
        <AlertDialogContent className="rounded-2xl border-border/60 bg-card/95">
          <AlertDialogHeader>
            {pendingToggleTeacher ? (
              <div className="mb-2 flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 p-3 dark:bg-background/25">
                <UserAvatar
                  name={getFullName(pendingToggleTeacher)}
                  avatarUrl={pendingToggleTeacher.avatarUrl}
                  size={40}
                  fallbackClassName="bg-primary/10 text-primary"
                />
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {getFullName(pendingToggleTeacher)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {pendingToggleTeacher.email}
                  </p>
                </div>
              </div>
            ) : null}
            <AlertDialogTitle className="text-lg">
              {pendingToggleTeacher?.activo ? 'Desactivar docente' : 'Activar docente'}
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-6">
              {pendingToggleTeacher?.activo ? (
                <>
                  Vas a desactivar a {pendingToggleTeacher ? getFullName(pendingToggleTeacher) : 'este docente'}.
                  Podés volver a activarlo más adelante.
                </>
              ) : (
                <>
                  Vas a activar a {pendingToggleTeacher ? getFullName(pendingToggleTeacher) : 'este docente'}.
                  El docente volverá a figurar como activo.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl shadow-none active:scale-[0.98]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmToggleActive}
              className={cn(
                'rounded-xl shadow-none active:scale-[0.98]',
                pendingToggleTeacher?.activo
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
            >
              {pendingToggleTeacher?.activo ? (
                <>
                  <UserX className="mr-2 size-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 size-4" />
                  Activar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
