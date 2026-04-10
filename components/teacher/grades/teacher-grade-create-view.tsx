'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  Sparkles,
  CalendarDays,
  ClipboardList,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TeacherGradeForm } from './teacher-grade-form'
import { createTeacherGrade } from '@/lib/teacher/grades/api'
import type { GradeFormPayload } from '@/lib/teacher/grades/types'

type Props = {
  courseId: number
  alumnoId: number
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

export function TeacherGradeCreateView({ courseId, alumnoId }: Props) {
  const router = useRouter()

  const handleSubmit = async (payload: GradeFormPayload) => {
    await createTeacherGrade(courseId, alumnoId, payload)

    setTimeout(() => {
      router.push(`/teacher/courses/${courseId}/students/${alumnoId}/grades`)
    }, 700)
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
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Crear calificación
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Registrar evaluación
            </h1>

            <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
              Creá una calificación manual para el alumno con nota directa o con cálculo automático a partir de skills, según el tipo de evaluación.
            </p>
          </div>
        </div>
      </section>

      <TeacherGradeForm
        mode="create"
        onSubmit={handleSubmit}
        submitLabel="Crear calificación"
      />
    </div>
  )
}