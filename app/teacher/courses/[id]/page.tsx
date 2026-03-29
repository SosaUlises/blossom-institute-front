import { notFound } from 'next/navigation'
import {
  BookOpen,
  CalendarRange,
  Hash,
  Info,
  Layers3,
  Sparkles,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { TeacherCourseHero } from '@/components/teacher/course-detail/teacher-course-hero'
import { getTeacherCourseDetailServer } from '@/lib/teacher/course-detail/server-api'
import { getEstadoCursoBadgeClass, getEstadoCursoLabel } from '@/lib/teacher/course-detail/utils'
import type { TeacherCourseDetail } from '@/lib/teacher/course-detail/types'
import { TeacherCourseTabs } from '@/components/teacher/course-detail/teacher-course-tabs'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function TeacherCourseDetailPage({ params }: PageProps) {
  const { id } = await params
  const courseId = Number(id)

  if (!courseId || Number.isNaN(courseId) || courseId <= 0) {
    notFound()
  }

  let course: TeacherCourseDetail

  try {
    course = await getTeacherCourseDetailServer(courseId)
  } catch {
    notFound()
  }

  return (
    <>
      <AppHeader title="Course Detail" />

      <main className="px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
     <div className="space-y-8">
      <TeacherCourseHero course={course} />

      <div className="pt-2">
        <TeacherCourseTabs course={course} />
      </div>
    </div>

          <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
            <div className="relative overflow-hidden rounded-[30px] border border-border/70 bg-card/95 p-6 shadow-[0_20px_48px_-26px_rgba(30,42,68,0.18)] md:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.07),transparent_24%)]" />

              <div className="relative space-y-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    <Sparkles className="size-3.5" />
                    Course overview
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                      Resumen del curso
                    </h2>

                    <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                      Esta vista concentra la información principal del curso y
                      prepara la navegación para alumnos, clases, tareas y
                      profesores dentro del módulo teacher.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <BookOpen className="size-4.5" />
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Curso
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {course.nombre}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <CalendarRange className="size-4.5" />
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Año lectivo
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {course.anio}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-dashed border-border/70 bg-background/65 p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Info className="size-4.5" />
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-foreground">
                        Próximo paso del módulo
                      </p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        En la siguiente iteración vamos a integrar tabs premium
                        para alumnos, clases, tareas y profesores, manteniendo
                        una experiencia consistente con el panel admin y el resto
                        del panel teacher.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="relative overflow-hidden rounded-[30px] border border-border/70 bg-card/95 p-6 shadow-[0_20px_48px_-26px_rgba(30,42,68,0.18)] md:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(36,59,123,0.06),transparent_24%)]" />

              <div className="relative space-y-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <Layers3 className="size-3.5" />
                    Quick info
                  </div>

                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    Datos rápidos
                  </h2>

                  <p className="text-sm leading-6 text-muted-foreground">
                    Información clave del curso con el mismo lenguaje visual del
                    sistema.
                  </p>
                </div>

                <div className="space-y-3">
            
                  <div className="group rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Sparkles className="size-4.5" />
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Estado
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Situación actual del curso
                          </p>
                        </div>
                      </div>

                      <span className={getEstadoCursoBadgeClass(course.estado)}>
                        {getEstadoCursoLabel(course.estado)}
                      </span>
                    </div>
                  </div>

                  <div className="group rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <CalendarRange className="size-4.5" />
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Año
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Nivel o ciclo asignado
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-sm">
                        {course.anio}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </>
  )
}