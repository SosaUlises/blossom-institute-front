'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Archive,
  CalendarDays,
  Pencil,
  Plus,
  Sparkles,
  Trophy,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RowActions } from '@/components/ui/row-actions'
import { getTeacherGrades, archiveTeacherGrade } from '@/lib/teacher/grades/api'
import type { GradeListItem } from '@/lib/teacher/grades/types'
import {
  getTipoCalificacionBadgeClass,
  getTipoCalificacionLabel,
} from '@/lib/teacher/grades/utils'

type Props = {
  courseId: number
  alumnoId: number
  alumnoNombre?: string
}

type Envelope<T> = {
  message?: string
  data?: T
}

type GradeListResponse = {
  total: number
  pageNumber: number
  pageSize: number
  items: GradeListItem[]
}

function formatDate(date: string) {
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

function GradeStat({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div
      className={
        highlight
          ? 'rounded-[22px] border border-primary/15 bg-primary/5 px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md'
          : 'rounded-[22px] border border-border/70 bg-background/80 px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md'
      }
    >
      <p
        className={
          highlight
            ? 'text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80'
            : 'text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
        }
      >
        {label}
      </p>

      <p
        className={
          highlight
            ? 'mt-2 text-xl font-bold text-primary'
            : 'mt-2 text-xl font-bold text-foreground'
        }
      >
        {value}
      </p>
    </div>
  )
}

function GradeCard({
  grade,
  courseId,
  alumnoId,
  onArchive,
}: {
  grade: GradeListItem
  courseId: number
  alumnoId: number
  onArchive: (gradeId: number) => void
}) {
  const router = useRouter()
  const tipoLabel = getTipoCalificacionLabel(grade.tipo)
  const tipoBadge = getTipoCalificacionBadgeClass(grade.tipo)

  return (
    <article className="relative rounded-[28px] border border-border/70 bg-card/95 p-5 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.16)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_24px_52px_-24px_rgba(30,42,68,0.22)] md:p-6">
      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.06),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.05),transparent_22%)]" />

      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              Calificación
            </div>

            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tipoBadge}`}
            >
              {tipoLabel}
            </span>
          </div>

          <div className="pl-2">
            <RowActions
              actions={[
                {
                  label: 'Editar',
                  icon: Pencil,
                  onClick: () =>
                    router.push(
                      `/teacher/courses/${courseId}/students/${alumnoId}/grades/${grade.id}/edit`
                    ),
                },
                {
                  label: 'Archivar',
                  icon: Archive,
                  destructive: true,
                  onClick: () => onArchive(grade.id),
                },
              ]}
            />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="min-w-0 space-y-3">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {grade.titulo}
              </h3>

              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {grade.descripcion?.trim()
                  ? grade.descripcion
                  : 'Evaluación registrada manualmente para el alumno.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1">
                <CalendarDays className="size-4" />
                {formatDate(grade.fecha)}
              </span>

              {grade.tareaId ? (
                <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-3 py-1">
                  Tarea #{grade.tareaId}
                </span>
              ) : null}

              {grade.entregaId ? (
                <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-3 py-1">
                  Entrega #{grade.entregaId}
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <GradeStat label="Nota" value={grade.nota.toFixed(2)} highlight />
            <GradeStat label="Fecha" value={formatDate(grade.fecha)} />
          </div>
        </div>
      </div>
    </article>
  )
}

export function TeacherStudentGrades({
  courseId,
  alumnoId,
  alumnoNombre,
}: Props) {
  const router = useRouter()

  const [data, setData] = useState<GradeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pageNumber, setPageNumber] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  const loadGrades = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await getTeacherGrades(courseId, alumnoId, pageNumber, pageSize)

      const filtered = (result.items ?? []).filter(
        (item) => item.tipo !== 1 // Homework fuera de esta UI
      )

      setData(filtered)
      setTotal(result.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGrades()
  }, [courseId, alumnoId, pageNumber])

  const handleArchive = async (gradeId: number) => {
    const confirmed = window.confirm('¿Querés archivar esta calificación?')
    if (!confirmed) return

    try {
      setError(null)
      await archiveTeacherGrade(courseId, alumnoId, gradeId)

      setData((prev) => prev.filter((item) => item.id !== gradeId))
      setTotal((prev) => Math.max(0, prev - 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error.')
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando calificaciones...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Grades
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            Calificaciones
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {alumnoNombre
              ? `Evaluaciones manuales registradas para ${alumnoNombre}.`
              : 'Evaluaciones manuales registradas para el alumno.'}
          </p>
        </div>

        <Button
          onClick={() =>
            router.push(
              `/teacher/courses/${courseId}/students/${alumnoId}/grades/create`
            )
          }
          className="h-10 rounded-2xl bg-primary text-primary-foreground shadow-[0_12px_26px_-12px_rgba(36,59,123,0.45)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_16px_34px_-14px_rgba(36,59,123,0.55)] active:translate-y-0"
        >
          <Plus className="mr-2 size-4" />
          Crear calificación
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="rounded-[26px] border border-dashed border-border/70 bg-background/60 px-6 py-12 text-center text-sm text-muted-foreground">
          No hay calificaciones manuales registradas para este alumno.
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((grade) => (
            <GradeCard
              key={grade.id}
              grade={grade}
              courseId={courseId}
              alumnoId={alumnoId}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-sm text-muted-foreground">
          Página {pageNumber} · {total} calificaciones en total
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40 disabled:hover:translate-y-0"
            disabled={pageNumber === 1}
            onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
          >
            Anterior
          </Button>

          <Button
            variant="outline"
            className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-40 disabled:hover:translate-y-0"
            disabled={pageNumber * pageSize >= total}
            onClick={() => setPageNumber((prev) => prev + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}