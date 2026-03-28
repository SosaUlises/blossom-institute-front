import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  ChartColumn,
  Sparkles,
  CalendarRange,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { StatCard } from '@/components/shared/stat-card'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { UpcomingAssignmentsCard } from '@/components/dashboard/upcoming-assignments'
import { UpcomingClassesCard } from '@/components/dashboard/upcoming-classes'
import { getAdminDashboard } from '@/lib/dashboard/get-admin-dashboard'

export default async function DashboardPage() {
  const dashboard = await getAdminDashboard()

  return (
    <>
      <AppHeader title="Dashboard" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <section className="relative overflow-hidden rounded-[30px] border border-border/70 bg-card/90 p-7 shadow-[0_24px_70px_-34px_rgba(30,42,68,0.28)] backdrop-blur-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.10),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(72,99,180,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.12),transparent_30%)]" />

            <div className="relative space-y-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                      <Sparkles className="size-3.5" />
                      Blossom Institute
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      <CalendarRange className="size-3.5" />
                      Panel administrativo
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h2 className="max-w-3xl text-[2rem] font-bold tracking-tight text-foreground">
                      Resumen general del instituto
                    </h2>

                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                      Visualizá el estado actual del instituto, el rendimiento académico por curso y la actividad operativa más relevante desde una vista centralizada.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px] xl:grid-cols-1">
                  <div className="rounded-2xl border border-primary/15 bg-background/80 px-4 py-4 shadow-[0_12px_30px_-18px_rgba(36,59,123,0.28)] backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <ChartColumn className="size-5" />
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Promedio general
                        </p>
                        <p className="text-2xl font-bold tracking-tight text-foreground">
                          {dashboard.generalAverage !== null
                            ? dashboard.generalAverage.toFixed(2) +"%"
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Próxima actividad
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {dashboard.upcomingClasses.length} clases agendadas · {dashboard.upcomingAssignments.length} entregas cercanas
                  </p>
                </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Overview
              </p>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Métricas principales
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Alumnos"
                value={dashboard.overview.studentsCount.toLocaleString()}
                icon={Users}
                accent="blue"
                subtitle="Usuarios activos en el sistema"
              />
              <StatCard
                title="Docentes"
                value={dashboard.overview.teachersCount.toLocaleString()}
                icon={GraduationCap}
                accent="violet"
                subtitle="Profesores con acceso vigente"
              />
              <StatCard
                title="Cursos activos"
                value={dashboard.overview.activeCoursesCount.toLocaleString()}
                icon={BookOpen}
                accent="emerald"
                subtitle="Oferta académica en curso"
              />
              <StatCard
                title="Tareas pendientes"
                value={dashboard.overview.pendingAssignmentsCount.toLocaleString()}
                icon={ClipboardList}
                accent="amber"
                subtitle="Entregas próximas o activas"
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Academic insight
              </p>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Rendimiento académico
              </h3>
            </div>

            <PerformanceChart data={dashboard.averageGradesByCourse} />
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Operational snapshot
              </p>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Próxima actividad
              </h3>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <UpcomingAssignmentsCard items={dashboard.upcomingAssignments} />
              <UpcomingClassesCard items={dashboard.upcomingClasses} />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}