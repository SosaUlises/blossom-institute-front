'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  CheckSquare,
  Save,
  Users,
  CheckCircle2,
  XCircle,
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

type Props = {
  courseId: number
  fecha: string
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

  const registeredCount = useMemo(
    () => students.filter((x) => x.estado != null).length,
    [students],
  )

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
      <div className="rounded-[24px] border border-border/60 bg-background/60 px-6 py-10 text-sm text-muted-foreground">
        Cargando asistencia...
      </div>
    )
  }

  if (error && !detail) {
    return (
      <div className="rounded-[24px] border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="rounded-[24px] border border-border/60 bg-background/60 px-6 py-10 text-sm text-muted-foreground">
        No se encontró la asistencia.
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

            <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
              {getAttendanceEstadoClaseLabel(detail.estadoClase)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <CheckSquare className="size-3.5" />
              Asistencia
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Asistencia · {formatDate(detail.fecha)}
            </h1>

            <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
              Registrá presentes y ausentes para la clase del día y guardá la
              descripción del contenido visto.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              icon={<Users className="size-4" />}
              label="Registros"
              value={registeredCount}
            />
            <StatCard
              icon={<CheckSquare className="size-4" />}
              label="Presentes"
              value={presentCount}
              tone="success"
            />
            <StatCard
              icon={<CalendarDays className="size-4" />}
              label="Ausentes"
              value={absentCount}
              tone="danger"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Descripción de la clase
          </label>

          <textarea
            value={descripcionClase}
            onChange={(e) => setDescripcionClase(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-border/70 bg-background/85 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
            placeholder="Temas vistos, observaciones, contenido trabajado..."
          />
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

          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
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