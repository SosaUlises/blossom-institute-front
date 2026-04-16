import Link from 'next/link'
import {
  BookOpen,
  CalendarRange,
  Clock3,
  GraduationCap,
  Plus,
  Users,
  CheckSquare,
  ClipboardList,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { MiniStatCard } from '@/components/shared/mini-stat-card'
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
    <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/95 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.06),transparent_26%)]" />

      <div className="relative p-5 sm:p-6 md:p-8 lg:p-9">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl space-y-5 text-center xl:text-left">
            <div className="flex flex-wrap items-center justify-center gap-3 xl:justify-start">
              <div className="flex size-14 items-center justify-center rounded-[20px] bg-primary/10 text-primary shadow-sm">
                <BookOpen className="size-6" />
              </div>

              <span className={getEstadoCursoBadgeClass(course.estado)}>
                {getEstadoCursoLabel(course.estado)}
              </span>

              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/75 px-3 py-1 text-xs font-medium text-muted-foreground">
                <CalendarRange className="size-3.5" />
                Año {course.anio}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                Panel del curso
              </p>

              <h1 className="text-[2rem] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-[2.2rem] md:text-[2.6rem] xl:text-[2.8rem]">
                {course.nombre}
              </h1>

              <p className="mx-auto max-w-2xl text-[15px] leading-7 text-muted-foreground xl:mx-0">
                {course.descripcion?.trim()
                  ? course.descripcion
                  : 'Vista general del curso con acceso rápido a alumnos, clases y tareas.'}
              </p>
            </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
  <Button
    asChild
    className="h-11 min-w-[210px] rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
  >
    <Link
      href={`/teacher/courses/${course.id}/tasks/create`}
      className="flex items-center justify-center"
    >
      <Plus className="mr-2 size-4" />
      Crear tarea
    </Link>
  </Button>

  <Button
    asChild
    variant="outline"
    className="h-11 min-w-[210px] rounded-2xl border-primary/15 bg-primary/5 px-5 text-sm font-semibold text-primary transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/10 hover:text-primary"
  >
    <Link
      href={`/teacher/courses/${course.id}/classes/take`}
      className="flex items-center justify-center"
    >
      <CheckSquare className="mr-2 size-4" />
      Tomar asistencia
    </Link>
  </Button>

  <Button
    asChild
    variant="outline"
    className="h-11 min-w-[210px] rounded-2xl border-primary/15 bg-primary/5 px-5 text-sm font-semibold text-primary transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/10 hover:text-primary"
  >
    <Link
      href={`/teacher/courses/${course.id}/grade-templates`}
      className="flex items-center justify-center"
    >
      <ClipboardList className="mr-2 size-4" />
      Gestionar calificaciones
    </Link>
  </Button>
</div>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:min-w-[440px] xl:grid-cols-3">
            <div className="col-span-1">
              <MiniStatCard
                icon={Users}
                label="Alumnos"
                value={course.cantidadAlumnos}
                accent="sky"
              />
            </div>

            <div className="col-span-1">
              <MiniStatCard
                icon={GraduationCap}
                label="Profesores"
                value={course.cantidadProfesores}
                accent="violet"
              />
            </div>

            <div className="col-span-2 xl:col-span-1">
              <MiniStatCard
                icon={Clock3}
                label="Horarios"
                value={course.horarios.length}
                accent="amber"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {course.horarios.length > 0 ? (
            course.horarios.map((schedule, index) => (
              <div
                key={`${schedule.dia}-${schedule.horaInicio}-${schedule.horaFin}-${index}`}
                className="group rounded-[22px] border border-border/60 bg-background/80 p-4 text-center shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-background hover:shadow-md sm:text-left"
              >
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    {getDayLabel(schedule.dia)}
                  </p>

                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors group-hover:bg-primary/10">
                    <Clock3 className="size-3.5" />
                    {schedule.horaInicio} – {schedule.horaFin}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-border/70 bg-background/60 p-5 text-center text-sm text-muted-foreground sm:text-left">
              Este curso no tiene horarios configurados todavía.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}