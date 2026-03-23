import { AppHeader } from '@/components/layout/app-header'
import { CoursesTable } from '@/components/courses/courses-table'

export default function CoursesPage() {
  return (
    <>
      <AppHeader title="Courses" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Cursos
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestioná cursos, horarios y estado general del ciclo académico.
            </p>
          </section>

          <CoursesTable />
        </div>
      </div>
    </>
  )
}