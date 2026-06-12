import Link from 'next/link'
import { CalendarClock, CheckSquare, ClipboardList } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type {
  TeacherCourseDetail,
  TeacherCourseScheduleItem,
} from '@/lib/teacher/course-detail/types'
import { EstadoCurso } from '@/lib/teacher/course-detail/types'
import { getEstadoCursoLabel } from '@/lib/teacher/course-detail/utils'
import { TeacherCourseTeamContext } from './teacher-course-team-context'

type Props = {
  course: TeacherCourseDetail
}

type NextSchedule = {
  date: Date
  schedule: TeacherCourseScheduleItem
}

function getTimeParts(value: string) {
  const [hours = 0, minutes = 0] = value.split(':').map(Number)
  return { hours, minutes }
}

function getNextSchedule(
  course: TeacherCourseDetail,
  now = new Date(),
): NextSchedule | null {
  if (course.horarios.length === 0) return null

  const schedules = course.horarios.map((schedule) => {
    const dayOffset = (schedule.dia - now.getDay() + 7) % 7
    const date = new Date(now)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + dayOffset)

    const start = getTimeParts(schedule.horaInicio)
    const end = getTimeParts(schedule.horaFin)
    date.setHours(start.hours, start.minutes, 0, 0)

    const endDate = new Date(date)
    endDate.setHours(end.hours, end.minutes, 0, 0)

    if (endDate < now) {
      date.setDate(date.getDate() + 7)
    }

    return { date, schedule }
  })

  return schedules.sort((a, b) => a.date.getTime() - b.date.getTime())[0]
}

function formatTime(value: string) {
  return value.slice(0, 5)
}

function formatNextClass({ date, schedule }: NextSchedule) {
  const dateLabel = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
  }).format(date)

  return `${dateLabel}, ${formatTime(schedule.horaInicio)}`
}

function isToday(date: Date, now = new Date()) {
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function CourseStatus({ estado }: { estado: EstadoCurso }) {
  const label = getEstadoCursoLabel(estado)

  if (estado === EstadoCurso.Activo) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        {label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium',
        estado === EstadoCurso.Inactivo
          ? 'border-amber-500/15 bg-amber-500/8 text-amber-700 dark:text-amber-400'
          : 'border-slate-500/15 bg-slate-500/8 text-slate-600 dark:text-slate-400',
      )}
    >
      {label}
    </span>
  )
}

export function TeacherCourseHero({ course }: Props) {
  const nextSchedule = getNextSchedule(course)
  const attendanceIsPrimary =
    course.estado === EstadoCurso.Activo &&
    nextSchedule !== null &&
    isToday(nextSchedule.date)

  return (
    <section className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2.5">
        <h1 className="break-words text-2xl font-semibold leading-tight text-foreground">
          {course.nombre}
        </h1>

        {course.descripcion?.trim() ? (
          <p className="max-w-2xl text-sm leading-5 text-muted-foreground">
            {course.descripcion.trim()}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <CourseStatus estado={course.estado} />
          <span className="text-xs text-muted-foreground">{course.anio}</span>
          {nextSchedule ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/85">
              <CalendarClock className="size-3.5 text-primary" />
              Próxima clase: {formatNextClass(nextSchedule)}
            </span>
          ) : null}
          {course.cantidadProfesores > 1 ? (
            <TeacherCourseTeamContext courseId={course.id} />
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button
          asChild
          variant={attendanceIsPrimary ? 'default' : 'outline'}
          className={cn(
            'h-9 rounded-lg px-3 text-sm font-semibold shadow-none transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98]',
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
          variant="ghost"
          className="h-9 rounded-lg px-3 text-sm font-medium text-muted-foreground shadow-none transition-[background-color,color,transform] duration-150 ease-out hover:bg-muted/50 hover:text-foreground active:scale-[0.98]"
        >
          <Link href={`/teacher/courses/${course.id}/grade-templates`}>
            <ClipboardList className="mr-2 size-4" />
            Plantillas de calificación
          </Link>
        </Button>
      </div>
    </section>
  )
}
