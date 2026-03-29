import { BookOpen, Sparkles } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { CoursesTable } from '@/components/admin/courses/courses-table'

export default function CoursesPage() {
  return (
    <>
      <AppHeader title="Courses" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="relative overflow-hidden rounded-[30px] border border-border/70 bg-card/92 p-7 shadow-[0_24px_70px_-34px_rgba(30,42,68,0.24)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.08),transparent_26%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(72,99,180,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.10),transparent_28%)]" />

            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="size-3.5" />
                Courses management
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                  <h2 className="max-w-3xl text-[2rem] font-bold tracking-tight text-foreground">
                    Gestión de cursos
                  </h2>

                  <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                    Administrá cursos, horarios, asignaciones y estado general del ciclo académico.
                  </p>
                </div>

                <div className="inline-flex items-center gap-3 rounded-2xl border border-primary/10 bg-card/85 px-4 py-3 shadow-[0_12px_30px_-16px_rgba(36,59,123,0.28)] backdrop-blur-sm">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <BookOpen className="size-5" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Módulo
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      Courses
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <CoursesTable />
        </div>
      </div>
    </>
  )
}