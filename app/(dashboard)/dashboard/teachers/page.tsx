import { AppHeader } from '@/components/layout/app-header'
import { TeachersTable } from '@/components/teachers/teachers-table'

export default function TeachersPage() {
  return (
    <>
      <AppHeader title="Teachers" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Profesores
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestioná altas, edición y estado de los profesores del instituto.
            </p>
          </section>

          <TeachersTable />
        </div>
      </div>
    </>
  )
}