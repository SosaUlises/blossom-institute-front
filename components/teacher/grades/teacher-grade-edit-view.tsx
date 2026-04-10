'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Pencil,
  FileText,
  Sparkles,
  CalendarDays,
  Inbox,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { TeacherGradeForm } from './teacher-grade-form'
import {
  getTeacherGradeDetail,
  updateTeacherGrade,
} from '@/lib/teacher/grades/api'
import type {
  GradeFormPayload,
  GradeFormValues,
} from '@/lib/teacher/grades/types'

type Props = {
  courseId: number
  alumnoId: number
  gradeId: number
}

function EditViewSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border/60 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)] md:p-8">
        <div className="space-y-5">
          <div className="h-10 w-48 animate-pulse rounded-2xl bg-muted/35" />

          <div className="space-y-3">
            <div className="h-4 w-28 animate-pulse rounded-lg bg-muted/30" />
            <div className="h-9 w-2/5 animate-pulse rounded-xl bg-muted/40" />
            <div className="h-4 w-4/5 animate-pulse rounded-lg bg-muted/30" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
            <div className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
            <div className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
          </div>
        </div>
      </section>
    </div>
  )
}

function HeroMetaCard({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  tone?: 'default' | 'highlight'
}) {
  const containerClass =
    tone === 'highlight'
      ? 'rounded-[24px] border border-primary/15 bg-primary/5 px-4 py-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]'
      : 'rounded-[24px] border border-border/60 bg-background/75 px-4 py-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]'

  const iconWrapClass =
    tone === 'highlight'
      ? 'bg-primary/10 text-primary'
      : 'bg-background text-muted-foreground'

  const labelClass = tone === 'highlight' ? 'text-primary/80' : 'text-muted-foreground'
  const valueClass = tone === 'highlight' ? 'text-primary' : 'text-foreground'

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-2">
        <div className={`flex size-10 items-center justify-center rounded-2xl ${iconWrapClass}`}>
          <Icon className="size-4.5" />
        </div>
        <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${labelClass}`}>
          {label}
        </span>
      </div>

      <p className={`mt-3 text-sm font-semibold leading-6 ${valueClass}`}>{value}</p>
    </div>
  )
}

export function TeacherGradeEditView({
  courseId,
  alumnoId,
  gradeId,
}: Props) {
  const router = useRouter()

  const [initialValues, setInitialValues] = useState<GradeFormValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const grade = await getTeacherGradeDetail(courseId, alumnoId, gradeId)

        setInitialValues({
          tipo: String(grade.tipo),
          titulo: grade.titulo ?? '',
          descripcion: grade.descripcion ?? '',
          fecha: grade.fecha ?? '',
          tareaId: '',
          entregaId: '',
          nota: grade.nota != null ? String(grade.nota) : '',
          detalles:
            grade.detalles?.map((detail) => ({
              id: crypto.randomUUID(),
              skill: String(detail.skill),
              puntajeObtenido: String(detail.puntajeObtenido),
              puntajeMaximo: String(detail.puntajeMaximo),
            })) ?? [],
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId, alumnoId, gradeId])

  const handleSubmit = async (payload: GradeFormPayload) => {
    await updateTeacherGrade(courseId, alumnoId, gradeId, payload)

    setTimeout(() => {
      router.push(`/teacher/courses/${courseId}/students/${alumnoId}/grades`)
    }, 700)
  }

  if (loading) {
    return <EditViewSkeleton />
  }

  if (error || !initialValues) {
    return (
      <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
        <CardContent className="px-6 py-14">
          <Empty className="border-0 p-0">
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No se pudo cargar la calificación</EmptyTitle>
              <EmptyDescription>
                {error ?? 'Ocurrió un error al obtener la información.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-border/60 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)] md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.06),transparent_28%)]" />

        <div className="relative space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              onClick={() =>
                router.push(`/teacher/courses/${courseId}/students/${alumnoId}/grades`)
              }
            >
              <ArrowLeft className="mr-2 size-4" />
              Volver a calificaciones
            </Button>

            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Pencil className="size-3.5" />
              Edición
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Editar calificación
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Actualizar evaluación
            </h1>

            <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
              Modificá tipo, fecha, nota o detalle por skills para mantener la evaluación alineada con el seguimiento académico del alumno.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <HeroMetaCard
              icon={FileText}
              label="Título actual"
              value={initialValues.titulo || 'Sin título'}
              tone="highlight"
            />

            <HeroMetaCard
              icon={CalendarDays}
              label="Fecha"
              value={initialValues.fecha || 'Sin fecha'}
            />

            <HeroMetaCard
              icon={Sparkles}
              label="Modo"
              value={initialValues.detalles?.length ? 'Detalle por skills' : 'Nota directa'}
            />
          </div>
        </div>
      </section>

      <TeacherGradeForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
      />
    </div>
  )
}