import { AppHeader } from '@/components/layout/app-header'
import { TeacherCoursesTable } from '@/components/teacher/courses/teacher-courses-table'

export default function TeacherCoursesPage() {
  return (
    <>
      <AppHeader title="Mis cursos" />

      <main className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* ── Hero — mismo lenguaje que el dashboard ───────────────────────── */}
          <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 px-7 py-6 shadow-[0_12px_36px_-18px_rgba(15,23,42,0.14)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.07),transparent_40%)]" />

            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70">
                Panel docente
              </p>

              <h2 className="mt-1.5 text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground">
                Mis cursos
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Accedé al detalle de cada curso, sus clases y entregas.
              </p>
            </div>
          </div>

          {/* ── Lista de cursos ───────────────────────────────────────────────── */}
          <TeacherCoursesTable />

        </div>
      </main>
    </>
  )
}