import type { TeacherCourseDetail } from '@/lib/teacher/course-detail/types'

type Props = {
  course: TeacherCourseDetail
}

export function TeacherCourseHero({ course }: Props) {
  return (
    <section className="pb-1">
      <div className="min-w-0 space-y-1.5">
        <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {course.nombre}
        </h1>

        {course.descripcion?.trim() ? (
          <p className="max-w-2xl text-sm leading-5 text-muted-foreground sm:text-[15px]">
            {course.descripcion.trim()}
          </p>
        ) : null}
      </div>
    </section>
  )
}
