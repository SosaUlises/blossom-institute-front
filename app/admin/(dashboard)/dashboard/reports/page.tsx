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

const reportCards = [
  {
    title: 'Calificaciones por curso',
    description: 'Promedios, quizzes, tests y rendimiento general por curso y trimestre.',
    href: 'reports/marks',
    icon: BarChart3,
    accent: 'blue',
  },
  {
    title: 'Asistencia por curso',
    description: 'Asistencia consolidada por curso y trimestre.',
    href: 'reports/attendance',
    icon: CalendarCheck2,
    accent: 'emerald',
  },
  {
    title: 'Homeworks por curso',
    description: 'Entregas, pendientes, rehacer y promedio de homework.',
    href: 'reports/homework',
    icon: ClipboardCheck,
    accent: 'amber',
  },
  {
    title: 'Resumen de estudiante',
    description: 'Resumen acadÃ©mico completo por alumno.',
    href: 'reports/student-summary',
    icon: UserRoundSearch,
    accent: 'violet',
  },
  {
    title: 'Detalle de evaluaciones por estudiante',
    description: 'Detalle cronolÃ³gico de evaluaciones por alumno, con skills por calificaciÃ³n.',
    href: 'reports/student-assessments',
    icon: GraduationCap,
    accent: 'rose',
  },
  {
    title: 'Asistencia por rango de fechas',
    description: 'Reporte de asistencias en un rango de fechas.',
    href: 'reports/attendance-range',
    icon: FileSpreadsheet,
    accent: 'emerald',
  },
  {
    title: 'Entregas por tarea',
    description: 'Estado de entregas de una tarea puntual.',
    href: 'reports/deliveries',
    icon: FileBarChart2,
    accent: 'blue',
  },
] as const

function getAccentClasses(accent: string) {
  switch (accent) {
    case 'blue':
      return {
        card: 'border-blue-200/55 dark:border-blue-900/45 bg-[linear-gradient(180deg,rgba(59,88,170,0.05)_0%,rgba(255,255,255,0)_100%)] dark:bg-[linear-gradient(180deg,rgba(59,88,170,0.10)_0%,rgba(255,255,255,0)_100%)]',
        icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        arrow: 'group-hover:border-blue-200/60 group-hover:text-blue-600 dark:group-hover:border-blue-900/60 dark:group-hover:text-blue-400',
      }
    case 'emerald':
      return {
        card: 'border-emerald-200/55 dark:border-emerald-900/45 bg-[linear-gradient(180deg,rgba(16,185,129,0.05)_0%,rgba(255,255,255,0)_100%)] dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.08)_0%,rgba(255,255,255,0)_100%)]',
        icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        arrow: 'group-hover:border-emerald-200/60 group-hover:text-emerald-600 dark:group-hover:border-emerald-900/60 dark:group-hover:text-emerald-400',
      }
    case 'amber':
      return {
        card: 'border-amber-200/55 dark:border-amber-900/45 bg-[linear-gradient(180deg,rgba(245,158,11,0.05)_0%,rgba(255,255,255,0)_100%)] dark:bg-[linear-gradient(180deg,rgba(245,158,11,0.08)_0%,rgba(255,255,255,0)_100%)]',
        icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        arrow: 'group-hover:border-amber-200/60 group-hover:text-amber-700 dark:group-hover:border-amber-900/60 dark:group-hover:text-amber-400',
      }
    case 'violet':
      return {
        card: 'border-violet-200/55 dark:border-violet-900/45 bg-[linear-gradient(180deg,rgba(139,92,246,0.05)_0%,rgba(255,255,255,0)_100%)] dark:bg-[linear-gradient(180deg,rgba(139,92,246,0.08)_0%,rgba(255,255,255,0)_100%)]',
        icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        arrow: 'group-hover:border-violet-200/60 group-hover:text-violet-600 dark:group-hover:border-violet-900/60 dark:group-hover:text-violet-400',
      }
    case 'rose':
      return {
        card: 'border-rose-200/55 dark:border-rose-900/45 bg-[linear-gradient(180deg,rgba(244,63,94,0.05)_0%,rgba(255,255,255,0)_100%)] dark:bg-[linear-gradient(180deg,rgba(244,63,94,0.08)_0%,rgba(255,255,255,0)_100%)]',
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
      <AppHeader title="Reports" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <WorkspaceHeader
            title="Reportes academicos y operativos"
            description="Elige un modulo para analizar rendimiento, asistencia, homework y evaluaciones."
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
                Report modules
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                SeleccionÃ¡ un reporte
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {reportCards.map((card) => {
                const styles = getAccentClasses(card.accent)

                return (
                  <Link key={card.title} href={card.href} className="group">
                    <Card
                      className={`h-full rounded-2xl text-card-foreground shadow-sm transition-colors duration-200 hover:border-primary/20 hover:bg-card ${styles.card}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div
                            className={`flex size-12 items-center justify-center rounded-2xl transition-all duration-200 group-hover:scale-[1.04] ${styles.icon}`}
                          >
                            <card.icon className="size-5" />
                          </div>

                          <div
                            className={`rounded-full border border-border/60 bg-background/70 p-2 text-muted-foreground transition-all duration-200 ${styles.arrow}`}
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
          </section>
        </div>
      </div>
    </>
  )
}