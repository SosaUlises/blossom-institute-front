import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  ChartColumn,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { StatCard } from '@/components/shared/stat-card'
import { PerformanceChart } from '@/components/admin/dashboard/performance-chart'
import { UpcomingAssignmentsCard } from '@/components/admin/dashboard/upcoming-assignments'
import { UpcomingClassesCard } from '@/components/admin/dashboard/upcoming-classes'
import { getAdminDashboard } from '@/lib/admin/dashboard/get-admin-dashboard'

export default async function DashboardPage() {
  const dashboard = await getAdminDashboard()

  return (
    <>
      <AppHeader title="Dashboard" />

      <div className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 px-6 py-7 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:px-7 sm:py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.05),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(72,99,180,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.08),transparent_26%)]" />

            <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-5 h-[3px] w-12 rounded-full bg-primary" />

                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                  Panel administrativo
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.45rem]">
                  Resumen general del instituto
                </h2>

                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
                  Visualizá el estado académico y operativo desde una vista centralizada.
                </p>
              </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[380px] xl:grid-cols-1">
                {/* Promedio general */}
                <div className="group rounded-2xl border border-border/60 bg-background/80 px-4 py-4 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_22px_40px_-22px_rgba(15,23,42,0.22)]">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-200 group-hover:scale-[1.05] group-hover:bg-primary/15">
                      <ChartColumn className="size-5" />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Promedio general
                      </p>
                      <p className="text-2xl font-semibold tracking-tight text-foreground">
                        {dashboard.generalAverage !== null
                          ? `${dashboard.generalAverage.toFixed(2)}%`
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Próxima actividad */}
                <div className="group rounded-2xl border border-border/60 bg-background/75 px-4 py-4 shadow-[0_12px_26px_-22px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/15 hover:bg-background/90 hover:shadow-[0_20px_36px_-22px_rgba(15,23,42,0.20)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Próxima actividad
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {dashboard.upcomingClasses.length} clases agendadas ·{' '}
                    {dashboard.upcomingAssignments.length} entregas cercanas
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Overview
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
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
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
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
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
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