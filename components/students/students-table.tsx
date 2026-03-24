'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Power, Search, UserCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  activateStudent,
  deactivateStudent,
  getStudents,
} from '@/lib/students/api'
import type { Alumno } from '@/lib/students/types'

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

    return 'Todavía no hay alumnos cargados.'
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

        <Link href="/dashboard/students/new">
          <Button>
            <Plus className="mr-2 size-4" />
            Nuevo alumno
          </Button>
        </Link>
      </div>

      <Card className="border-border/70 bg-card/95 shadow-[0_12px_30px_-18px_rgba(30,42,68,0.18)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead className="border-b border-border/70 bg-muted/30">
                <tr className="text-left text-muted-foreground">
                  <th className="px-5 py-4 font-medium">Alumno</th>
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
                  items.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-border/60 transition hover:bg-muted/20"
                    >
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-foreground">
                            {student.nombre} {student.apellido}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {student.email}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {student.dni}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {student.telefono || '-'}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            student.activo
                              ? 'inline-flex rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400'
                              : 'inline-flex rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400'
                          }
                        >
                          {student.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                     <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">

                        {/* EDITAR */}
                        <Link href={`/dashboard/students/${student.id}`}>
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
                          onClick={() => handleToggleActive(student)}
                          disabled={actionLoadingId === student.id}
                          className={
                            student.activo
                              ? "h-9 rounded-xl bg-destructive/90 text-destructive-foreground shadow-sm transition-all hover:bg-destructive hover:shadow-md hover:-translate-y-[1px]"
                              : "h-9 rounded-xl bg-success/90 text-success-foreground shadow-sm transition-all hover:bg-success hover:shadow-md hover:-translate-y-[1px]"
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