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
  activateStudent,
  deactivateStudent,
  getStudents,
} from '@/lib/admin/students/api'
import type { Alumno } from '@/lib/admin/students/types'
import { cn } from '@/lib/utils'

type RosterFilter = 'all' | 'follow-up' | 'without-course' | 'low-attendance' | 'inactive'

const PAGE_SIZE = 20

const filters: Array<{ value: RosterFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'follow-up', label: 'Requieren seguimiento' },
  { value: 'without-course', label: 'Sin curso' },
  { value: 'low-attendance', label: 'Baja asistencia' },
  { value: 'inactive', label: 'Inactivos' },
]

function getFullName(student: Alumno) {
  return `${student.nombre} ${student.apellido}`.trim()
}

function getAcademicLevel(student: Alumno) {
  return student.academicStatusLevel ?? 'normal'
}

function normalizeAcademicCopy(value?: string | null) {
  if (!value) return ''

  return value
    .replace('Sin alertas academicas', 'Sin alertas académicas')
    .replace('Requiere intervencion prioritaria', 'Requiere intervención prioritaria')
    .replace('Ultima nota baja', 'Última nota baja')
}

function getMainReason(student: Alumno) {
  const reasons = student.academicReasons ?? []

  if (student.isWithoutCourse || !student.hasActiveEnrollment) {
    return 'Sin curso activo'
  }

  if (reasons.length > 0) {
    return normalizeAcademicCopy(reasons[0])
  }

  if (student.latestLowGrade) {
    return `Última nota baja: ${formatNumber(student.latestLowGrade.grade)}`
  }

  return 'Sin señales académicas relevantes'
}

function formatNumber(value?: number | null, fallback = 'Sin datos') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback
  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 1,
  }).format(value)
}

function getAttendanceTone(value?: number | null) {
  if (value === null || value === undefined) return 'muted'
  if (value < 70) return 'critical'
  if (value < 85) return 'attention'
  return 'healthy'
}

function getAverageTone(value?: number | null) {
  if (value === null || value === undefined) return 'muted'
  if (value < 60) return 'critical'
  if (value < 70) return 'attention'
  return 'healthy'
}

function MetricPill({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'healthy' | 'attention' | 'critical' | 'muted'
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

function AcademicStatusBadge({ student }: { student: Alumno }) {
  const level = getAcademicLevel(student)
  const label = normalizeAcademicCopy(student.academicStatusLabel) || 'Sin alertas académicas'

  if (level === 'critical') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
        <ShieldAlert className="size-3.5" />
        Crítico
      </span>
    )
  }

  if (level === 'follow-up') {
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
      Sin seguimiento
    </span>
  )
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

function StudentsToolbar({
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
      <div className="grid gap-3 xl:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)] xl:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            placeholder="Buscar por nombre o email"
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

function StudentRosterRow({
  student,
  actionLoadingId,
  onRequestToggleActive,
}: {
  student: Alumno
  actionLoadingId: number | null
  onRequestToggleActive: (student: Alumno) => void
}) {
  const fullName = getFullName(student)
  const active = student.isActive ?? student.activo
  const courseLabel = student.hasActiveEnrollment
    ? student.currentCourseName ?? 'Curso sin nombre'
    : 'Sin curso activo'
  const courseDescription = student.currentCourseDescription?.trim()
  const mainReason = getMainReason(student)

  return (
    <article className="rounded-2xl border border-border/60 bg-card/95 px-4 py-4 shadow-sm transition-colors hover:border-primary/20 sm:px-5">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.8fr)_auto] xl:items-center">
        <div className="flex min-w-0 gap-3">
          <UserAvatar
            name={fullName}
            avatarUrl={student.avatarUrl}
            size={44}
            className="shrink-0"
            fallbackClassName="bg-primary/10 text-primary"
          />

          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="min-w-0 text-[15px] font-semibold leading-6 text-foreground">
                {fullName}
              </h3>
              <ActiveStatusBadge active={active} />
            </div>
            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate" title={student.email}>
                {student.email}
              </span>
            </div>
            <div className="mt-2 flex min-w-0 items-start gap-2 text-sm">
              <BookOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="min-w-0 text-muted-foreground">
                <span className="font-medium text-foreground">{courseLabel}</span>
                {courseDescription ? (
                  <span className="text-muted-foreground">, {courseDescription}</span>
                ) : null}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <AcademicStatusBadge student={student} />
            <MetricPill
              label="Asistencia"
              value={
                student.attendancePercentage === null || student.attendancePercentage === undefined
                  ? 'Sin datos'
                  : `${formatNumber(student.attendancePercentage)}%`
              }
              tone={getAttendanceTone(student.attendancePercentage)}
            />
            <MetricPill
              label="Promedio"
              value={formatNumber(student.averageGrade)}
              tone={getAverageTone(student.averageGrade)}
            />
          </div>
          <p className="text-sm leading-5 text-muted-foreground">
            <span className="font-medium text-foreground">Señal principal:</span>{' '}
            {mainReason}
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center xl:justify-end">
          <Button
            asChild
            size="sm"
            className="h-9 w-full justify-start rounded-xl px-3 shadow-none active:scale-[0.98] sm:w-auto sm:justify-center"
          >
            <Link href={`/admin/dashboard/students/${student.id}/profile`}>
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
            <Link href={`/admin/dashboard/students/${student.id}`}>
              <Edit3 className="mr-2 size-4" />
              Editar datos
            </Link>
          </Button>

          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => onRequestToggleActive(student)}
            disabled={actionLoadingId === student.id}
            className={cn(
              'h-9 w-full justify-start rounded-xl border px-3 shadow-none active:scale-[0.98] sm:w-auto sm:justify-center',
              active
                ? 'border-border/70 bg-background/70 text-muted-foreground hover:border-rose-500/25 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300'
                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300',
            )}
          >
            {active ? (
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

function StudentsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border/60 bg-card/95 px-4 py-4 shadow-sm"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.8fr)_auto]">
            <div className="flex gap-3">
              <div className="size-11 animate-pulse rounded-full bg-muted/45" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-44 animate-pulse rounded-lg bg-muted/45" />
                <div className="h-4 w-56 animate-pulse rounded-lg bg-muted/30" />
                <div className="h-4 w-72 max-w-full animate-pulse rounded-lg bg-muted/25" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-72 max-w-full animate-pulse rounded-xl bg-muted/30" />
              <div className="h-4 w-64 max-w-full animate-pulse rounded-lg bg-muted/25" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-28 animate-pulse rounded-xl bg-muted/30" />
              <div className="h-9 w-20 animate-pulse rounded-xl bg-muted/25" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyStudentsState({ text }: { text: string }) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
      <CardContent className="px-6 py-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <h4 className="mt-4 text-base font-semibold tracking-tight text-foreground">
            Sin alumnos para mostrar
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
        de {total} alumnos
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

export function StudentsTable() {
  const [items, setItems] = useState<Alumno[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<RosterFilter>('all')
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [total, setTotal] = useState(0)
  const [pendingToggleStudent, setPendingToggleStudent] = useState<Alumno | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
      setPageNumber(1)
    }, 350)

    return () => clearTimeout(timeout)
  }, [search])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const data = await getStudents({
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
    loadStudents()
  }, [debouncedSearch, pageNumber])

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const level = getAcademicLevel(item)
      const attendance = item.attendancePercentage

      if (activeFilter === 'follow-up') return level === 'follow-up' || level === 'critical'
      if (activeFilter === 'without-course') return item.isWithoutCourse || !item.hasActiveEnrollment
      if (activeFilter === 'low-attendance') return attendance !== null && attendance !== undefined && attendance < 70
      if (activeFilter === 'inactive') return !(item.isActive ?? item.activo)

      return true
    })
  }, [items, activeFilter])

  const emptyStateText = useMemo(() => {
    if (debouncedSearch.trim() || activeFilter !== 'all') {
      return 'No se encontraron alumnos con esos filtros en esta página.'
    }

    return 'Todavía no hay alumnos cargados en el sistema.'
  }, [debouncedSearch, activeFilter])

  const hasClientFilter = activeFilter !== 'all'

  const handleConfirmToggleActive = async () => {
    if (!pendingToggleStudent) return

    setActionLoadingId(pendingToggleStudent.id)

    try {
      if (pendingToggleStudent.activo) {
        await deactivateStudent(pendingToggleStudent.id)
      } else {
        await activateStudent(pendingToggleStudent.id)
      }

      await loadStudents()
      setPendingToggleStudent(null)
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <StudentsToolbar
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
              : 'Vista priorizada por señales académicas del trimestre.'}
          </span>
        </div>
        <span className="hidden sm:inline">{PAGE_SIZE} por página</span>
      </div>

      {loading ? (
        <StudentsSkeleton />
      ) : visibleItems.length === 0 ? (
        <EmptyStudentsState text={emptyStateText} />
      ) : (
        <div className="space-y-2">
          {visibleItems.map((student) => (
            <StudentRosterRow
              key={student.id}
              student={student}
              actionLoadingId={actionLoadingId}
              onRequestToggleActive={setPendingToggleStudent}
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
        open={pendingToggleStudent !== null}
        onOpenChange={(open) => {
          if (!open) setPendingToggleStudent(null)
        }}
      >
        <AlertDialogContent className="rounded-2xl border-border/60 bg-card/95">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              {pendingToggleStudent?.activo ? 'Desactivar alumno' : 'Activar alumno'}
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-6">
              {pendingToggleStudent?.activo ? (
                <>
                  Vas a desactivar a {pendingToggleStudent ? getFullName(pendingToggleStudent) : 'este alumno'}.
                  Podés volver a activarlo más adelante.
                </>
              ) : (
                <>
                  Vas a activar a {pendingToggleStudent ? getFullName(pendingToggleStudent) : 'este alumno'}.
                  El alumno volverá a figurar como activo.
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
                pendingToggleStudent?.activo
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
            >
              {pendingToggleStudent?.activo ? (
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
