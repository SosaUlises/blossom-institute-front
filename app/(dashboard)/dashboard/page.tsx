import { Users, GraduationCap, BookOpen, ClipboardList, ChartColumn } from 'lucide-react'

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
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Hero resumen */}
          <section className="rounded-3xl border border-border/70 bg-[linear-gradient(135deg,rgba(36,59,123,0.08),rgba(255,255,255,0.96),rgba(198,61,79,0.04))] p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
                  Blossom Institute
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Resumen general del panel administrativo
                </h2>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Visualizá métricas clave del instituto, rendimiento académico por curso y la actividad próxima más relevante.
                </p>
              </div>

              <div className="inline-flex items-center gap-3 rounded-2xl border border-primary/10 bg-white/80 px-4 py-3 shadow-sm">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ChartColumn className="size-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Promedio general
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {dashboard.generalAverage !== null ? dashboard.generalAverage.toFixed(2) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* KPI */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Overview
            </h3>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Alumnos"
                value={dashboard.overview.studentsCount.toLocaleString()}
                icon={Users}
              />
              <StatCard
                title="Docentes"
                value={dashboard.overview.teachersCount.toLocaleString()}
                icon={GraduationCap}
              />
              <StatCard
                title="Cursos activos"
                value={dashboard.overview.activeCoursesCount.toLocaleString()}
                icon={BookOpen}
              />
              <StatCard
                title="Tareas pendientes"
                value={dashboard.overview.pendingAssignmentsCount.toLocaleString()}
                icon={ClipboardList}
              />
            </div>
          </section>

          {/* Performance */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Rendimiento académico
            </h3>

            <div className="grid gap-5 lg:grid-cols-1">
              <PerformanceChart data={dashboard.averageGradesByCourse} />
            </div>
          </section>

          {/* Operativa */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Operativa
            </h3>

            <div className="grid gap-5 lg:grid-cols-2">
              <UpcomingAssignmentsCard items={dashboard.upcomingAssignments} />
              <UpcomingClassesCard items={dashboard.upcomingClasses} />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}