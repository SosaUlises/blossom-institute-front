import {
  BookOpen,
  CalendarRange,
  Clock3,
  GraduationCap,
  Users,
} from 'lucide-react'

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
    <section className="relative overflow-hidden rounded-[30px] border border-border/70 bg-card/95 shadow-[0_24px_60px_-28px_rgba(30,42,68,0.24)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_28%)]" />

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="size-5" />
              </div>

              <span className={getEstadoCursoBadgeClass(course.estado)}>
                {getEstadoCursoLabel(course.estado)}
              </span>

              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                <CalendarRange className="size-3.5" />
                Año {course.anio}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Teacher course detail
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {course.nombre}
              </h1>

              <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-[15px]">
                {course.descripcion?.trim()
                  ? course.descripcion
                  : 'Vista general del curso con acceso rápido a alumnos, clases, tareas y organización académica.'}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
            <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="size-4" />
                <span className="text-xs font-medium uppercase tracking-[0.14em]">
                  Alumnos
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {course.cantidadAlumnos}
              </p>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="size-4" />
                <span className="text-xs font-medium uppercase tracking-[0.14em]">
                  Profesores
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {course.cantidadProfesores}
              </p>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock3 className="size-4" />
                <span className="text-xs font-medium uppercase tracking-[0.14em]">
                  Horarios
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {course.horarios.length}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {course.horarios.length > 0 ? (
            course.horarios.map((schedule, index) => (
              <div
                key={`${schedule.dia}-${schedule.horaInicio}-${schedule.horaFin}-${index}`}
                className="rounded-[24px] border border-border/70 bg-background/75 p-4 shadow-sm transition-colors hover:bg-background"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    {getDayLabel(schedule.dia)}
                  </p>

                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
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