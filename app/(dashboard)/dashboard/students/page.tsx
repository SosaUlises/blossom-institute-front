import { AppHeader } from '@/components/layout/app-header'
import { StudentsTable } from '@/components/students/students-table'

export default function StudentsPage() {
  return (
    <>
      <AppHeader title="Students" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Alumnos
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestioná altas, edición y estado de los alumnos del instituto.
            </p>
          </section>

          <StudentsTable />
        </div>
      </div>
    </>
  )
}