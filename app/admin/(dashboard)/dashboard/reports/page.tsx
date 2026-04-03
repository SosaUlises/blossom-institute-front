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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const reportCards = [
  {
    title: 'Marks by term',
    description: 'Promedios, quizzes, tests y rendimiento general por curso y trimestre.',
    href: 'reports/marks',
    icon: BarChart3,
    accent: 'blue',
  },
  {
    title: 'Attendance by term',
    description: 'Asistencia consolidada por curso y trimestre.',
    href: 'reports/attendance',
    icon: CalendarCheck2,
    accent: 'emerald',
  },
  {
    title: 'Homework by term',
    description: 'Entregas, pendientes, rehacer y promedio de homework.',
    href: 'reports/homework',
    icon: ClipboardCheck,
    accent: 'amber',
  },
  {
    title: 'Student summary',
    description: 'Resumen académico completo por alumno.',
    href: 'reports/student-summary',
    icon: UserRoundSearch,
    accent: 'violet',
  },
  {
    title: 'Student assessments detail',
    description: 'Detalle cronológico de evaluaciones por alumno, con skills por calificación.',
    href: 'reports/student-assessments',
    icon: GraduationCap,
    accent: 'rose',
  },
  {
    title: 'Attendance by range',
    description: 'Reporte de asistencias en un rango de fechas.',
    href: 'reports/attendance-range',
    icon: FileSpreadsheet,
    accent: 'emerald',
  },
  {
    title: 'Deliveries by task',
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

      <div className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 px-6 py-7 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:px-7 sm:py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.05),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(72,99,180,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.08),transparent_26%)]" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-5 h-[3px] w-12 rounded-full bg-primary" />

                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                  Reports center
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.45rem]">
                  Reportes académicos y operativos
                </h2>

                <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
                  Explorá reportes por curso, trimestre y alumno para analizar rendimiento, asistencia, homework y evaluaciones detalladas desde una vista centralizada.
                </p>
              </div>

              <div className="group inline-flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-4 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_22px_40px_-22px_rgba(15,23,42,0.22)]">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-200 group-hover:scale-[1.05] group-hover:bg-primary/15">
                  <BarChart3 className="size-5" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Centro
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    Reportes
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Report modules
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                Seleccioná un reporte
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {reportCards.map((card) => {
                const styles = getAccentClasses(card.accent)

                return (
                  <Link key={card.title} href={card.href} className="group">
                    <Card
                      className={`h-full rounded-[28px] text-card-foreground shadow-[0_16px_34px_-22px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_46px_-24px_rgba(15,23,42,0.20)] ${styles.card}`}
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