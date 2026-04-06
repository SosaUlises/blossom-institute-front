'use client'

import {
  BookOpen,
  ClipboardCheck,
  Users,
  Sparkles,
  CalendarRange,
  GraduationCap,
} from 'lucide-react'

import { TeacherStatCard } from '@/components/teacher/dashboard/teacher-stat-card'
import { TeacherUpcomingClassesCard } from '@/components/teacher/dashboard/teacher-upcoming-classes-card'
import { TeacherLastClassesCard } from '@/components/teacher/dashboard/teacher-last-classes-card'
import { TeacherLastDeliveriesCard } from '@/components/teacher/dashboard/teacher-last-deliveries-card'
import { TeacherCourseSummaryCard } from '@/components/teacher/dashboard/teacher-course-summary-card'
import type { ProfesorDashboardResponse } from '@/lib/teacher/dashboard/types'

export function TeacherDashboardView({
  dashboard,
}: {
  dashboard: ProfesorDashboardResponse
}) {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 px-6 py-7 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:px-7 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.05),transparent_24%)]" />

        <div className="relative space-y-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 h-[3px] w-12 rounded-full bg-primary" />

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  <Sparkles className="size-3.5" />
                  Blossom Institute
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/75 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  <CalendarRange className="size-3.5" />
                  Panel docente
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.45rem]">
                Resumen general del docente
              </h2>

              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
                Visualizá tus cursos, el seguimiento de clases y la actividad reciente de entregas desde una vista centralizada.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[380px] xl:grid-cols-1">
              <div className="group rounded-2xl border border-border/60 bg-background/80 px-4 py-4 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_22px_40px_-22px_rgba(15,23,42,0.22)]">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-200 group-hover:scale-[1.05] group-hover:bg-primary/15">
                    <GraduationCap className="size-5" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Docente
                    </p>
                    <p className="text-base font-semibold tracking-tight text-foreground">
                      {dashboard.nombre} {dashboard.apellido}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-border/60 bg-background/75 px-4 py-4 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_22px_40px_-22px_rgba(15,23,42,0.18)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Próxima actividad
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {dashboard.proximasClases.length} clases agendadas ·{' '}
                  {dashboard.entregasPendientesCorreccionCount} pendientes de corrección
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
          <TeacherStatCard
            title="Cursos"
            value={dashboard.cantidadCursos.toLocaleString()}
            icon={BookOpen}
            accent="blue"
            subtitle="Cursos asignados al docente"
          />

          <TeacherStatCard
            title="Alumnos"
            value={dashboard.cantidadAlumnos.toLocaleString()}
            icon={Users}
            accent="violet"
            subtitle="Estudiantes vinculados a tus cursos"
          />

          <TeacherStatCard
            title="Tareas publicadas"
            value={dashboard.tareasPublicadasCount.toLocaleString()}
            icon={ClipboardCheck}
            accent="emerald"
            subtitle="Actividades visibles para los alumnos"
          />

          <TeacherStatCard
            title="Pend. corrección"
            value={dashboard.entregasPendientesCorreccionCount.toLocaleString()}
            icon={ClipboardCheck}
            accent="amber"
            subtitle="Entregas esperando revisión"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Teaching flow
          </p>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Clases y seguimiento
          </h3>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <TeacherUpcomingClassesCard items={dashboard.proximasClases} />
          <TeacherLastClassesCard items={dashboard.ultimasClases} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Recent activity
          </p>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Entregas recientes
          </h3>
        </div>

        <TeacherLastDeliveriesCard items={dashboard.ultimasEntregas} />
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Course snapshot
          </p>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Resumen por curso
          </h3>
        </div>

        <TeacherCourseSummaryCard items={dashboard.resumenPorCurso} />
      </section>
    </div>
  )
}