'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckSquare,
  Save,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { saveTeacherClassAttendance } from '@/lib/teacher/course-detail/attendance-api'
import {
  EstadoAsistencia,
  type SaveAttendancePayload,
} from '@/lib/teacher/course-detail/attendance-types'
import { cn } from '@/lib/utils'

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
        ? 'border-emerald-500/20 bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 shadow-sm'
        : 'border-border/60 bg-background/85 text-muted-foreground hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-700 dark:hover:text-emerald-400'
      : tone === 'danger'
        ? active
          ? 'border-rose-500/20 bg-rose-500/12 text-rose-700 dark:text-rose-400 shadow-sm'
          : 'border-border/60 bg-background/85 text-muted-foreground hover:border-rose-500/20 hover:bg-rose-500/5 hover:text-rose-700 dark:hover:text-rose-400'
        : active
          ? 'border-primary/20 bg-primary/10 text-primary shadow-sm'
          : 'border-border/60 bg-background/85 text-muted-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-primary'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all duration-200',
        'hover:-translate-y-[1px]',
        toneClass,
      )}
    >
      {label}
    </button>
  )
}

function StatCard({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode
  label: string
  value: number
  tone?: 'default' | 'success' | 'danger'
}) {
  return (
    <div
      className={cn(
        'rounded-[24px] border p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]',
        tone === 'success' &&
          'border-emerald-500/20 bg-emerald-500/[0.06]',
        tone === 'danger' &&
          'border-rose-500/20 bg-rose-500/[0.06]',
        tone === 'default' &&
          'border-border/60 bg-background/80',
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
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

  const presentCount = useMemo(
    () => students.filter((x) => x.estado === EstadoAsistencia.Presente).length,
    [students],
  )

  const absentCount = useMemo(
    () => students.filter((x) => x.estado === EstadoAsistencia.Ausente).length,
    [students],
  )

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
    return (
      <div className="rounded-[24px] border border-border/60 bg-background/60 px-6 py-10 text-sm text-muted-foreground">
        Cargando alumnos...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.06),transparent_28%)]" />

        <div className="relative space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              onClick={() => router.push(`/teacher/courses/${courseId}`)}
            >
              <ArrowLeft className="mr-2 size-4" />
              Volver al curso
            </Button>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <CheckSquare className="size-3.5" />
              Asistencia
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Tomar asistencia
            </h1>

            <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
              Seleccioná la fecha, marcá presentes y ausentes y guardá el registro
              de la clase.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-2xl border border-border/70 bg-background/85 px-4 py-3 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Descripción de la clase
              </label>
              <input
                value={descripcionClase}
                onChange={(e) => setDescripcionClase(e.target.value)}
                className="w-full rounded-2xl border border-border/70 bg-background/85 px-4 py-3 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
                placeholder="Temas vistos, observaciones, contenido trabajado..."
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              icon={<Users className="size-4" />}
              label="Alumnos"
              value={students.length}
            />
            <StatCard
              icon={<CheckCircle2 className="size-4" />}
              label="Presentes"
              value={presentCount}
              tone="success"
            />
            <StatCard
              icon={<XCircle className="size-4" />}
              label="Ausentes"
              value={absentCount}
              tone="danger"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Alumnos
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Registro por alumno
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleMarkAllPresent}
              className="rounded-2xl border-emerald-500/20 bg-emerald-500/8 text-emerald-700 transition-all duration-200 hover:-translate-y-[1px] hover:bg-emerald-500/12 hover:text-emerald-700 dark:text-emerald-400"
            >
              <CheckCircle2 className="mr-2 size-4" />
              Marcar todos presentes
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
            >
              <Save className="mr-2 size-4" />
              {saving ? 'Guardando...' : 'Guardar asistencia'}
            </Button>
          </div>
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
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : student.estado === EstadoAsistencia.Ausente
                  ? 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400'
                  : 'border-border/60 bg-muted/40 text-muted-foreground'

            return (
              <div
                key={student.alumnoId}
                className="rounded-[26px] border border-border/60 bg-background/75 p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-background hover:shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-foreground">
                        {student.nombreCompleto}
                      </p>

                      <span
                        className={cn(
                          'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                          statusClass,
                        )}
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
                        handleChangeEstado(
                          student.alumnoId,
                          EstadoAsistencia.Presente,
                        )
                      }
                    />

                    <AttendanceOptionButton
                      label="Ausente"
                      tone="danger"
                      active={student.estado === EstadoAsistencia.Ausente}
                      onClick={() =>
                        handleChangeEstado(
                          student.alumnoId,
                          EstadoAsistencia.Ausente,
                        )
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