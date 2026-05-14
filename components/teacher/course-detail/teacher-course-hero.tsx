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
import type { TeacherCourseDetail } from '@/lib/teacher/course-detail/types'
import {
  getDayLabel,
  getEstadoCursoBadgeClass,
  getEstadoCursoLabel,
} from '@/lib/teacher/course-detail/utils'

type Props = {
  course: TeacherCourseDetail
}

function InfoStatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  accent: 'sky' | 'violet'
}) {
  const accentStyles = {
    sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card/85 px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-10 items-center justify-center rounded-lg ${accentStyles[accent]}`}
        >
          <Icon className="size-5" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-xl font-semibold leading-none tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

export function TeacherCourseHero({ course }: Props) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90">
      <div className="p-4 sm:p-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_360px]">
          <div className="rounded-xl border border-border/60 bg-background/55 p-5 dark:bg-background/30 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg border border-primary/10 bg-primary/10 text-primary">
                <BookOpen className="size-5" />
              </div>

              <span className={getEstadoCursoBadgeClass(course.estado)}>
                {getEstadoCursoLabel(course.estado)}
              </span>

              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                <CalendarRange className="size-3.5" />
                Año {course.anio}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
                Espacio del curso
              </p>

              <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                {course.nombre}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                {course.descripcion?.trim()
                  ? course.descripcion
                  : 'Gestioná alumnos, asistencia, tareas y calificaciones desde un único espacio de trabajo.'}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                asChild
                className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors duration-200 hover:bg-primary/90"
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
                className="h-10 rounded-lg border-border/70 bg-background/70 px-4 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
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
                className="h-10 rounded-lg border-border/70 bg-background/70 px-4 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
              >
                <Link
                  href={`/teacher/courses/${course.id}/grade-templates`}
                  className="flex items-center justify-center"
                >
                  <ClipboardList className="mr-2 size-4" />
                  Cargar calificaciones
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/45 p-4 dark:bg-background/25">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoStatCard
                icon={Users}
                label="Alumnos"
                value={course.cantidadAlumnos}
                accent="sky"
              />

              <InfoStatCard
                icon={GraduationCap}
                label="Profesores"
                value={course.cantidadProfesores}
                accent="violet"
              />
            </div>

            <div className="mt-4 rounded-xl border border-border/60 bg-background/55 p-4 dark:bg-background/30">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Disponibilidad semanal
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Horarios configurados para este curso.
                  </p>
                </div>

              </div>

              <div className="space-y-2.5">
                {course.horarios.length > 0 ? (
                  course.horarios.map((schedule, index) => (
                    <div
                      key={`${schedule.dia}-${schedule.horaInicio}-${schedule.horaFin}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/90 px-4 py-3 transition-colors duration-200 hover:border-primary/15 hover:bg-primary/[0.04]"
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {getDayLabel(schedule.dia)}
                      </span>

                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                        <Clock3 className="size-3.5" />
                        {schedule.horaInicio} – {schedule.horaFin}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-card/70 px-4 py-5 text-sm text-muted-foreground">
                    Este curso no tiene horarios configurados todavía.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
