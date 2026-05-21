import Link from 'next/link'
import { CheckSquare, ClipboardList } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { TeacherCourseDetail } from '@/lib/teacher/course-detail/types'
import { getDayLabel } from '@/lib/teacher/course-detail/utils'

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
    <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
          {course.nombre}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {course.cantidadAlumnos} alumnos
          {nextSchedule
            ? ` · ${getDayLabel(nextSchedule.dia)} ${nextSchedule.horaInicio}`
            : ''}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button
          asChild
          variant="outline"
          className="h-9 rounded-lg border-border/65 bg-background/60 px-3 text-sm font-medium text-foreground shadow-none transition-colors duration-200 hover:border-primary/25 hover:bg-primary/5 hover:text-primary dark:bg-background/30"
        >
          <Link href={`/teacher/courses/${course.id}/classes/take`}>
            <CheckSquare className="mr-2 size-4" />
            Asistencia
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-9 rounded-lg border-border/65 bg-background/60 px-3 text-sm font-medium text-foreground shadow-none transition-colors duration-200 hover:border-primary/25 hover:bg-primary/5 hover:text-primary dark:bg-background/30"
        >
          <Link href={`/teacher/courses/${course.id}/grade-templates`}>
            <ClipboardList className="mr-2 size-4" />
            Plantilla de Calificaciones
          </Link>
        </Button>
      </div>
    </section>
  )
}
