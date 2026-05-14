import { AppHeader } from '@/components/layout/app-header'
import { BookOpen } from 'lucide-react'
import { TeacherCoursesTable } from '@/components/teacher/courses/teacher-courses-table'

function HeroInfoCard() {
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-border/60 bg-background/75 px-4 py-3 shadow-[0_1px_1px_rgba(15,23,42,0.03)] transition-colors hover:border-primary/20 hover:bg-background">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <BookOpen className="size-5" />
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Módulo
        </p>
        <p className="text-sm font-semibold text-foreground">
          Courses
        </p>
      </div>
    </div>
  )
}

export default function TeacherCoursesPage() {
  return (
    <>
      <AppHeader title="Mis cursos" />

      <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <section className="rounded-2xl border border-border/65 bg-card/90 px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/80 sm:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
                  Panel docente
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Mis cursos
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                  Accedé al detalle de cada curso, sus clases, tareas y entregas desde un único espacio de trabajo.
                </p>
              </div>

              <HeroInfoCard />
            </div>
          </section>

          <TeacherCoursesTable />
        </div>
      </main>
    </>
  )
}
