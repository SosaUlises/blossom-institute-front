'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Pencil,
  Plus,
  Power,
  Search,
  UserCheck,
  GraduationCap,
  Mail,
  IdCard,
  Phone,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  activateTeacher,
  deactivateTeacher,
  getTeachers,
} from '@/lib/admin/teachers/api'
import type { Profesor } from '@/lib/admin/teachers/types'

export function TeachersTable() {
  const [items, setItems] = useState<Profesor[]>([])
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

  const emptyStateText = useMemo(() => {
    if (debouncedSearch.trim()) {
      return 'No se encontraron profesores para esa búsqueda.'
    }

    return 'Todavía no hay profesores cargados.'
  }, [debouncedSearch])

  const handleToggleActive = async (teacher: Profesor) => {
    const confirmText = teacher.activo
      ? `¿Querés desactivar a ${teacher.nombre} ${teacher.apellido}?`
      : `¿Querés activar a ${teacher.nombre} ${teacher.apellido}?`

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">


        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full min-w-[280px] max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, apellido, email o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-2xl border-border/70 bg-card/80 pl-10 shadow-sm"
            />
          </div>

          <Link href="/admin/dashboard/teachers/new">
            <Button className="h-11 rounded-2xl bg-primary/90 px-5 text-primary-foreground shadow-[0_14px_30px_-18px_rgba(36,59,123,0.42)] transition-all hover:-translate-y-[1px] hover:bg-primary hover:shadow-[0_18px_36px_-18px_rgba(36,59,123,0.50)]">
              <Plus className="mr-2 size-4" />
              Nuevo profesor
            </Button>
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="border-b border-border/70 bg-muted/25">
                <tr className="text-left">
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Profesor
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    DNI
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Teléfono
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="border-b border-border/60 last:border-0">
                      <td className="px-6 py-4" colSpan={6}>
                        <div className="h-12 animate-pulse rounded-2xl bg-muted/40" />
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-sm text-muted-foreground">
                      {emptyStateText}
                    </td>
                  </tr>
                ) : (
                  items.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className="border-b border-border/60 transition-colors hover:bg-muted/15 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <GraduationCap className="size-4.5" />
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">
                              {teacher.nombre} {teacher.apellido}
                            </p>
                        
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                          <Mail className="size-4" />
                          <span>{teacher.email}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                          <IdCard className="size-4" />
                          <span>{teacher.dni}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                          <Phone className="size-4" />
                          <span>{teacher.telefono || '-'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={
                            teacher.activo
                              ? 'inline-flex rounded-full border border-green-500/15 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400'
                              : 'inline-flex rounded-full border border-red-500/15 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400'
                          }
                        >
                          {teacher.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/dashboard/teachers/${teacher.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-xl border-border/70 bg-background/70 px-3 text-foreground shadow-sm transition-all hover:-translate-y-[1px] hover:bg-primary/10 hover:shadow-md hover:text-primary-700"
                            >
                              <Pencil className="mr-2 size-4" />
                              Editar
                            </Button>
                          </Link>

                          <Button
                            size="sm"
                            onClick={() => handleToggleActive(teacher)}
                            disabled={actionLoadingId === teacher.id}
                            className={
                              teacher.activo
                                ? 'h-9 rounded-xl border border-red-500/15 bg-red-500/10 px-3 text-red-600 shadow-sm transition-all hover:-translate-y-[1px] hover:bg-red-500/15 dark:text-red-400'
                                : 'h-9 rounded-xl border border-green-500/15 bg-green-500/10 px-3 text-green-600 shadow-sm transition-all hover:-translate-y-[1px] hover:bg-green-500/15 dark:text-green-400'
                            }
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}