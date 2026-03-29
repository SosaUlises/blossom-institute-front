'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CalendarRange,
  Clock3,
  Search,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getTeacherCourses } from '@/lib/teacher/courses/api'
import type { TeacherCourseListItem } from '@/lib/teacher/courses/types'
import { EstadoCurso } from '@/lib/teacher/dashboard/types'

const estadoLabels: Record<number, string> = {
  [EstadoCurso.Activo]: 'Activo',
  [EstadoCurso.Inactivo]: 'Inactivo',
  [EstadoCurso.Archivado]: 'Archivado',
}

function getEstadoCursoBadgeClass(estado: number) {
  switch (estado) {
    case EstadoCurso.Activo:
      return 'inline-flex rounded-full border border-green-500/15 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400'
    case EstadoCurso.Inactivo:
      return 'inline-flex rounded-full border border-amber-500/15 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400'
    case EstadoCurso.Archivado:
      return 'inline-flex rounded-full border border-slate-500/15 bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400'
    default:
      return 'inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary'
  }
}

export function TeacherCoursesTable() {
  const [items, setItems] = useState<TeacherCourseListItem[]>([])
  const [search, setSearch] = useState('')
  const [anio, setAnio] = useState('')
  const [estado, setEstado] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(timeout)
  }, [search])

  const loadCourses = async () => {
    setLoading(true)

    try {
      const data = await getTeacherCourses({
        pageNumber: 1,
        pageSize: 50,
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

    return 'Todavía no tenés cursos asignados.'
  }, [debouncedSearch, anio, estado])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
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
            className="flex h-11 rounded-2xl border border-border/70 bg-card/80 px-3 py-2 text-sm shadow-sm outline-none"
          >
            <option value="">Todos los estados</option>
            <option value={EstadoCurso.Activo}>Activo</option>
            <option value={EstadoCurso.Inactivo}>Inactivo</option>
            <option value={EstadoCurso.Archivado}>Archivado</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-sm">
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
                    Horarios por semana
                  </th>
                  <th className="px-6 py-4  text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="border-b border-border/60 last:border-0">
                      <td className="px-6 py-4" colSpan={5}>
                        <div className="h-12 animate-pulse rounded-2xl bg-muted/40" />
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-14 text-center text-sm text-muted-foreground"
                    >
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
                            <p className="truncate font-semibold text-foreground">
                              {course.nombre}
                            </p>
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
                        <span className={getEstadoCursoBadgeClass(course.estado)}>
                          {estadoLabels[course.estado]}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-muted-foreground shadow-sm">
                          <Clock3 className="size-4" />
                          <span className="text-sm font-medium">
                            {course.cantidadHorarios}{' '}
                            {course.cantidadHorarios === 1 ? 'horario' : 'horarios'}
                          </span>
                        </div>
                      </td>

                     <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/teacher/courses/${course.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-xl border-primary/15 bg-primary/5 px-3 text-primary shadow-sm transition-all hover:-translate-y-[1px] hover:bg-primary/10 hover:shadow-md hover:text-primary-700"
                            >
                              Ver curso
                              <ArrowRight className="ml-2 size-4" />
                            </Button>
                          </Link>
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