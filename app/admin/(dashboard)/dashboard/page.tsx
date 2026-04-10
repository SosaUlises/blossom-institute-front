import {
  Users,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { StatCard } from '@/components/shared/stat-card'
import { UpcomingClassesCard } from '@/components/admin/dashboard/upcoming-classes'
import { AdminAttentionRequiredCard } from '@/components/admin/dashboard/admin-attention-required-card'
import { AdminCoursePerformanceOverviewCard } from '@/components/admin/dashboard/admin-course-performance-overview-card'
import { getAdminDashboard } from '@/lib/admin/dashboard/get-admin-dashboard'

export default async function DashboardPage() {
  const dashboard = await getAdminDashboard()

  const todayClassesCount = dashboard.upcomingClasses.filter((item) => {
    const datePart = item.proximaClase.split('T')[0]
    const [year, month, day] = datePart.split('-').map(Number)

    const classDate = new Date(year, month - 1, day)
    const today = new Date()

    return (
      classDate.getFullYear() === today.getFullYear() &&
      classDate.getMonth() === today.getMonth() &&
      classDate.getDate() === today.getDate()
    )
  }).length

  const alertCount =
    dashboard.coursesAtRiskByManualAverage.length +
    dashboard.studentsManualLowGradesThisMonthCount

  return (
    <>
      <AppHeader title="Dashboard" />

      <div className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 px-6 py-7 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:px-7 sm:py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.05),transparent_24%)]" />

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
                  Visualizá métricas académicas, actividad operativa y cursos que requieren seguimiento desde una vista centralizada.
                </p>
              </div>

              <div className="group inline-flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-4 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_22px_40px_-22px_rgba(15,23,42,0.22)]">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CalendarDays className="size-5" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Hoy
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {todayClassesCount} {todayClassesCount === 1 ? 'clase programada' : 'clases programadas'}
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
                title="Alertas"
                value={alertCount.toLocaleString()}
                icon={AlertTriangle}
                accent="amber"
                subtitle="Señales de riesgo académico detectadas"
              />
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <UpcomingClassesCard items={dashboard.upcomingClasses} />

            <AdminAttentionRequiredCard
              studentsAtRiskThisMonthCount={dashboard.studentsAtRiskThisMonthCount}
              studentsManualLowGradesThisMonthCount={dashboard.studentsManualLowGradesThisMonthCount}
              coursesAtRiskByOverallAverage={dashboard.coursesAtRiskByOverallAverage}
              coursesAtRiskByManualAverage={dashboard.coursesAtRiskByManualAverage}
            />
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

            <AdminCoursePerformanceOverviewCard
              data={dashboard.averageGradesByCourse}
              generalAverage={dashboard.generalAverage}
            />
          </section>
        </div>
      </div>
    </>
  )
}