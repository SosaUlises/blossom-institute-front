import Link from 'next/link'
import {
  BarChart3,
  ClipboardCheck,
  FileSpreadsheet,
  GraduationCap,
  UserRoundSearch,
  CalendarCheck2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const reportCards = [
  {
    title: 'Marks by term',
    description: 'Promedios, quizzes, tests y rendimiento general por curso y trimestre.',
    href: '/dashboard/reports/marks',
    icon: BarChart3,
    accent: 'blue',
  },
  {
    title: 'Attendance by term',
    description: 'Asistencia consolidada por curso y trimestre.',
    href: '/dashboard/reports/attendance',
    icon: CalendarCheck2,
    accent: 'emerald',
  },
  {
    title: 'Homework by term',
    description: 'Entregas, pendientes, rehacer y promedio de homework.',
    href: '/dashboard/reports/homework',
    icon: ClipboardCheck,
    accent: 'amber',
  },
  {
    title: 'Student summary',
    description: 'Resumen académico completo por alumno.',
    href: '/dashboard/reports/student-summary',
    icon: UserRoundSearch,
    accent: 'violet',
  },
  {
    title: 'Student assessments detail',
    description: 'Detalle cronológico de evaluaciones por alumno, con skills por calificación.',
    href: '/dashboard/reports/student-assessments',
    icon: GraduationCap,
    accent: 'rose',
  },
  {
    title: 'Attendance by range',
    description: 'Reporte de asistencias en un rango de fechas.',
    href: '/dashboard/reports/attendance-range',
    icon: FileSpreadsheet,
    accent: 'emerald',
  },
  {
    title: 'Deliveries by task',
    description: 'Estado de entregas de una tarea puntual.',
    href: '/dashboard/reports/deliveries',
    icon: GraduationCap,
    accent: 'blue',
  },
] as const

function getAccentClasses(accent: string) {
  switch (accent) {
    case 'blue':
      return {
        card: 'from-blue-50/75 to-background dark:from-blue-950/20 dark:to-background border-blue-200/50 dark:border-blue-900/40',
        icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      }
    case 'emerald':
      return {
        card: 'from-emerald-50/75 to-background dark:from-emerald-950/20 dark:to-background border-emerald-200/50 dark:border-emerald-900/40',
        icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      }
    case 'amber':
      return {
        card: 'from-amber-50/75 to-background dark:from-amber-950/20 dark:to-background border-amber-200/50 dark:border-amber-900/40',
        icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      }
    case 'violet':
      return {
        card: 'from-violet-50/75 to-background dark:from-violet-950/20 dark:to-background border-violet-200/50 dark:border-violet-900/40',
        icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      }
    case 'rose':
      return {
        card: 'from-rose-50/75 to-background dark:from-rose-950/20 dark:to-background border-rose-200/50 dark:border-rose-900/40',
        icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      }
    default:
      return {
        card: 'from-card to-card border-border/70',
        icon: 'bg-primary/10 text-primary',
      }
  }
}

export default function ReportsPage() {
  return (
    <>
      <AppHeader title="Reports" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="relative overflow-hidden rounded-[30px] border border-border/70 bg-card/92 p-7 shadow-[0_24px_70px_-34px_rgba(30,42,68,0.24)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.08),transparent_26%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(72,99,180,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.10),transparent_28%)]" />

            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="size-3.5" />
                Reports center
              </div>

              <div className="space-y-3">
                <h2 className="max-w-3xl text-[2rem] font-bold tracking-tight text-foreground">
                  Reportes académicos y operativos
                </h2>

                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                  Explorá reportes por curso, trimestre y alumno para analizar rendimiento, asistencia, homework y evaluaciones detalladas desde una vista centralizada.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Report modules
              </p>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Seleccioná un reporte
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {reportCards.map((card) => {
                const styles = getAccentClasses(card.accent)

                return (
                  <Link key={card.title} href={card.href}>
                    <Card
                      className={`group h-full rounded-[28px] border bg-linear-to-br text-card-foreground shadow-[0_16px_34px_-20px_rgba(30,42,68,0.18)] transition-all hover:-translate-y-[2px] hover:shadow-[0_22px_46px_-22px_rgba(30,42,68,0.24)] ${styles.card}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className={`flex size-12 items-center justify-center rounded-2xl ${styles.icon}`}>
                            <card.icon className="size-5" />
                          </div>

                          <div className="rounded-full border border-border/60 bg-background/60 p-2 text-muted-foreground transition group-hover:border-primary/20 group-hover:text-primary">
                            <ArrowRight className="size-4" />
                          </div>
                        </div>

                        <CardTitle className="text-lg font-semibold tracking-tight">
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