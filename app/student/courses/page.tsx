import { AppHeader } from '@/components/layout/app-header'
import { StudentCoursesList } from '@/components/student/courses/student-courses-list'

export default function StudentCoursesPage() {
  return (
    <>
      <AppHeader title="Mis cursos" />

      <main className="flex-1 overflow-auto px-5 pb-6 pt-8 sm:pt-9 lg:px-8 lg:pb-7 lg:pt-10">
        <div className="mx-auto max-w-6xl space-y-5">
          <header className="border-b border-border/60 pb-5">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Mis cursos
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                Tus aulas de Blossom para seguir tareas, clases, materiales y
                devoluciones.
              </p>
            </div>
          </header>

          <StudentCoursesList />
        </div>
      </main>
    </>
  )
}
