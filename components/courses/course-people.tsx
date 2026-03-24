'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  GraduationCap,
  Search,
  Trash2,
  Users,
  CheckCircle2,
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
      <Card className="min-w-0 border-border/70 bg-card/95 shadow-[0_18px_40px_-22px_rgba(30,42,68,0.20)]">
        <CardHeader className="space-y-4">
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
                variant={tab === 'alumnos' ? 'default' : 'outline'}
                onClick={() => setTab('alumnos')}
              >
                <Users className="mr-2 size-4" />
                Alumnos
              </Button>

              <Button
                variant={tab === 'profesores' ? 'default' : 'outline'}
                onClick={() => setTab('profesores')}
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
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent className="min-w-0 pt-0">
          <div className="overflow-x-auto rounded-2xl border border-border/70">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-border/70 bg-muted/30">
                <tr className="text-left text-muted-foreground">
                  <th className="px-5 py-4 font-medium">
                    {tab === 'alumnos' ? 'Alumno' : 'Profesor'}
                  </th>
                  <th className="px-5 py-4 font-medium">Email</th>
                  <th className="px-5 py-4 font-medium">DNI</th>
                  <th className="px-5 py-4 text-right font-medium">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b border-border/60">
                      <td className="px-5 py-4" colSpan={4}>
                        <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
                      </td>
                    </tr>
                  ))
                ) : tab === 'alumnos' ? (
                  filteredCurrentAlumnos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">
                        No hay alumnos asignados para mostrar.
                      </td>
                    </tr>
                  ) : (
                    filteredCurrentAlumnos.map((alumno) => (
                      <tr key={alumno.alumnoId} className="border-b border-border/60 transition hover:bg-muted/20">
                        <td className="px-5 py-4">
                          <div className="space-y-0.5">
                            <p className="font-medium text-foreground">
                              {alumno.nombre} {alumno.apellido}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{alumno.email}</td>
                        <td className="px-5 py-4 text-muted-foreground">{alumno.dni}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveAlumno(alumno)}
                              disabled={actionLoadingId === alumno.alumnoId}
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
                    <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">
                      No hay profesores asignados para mostrar.
                    </td>
                  </tr>
                ) : (
                  filteredCurrentProfesores.map((profesor) => (
                    <tr key={profesor.profesorId} className="border-b border-border/60 transition hover:bg-muted/20">
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-foreground">
                            {profesor.nombre} {profesor.apellido}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{profesor.email}</td>
                      <td className="px-5 py-4 text-muted-foreground">{profesor.dni}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveProfesor(profesor)}
                            disabled={actionLoadingId === profesor.profesorId}
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

      <Card className="min-w-0 border-border/70 bg-card/95 shadow-[0_18px_40px_-22px_rgba(30,42,68,0.20)]">
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
              className="pl-10"
            />
          </div>

          <Button
            onClick={handleAssign}
            disabled={
              assigning ||
              (tab === 'alumnos' ? selectedAlumnoIds.length === 0 : selectedProfesorIds.length === 0)
            }
          >
            <CheckCircle2 className="mr-2 size-4" />
            {assigning
              ? 'Guardando...'
              : tab === 'alumnos'
              ? `Agregar seleccionados (${selectedAlumnoIds.length})`
              : `Agregar seleccionados (${selectedProfesorIds.length})`}
          </Button>
        </CardHeader>

        <CardContent className="min-w-0 pt-0">
          <div className="max-h-[540px] space-y-3 overflow-y-auto overflow-x-hidden pr-1">
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
                      className="flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 transition hover:bg-muted/20"
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
                    className="flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 transition hover:bg-muted/20"
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