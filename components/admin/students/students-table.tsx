'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Pencil,
  Plus,
  Power,
  Search,
  UserCheck,
  UserRound,
  Mail,
  IdCard,
  Phone,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  activateStudent,
  deactivateStudent,
  getStudents,
} from '@/lib/admin/students/api'
import type { Alumno } from '@/lib/admin/students/types'
import { cn } from '@/lib/utils'

function StudentsToolbar({
  search,
  setSearch,
}: {
  search: string
  setSearch: (value: string) => void
}) {
  return (
    <section className="rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)] md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Gestión
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            Listado de alumnos
          </h3>
          <p className="text-sm text-muted-foreground">
            Buscá, editá y administrá el estado de los alumnos del instituto.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full min-w-[280px] max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, apellido, email o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-2xl border-border/70 bg-background/85 pl-10 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
            />
          </div>

          <Link href="/admin/dashboard/students/new">
            <Button className="h-11 rounded-2xl bg-primary px-5 text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md">
              <Plus className="mr-2 size-4" />
              Nuevo alumno
            </Button>
          </Link>
        </div>
      </div>
    </section>
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
    <div className="inline-flex items-center gap-2 rounded-[18px] border border-border/60 bg-background/80 px-3 py-2 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md">
      <div className="flex size-8 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0 leading-none">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-foreground">
          {value}
        </p>
      </div>
    </div>
  )
}

function StudentStatusBadge({ activo }: { activo: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
        activo
          ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : 'border-rose-500/15 bg-rose-500/10 text-rose-700 dark:text-rose-400',
      )}
    >
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  )
}

function StudentCard({
  student,
  actionLoadingId,
  onToggleActive,
}: {
  student: Alumno
  actionLoadingId: number | null
  onToggleActive: (student: Alumno) => Promise<void>
}) {
  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-[1px] hover:border-border/80 hover:shadow-[0_24px_52px_-24px_rgba(15,23,42,0.22)] md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.05),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.04),transparent_22%)]" />

      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_auto_auto] xl:items-center">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <UserRound className="size-5" />
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h4 className="truncate text-[1.08rem] font-semibold tracking-tight text-foreground">
                  {student.nombre} {student.apellido}
                </h4>

                <StudentStatusBadge activo={student.activo} />
              </div>

              <div className="inline-flex max-w-full items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 xl:justify-center">
          <MetaPill icon={IdCard} label="DNI" value={String(student.dni)} />
          <MetaPill icon={Phone} label="Teléfono" value={student.telefono || '-'} />
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <Link href={`/admin/dashboard/students/${student.id}`}>
            <Button
              size="sm"
              variant="outline"
              className="h-10 rounded-xl border-border/70 bg-background/75 px-3 text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/8 hover:text-primary"
            >
              <Pencil className="mr-2 size-4" />
              Editar
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => onToggleActive(student)}
            disabled={actionLoadingId === student.id}
            className={
              student.activo
                ? 'h-10 rounded-xl border border-rose-500/15 bg-rose-500/10 px-3 text-rose-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-500/15 dark:text-rose-400'
                : 'h-10 rounded-xl border border-emerald-500/15 bg-emerald-500/10 px-3 text-emerald-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500/15 dark:text-emerald-400'
            }
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
        </div>
      </div>
    </article>
  )
}

function StudentsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)] md:p-6"
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_auto_auto] xl:items-center">
            <div className="flex items-start gap-4">
              <div className="size-12 animate-pulse rounded-2xl bg-muted/35" />
              <div className="space-y-2">
                <div className="h-5 w-44 animate-pulse rounded-lg bg-muted/35" />
                <div className="h-4 w-64 animate-pulse rounded-lg bg-muted/25" />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="h-12 w-36 animate-pulse rounded-[18px] bg-muted/30" />
              <div className="h-12 w-40 animate-pulse rounded-[18px] bg-muted/30" />
            </div>

            <div className="flex gap-2">
              <div className="h-10 w-24 animate-pulse rounded-xl bg-muted/30" />
              <div className="h-10 w-28 animate-pulse rounded-xl bg-muted/30" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyStudentsState({ text }: { text: string }) {
  return (
    <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
      <CardContent className="px-6 py-14">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <Users className="size-6" />
          </div>

          <h4 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            Sin alumnos para mostrar
          </h4>

          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
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

  const emptyStateText = useMemo(() => {
    if (debouncedSearch.trim()) {
      return 'No se encontraron alumnos para esa búsqueda.'
    }

    return 'Todavía no hay alumnos cargados en el sistema.'
  }, [debouncedSearch])

  const handleToggleActive = async (student: Alumno) => {
    const confirmText = student.activo
      ? `¿Querés desactivar a ${student.nombre} ${student.apellido}?`
      : `¿Querés activar a ${student.nombre} ${student.apellido}?`

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
    <div className="space-y-6">
      <StudentsToolbar search={search} setSearch={setSearch} />

      {loading ? (
        <StudentsSkeleton />
      ) : items.length === 0 ? (
        <EmptyStudentsState text={emptyStateText} />
      ) : (
        <div className="space-y-4">
          {items.map((student) => (
            <StudentCard
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