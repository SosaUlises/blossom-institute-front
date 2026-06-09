import Link from 'next/link'
import {
  BarChart3,
  ClipboardCheck,
  FileSpreadsheet,
  GraduationCap,
  UserRoundSearch,
  CalendarCheck2,
  ArrowRight,
  FileBarChart2,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const reportGroups = [
  {
    title: 'Rendimiento académico',
    cards: [
      {
        title: 'Calificaciones por curso',
        description: 'Promedios, quizzes, exámenes y rendimiento general por curso y trimestre.',
        href: 'reports/marks',
        icon: BarChart3,
        accent: 'blue',
      },
      {
        title: 'Resumen académico del estudiante',
        description: 'Vista consolidada de asistencia, tareas, calificaciones y habilidades por alumno.',
        href: 'reports/student-summary',
        icon: UserRoundSearch,
        accent: 'violet',
      },
      {
        title: 'Evaluaciones del estudiante',
        description: 'Detalle cronológico de evaluaciones por alumno, con habilidades por calificación.',
        href: 'reports/student-assessments',
        icon: GraduationCap,
        accent: 'rose',
      },
    ],
  },
  {
    title: 'Asistencia',
    cards: [
      {
        title: 'Asistencia por curso',
        description: 'Asistencia consolidada por curso y trimestre.',
        href: 'reports/attendance',
        icon: CalendarCheck2,
        accent: 'emerald',
      },
      {
        title: 'Asistencia por período personalizado',
        description: 'Asistencias registradas dentro de un rango de fechas específico.',
        href: 'reports/attendance-range',
        icon: FileSpreadsheet,
        accent: 'emerald',
      },
    ],
  },
  {
    title: 'Tareas y entregas',
    cards: [
      {
        title: 'Tareas por curso',
        description: 'Entregas, pendientes, rehacer, aprobadas y promedio de tareas.',
        href: 'reports/homework',
        icon: ClipboardCheck,
        accent: 'amber',
      },
      {
        title: 'Entregas por tarea',
        description: 'Estado de entregas de una tarea puntual.',
        href: 'reports/deliveries',
        icon: FileBarChart2,
        accent: 'blue',
      },
    ],
  },
] as const

function getAccentClasses(accent: string) {
  switch (accent) {
    case 'blue':
      return {
        card: 'border-blue-200/55 bg-blue-500/[0.03] dark:border-blue-900/45 dark:bg-blue-500/[0.06]',
        icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        arrow: 'group-hover:border-blue-200/60 group-hover:text-blue-600 dark:group-hover:border-blue-900/60 dark:group-hover:text-blue-400',
      }
    case 'emerald':
      return {
        card: 'border-emerald-200/55 bg-emerald-500/[0.03] dark:border-emerald-900/45 dark:bg-emerald-500/[0.06]',
        icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        arrow: 'group-hover:border-emerald-200/60 group-hover:text-emerald-600 dark:group-hover:border-emerald-900/60 dark:group-hover:text-emerald-400',
      }
    case 'amber':
      return {
        card: 'border-amber-200/55 bg-amber-500/[0.03] dark:border-amber-900/45 dark:bg-amber-500/[0.06]',
        icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        arrow: 'group-hover:border-amber-200/60 group-hover:text-amber-700 dark:group-hover:border-amber-900/60 dark:group-hover:text-amber-400',
      }
    case 'violet':
      return {
        card: 'border-violet-200/55 bg-violet-500/[0.03] dark:border-violet-900/45 dark:bg-violet-500/[0.06]',
        icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        arrow: 'group-hover:border-violet-200/60 group-hover:text-violet-600 dark:group-hover:border-violet-900/60 dark:group-hover:text-violet-400',
      }
    case 'rose':
      return {
        card: 'border-rose-200/55 bg-rose-500/[0.03] dark:border-rose-900/45 dark:bg-rose-500/[0.06]',
        icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        arrow: 'group-hover:border-rose-200/60 group-hover:text-rose-600 dark:group-hover:border-rose-900/60 dark:group-hover:text-rose-400',
      }
    default:
      return {
        card: 'border-border/60 bg-card/95',
        icon: 'bg-primary/10 text-primary',
        arrow: 'group-hover:border-primary/20 group-hover:text-primary',
      }
  }
}

export default function ReportsPage() {
  return (
    <>
      <AppHeader title="Reportes" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <WorkspaceHeader
            title="Reportes académicos y operativos"
            description="Elegí un módulo para analizar rendimiento, asistencia, tareas y evaluaciones."
            metadata={
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                <span className="font-medium text-foreground">Centro de reportes</span>
              </div>
            }
          />
          <section className="space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Módulos de reportes
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                Seleccioná un reporte
              </h3>
            </div>

            <div className="space-y-8">
              {reportGroups.map((group) => (
                <div key={group.title} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      {group.title}
                    </h4>
                    <div className="h-px flex-1 bg-border/60" />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {group.cards.map((card) => {
                      const styles = getAccentClasses(card.accent)

                      return (
                        <Link key={card.title} href={card.href} className="group block">
                          <Card
                            className={`h-full rounded-2xl text-card-foreground shadow-sm transition-colors duration-150 hover:border-primary/20 hover:bg-card ${styles.card}`}
                          >
                            <CardHeader className="pb-3">
                              <div className="mb-4 flex items-start justify-between gap-3">
                                <div
                                  className={`flex size-12 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-[1.04] ${styles.icon}`}
                                >
                                  <card.icon className="size-5" />
                                </div>

                                <div
                                  className={`rounded-full border border-border/60 bg-background/70 p-2 text-muted-foreground transition-colors duration-200 ${styles.arrow}`}
                                >
                                  <ArrowRight className="size-4" />
                                </div>
                              </div>

                              <CardTitle className="text-[1.05rem] font-semibold tracking-tight text-foreground">
                                {card.title}
                              </CardTitle>
                            </CardHeader>

                            <CardContent>
                              <p className="text-sm leading-6 text-muted-foreground">
                                {card.description}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
