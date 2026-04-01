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

const estadoLabels: Record<number, string> = {
  [EstadoCurso.Activo]: 'Activo',
  [EstadoCurso.Inactivo]: 'Inactivo',
  [EstadoCurso.Archivado]: 'Archivado',
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

    return 'Todavía no hay cursos cargados.'
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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar curso..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-2xl border-border/70 bg-card/80 pl-10 shadow-sm"
              />
            </div>

            <Input
              placeholder="Filtrar por año"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="h-11 rounded-2xl border-border/70 bg-card/80 shadow-sm"
            />

            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="flex h-11 rounded-2xl border border-border/70 bg-card/80 px-3 py-2 text-sm shadow-sm"
            >
              <option value="">Todos los estados</option>
              <option value={EstadoCurso.Activo}>Activo</option>
              <option value={EstadoCurso.Inactivo}>Inactivo</option>
              <option value={EstadoCurso.Archivado}>Archivado</option>
            </select>
          </div>

          <Link href="/admin/dashboard/courses/new">
            <Button className="h-11 rounded-2xl bg-primary/90 px-5 text-primary-foreground shadow-[0_14px_30px_-18px_rgba(36,59,123,0.42)] transition-all hover:-translate-y-[1px] hover:bg-primary hover:shadow-[0_18px_36px_-18px_rgba(36,59,123,0.50)]">
              <Plus className="mr-2 size-4" />
              Nuevo curso
            </Button>
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-sm">
              <thead className="border-b border-border/70 bg-muted/25">
                <tr className="text-left">
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Curso
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Año
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Profesores
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Alumnos
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
                  items.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-border/60 transition-colors hover:bg-muted/15 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <BookOpen className="size-4.5" />
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">{course.nombre}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                          <CalendarRange className="size-4" />
                          <span>{course.anio}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={
                            course.estado === EstadoCurso.Activo
                              ? 'inline-flex rounded-full border border-green-500/15 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400'
                              : course.estado === EstadoCurso.Inactivo
                              ? 'inline-flex rounded-full border border-amber-500/15 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400'
                              : 'inline-flex rounded-full border border-slate-500/15 bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400'
                          }
                        >
                          {estadoLabels[course.estado]}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                          <GraduationCap className="size-4" />
                          <span>{course.cantidadProfesores}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                          <Users className="size-4" />
                          <span>{course.cantidadAlumnos}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/dashboard/courses/${course.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-xl border-border/70 bg-background/70 px-3 text-foreground shadow-sm transition-all hover:-translate-y-[1px] hover:bg-card hover:shadow-md hover:text-primary-700"
                            >
                              <Pencil className="mr-2 size-4" />
                              Editar
                            </Button>
                          </Link>

                          <Link href={`/admin/dashboard/courses/${course.id}/manage`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-xl border-primary/15 bg-primary/5 px-3 text-primary shadow-sm transition-all hover:-translate-y-[1px] hover:bg-primary/10 hover:shadow-md hover:text-primary-700"
                            >
                              <Settings2 className="mr-2 size-4" />
                              Gestionar
                            </Button>
                          </Link>

                          {course.estado !== EstadoCurso.Archivado && (
                            <Button
                              size="sm"
                              onClick={() => handleToggleActive(course)}
                              disabled={actionLoadingId === course.id}
                              className={
                                course.estado === EstadoCurso.Activo
                                  ? 'h-9 rounded-xl border border-red-500/15 bg-red-500/10 px-3 text-red-600 shadow-sm transition-all hover:-translate-y-[1px] hover:bg-red-500/15 dark:text-red-400'
                                  : 'h-9 rounded-xl border border-green-500/15 bg-green-500/10 px-3 text-green-600 shadow-sm transition-all hover:-translate-y-[1px] hover:bg-green-500/15 dark:text-green-400'
                              }
                            >
                              {course.estado === EstadoCurso.Activo ? (
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
                          )}

                          {course.estado !== EstadoCurso.Archivado && (
                            <Button
                              size="sm"
                              onClick={() => handleArchive(course)}
                              disabled={actionLoadingId === course.id}
                              className="h-9 rounded-xl border border-border/70 bg-muted/40 px-3 text-muted-foreground transition-all hover:-translate-y-[1px] hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive hover:shadow-sm"
                            >
                              <Archive className="mr-2 size-4" />
                              Archivar
                            </Button>
                          )}
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