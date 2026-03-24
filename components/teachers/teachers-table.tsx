'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Power, Search, UserCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  activateTeacher,
  deactivateTeacher,
  getTeachers,
} from '@/lib/teachers/api'
import type { Profesor } from '@/lib/teachers/types'

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
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, apellido, email o DNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Link href="/dashboard/teachers/new">
          <Button>
            <Plus className="mr-2 size-4" />
            Nuevo profesor
          </Button>
        </Link>
      </div>

      <Card className="border-border/70 bg-card/95 shadow-[0_12px_30px_-18px_rgba(30,42,68,0.18)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead className="border-b border-border/70 bg-muted/30">
                <tr className="text-left text-muted-foreground">
                  <th className="px-5 py-4 font-medium">Profesor</th>
                  <th className="px-5 py-4 font-medium">Email</th>
                  <th className="px-5 py-4 font-medium">DNI</th>
                  <th className="px-5 py-4 font-medium">Teléfono</th>
                  <th className="px-5 py-4 font-medium">Estado</th>
                  <th className="px-5 py-4 text-right font-medium">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="border-b border-border/60">
                      <td className="px-5 py-4" colSpan={6}>
                        <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                      {emptyStateText}
                    </td>
                  </tr>
                ) : (
                  items.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className="border-b border-border/60 transition hover:bg-muted/20"
                    >
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-foreground">
                            {teacher.nombre} {teacher.apellido}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {teacher.email}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {teacher.dni}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {teacher.telefono || '-'}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            teacher.activo
                              ? 'inline-flex rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400'
                              : 'inline-flex rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400'
                          }
                        >
                          {teacher.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">

                        {/* EDITAR */}
                        <Link href={`/dashboard/teachers/${teacher.id}`}>
                          <Button
                            size="sm"
                            className="h-9 rounded-xl bg-primary/90 text-primary-foreground shadow-sm transition-all hover:bg-primary hover:shadow-md hover:-translate-y-[1px]"
                          >
                            <Pencil className="mr-2 size-4" />
                            Editar
                          </Button>
                        </Link>

                        {/* ACTIVAR / DESACTIVAR */}
                        <Button
                          size="sm"
                          onClick={() => handleToggleActive(teacher)}
                          disabled={actionLoadingId === teacher.id}
                          className={
                            teacher.activo
                              ? "h-9 rounded-xl bg-destructive/90 text-destructive-foreground shadow-sm transition-all hover:bg-destructive hover:shadow-md hover:-translate-y-[1px]"
                              : "h-9 rounded-xl bg-success/90 text-success-foreground shadow-sm transition-all hover:bg-success hover:shadow-md hover:-translate-y-[1px]"
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