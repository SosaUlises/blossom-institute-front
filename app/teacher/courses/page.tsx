import { AppHeader } from '@/components/layout/app-header'
import { TeacherCoursesTable } from '@/components/teacher/courses/teacher-courses-table'

export default function TeacherCoursesPage() {
  return (
    <>
      <AppHeader title="Mis cursos" />

      <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <header className="border-b border-border/60 pb-4">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Cursos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Accedé a tus espacios de trabajo, clases y alumnos asignados.
            </p>
          </header>
          <TeacherCoursesTable />
        </div>
      </main>
    </>
  )
}
