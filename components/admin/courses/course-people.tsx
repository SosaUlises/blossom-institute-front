'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  GraduationCap,
  Search,
  Trash2,
  Users,
  UserRound,
  Mail,
  IdCard,
  Plus,
  CheckCircle2,
  UserPlus2,
  Sparkles,
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
} from '@/lib/admin/courses/people-api'
import type { CursoAlumno, CursoProfesor } from '@/lib/admin/courses/people-types'
import { getStudents } from '@/lib/admin/students/api'
import { getTeachers } from '@/lib/admin/teachers/api'
import type { Alumno } from '@/lib/admin/students/types'
import type { Profesor } from '@/lib/admin/teachers/types'
import { cn } from '@/lib/utils'

type TabKey = 'alumnos' | 'profesores'

function StatMiniCard({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  tone?: 'default' | 'highlight'
}) {
  return (
    <div
      className={cn(
        'rounded-[24px] border p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md',
        tone === 'highlight'
          ? 'border-primary/15 bg-primary/5'
          : 'border-border/60 bg-background/70',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-2xl',
            tone === 'highlight'
              ? 'bg-primary/10 text-primary'
              : 'bg-background text-muted-foreground',
          )}
        >
          <Icon className="size-4.5" />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

function SegmentTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        'h-10 rounded-2xl border-border/70 px-4 transition-all duration-200',
        active
          ? 'border-primary/20 bg-primary/10 text-primary shadow-sm hover:border-primary/30 hover:bg-primary/15 hover:text-primary hover:translate-y-0 hover:shadow-md'
          : 'border-border/70 bg-background/75 text-foreground hover:border-primary/20 hover:bg-primary/8 hover:text-primary hover:translate-y-0 hover:shadow-md',
      )}
    >
      <Icon className="mr-2 size-4" />
      {label}
    </Button>
  )
}

function CurrentPersonCard({
  name,
  email,
  dni,
  type,
  onRemove,
  loading,
}: {
  name: string
  email: string
  dni: number
  type: 'alumno' | 'profesor'
  onRemove: () => void
  loading: boolean
}) {
  const Icon = type === 'alumno' ? UserRound : GraduationCap
  const toneClass =
    type === 'alumno'
      ? 'group-hover:border-primary/20 group-hover:bg-primary/[0.04]'
      : 'group-hover:border-violet-500/20 group-hover:bg-violet-500/[0.04]'

  const iconClass =
    type === 'alumno'
      ? 'bg-primary/10 text-primary'
      : 'bg-violet-500/10 text-violet-700 dark:text-violet-400'

  return (
    <article
      className={cn(
        'group rounded-[24px] border border-border/60 bg-background/75 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md',
        toneClass,
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex items-start gap-3">
          <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-2xl', iconClass)}>
            <Icon className="size-4.5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-[15px] font-semibold tracking-tight text-foreground">
                {name}
              </p>

              <span className="inline-flex rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {type === 'alumno' ? 'Alumno' : 'Profesor'}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{email}</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-sm text-muted-foreground">
                <IdCard className="size-4 shrink-0" />
                <span>DNI {dni}</span>
              </div>
            </div>
          </div>
        </div>

        <Button
          size="sm"
          onClick={onRemove}
          disabled={loading}
          className="h-10 rounded-xl border border-rose-500/15 bg-rose-500/10 px-3 text-rose-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-500/15 dark:text-rose-400"
        >
          <Trash2 className="mr-2 size-4" />
          Quitar
        </Button>
      </div>
    </article>
  )
}

function AssignablePersonCard({
  checked,
  onToggle,
  name,
  email,
  dni,
  type,
}: {
  checked: boolean
  onToggle: () => void
  name: string
  email: string
  dni: number
  type: 'alumno' | 'profesor'
}) {
  const Icon = type === 'alumno' ? UserRound : GraduationCap

  const selectedTone =
    type === 'alumno'
      ? 'border-primary/25 bg-primary/8 shadow-[0_16px_26px_-22px_rgba(36,59,123,0.24)]'
      : 'border-violet-500/25 bg-violet-500/[0.08] shadow-[0_16px_26px_-22px_rgba(139,92,246,0.24)]'

  const idleHover =
    type === 'alumno'
      ? 'hover:border-primary/15 hover:bg-primary/[0.04]'
      : 'hover:border-violet-500/15 hover:bg-violet-500/[0.04]'

  const iconTone =
    type === 'alumno'
      ? checked
        ? 'bg-primary/15 text-primary'
        : 'bg-primary/10 text-primary'
      : checked
        ? 'bg-violet-500/15 text-violet-700 dark:text-violet-400'
        : 'bg-violet-500/10 text-violet-700 dark:text-violet-400'

  return (
    <label
      className={cn(
        'group flex cursor-pointer items-start gap-3 rounded-[22px] border p-4 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm',
        checked ? selectedTone : 'border-border/70 bg-background/70',
        !checked && idleHover,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-1"
      />

      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-2xl', iconTone)}>
          <Icon className="size-4.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>

            {checked && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-3" />
                Seleccionado
              </span>
            )}
          </div>

          <p className="mt-1 truncate text-sm text-muted-foreground">{email}</p>
          <p className="mt-1 text-xs text-muted-foreground">DNI {dni}</p>
        </div>
      </div>
    </label>
  )
}


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
 const rightPanelTone =
  tab === 'alumnos'
    ? {
        card: 'border-blue-600/15 bg-blue-600/[0.03] dark:border-blue-500/15 dark:bg-blue-500/[0.04]',
        selection: 'border-blue-600/15 bg-blue-600/[0.06] dark:border-blue-500/15 dark:bg-blue-500/[0.08]',
        selectionIcon: 'bg-blue-600/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
        selectionLabel: 'text-blue-700/80 dark:text-blue-300/90',
        selectionValue: 'text-blue-700 dark:text-blue-300',
        button:
          'bg-blue-700 text-white shadow-md shadow-blue-700/20 hover:bg-blue-700/90 dark:bg-blue-600 dark:hover:bg-blue-600/90',
      }
    : {
        card: 'border-violet-500/15 bg-violet-500/[0.03]',
        selection: 'border-violet-500/15 bg-violet-500/[0.06]',
        selectionIcon: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
        selectionLabel: 'text-violet-700/80 dark:text-violet-400/90',
        selectionValue: 'text-violet-700 dark:text-violet-400',
        button:
          'bg-violet-600 text-white shadow-md shadow-violet-600/20 hover:bg-violet-600/90 dark:bg-violet-500 dark:hover:bg-violet-500/90',
      }

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

  const selectedCount = tab === 'alumnos' ? selectedAlumnoIds.length : selectedProfesorIds.length

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <Card className="min-w-0 rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
        <CardHeader className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                Personas asignadas
              </CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">
                Visualizá y administrá las personas actualmente vinculadas al curso.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <SegmentTab
                active={tab === 'alumnos'}
                onClick={() => setTab('alumnos')}
                icon={Users}
                label="Alumnos"
              />
              <SegmentTab
                active={tab === 'profesores'}
                onClick={() => setTab('profesores')}
                icon={GraduationCap}
                label="Profesores"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <StatMiniCard
              icon={tab === 'alumnos' ? Users : GraduationCap}
              label="Asignados actualmente"
              value={currentCount}
              tone="highlight"
            />
            <StatMiniCard
              icon={UserPlus2}
              label="Disponibles para asignar"
              value={assignableCount}
            />
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
              className="h-11 rounded-2xl border-border/70 bg-card/85 pl-10 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
            />
          </div>
        </CardHeader>

        <CardContent className="min-w-0 pt-0">
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
              ))
            ) : tab === 'alumnos' ? (
              filteredCurrentAlumnos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
                  No hay alumnos asignados para mostrar.
                </div>
              ) : (
                filteredCurrentAlumnos.map((alumno) => (
                  <CurrentPersonCard
                    key={alumno.alumnoId}
                    name={`${alumno.nombre} ${alumno.apellido}`}
                    email={alumno.email}
                    dni={alumno.dni}
                    type="alumno"
                    loading={actionLoadingId === alumno.alumnoId}
                    onRemove={() => handleRemoveAlumno(alumno)}
                  />
                ))
              )
            ) : filteredCurrentProfesores.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
                No hay profesores asignados para mostrar.
              </div>
            ) : (
              filteredCurrentProfesores.map((profesor) => (
                <CurrentPersonCard
                  key={profesor.profesorId}
                  name={`${profesor.nombre} ${profesor.apellido}`}
                  email={profesor.email}
                  dni={profesor.dni}
                  type="profesor"
                  loading={actionLoadingId === profesor.profesorId}
                  onRemove={() => handleRemoveProfesor(profesor)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card
  className={cn(
    'min-w-0 rounded-[28px] border bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)] transition-colors duration-200',
    rightPanelTone.card,
  )}
>
  <CardHeader className="space-y-4">
    <div className="space-y-1">
      <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
        {tab === 'alumnos' ? 'Asignar alumnos' : 'Asignar profesores'}
      </CardTitle>
      <p className="text-sm leading-6 text-muted-foreground">
        Seleccioná una o varias personas disponibles para agregarlas al curso.
      </p>
    </div>

    <div className="grid gap-3">
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
          className="h-11 rounded-2xl border-border/70 bg-card/85 pl-10 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
        />
      </div>

      <div
        className={cn(
          'rounded-[22px] border px-4 py-3 transition-colors duration-200',
          rightPanelTone.selection,
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex size-10 items-center justify-center rounded-2xl transition-colors duration-200',
              rightPanelTone.selectionIcon,
            )}
          >
            <Sparkles className="size-4.5" />
          </div>

          <div>
            <p
              className={cn(
                'text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200',
                rightPanelTone.selectionLabel,
              )}
            >
              Selección actual
            </p>
            <p
              className={cn(
                'text-sm font-semibold transition-colors duration-200',
                rightPanelTone.selectionValue,
              )}
            >
              {selectedCount} seleccionado{selectedCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </div>
    </div>

    <Button
      onClick={handleAssign}
      disabled={assigning || selectedCount === 0}
      className={cn(
        'h-11 rounded-2xl px-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
        rightPanelTone.button,
      )}
    >
      <Plus className="mr-2 size-4" />
      {assigning ? 'Guardando...' : `Agregar seleccionados (${selectedCount})`}
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
              <AssignablePersonCard
                key={student.id}
                checked={checked}
                onToggle={() => toggleAlumnoSelection(student.id)}
                name={`${student.nombre} ${student.apellido}`}
                email={student.email}
                dni={student.dni}
                type="alumno"
              />
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
            <AssignablePersonCard
              key={teacher.id}
              checked={checked}
              onToggle={() => toggleProfesorSelection(teacher.id)}
              name={`${teacher.nombre} ${teacher.apellido}`}
              email={teacher.email}
              dni={teacher.dni}
              type="profesor"
            />
          )
        })
      )}
    </div>
  </CardContent>
</Card>
    </div>
  )
}