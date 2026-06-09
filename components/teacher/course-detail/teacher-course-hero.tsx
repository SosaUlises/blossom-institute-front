import Link from 'next/link'
import { CalendarClock, CheckSquare, ClipboardList } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TeacherCourseDetail } from '@/lib/teacher/course-detail/types'
import { EstadoCurso } from '@/lib/teacher/course-detail/types'
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
  const attendanceIsPrimary = course.estado === EstadoCurso.Activo

  return (
    <section className="flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
            {course.nombre}
          </h1>
          <span className={getEstadoCursoBadgeClass(course.estado)}>
            {getEstadoCursoLabel(course.estado)}
          </span>
        </div>

        {course.descripcion?.trim() ? (
          <p className="max-w-2xl text-sm leading-5 text-muted-foreground">
            {course.descripcion.trim()}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{course.anio}</span>
          {nextSchedule ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground/75">
              <CalendarClock className="size-3.5 text-primary" />
              Próximo horario: {getDayLabel(nextSchedule.dia)}{' '}
              {nextSchedule.horaInicio}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button
          asChild
          variant={attendanceIsPrimary ? 'default' : 'outline'}
          className={cn(
            'h-9 rounded-lg px-3 text-sm font-semibold shadow-none transition-colors duration-200',
            attendanceIsPrimary
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border-border/65 bg-background/60 text-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-primary dark:bg-background/30',
          )}
        >
          <Link href={`/teacher/courses/${course.id}/classes/take`}>
            <CheckSquare className="mr-2 size-4" />
            Tomar asistencia
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-9 rounded-lg border-border/65 bg-background/60 px-3 text-sm font-medium text-foreground shadow-none transition-colors duration-200 hover:border-primary/25 hover:bg-primary/5 hover:text-primary dark:bg-background/30"
        >
          <Link href={`/teacher/courses/${course.id}/grade-templates`}>
            <ClipboardList className="mr-2 size-4" />
            Plantillas
          </Link>
        </Button>
      </div>
    </section>
  )
}
