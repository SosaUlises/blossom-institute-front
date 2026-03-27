'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  GraduationCap,
  Search,
  Trash2,
  Users,
  CheckCircle2,
  UserRound,
  Mail,
  IdCard,
  Plus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  assignAlumnos,
  assignProfesores,
  getCursoAlumnos,
  getCursoProfesores,
  removeAlumno,
  removeProfesor,
} from '@/lib/courses/people-api'
import type { CursoAlumno, CursoProfesor } from '@/lib/courses/people-types'
import { getStudents } from '@/lib/students/api'
import { getTeachers } from '@/lib/teachers/api'
import type { Alumno } from '@/lib/students/types'
import type { Profesor } from '@/lib/teachers/types'
import { cn } from '@/lib/utils'

type TabKey = 'alumnos' | 'profesores'

export function CoursePeople({ cursoId }: { cursoId: number }) {
  const [tab, setTab] = useState<TabKey>('alumnos')
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [assigning, setAssigning] = useState(false)

  const [cursoAlumnos, setCursoAlumnos] = useState<CursoAlumno[]>([])
  const [cursoProfesores, setCursoProfesores] = useState<CursoProfesor[]>([])

  const [allStudents, setAllStudents] = useState<Alumno[]>([])
  const [allTeachers, setAllTeachers] = useState<Profesor[]>([])

  const [searchCurrent, setSearchCurrent] = useState('')
  const [searchAssignable, setSearchAssignable] = useState('')

  const [selectedAlumnoIds, setSelectedAlumnoIds] = useState<number[]>([])
  const [selectedProfesorIds, setSelectedProfesorIds] = useState<number[]>([])

  const loadCurrent = async () => {
    setLoading(true)

    try {
      if (tab === 'alumnos') {
        const current = await getCursoAlumnos(cursoId)
        setCursoAlumnos(current.items)
      } else {
        const current = await getCursoProfesores(cursoId)
        setCursoProfesores(current.items)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadAssignable = async () => {
    if (tab === 'alumnos') {
      const students = await getStudents({ pageNumber: 1, pageSize: 100 })
      setAllStudents(students.items)
    } else {
      const teachers = await getTeachers({ pageNumber: 1, pageSize: 100 })
      setAllTeachers(teachers.items)
    }
  }

  useEffect(() => {
    loadCurrent()
    loadAssignable()
    setSearchCurrent('')
    setSearchAssignable('')
    setSelectedAlumnoIds([])
    setSelectedProfesorIds([])
  }, [tab, cursoId])

  const filteredCurrentAlumnos = useMemo(() => {
    const q = searchCurrent.trim().toLowerCase()
    if (!q) return cursoAlumnos

    return cursoAlumnos.filter((a) =>
      `${a.nombre} ${a.apellido}`.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      String(a.dni).includes(q)
    )
  }, [cursoAlumnos, searchCurrent])

  const filteredCurrentProfesores = useMemo(() => {
    const q = searchCurrent.trim().toLowerCase()
    if (!q) return cursoProfesores

    return cursoProfesores.filter((p) =>
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      String(p.dni).includes(q)
    )
  }, [cursoProfesores, searchCurrent])

  const assignableStudents = useMemo(() => {
    const currentIds = new Set(cursoAlumnos.map((a) => a.alumnoId))
    const q = searchAssignable.trim().toLowerCase()

    return allStudents.filter((s) => {
      if (!s.activo) return false
      if (currentIds.has(s.id)) return false

      if (!q) return true

      return (
        `${s.nombre} ${s.apellido}`.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        String(s.dni).includes(q)
      )
    })
  }, [allStudents, cursoAlumnos, searchAssignable])

  const assignableTeachers = useMemo(() => {
    const currentIds = new Set(cursoProfesores.map((p) => p.profesorId))
    const q = searchAssignable.trim().toLowerCase()

    return allTeachers.filter((t) => {
      if (!t.activo) return false
      if (currentIds.has(t.id)) return false

      if (!q) return true

      return (
        `${t.nombre} ${t.apellido}`.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        String(t.dni).includes(q)
      )
    })
  }, [allTeachers, cursoProfesores, searchAssignable])

  const toggleAlumnoSelection = (id: number) => {
    setSelectedAlumnoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleProfesorSelection = (id: number) => {
    setSelectedProfesorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleAssign = async () => {
    setAssigning(true)

    try {
      if (tab === 'alumnos') {
        if (!selectedAlumnoIds.length) return
        await assignAlumnos(cursoId, { alumnoIds: selectedAlumnoIds })
        setSelectedAlumnoIds([])
      } else {
        if (!selectedProfesorIds.length) return
        await assignProfesores(cursoId, { profesorIds: selectedProfesorIds })
        setSelectedProfesorIds([])
      }

      await loadCurrent()
      await loadAssignable()
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveAlumno = async (alumno: CursoAlumno) => {
    const confirmed = window.confirm(
      `¿Querés quitar a ${alumno.nombre} ${alumno.apellido} de este curso?`
    )
    if (!confirmed) return

    setActionLoadingId(alumno.alumnoId)

    try {
      await removeAlumno(cursoId, alumno.alumnoId)
      await loadCurrent()
      await loadAssignable()
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRemoveProfesor = async (profesor: CursoProfesor) => {
    const confirmed = window.confirm(
      `¿Querés quitar a ${profesor.nombre} ${profesor.apellido} de este curso?`
    )
    if (!confirmed) return

    setActionLoadingId(profesor.profesorId)

    try {
      await removeProfesor(cursoId, profesor.profesorId)
      await loadCurrent()
      await loadAssignable()
    } finally {
      setActionLoadingId(null)
    }
  }

  const currentCount = tab === 'alumnos' ? cursoAlumnos.length : cursoProfesores.length
  const assignableCount =
    tab === 'alumnos' ? assignableStudents.length : assignableTeachers.length

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]">
      <Card className="min-w-0 rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_40px_-22px_rgba(30,42,68,0.20)]">
        <CardHeader className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight">
                Gestión de personas
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Administrá profesores asignados y alumnos matriculados del curso.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => setTab('alumnos')}
                className={cn(
                  'h-10 rounded-2xl border-border/70 px-4',
                  tab === 'alumnos'
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'bg-background/70 text-foreground'
                )}
              >
                <Users className="mr-2 size-4" />
                Alumnos
              </Button>

              <Button
                variant="outline"
                onClick={() => setTab('profesores')}
                className={cn(
                  'h-10 rounded-2xl border-border/70 px-4',
                  tab === 'profesores'
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'bg-background/70 text-foreground'
                )}
              >
                <GraduationCap className="mr-2 size-4" />
                Profesores
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Asignados actualmente
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {currentCount}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Disponibles para asignar
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {assignableCount}
              </p>
            </div>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={
                tab === 'alumnos'
                  ? 'Buscar entre alumnos asignados...'
                  : 'Buscar entre profesores asignados...'
              }
              value={searchCurrent}
              onChange={(e) => setSearchCurrent(e.target.value)}
              className="h-11 rounded-2xl border-border/70 bg-card/80 pl-10 shadow-sm"
            />
          </div>
        </CardHeader>

        <CardContent className="min-w-0 pt-0">
          <div className="overflow-x-auto rounded-2xl border border-border/70">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-border/70 bg-muted/25">
                <tr className="text-left">
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {tab === 'alumnos' ? 'Alumno' : 'Profesor'}
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Email
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    DNI
                  </th>
                  <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b border-border/60 last:border-0">
                      <td className="px-6 py-4" colSpan={4}>
                        <div className="h-12 animate-pulse rounded-2xl bg-muted/40" />
                      </td>
                    </tr>
                  ))
                ) : tab === 'alumnos' ? (
                  filteredCurrentAlumnos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        No hay alumnos asignados para mostrar.
                      </td>
                    </tr>
                  ) : (
                    filteredCurrentAlumnos.map((alumno) => (
                      <tr key={alumno.alumnoId} className="border-b border-border/60 transition hover:bg-muted/15 last:border-0">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                              <UserRound className="size-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {alumno.nombre} {alumno.apellido}
                              </p>
                              <p className="text-xs text-muted-foreground">ID #{alumno.alumnoId}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-muted-foreground">
                          <div className="inline-flex items-center gap-2">
                            <Mail className="size-4" />
                            {alumno.email}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-muted-foreground">
                          <div className="inline-flex items-center gap-2">
                            <IdCard className="size-4" />
                            {alumno.dni}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleRemoveAlumno(alumno)}
                              disabled={actionLoadingId === alumno.alumnoId}
                              className="h-9 rounded-xl border border-red-500/15 bg-red-500/10 px-3 text-red-600 shadow-sm transition-all hover:-translate-y-[1px] hover:bg-red-500/15 dark:text-red-400"
                            >
                              <Trash2 className="mr-2 size-4" />
                              Quitar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                ) : filteredCurrentProfesores.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No hay profesores asignados para mostrar.
                    </td>
                  </tr>
                ) : (
                  filteredCurrentProfesores.map((profesor) => (
                    <tr key={profesor.profesorId} className="border-b border-border/60 transition hover:bg-muted/15 last:border-0">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <GraduationCap className="size-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {profesor.nombre} {profesor.apellido}
                            </p>
                            <p className="text-xs text-muted-foreground">ID #{profesor.profesorId}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="inline-flex items-center gap-2">
                          <Mail className="size-4" />
                          {profesor.email}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="inline-flex items-center gap-2">
                          <IdCard className="size-4" />
                          {profesor.dni}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleRemoveProfesor(profesor)}
                            disabled={actionLoadingId === profesor.profesorId}
                            className="h-9 rounded-xl border border-red-500/15 bg-red-500/10 px-3 text-red-600 shadow-sm transition-all hover:-translate-y-[1px] hover:bg-red-500/15 dark:text-red-400"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Quitar
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

      <Card className="min-w-0 rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_40px_-22px_rgba(30,42,68,0.20)]">
        <CardHeader className="space-y-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold tracking-tight">
              {tab === 'alumnos' ? 'Matricular alumnos' : 'Asignar profesores'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Seleccioná una o varias personas disponibles para agregarlas al curso.
            </p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={
                tab === 'alumnos'
                  ? 'Buscar alumnos disponibles...'
                  : 'Buscar profesores disponibles...'
              }
              value={searchAssignable}
              onChange={(e) => setSearchAssignable(e.target.value)}
              className="h-11 rounded-2xl border-border/70 bg-card/80 pl-10 shadow-sm"
            />
          </div>

          <Button
            onClick={handleAssign}
            disabled={
              assigning ||
              (tab === 'alumnos' ? selectedAlumnoIds.length === 0 : selectedProfesorIds.length === 0)
            }
            className="h-11 rounded-2xl bg-primary/90 text-primary-foreground shadow-[0_14px_30px_-18px_rgba(36,59,123,0.42)] transition-all hover:-translate-y-[1px] hover:bg-primary hover:shadow-[0_18px_36px_-18px_rgba(36,59,123,0.50)]"
          >
            <Plus className="mr-2 size-4" />
            {assigning
              ? 'Guardando...'
              : tab === 'alumnos'
              ? `Agregar seleccionados (${selectedAlumnoIds.length})`
              : `Agregar seleccionados (${selectedProfesorIds.length})`}
          </Button>
        </CardHeader>

        <CardContent className="min-w-0 pt-0">
          <div className="max-h-[560px] space-y-3 overflow-y-auto overflow-x-hidden pr-1">
            {tab === 'alumnos' ? (
              assignableStudents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
                  No hay alumnos disponibles para asignar.
                </div>
              ) : (
                assignableStudents.map((student) => {
                  const checked = selectedAlumnoIds.includes(student.id)

                  return (
                    <label
                      key={student.id}
                      className={cn(
                        'flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all',
                        checked
                          ? 'border-primary/25 bg-primary/8 shadow-sm'
                          : 'border-border/70 bg-background/60 hover:bg-muted/20'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAlumnoSelection(student.id)}
                        className="mt-1"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">
                          {student.nombre} {student.apellido}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground">DNI {student.dni}</p>
                      </div>
                    </label>
                  )
                })
              )
            ) : assignableTeachers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
                No hay profesores disponibles para asignar.
              </div>
            ) : (
              assignableTeachers.map((teacher) => {
                const checked = selectedProfesorIds.includes(teacher.id)

                return (
                  <label
                    key={teacher.id}
                    className={cn(
                      'flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all',
                      checked
                        ? 'border-primary/25 bg-primary/8 shadow-sm'
                        : 'border-border/70 bg-background/60 hover:bg-muted/20'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleProfesorSelection(teacher.id)}
                      className="mt-1"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">
                        {teacher.nombre} {teacher.apellido}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">{teacher.email}</p>
                      <p className="text-xs text-muted-foreground">DNI {teacher.dni}</p>
                    </div>
                  </label>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}