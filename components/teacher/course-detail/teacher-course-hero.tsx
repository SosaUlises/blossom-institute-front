import Link from 'next/link'
import {
  BookOpen,
  CalendarRange,
  Clock3,
  GraduationCap,
  Plus,
  Users,
  CheckSquare,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { TeacherCourseDetail } from '@/lib/teacher/course-detail/types'
import {
  getDayLabel,
  getEstadoCursoBadgeClass,
  getEstadoCursoLabel,
} from '@/lib/teacher/course-detail/utils'

type Props = {
  course: TeacherCourseDetail
}

export function TeacherCourseHero({ course }: Props) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border/70 bg-card/95 shadow-[0_28px_70px_-30px_rgba(30,42,68,0.28)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_30%)]" />

      <div className="relative p-7 md:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-[20px] bg-primary/10 text-primary shadow-sm transition-transform duration-200 hover:scale-[1.02]">
                <BookOpen className="size-6" />
              </div>

              <span className={getEstadoCursoBadgeClass(course.estado)}>
                {getEstadoCursoLabel(course.estado)}
              </span>

              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                <CalendarRange className="size-3.5" />
                Año {course.anio}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Teacher course
              </p>

              <h1 className="text-[2.4rem] font-bold leading-[1.05] tracking-tight text-foreground md:text-[2.8rem]">
                {course.nombre}
              </h1>

              <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
                {course.descripcion?.trim()
                  ? course.descripcion
                  : 'Vista general del curso con acceso rápido a alumnos, clases y tareas.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link href={`/teacher/courses/${course.id}/tasks/create`}>
              <Button className="h-11 rounded-2xl px-5 text-sm font-semibold shadow-[0_14px_28px_-16px_rgba(36,59,123,0.40)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_18px_36px_-18px_rgba(36,59,123,0.46)]">
                <Plus className="mr-2 size-4" />
                Crear tarea
              </Button>
            </Link>

              <Link href={`/teacher/courses/${course.id}/classes/take`}>
                <Button
                  variant="outline"
                  className="h-11 rounded-2xl border-primary/15 bg-primary/5 px-5 text-sm font-semibold text-primary shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/10 hover:shadow-md"
                >
                  <CheckSquare className="mr-2 size-4" />
                  Tomar asistencia
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[440px]">
            <StatCard
              icon={Users}
              label="Alumnos"
              value={course.cantidadAlumnos}
              color="sky"
            />
            <StatCard
              icon={GraduationCap}
              label="Profesores"
              value={course.cantidadProfesores}
              color="violet"
            />
            <StatCard
              icon={Clock3}
              label="Horarios"
              value={course.horarios.length}
              color="amber"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {course.horarios.length > 0 ? (
            course.horarios.map((schedule, index) => (
              <div
                key={`${schedule.dia}-${schedule.horaInicio}-${schedule.horaFin}-${index}`}
                className="group rounded-[22px] border border-border/70 bg-background/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-background hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    {getDayLabel(schedule.dia)}
                  </p>

                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors group-hover:bg-primary/10">
                    <Clock3 className="size-3.5" />
                    {schedule.horaInicio} · {schedule.horaFin}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-border/70 bg-background/60 p-5 text-sm text-muted-foreground">
              Este curso no tiene horarios configurados todavía.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: 'sky' | 'violet' | 'amber'
}) {
  const iconWrapClass =
    color === 'sky'
      ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
      : color === 'violet'
      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'

  return (
    <div className="rounded-[22px] border border-border/70 bg-background/85 p-4 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className={`flex size-8 items-center justify-center rounded-xl ${iconWrapClass}`}>
          <Icon className="size-4" />
        </div>

        <span className="text-xs font-medium uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}