'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  Loader2,
  Save,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { saveTeacherClassAttendance } from '@/lib/teacher/course-detail/attendance-api'
import {
  EstadoAsistencia,
  type SaveAttendancePayload,
} from '@/lib/teacher/course-detail/attendance-types'
import { cn } from '@/lib/utils'
import {
  PersonAvatar,
  PersonRosterSurface,
} from './course-people-ui'

type StudentItem = {
  alumnoId: number
  nombre: string
  apellido: string
  email?: string | null
  avatarUrl?: string | null
}

type StudentsEnvelope = {
  message?: string
  data?: {
    items?: StudentItem[]
  }
}

type StudentState = {
  alumnoId: number
  nombreCompleto: string
  avatarUrl?: string | null
  estado: EstadoAsistencia | null
}

function formatDisplayDate(date: string) {
  try {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(`${date}T00:00:00`))
  } catch {
    return date
  }
}

function AttendanceSegmentedControl({
  value,
  onChange,
}: {
  value: EstadoAsistencia | null
  onChange: (value: EstadoAsistencia) => void
}) {
  return (
    <div className="grid h-10 w-full grid-cols-2 rounded-xl border border-border/60 bg-background/70 p-1 sm:w-auto sm:min-w-56 dark:bg-background/35">
      <button
        type="button"
        onClick={() => onChange(EstadoAsistencia.Presente)}
        className={cn(
          'rounded-lg border border-transparent px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
          value === EstadoAsistencia.Presente
            ? 'border-green-200 bg-green-500/10 text-green-700 dark:border-green-800 dark:text-green-400'
            : 'text-muted-foreground hover:bg-emerald-500/5 hover:text-emerald-700 dark:hover:text-emerald-300',
        )}
      >
        Presente
      </button>
      <button
        type="button"
        onClick={() => onChange(EstadoAsistencia.Ausente)}
        className={cn(
          'rounded-lg border border-transparent px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
          value === EstadoAsistencia.Ausente
            ? 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-800 dark:text-red-400'
            : 'text-muted-foreground hover:bg-rose-500/5 hover:text-rose-700 dark:hover:text-rose-300',
        )}
      >
        Ausente
      </button>
    </div>
  )
}

function TeacherTakeAttendanceSkeleton() {
  return (
    <div aria-busy="true" className="space-y-5">
      <p className="sr-only">Cargando asistencia.</p>

      <header className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
        <div className="h-7 w-44 rounded-lg bg-muted/70" />
        <div className="mt-2 h-4 w-36 rounded-lg bg-muted/55" />
      </header>

      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-2">
            <div className="h-4 w-14 rounded-lg bg-muted/60" />
            <div className="h-10 rounded-xl bg-muted/50" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-lg bg-muted/60" />
            <div className="h-10 rounded-xl bg-muted/50" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-5 w-40 rounded-lg bg-muted/70" />
            <div className="h-4 w-52 rounded-lg bg-muted/50" />
          </div>
          <div className="hidden h-9 w-44 rounded-xl bg-muted/45 sm:block" />
        </div>
        <div className="space-y-2">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-16 rounded-xl border border-border/45 bg-background/55 dark:bg-background/30"
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export function TeacherTakeAttendanceView({ courseId }: { courseId: number }) {
  const router = useRouter()

  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [descripcionClase, setDescripcionClase] = useState('')
  const [students, setStudents] = useState<StudentState[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/teacher/courses/${courseId}/students`, {
          cache: 'no-store',
        })
        const result = (await response.json()) as StudentsEnvelope

        if (!response.ok) {
          throw new Error(result.message || 'No se pudieron obtener los alumnos.')
        }

        const items = result.data?.items ?? []

        setStudents(
          items.map((student) => ({
            alumnoId: student.alumnoId,
            nombreCompleto: `${student.nombre} ${student.apellido}`,
            avatarUrl: student.avatarUrl,
            estado: null,
          })),
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId])

  const handleChangeEstado = (
    alumnoId: number,
    estado: EstadoAsistencia | null,
  ) => {
    setStudents((prev) =>
      prev.map((item) =>
        item.alumnoId === alumnoId ? { ...item, estado } : item,
      ),
    )
  }

  const handleMarkAllPresent = () => {
    setStudents((prev) =>
      prev.map((item) => ({
        ...item,
        estado: EstadoAsistencia.Presente,
      })),
    )
  }

  const handleClearSelection = () => {
    setStudents((prev) =>
      prev.map((item) => ({
        ...item,
        estado: null,
      })),
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const payload: SaveAttendancePayload = {
        descripcionClase,
        asistencias: students
          .filter((item) => item.estado != null)
          .map((item) => ({
            alumnoId: item.alumnoId,
            estado: item.estado as EstadoAsistencia,
          })),
      }

      await saveTeacherClassAttendance(courseId, fecha, payload)
      setSuccess('Asistencia guardada correctamente.')

      setTimeout(() => {
        router.push(`/teacher/courses/${courseId}/classes/${fecha}`)
      }, 700)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ocurrió un error al guardar.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <TeacherTakeAttendanceSkeleton />
  }

  const presentCount = students.filter(
    (student) => student.estado === EstadoAsistencia.Presente,
  ).length
  const absentCount = students.filter(
    (student) => student.estado === EstadoAsistencia.Ausente,
  ).length
  const markedCount = presentCount + absentCount
  const unmarkedCount = students.length - presentCount - absentCount

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Tomar asistencia
        </h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Nuevo registro · {formatDisplayDate(fecha)}
        </p>
      </header>

      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="h-10 w-full rounded-xl border border-border/60 bg-background/75 px-3 text-sm outline-none transition-colors focus:border-primary/35 focus:ring-2 focus:ring-primary/15 dark:bg-background/35"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Tema trabajado
            </label>
            <input
              value={descripcionClase}
              onChange={(e) => setDescripcionClase(e.target.value)}
              className="h-10 w-full rounded-xl border border-border/60 bg-background/75 px-3 text-sm outline-none transition-colors focus:border-primary/35 focus:ring-2 focus:ring-primary/15 dark:bg-background/35"
              placeholder="Ej: Past simple, conversación o repaso de unidad"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Registro por alumno
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {students.length} alumnos · {presentCount} presentes · {absentCount}{' '}
              ausentes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/60 bg-muted/25 p-1">
            <Button
              type="button"
              variant="ghost"
              onClick={handleMarkAllPresent}
              className="h-8 rounded-lg px-2.5 text-sm font-medium text-muted-foreground shadow-none transition-colors duration-200 hover:bg-emerald-500/10 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500/20 dark:hover:text-emerald-300"
            >
              <CheckCircle2 className="mr-1.5 size-4" />
              Todos presentes
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleClearSelection}
              className="h-8 rounded-lg px-2.5 text-sm font-medium text-muted-foreground shadow-none transition-colors duration-200 hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <RotateCcw className="mr-1.5 size-4" />
              Limpiar
            </Button>

          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm font-medium text-rose-700 dark:text-rose-300">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{success}</span>
          </div>
        )}

        {students.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-4 dark:bg-muted/10">
            <p className="text-sm font-medium text-foreground">
              Todavía no hay alumnos asignados a este curso.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cuando el curso tenga alumnos, vas a poder tomar asistencia desde acá.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((student) => {
            const hasStatus = student.estado != null
            const statusLabel =
              student.estado === EstadoAsistencia.Presente ? 'Presente' : 'Ausente'

            const statusClass =
              student.estado === EstadoAsistencia.Presente
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400'

              return (
                <PersonRosterSurface key={student.alumnoId} tone="student">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <PersonAvatar
                      name={student.nombreCompleto}
                      avatarUrl={student.avatarUrl}
                      tone="student"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-[15px]">
                        {student.nombreCompleto}
                      </p>
                      {hasStatus ? (
                        <span
                          className={cn(
                            'mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                            statusClass,
                          )}
                        >
                          {statusLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <AttendanceSegmentedControl
                    value={student.estado}
                    onChange={(estado) =>
                      handleChangeEstado(student.alumnoId, estado)
                    }
                  />
                </div>
                </PersonRosterSurface>
              )
            })}
          </div>
        )}
      </section>

      <div className="sticky bottom-3 z-10 rounded-2xl border border-border/60 bg-card/95 p-3 shadow-[0_14px_32px_rgba(15,23,42,0.10)] backdrop-blur dark:bg-card/90 dark:shadow-black/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {markedCount} de {students.length} alumnos marcados
            </p>
            <p
              className={cn(
                'mt-0.5 text-sm',
                unmarkedCount > 0
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-muted-foreground',
              )}
            >
              {unmarkedCount > 0
                ? `Faltan ${unmarkedCount} ${unmarkedCount === 1 ? 'alumno' : 'alumnos'} por marcar`
                : 'Registro listo para guardar'}
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="w-full rounded-xl bg-primary px-5 text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90 sm:w-auto"
          >
            {saving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar asistencia'}
          </Button>
        </div>
      </div>
    </div>
  )
}
