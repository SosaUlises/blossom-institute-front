import Link from 'next/link'
import {
  BookOpen,
  CalendarRange,
  CheckSquare,
  ClipboardList,
  Clock3,
  Plus,
  Users,
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

function getNextSchedule(course: TeacherCourseDetail) {
  if (course.horarios.length === 0) return null

  const today = new Date().getDay()

  return [...course.horarios].sort((a, b) => {
    const diffA = (a.dia - today + 7) % 7
    const diffB = (b.dia - today + 7) % 7

    if (diffA !== diffB) return diffA - diffB
    return a.horaInicio.localeCompare(b.horaInicio)
  })[0]
}

export function TeacherCourseHero({ course }: Props) {
  const nextSchedule = getNextSchedule(course)

  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/[0.06] text-primary">
          <BookOpen className="size-4" />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
            {course.nombre}
          </h1>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground dark:bg-background/30">
              <Users className="size-3" />
              {course.cantidadAlumnos} alumnos
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground dark:bg-background/30">
              <CalendarRange className="size-3" />
              Anio {course.anio}
            </span>
            {nextSchedule ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground dark:bg-background/30">
                <Clock3 className="size-3" />
                {getDayLabel(nextSchedule.dia)} {nextSchedule.horaInicio}
              </span>
            ) : null}
            <span className={getEstadoCursoBadgeClass(course.estado)}>
              {getEstadoCursoLabel(course.estado)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:justify-end">
        <Button
          asChild
          variant="outline"
          className="h-8 rounded-md border-primary/15 bg-primary/[0.04] px-2.5 text-xs font-semibold text-primary shadow-none transition-colors duration-200 hover:border-primary/25 hover:bg-primary/[0.07] hover:text-primary"
        >
          <Link href={`/teacher/courses/${course.id}/tasks/create`}>
            <Plus className="mr-1.5 size-3.5" />
            Publicar tarea
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-8 rounded-md border-border/65 bg-background/60 px-2.5 text-xs font-semibold text-foreground shadow-none transition-colors duration-200 hover:border-primary/25 hover:bg-primary/5 hover:text-primary dark:bg-background/30"
        >
          <Link href={`/teacher/courses/${course.id}/classes/take`}>
            <CheckSquare className="mr-1.5 size-3.5" />
            Asistencia
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-8 rounded-md border-border/65 bg-background/60 px-2.5 text-xs font-semibold text-foreground shadow-none transition-colors duration-200 hover:border-primary/25 hover:bg-primary/5 hover:text-primary dark:bg-background/30"
        >
          <Link href={`/teacher/courses/${course.id}/grade-templates`}>
            <ClipboardList className="mr-1.5 size-3.5" />
            Calificaciones
          </Link>
        </Button>
      </div>
    </section>
  )
}
