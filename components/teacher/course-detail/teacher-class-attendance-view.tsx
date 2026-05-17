'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  getTeacherClassAttendance,
  saveTeacherClassAttendance,
} from '@/lib/teacher/course-detail/attendance-api'
import {
  type ClassAttendanceDetail,
  type SaveAttendancePayload,
  EstadoAsistencia,
} from '@/lib/teacher/course-detail/attendance-types'
import { getEstadoClaseLabel as getAttendanceEstadoClaseLabel } from '@/lib/teacher/course-detail/attendance-utils'
import { formatDate } from '@/lib/teacher/course-detail/formatters'
import { cn } from '@/lib/utils'
import {
  PersonAvatar,
  PersonRosterSurface,
} from './course-people-ui'

type Props = {
  courseId: number
  fecha: string
}

type StudentState = {
  alumnoId: number
  nombreCompleto: string
  estado: EstadoAsistencia | null
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
          'rounded-lg px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
          value === EstadoAsistencia.Presente
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            : 'text-muted-foreground hover:bg-emerald-500/5 hover:text-emerald-700 dark:hover:text-emerald-300',
        )}
      >
        Presente
      </button>
      <button
        type="button"
        onClick={() => onChange(EstadoAsistencia.Ausente)}
        className={cn(
          'rounded-lg px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
          value === EstadoAsistencia.Ausente
            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
            : 'text-muted-foreground hover:bg-rose-500/5 hover:text-rose-700 dark:hover:text-rose-300',
        )}
      >
        Ausente
      </button>
    </div>
  )
}

export function TeacherClassAttendanceView({ courseId, fecha }: Props) {
  const router = useRouter()

  const [detail, setDetail] = useState<ClassAttendanceDetail | null>(null)
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
        setSuccess(null)

        const result = await getTeacherClassAttendance(courseId, fecha)

        setDetail(result)
        setDescripcionClase(result.descripcion ?? '')
        setStudents(
          result.alumnos.map((alumno) => ({
            alumnoId: alumno.alumnoId,
            nombreCompleto: alumno.nombreCompleto,
            estado: alumno.estado ?? null,
          })),
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId, fecha])

  const presentCount = useMemo(
    () => students.filter((x) => x.estado === EstadoAsistencia.Presente).length,
    [students],
  )

  const absentCount = useMemo(
    () => students.filter((x) => x.estado === EstadoAsistencia.Ausente).length,
    [students],
  )
  const unmarkedCount = students.length - presentCount - absentCount

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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ocurrió un error al guardar.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border/60 bg-background/60 px-5 py-6 text-sm text-muted-foreground dark:bg-background/35">
        Cargando asistencia...
      </div>
    )
  }

  if (error && !detail) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="rounded-2xl border border-border/60 bg-background/60 px-6 py-10 text-sm text-muted-foreground">
        No se encontró la asistencia.
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-24 md:pb-0">
      <header className="space-y-3 border-b border-border/60 pb-4">
        <Button
          variant="ghost"
          className="-ml-2 h-9 w-fit rounded-lg px-2 text-muted-foreground hover:bg-primary/5 hover:text-primary"
          onClick={() => router.push(`/teacher/courses/${courseId}`)}
        >
          <ArrowLeft className="mr-2 size-4" />
          Volver al curso
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Asistencia · {formatDate(detail.fecha)}
          </h1>
          <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-300">
            {getAttendanceEstadoClaseLabel(detail.estadoClase)}
          </span>
        </div>
      </header>

      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:border-border/70 sm:p-5">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Tema de la clase
          </label>

          <textarea
            value={descripcionClase}
            onChange={(e) => setDescripcionClase(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-border/60 bg-background/75 px-3 py-3 text-sm outline-none transition-colors focus:border-primary/35 focus:ring-2 focus:ring-primary/15 dark:bg-background/35"
            placeholder="Temas vistos, contenido trabajado..."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:border-border/70 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Alumnos
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Registro por alumno
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {students.length} alumnos · {presentCount} presentes · {absentCount}{' '}
              ausentes · {unmarkedCount} sin marcar
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-10 rounded-xl bg-primary px-4 text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90"
          >
            <Save className="mr-2 size-4" />
            {saving ? 'Guardando...' : 'Guardar asistencia'}
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            {success}
          </div>
        )}

        {students.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-6 text-center dark:bg-muted/10">
            <p className="text-sm font-medium text-foreground">
              Todavía no hay alumnos asignados a este curso.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((student) => {
            const statusLabel =
              student.estado === EstadoAsistencia.Presente
                ? 'Presente'
                : student.estado === EstadoAsistencia.Ausente
                  ? 'Ausente'
                  : 'Sin marcar'

            const statusClass =
              student.estado === EstadoAsistencia.Presente
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : student.estado === EstadoAsistencia.Ausente
                  ? 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400'
                  : 'border-border/60 bg-muted/40 text-muted-foreground'

              return (
                <PersonRosterSurface key={student.alumnoId} tone="student">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <PersonAvatar name={student.nombreCompleto} tone="student" />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-[15px]">
                          {student.nombreCompleto}
                        </p>
                        <span
                          className={cn(
                            'mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                            statusClass,
                          )}
                        >
                          {statusLabel}
                        </span>
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

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/95 px-5 py-3 backdrop-blur dark:bg-background/90 md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {unmarkedCount > 0
                ? `Faltan ${unmarkedCount} por marcar`
                : 'Asistencia completa'}
            </p>
            <p className="text-xs text-muted-foreground">
              {presentCount} presentes · {absentCount} ausentes
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-10 shrink-0 rounded-xl bg-primary px-4 text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90"
          >
            <Save className="mr-2 size-4" />
            {saving ? 'Guardando...' : 'Guardar asistencia'}
          </Button>
        </div>
      </div>
    </div>
  )
}
