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
                  Panel docente
                </span>
              </div>

              <div className="space-y-3">
                <h2 className="max-w-3xl text-[2rem] font-bold tracking-tight text-foreground">
                  Resumen general del docente
                </h2>

                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  Visualizá tus cursos, el seguimiento de clases y la actividad reciente de entregas desde una vista centralizada.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px] xl:grid-cols-1">
              <div className="rounded-2xl border border-primary/15 bg-background/80 px-4 py-4 shadow-[0_12px_30px_-18px_rgba(36,59,123,0.28)] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <GraduationCap className="size-5" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Docente
                    </p>
                    <p className="text-base font-bold tracking-tight text-foreground">
                      {dashboard.nombre} {dashboard.apellido}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Próxima actividad
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {dashboard.proximasClases.length} clases agendadas · {dashboard.entregasPendientesCorreccionCount} pendientes de corrección
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