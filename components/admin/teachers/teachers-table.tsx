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
  activateTeacher,
  deactivateTeacher,
  getTeachers,
} from '@/lib/admin/teachers/api'
import type { Profesor } from '@/lib/admin/teachers/types'
import { cn } from '@/lib/utils'

type StatusFilter = 'all' | 'active' | 'inactive'

function TeachersToolbar({
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
            placeholder="Buscar profesor..."
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
          <Link href="/admin/dashboard/teachers/new">
            <Plus className="mr-2 size-4" />
            Nuevo profesor
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

function TeacherRow({
  teacher,
  actionLoadingId,
  onToggleActive,
}: {
  teacher: Profesor
  actionLoadingId: number | null
  onToggleActive: (teacher: Profesor) => Promise<void>
}) {
  const fullName = `${teacher.nombre} ${teacher.apellido}`.trim()

  return (
    <EntityRosterRow
      name={fullName}
      email={teacher.email}
      avatarUrl={teacher.avatarUrl}
      avatarFallbackClassName="bg-violet-500/10 text-violet-700 dark:text-violet-400"
      status={<StatusBadge active={teacher.activo} />}
      metadata={
        <>
          <MetadataItem icon={IdCard}>DNI {teacher.dni}</MetadataItem>
          <MetadataItem icon={Phone}>{teacher.telefono || 'Sin telefono'}</MetadataItem>
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
            <Link href={`/admin/dashboard/teachers/${teacher.id}`}>
              <Pencil className="mr-2 size-4" />
              Editar
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={() => onToggleActive(teacher)}
            disabled={actionLoadingId === teacher.id}
            className={cn(
              'h-9 rounded-lg border px-3 shadow-none',
              teacher.activo
                ? 'border-rose-500/20 bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:text-rose-400'
                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400',
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
        </>
      }
    />
  )
}

function TeachersSkeleton() {
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

function EmptyTeachersState({ text }: { text: string }) {
  return (
    <Card className="rounded-2xl border border-border/70 bg-card/90 shadow-sm">
      <CardContent className="px-6 py-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-400">
            <Users className="size-5" />
          </div>
          <h4 className="mt-4 text-base font-semibold tracking-tight text-foreground">
            Sin profesores para mostrar
          </h4>
          <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            {text}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function TeachersTable() {
  const [items, setItems] = useState<Profesor[]>([])
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

  const loadTeachers = async () => {
    setLoading(true)

    try {
      const data = await getTeachers({
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
    loadTeachers()
  }, [debouncedSearch])

  const visibleItems = useMemo(() => {
    if (statusFilter === 'active') return items.filter((item) => item.activo)
    if (statusFilter === 'inactive') return items.filter((item) => !item.activo)
    return items
  }, [items, statusFilter])

  const emptyStateText = useMemo(() => {
    if (debouncedSearch.trim() || statusFilter !== 'all') {
      return 'No se encontraron profesores con esos filtros.'
    }

    return 'Todavia no hay profesores cargados en el sistema.'
  }, [debouncedSearch, statusFilter])

  const handleToggleActive = async (teacher: Profesor) => {
    const confirmText = teacher.activo
      ? `Queres desactivar a ${teacher.nombre} ${teacher.apellido}?`
      : `Queres activar a ${teacher.nombre} ${teacher.apellido}?`

    const confirmed = window.confirm(confirmText)
    if (!confirmed) return

    setActionLoadingId(teacher.id)

    try {
      if (teacher.activo) {
        await deactivateTeacher(teacher.id)
      } else {
        await activateTeacher(teacher.id)
      }

      await loadTeachers()
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <TeachersToolbar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {loading ? (
        <TeachersSkeleton />
      ) : visibleItems.length === 0 ? (
        <EmptyTeachersState text={emptyStateText} />
      ) : (
        <div className="space-y-2">
          {visibleItems.map((teacher) => (
            <TeacherRow
              key={teacher.id}
              teacher={teacher}
              actionLoadingId={actionLoadingId}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  )
}
