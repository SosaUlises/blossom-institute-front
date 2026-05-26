'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  IdCard,
  Pencil,
  Phone,
  Plus,
  Power,
  Search,
  UserCheck,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EntityRosterRow } from '@/components/shared/entity-roster-row'
import {
  activateStudent,
  deactivateStudent,
  getStudents,
} from '@/lib/admin/students/api'
import type { Alumno } from '@/lib/admin/students/types'
import { cn } from '@/lib/utils'

type StatusFilter = 'all' | 'active' | 'inactive'

function StudentsToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}: {
  search: string
  setSearch: (value: string) => void
  statusFilter: StatusFilter
  setStatusFilter: (value: StatusFilter) => void
}) {
  return (
    <section className="rounded-xl border border-border/70 bg-card/80 p-3 shadow-sm dark:bg-card/70">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px_auto] lg:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            placeholder="Buscar alumno..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 rounded-xl border-border/60 bg-background/75 pl-10 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          className="h-10 rounded-xl border border-border/60 bg-background/75 px-3 text-sm text-foreground shadow-none outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/15 dark:bg-background/35"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        <Button asChild className="h-10 rounded-xl px-4 shadow-none">
          <Link href="/admin/dashboard/students/new">
            <Plus className="mr-2 size-4" />
            Nuevo alumno
          </Link>
        </Button>
      </div>
    </section>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium',
        active
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400',
      )}
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

function MetadataItem({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/[0.18] px-2.5 py-1">
      <Icon className="size-3.5 shrink-0" />
      {children}
    </span>
  )
}

function StudentRow({
  student,
  actionLoadingId,
  onToggleActive,
}: {
  student: Alumno
  actionLoadingId: number | null
  onToggleActive: (student: Alumno) => Promise<void>
}) {
  const fullName = `${student.nombre} ${student.apellido}`.trim()

  return (
    <EntityRosterRow
      name={fullName}
      email={student.email}
      avatarUrl={student.avatarUrl}
      avatarFallbackClassName="bg-primary/10 text-primary"
      status={<StatusBadge active={student.activo} />}
      metadata={
        <>
          <MetadataItem icon={IdCard}>DNI {student.dni}</MetadataItem>
          <MetadataItem icon={Phone}>{student.telefono || 'Sin telefono'}</MetadataItem>
        </>
      }
      actions={
        <>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-9 rounded-lg border-border/70 bg-background/70 px-3 shadow-none hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
          >
            <Link href={`/admin/dashboard/students/${student.id}`}>
              <Pencil className="mr-2 size-4" />
              Editar
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={() => onToggleActive(student)}
            disabled={actionLoadingId === student.id}
            className={cn(
              'h-9 rounded-lg border px-3 shadow-none',
              student.activo
                ? 'border-rose-500/20 bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:text-rose-400'
                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400',
            )}
          >
            {student.activo ? (
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
        </>
      }
    />
  )
}

function StudentsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-border/70 bg-card/90 px-4 py-3 shadow-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="size-10 animate-pulse rounded-full bg-muted/45" />
              <div className="space-y-2">
                <div className="h-4 w-44 animate-pulse rounded-lg bg-muted/45" />
                <div className="h-4 w-60 animate-pulse rounded-lg bg-muted/30" />
                <div className="h-6 w-52 animate-pulse rounded-full bg-muted/25" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-20 animate-pulse rounded-lg bg-muted/30" />
              <div className="h-9 w-28 animate-pulse rounded-lg bg-muted/30" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyStudentsState({ text }: { text: string }) {
  return (
    <Card className="rounded-2xl border border-border/70 bg-card/90 shadow-sm">
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

export function StudentsTable() {
  const [items, setItems] = useState<Alumno[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)

    return () => clearTimeout(timeout)
  }, [search])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const data = await getStudents({
        pageNumber: 1,
        pageSize: 20,
        search: debouncedSearch,
      })

      setItems(data.items)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [debouncedSearch])

  const visibleItems = useMemo(() => {
    if (statusFilter === 'active') return items.filter((item) => item.activo)
    if (statusFilter === 'inactive') return items.filter((item) => !item.activo)
    return items
  }, [items, statusFilter])

  const emptyStateText = useMemo(() => {
    if (debouncedSearch.trim() || statusFilter !== 'all') {
      return 'No se encontraron alumnos con esos filtros.'
    }

    return 'Todavia no hay alumnos cargados en el sistema.'
  }, [debouncedSearch, statusFilter])

  const handleToggleActive = async (student: Alumno) => {
    const confirmText = student.activo
      ? `Queres desactivar a ${student.nombre} ${student.apellido}?`
      : `Queres activar a ${student.nombre} ${student.apellido}?`

    const confirmed = window.confirm(confirmText)
    if (!confirmed) return

    setActionLoadingId(student.id)

    try {
      if (student.activo) {
        await deactivateStudent(student.id)
      } else {
        await activateStudent(student.id)
      }

      await loadStudents()
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <StudentsToolbar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {loading ? (
        <StudentsSkeleton />
      ) : visibleItems.length === 0 ? (
        <EmptyStudentsState text={emptyStateText} />
      ) : (
        <div className="space-y-2">
          {visibleItems.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              actionLoadingId={actionLoadingId}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  )
}
