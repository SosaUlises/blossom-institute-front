'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Archive,
  BookOpen,
  Pencil,
  Plus,
  Power,
  Search,
  UserCheck,
  Users,
  GraduationCap,
  CalendarRange,
  Settings2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  activateCourse,
  archiveCourse,
  deactivateCourse,
  getCourses,
} from '@/lib/admin/courses/api'
import { EstadoCurso, type CursoListItem } from '@/lib/admin/courses/types'
import { cn } from '@/lib/utils'

const estadoLabels: Record<number, string> = {
  [EstadoCurso.Activo]: 'Activo',
  [EstadoCurso.Inactivo]: 'Inactivo',
  [EstadoCurso.Archivado]: 'Archivado',
}

function CoursesToolbar({
  search,
  setSearch,
  anio,
  setAnio,
  estado,
  setEstado,
}: {
  search: string
  setSearch: (value: string) => void
  anio: string
  setAnio: (value: string) => void
  estado: string
  setEstado: (value: string) => void
}) {
  return (
    <section className="rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)] md:p-6">
      <div className="flex flex-col gap-5">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Gestión
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            Listado de cursos
          </h3>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Buscá, editá y administrá estado, horarios y asignaciones del ciclo académico.
          </p>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1.2fr)_180px_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar curso..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-2xl border-border/70 bg-background/85 pl-10 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
              />
            </div>

            <Input
              placeholder="Filtrar por año"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="h-11 rounded-2xl border-border/70 bg-background/85 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
            />

            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="flex h-11 rounded-2xl border border-border/70 bg-background/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
            >
              <option value="">Todos los estados</option>
              <option value={EstadoCurso.Activo}>Activo</option>
              <option value={EstadoCurso.Inactivo}>Inactivo</option>
              <option value={EstadoCurso.Archivado}>Archivado</option>
            </select>
          </div>

          <Link href="/admin/dashboard/courses/new">
            <Button className="h-11 rounded-2xl bg-primary px-5 text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md">
              <Plus className="mr-2 size-4" />
              Nuevo curso
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function StatusBadge({ estado }: { estado: number }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
        estado === EstadoCurso.Activo
          ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : estado === EstadoCurso.Inactivo
            ? 'border-amber-500/15 bg-amber-500/10 text-amber-700 dark:text-amber-400'
            : 'border-slate-500/15 bg-slate-500/10 text-slate-700 dark:text-slate-400',
      )}
    >
      {estadoLabels[estado]}
    </span>
  )
}

function MetaPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-[20px] border border-border/60 bg-background/80 px-4 py-3 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md">
      <div className="flex size-9 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
        <Icon className="size-4.5" />
      </div>

      <div className="min-w-0 leading-none">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1.5 truncate text-[15px] font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  )
}
function ActionChip({
  href,
  onClick,
  disabled,
  icon: Icon,
  label,
  tone = 'default',
}: {
  href?: string
  onClick?: () => void
  disabled?: boolean
  icon: React.ComponentType<{ className?: string }>
  label: string
  tone?: 'default' | 'primary' | 'warning' | 'danger' | 'success'
}) {
  const className = cn(
    'h-10 rounded-xl border px-3 text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5',
    tone === 'default' &&
      'border-border/70 bg-background/75 text-foreground hover:border-primary/20 hover:bg-primary/8 hover:text-primary',
    tone === 'primary' &&
      'border-primary/15 bg-primary/5 text-primary hover:border-primary/20 hover:bg-primary/8 hover:text-primary',
    tone === 'warning' &&
      'border-amber-500/15 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:text-amber-400',
    tone === 'danger' &&
      'border-rose-500/15 bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:text-rose-400',
    tone === 'success' &&
      'border-emerald-500/15 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400',
  )

  const content = (
    <>
      <Icon className="mr-2 size-4" />
      {label}
    </>
  )

  if (href) {
    return (
      <Link href={href}>
        <Button size="sm" variant="outline" className={className}>
          {content}
        </Button>
      </Link>
    )
  }

  return (
    <Button size="sm" onClick={onClick} disabled={disabled} className={className}>
      {content}
    </Button>
  )
}

function CourseCard({
  course,
  actionLoadingId,
  onToggleActive,
  onArchive,
}: {
  course: CursoListItem
  actionLoadingId: number | null
  onToggleActive: (course: CursoListItem) => Promise<void>
  onArchive: (course: CursoListItem) => Promise<void>
}) {
  const isArchived = course.estado === EstadoCurso.Archivado
  const isActive = course.estado === EstadoCurso.Activo

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-[1px] hover:border-border/80 hover:shadow-[0_24px_52px_-24px_rgba(15,23,42,0.22)] md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.05),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.04),transparent_22%)]" />

      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="min-w-0 space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <BookOpen className="size-5" />
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h4 className="truncate text-[1.08rem] font-semibold tracking-tight text-foreground">
                  {course.nombre}
                </h4>

                <StatusBadge estado={course.estado} />
              </div>

              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Curso académico con configuración activa para el ciclo lectivo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <MetaPill icon={CalendarRange} label="Año" value={String(course.anio)} />
            <MetaPill
              icon={GraduationCap}
              label="Profesores"
              value={`${course.cantidadProfesores}`}
            />
            <MetaPill
              icon={Users}
              label="Alumnos"
              value={`${course.cantidadAlumnos}`}
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-border/60 bg-background/70 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
          <div className="mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Acciones
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestioná configuración, estado y asignaciones del curso.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ActionChip
              href={`/admin/dashboard/courses/${course.id}`}
              icon={Pencil}
              label="Editar"
            />

            <ActionChip
              href={`/admin/dashboard/courses/${course.id}/manage`}
              icon={Settings2}
              label="Gestionar"
              tone="primary"
            />

            {!isArchived && (
              <ActionChip
                onClick={() => onToggleActive(course)}
                disabled={actionLoadingId === course.id}
                icon={isActive ? Power : UserCheck}
                label={isActive ? 'Desactivar' : 'Activar'}
                tone={isActive ? 'warning' : 'success'}
              />
            )}

            {!isArchived && (
              <ActionChip
                onClick={() => onArchive(course)}
                disabled={actionLoadingId === course.id}
                icon={Archive}
                label="Archivar"
                tone="danger"
              />
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function CoursesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)] md:p-6"
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="size-12 animate-pulse rounded-2xl bg-muted/35" />
                <div className="space-y-2">
                  <div className="h-5 w-52 animate-pulse rounded-lg bg-muted/35" />
                  <div className="h-4 w-72 animate-pulse rounded-lg bg-muted/25" />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-12 w-28 animate-pulse rounded-[18px] bg-muted/30" />
                <div className="h-12 w-32 animate-pulse rounded-[18px] bg-muted/30" />
                <div className="h-12 w-28 animate-pulse rounded-[18px] bg-muted/30" />
              </div>
            </div>

            <div className="h-32 animate-pulse rounded-[24px] bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyCoursesState({ text }: { text: string }) {
  return (
    <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
      <CardContent className="px-6 py-14">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <BookOpen className="size-6" />
          </div>

          <h4 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            Sin cursos para mostrar
          </h4>

          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {text}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function CoursesTable() {
  const [items, setItems] = useState<CursoListItem[]>([])
  const [search, setSearch] = useState('')
  const [anio, setAnio] = useState('')
  const [estado, setEstado] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(timeout)
  }, [search])

  const loadCourses = async () => {
    setLoading(true)

    try {
      const data = await getCourses({
        pageNumber: 1,
        pageSize: 20,
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

    return 'Todavía no hay cursos cargados en el sistema.'
  }, [debouncedSearch, anio, estado])

  const handleToggleActive = async (course: CursoListItem) => {
    const isActive = course.estado === EstadoCurso.Activo

    const confirmText = isActive
      ? `¿Querés desactivar el curso ${course.nombre}?`
      : `¿Querés activar el curso ${course.nombre}?`

    const confirmed = window.confirm(confirmText)
    if (!confirmed) return

    setActionLoadingId(course.id)

    try {
      if (isActive) {
        await deactivateCourse(course.id)
      } else {
        await activateCourse(course.id)
      }

      await loadCourses()
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleArchive = async (course: CursoListItem) => {
    const confirmed = window.confirm(`¿Querés archivar el curso ${course.nombre}?`)
    if (!confirmed) return

    setActionLoadingId(course.id)

    try {
      await archiveCourse(course.id)
      await loadCourses()
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <CoursesToolbar
        search={search}
        setSearch={setSearch}
        anio={anio}
        setAnio={setAnio}
        estado={estado}
        setEstado={setEstado}
      />

      {loading ? (
        <CoursesSkeleton />
      ) : items.length === 0 ? (
        <EmptyCoursesState text={emptyStateText} />
      ) : (
        <div className="space-y-4">
          {items.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              actionLoadingId={actionLoadingId}
              onToggleActive={handleToggleActive}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}
    </div>
  )
}