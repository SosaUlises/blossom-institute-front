'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Archive, Pencil, Plus, Power, Search, UserCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  activateCourse,
  archiveCourse,
  deactivateCourse,
  getCourses,
} from '@/lib/courses/api'
import { EstadoCurso, type CursoListItem } from '@/lib/courses/types'

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
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid w-full gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar curso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Input
            placeholder="Filtrar por año"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
          />

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value={EstadoCurso.Activo}>Activo</option>
            <option value={EstadoCurso.Inactivo}>Inactivo</option>
            <option value={EstadoCurso.Archivado}>Archivado</option>
          </select>
        </div>

        <Link href="/dashboard/courses/new">
          <Button>
            <Plus className="mr-2 size-4" />
            Nuevo curso
          </Button>
        </Link>
      </div>

      <Card className="border-border/70 bg-card/95 shadow-[0_12px_30px_-18px_rgba(30,42,68,0.18)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="border-b border-border/70 bg-muted/30">
                <tr className="text-left text-muted-foreground">
                  <th className="px-5 py-4 text-center font-medium">Curso</th>
                  <th className="px-5 py-4 text-center font-medium">Año</th>
                  <th className="px-5 py-4 text-center font-medium">Estado</th>
                  <th className="px-5 py-4 text-center font-medium">Profesores</th>
                  <th className="px-5 py-4 text-center font-medium">Alumnos</th>
                  <th className="px-5 py-4 text-center font-medium">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="border-b border-border/60">
                      <td className="px-5 py-4" colSpan={7}>
                        <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                      {emptyStateText}
                    </td>
                  </tr>
                ) : (
                  items.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-border/60 transition hover:bg-muted/20"
                    >
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-center text-foreground">{course.nombre}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center text-muted-foreground">{course.anio}</td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            course.estado === EstadoCurso.Activo
                              ? 'inline-flex rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400 text-center'
                              : course.estado === EstadoCurso.Inactivo
                              ? 'inline-flex rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 text-center'
                              : 'inline-flex rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 text-center'
                          }
                        >
                          {estadoLabels[course.estado]}
                        </span>
                      </td>


                      <td className="px-5 py-4 text-center text-muted-foreground">{course.cantidadProfesores}</td>
                      <td className="px-5 py-4 text-center text-muted-foreground">{course.cantidadAlumnos}</td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/courses/${course.id}`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="mr-2 size-4" />
                              Editar
                            </Button>
                          </Link>

                          {course.estado !== EstadoCurso.Archivado && (
                            <Button
                              size="sm"
                              variant={course.estado === EstadoCurso.Activo ? 'destructive' : 'default'}
                              onClick={() => handleToggleActive(course)}
                              disabled={actionLoadingId === course.id}
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
                              variant="secondary"
                              onClick={() => handleArchive(course)}
                              disabled={actionLoadingId === course.id}
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