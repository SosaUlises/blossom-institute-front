'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckSquare, Save, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { saveTeacherClassAttendance } from '@/lib/teacher/course-detail/attendance-api'
import {
  EstadoAsistencia,
  type SaveAttendancePayload,
} from '@/lib/teacher/course-detail/attendance-types'

type StudentItem = {
  alumnoId: number
  nombre: string
  apellido: string
  email?: string | null
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
  estado: EstadoAsistencia | null
}

function AttendanceOptionButton({
  label,
  active,
  tone = 'default',
  onClick,
}: {
  label: string
  active: boolean
  tone?: 'success' | 'danger' | 'default'
  onClick: () => void
}) {
  const toneClass =
    tone === 'success'
      ? active
        ? 'border-green-500/20 bg-green-500/12 text-green-700 dark:text-green-400 shadow-sm'
        : 'border-border/60 bg-background/80 text-muted-foreground hover:border-green-500/20 hover:bg-green-500/5 hover:text-green-700 dark:hover:text-green-400'
      : tone === 'danger'
      ? active
        ? 'border-red-500/20 bg-red-500/12 text-red-700 dark:text-red-400 shadow-sm'
        : 'border-border/60 bg-background/80 text-muted-foreground hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-700 dark:hover:text-red-400'
      : active
      ? 'border-primary/20 bg-primary/10 text-primary shadow-sm'
      : 'border-border/60 bg-background/80 text-muted-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-primary'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all hover:-translate-y-[1px] ${toneClass}`}
    >
      {label}
    </button>
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
            estado: null,
          }))
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId])

  const presentCount = useMemo(
    () => students.filter((x) => x.estado === EstadoAsistencia.Presente).length,
    [students]
  )

  const absentCount = useMemo(
    () => students.filter((x) => x.estado === EstadoAsistencia.Ausente).length,
    [students]
  )

  const handleChangeEstado = (
    alumnoId: number,
    estado: EstadoAsistencia | null
  ) => {
    setStudents((prev) =>
      prev.map((item) =>
        item.alumnoId === alumnoId ? { ...item, estado } : item
      )
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
      setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando alumnos...</p>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border/70 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(30,42,68,0.24)] md:p-8">
        <div className="space-y-5">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => router.push(`/teacher/courses/${courseId}`)}
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver al curso
          </Button>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <CheckSquare className="size-3.5" />
              Take attendance
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Tomar asistencia
            </h1>

            <p className="text-sm leading-6 text-muted-foreground">
              Seleccioná la fecha, marcá presentes y ausentes y guardá el registro de clase.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Descripción de la clase
              </label>
              <input
                value={descripcionClase}
                onChange={(e) => setDescripcionClase(e.target.value)}
                className="w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm outline-none"
                placeholder="Temas vistos, observaciones, contenido trabajado..."
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="size-4" />
                <span className="text-xs font-medium uppercase tracking-[0.14em]">
                  Alumnos
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {students.length}
              </p>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckSquare className="size-4" />
                <span className="text-xs font-medium uppercase tracking-[0.14em]">
                  Presentes
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {presentCount}
              </p>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckSquare className="size-4" />
                <span className="text-xs font-medium uppercase tracking-[0.14em]">
                  Ausentes
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {absentCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Students
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Registro por alumno
            </h2>
          </div>

          <Button onClick={handleSave} disabled={saving} className="rounded-2xl">
            <Save className="mr-2 size-4" />
            {saving ? 'Guardando...' : 'Guardar asistencia'}
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
            {success}
          </div>
        )}

       
        <div className="space-y-3">
  {students.map((student) => {
    const statusLabel =
      student.estado === EstadoAsistencia.Presente
        ? 'Presente'
        : student.estado === EstadoAsistencia.Ausente
        ? 'Ausente'
        : 'Sin registro'

    const statusClass =
      student.estado === EstadoAsistencia.Presente
        ? 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400'
        : student.estado === EstadoAsistencia.Ausente
        ? 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400'
        : 'border-border/60 bg-muted/40 text-muted-foreground'

    return (
      <div
        key={student.alumnoId}
        className="rounded-[26px] border border-border/70 bg-background/75 p-4 shadow-sm transition-all hover:-translate-y-[1px] hover:bg-background hover:shadow-md"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-foreground">
                {student.nombreCompleto}
              </p>

              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusClass}`}
              >
                {statusLabel}
              </span>
            </div>

          </div>

          <div className="flex flex-wrap gap-2">
            <AttendanceOptionButton
              label="Presente"
              tone="success"
              active={student.estado === EstadoAsistencia.Presente}
              onClick={() =>
                handleChangeEstado(student.alumnoId, EstadoAsistencia.Presente)
              }
            />

            <AttendanceOptionButton
              label="Ausente"
              tone="danger"
              active={student.estado === EstadoAsistencia.Ausente}
              onClick={() =>
                handleChangeEstado(student.alumnoId, EstadoAsistencia.Ausente)
              }
            />

           
          </div>
        </div>
      </div>
    )
  })}
</div>
      </section>
    </div>
  )
}