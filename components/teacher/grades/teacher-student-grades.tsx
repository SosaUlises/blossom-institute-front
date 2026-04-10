'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Archive,
  CalendarDays,
  Pencil,
  Plus,
  Sparkles,
  Trophy,
  ClipboardList,
  Inbox,
  FileCheck2,
  Users,
  ShieldCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RowActions } from '@/components/ui/row-actions'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
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
  alumnoApellido?: string
  alumnoDni?: number
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

function getGradeTone(nota: number) {
  if (nota >= 80) {
    return {
      container:
        'rounded-[24px] border border-emerald-500/20 bg-emerald-500/[0.10] px-5 py-5 shadow-[0_12px_24px_-18px_rgba(16,185,129,0.35)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-emerald-500/[0.14] hover:shadow-md',
      label:
        'text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700/80 dark:text-emerald-400/90',
      value:
        'text-3xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400',
      iconWrap:
        'flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      suffix: 'text-xs text-emerald-700/70 dark:text-emerald-400/70',
    }
  }

  if (nota >= 60) {
    return {
      container:
        'rounded-[24px] border border-amber-500/20 bg-amber-500/[0.10] px-5 py-5 shadow-[0_12px_24px_-18px_rgba(245,158,11,0.30)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-amber-500/[0.14] hover:shadow-md',
      label:
        'text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700/80 dark:text-amber-400/90',
      value:
        'text-3xl font-semibold tracking-tight text-amber-700 dark:text-amber-400',
      iconWrap:
        'flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400',
      suffix: 'text-xs text-amber-700/70 dark:text-amber-400/70',
    }
  }

  return {
    container:
      'rounded-[24px] border border-rose-500/20 bg-rose-500/[0.10] px-5 py-5 shadow-[0_12px_24px_-18px_rgba(244,63,94,0.30)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-rose-500/[0.14] hover:shadow-md',
    label:
      'text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700/80 dark:text-rose-400/90',
    value:
      'text-3xl font-semibold tracking-tight text-rose-700 dark:text-rose-400',
    iconWrap:
      'flex size-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-400',
    suffix: 'text-xs text-rose-700/70 dark:text-rose-400/70',
  }
}

function normalizeTipoLabel(label: string) {
  return label.trim().toLowerCase()
}

function getGradeTypeVisual(tipoLabel: string) {
  const normalized = normalizeTipoLabel(tipoLabel)

  if (normalized.includes('test')) {
    return {
      icon: FileCheck2,
      badge:
        'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400',
      title: 'Evaluación tipo test',
      description:
        'Instancia de evaluación estructurada con respuestas definidas.',
    }
  }

  if (normalized.includes('quiz')) {
    return {
      icon: ClipboardList,
      badge:
        'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400',
      title: 'Quiz breve',
      description: 'Actividad corta para medir comprensión puntual.',
    }
  }

  if (normalized.includes('particip')) {
    return {
      icon: Users,
      badge:
        'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
      title: 'Participación',
      description: 'Registro del involucramiento y la intervención en clase.',
    }
  }

  if (normalized.includes('comport')) {
    return {
      icon: ShieldCheck,
      badge:
        'border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400',
      title: 'Comportamiento',
      description: 'Observación vinculada a actitud, convivencia y conducta.',
    }
  }

  return {
    icon: Sparkles,
    badge: getTipoCalificacionBadgeClass(tipoLabel as never),
    title: 'Calificación registrada',
    description: 'Registro manual de evaluación para seguimiento académico.',
  }
}

function GradeValueCard({ nota }: { nota: number }) {
  const tone = getGradeTone(nota)

  return (
    <div className={tone.container}>
      <p className={tone.label}>Calificación</p>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <p className={tone.value}>{nota.toFixed(2)}</p>
          <p className={`mt-1 ${tone.suffix}`}>Resultado final registrado</p>
        </div>

        <div className={tone.iconWrap}>
          <Trophy className="size-4.5" />
        </div>
      </div>
    </div>
  )
}

function GradeCardSkeleton() {
  return (
    <article className="rounded-[28px] border border-border/70 bg-card/95 p-5 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.16)] md:p-6">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-2">
            <div className="h-7 w-24 animate-pulse rounded-full bg-muted/35" />
            <div className="h-7 w-28 animate-pulse rounded-full bg-muted/35" />
          </div>
          <div className="h-8 w-8 animate-pulse rounded-xl bg-muted/35" />
        </div>

        <div className="space-y-2">
          <div className="h-6 w-2/3 animate-pulse rounded-xl bg-muted/40" />
          <div className="h-4 w-4/5 animate-pulse rounded-lg bg-muted/30" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-20 w-44 animate-pulse rounded-[20px] bg-muted/30" />
          <div className="h-28 animate-pulse rounded-[24px] bg-muted/30" />
        </div>
      </div>
    </article>
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
  const visual = getGradeTypeVisual(tipoLabel)
  const TipoIcon = visual.icon

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
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${visual.badge}`}
            >
              <TipoIcon className="size-3.5" />
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
                      `/teacher/courses/${courseId}/students/${alumnoId}/grades/${grade.id}/edit`,
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

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <div className="min-w-0 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {grade.titulo}
              </h3>

              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {grade.descripcion?.trim() ? grade.descripcion : visual.description}
              </p>
            </div>

            <div className="inline-flex items-center gap-3 rounded-[20px] border border-border/60 bg-background/75 px-4 py-3 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-background hover:shadow-md">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-background text-muted-foreground">
                <CalendarDays className="size-4.5" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Fecha
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatDate(grade.fecha)}
                </p>
              </div>
            </div>
          </div>

          <GradeValueCard nota={grade.nota} />
        </div>
      </div>
    </article>
  )
}

export function TeacherStudentGrades({
  courseId,
  alumnoId,
  alumnoNombre,
  alumnoApellido,
  alumnoDni,
}: Props) {
  const router = useRouter()

  const [data, setData] = useState<GradeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pageNumber, setPageNumber] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const pageLabel = useMemo(() => {
    if (total === 0) return 'Sin calificaciones'
    return `Página ${pageNumber} de ${totalPages} · ${total} calificaciones`
  }, [pageNumber, total, totalPages])

  const alumnoContext = useMemo(() => {
    const first = data[0]

    return {
      nombre: alumnoNombre || first?.alumnoNombre || '',
      apellido: alumnoApellido || first?.alumnoApellido || '',
      dni: alumnoDni ?? first?.alumnoDni ?? null,
    }
  }, [data, alumnoNombre, alumnoApellido, alumnoDni])

  const alumnoFullName =
    `${alumnoContext.nombre} ${alumnoContext.apellido}`.trim() || 'Alumno'

  const loadGrades = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await getTeacherGrades(
        courseId,
        alumnoId,
        pageNumber,
        pageSize,
      )

      const filtered = (result.items ?? []).filter((item) => item.tipo !== 1)

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
    return (
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <GradeCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Calificaciones
              </p>

              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                Historial de calificaciones
              </h3>

              <p className="text-sm text-muted-foreground">
                {alumnoContext.nombre || alumnoContext.apellido
                  ? `Registro de evaluaciones manuales de ${alumnoFullName}.`
                  : 'Registro de evaluaciones manuales del alumno.'}
              </p>
            </div>

            <div className="inline-flex items-center gap-3 rounded-[22px] border border-border/60 bg-background/75 px-4 py-3 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-background hover:shadow-md">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users className="size-4.5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {alumnoFullName}
                </p>

                {alumnoContext.dni ? (
                  <p className="text-xs text-muted-foreground">
                    DNI: {alumnoContext.dni}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <Button
            onClick={() =>
              router.push(
                `/teacher/courses/${courseId}/students/${alumnoId}/grades/create`,
              )
            }
            className="h-11 rounded-2xl bg-primary text-primary-foreground shadow-[0_12px_26px_-12px_rgba(36,59,123,0.45)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_16px_34px_-14px_rgba(36,59,123,0.55)] active:translate-y-0"
          >
            <Plus className="mr-2 size-4" />
            Crear calificación
          </Button>
        </div>
      </section>

      {data.length === 0 ? (
        <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
          <CardContent className="px-6 py-14">
            <Empty className="border-0 p-0">
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>Sin calificaciones</EmptyTitle>
                <EmptyDescription>
                  No hay calificaciones manuales registradas para este alumno.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
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

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <p className="text-sm text-muted-foreground">{pageLabel}</p>

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
            disabled={pageNumber >= totalPages || total === 0}
            onClick={() => setPageNumber((prev) => prev + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}