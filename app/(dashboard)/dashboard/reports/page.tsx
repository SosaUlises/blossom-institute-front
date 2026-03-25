import Link from 'next/link'
import {
  BarChart3,
  ClipboardCheck,
  FileSpreadsheet,
  GraduationCap,
  UserRoundSearch,
  CalendarCheck2,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const reportCards = [
  {
    title: 'Marks by term',
    description: 'Promedios, quizzes, tests y rendimiento general por curso y trimestre.',
    href: '/dashboard/reports/marks',
    icon: BarChart3,
  },
  {
    title: 'Attendance by term',
    description: 'Asistencia consolidada por curso y trimestre.',
    href: '/dashboard/reports/attendance',
    icon: CalendarCheck2,
  },
  {
    title: 'Homework by term',
    description: 'Entregas, pendientes, rehacer y promedio de homework.',
    href: '/dashboard/reports/homework',
    icon: ClipboardCheck,
  },
  {
    title: 'Student summary',
    description: 'Resumen académico completo por alumno.',
    href: '/dashboard/reports/student-summary',
    icon: UserRoundSearch,
  },
  {
    title: 'Attendance by range',
    description: 'Reporte de asistencias en un rango de fechas.',
    href: '/dashboard/reports/attendance-range',
    icon: FileSpreadsheet,
  },
  {
    title: 'Deliveries by task',
    description: 'Estado de entregas de una tarea puntual.',
    href: '/dashboard/reports/deliveries',
    icon: GraduationCap,
  },
]

export default function ReportsPage() {
  return (
    <>
      <AppHeader title="Reports" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Reportes
            </h2>
            <p className="text-sm text-muted-foreground">
              Visualizá métricas académicas, asistencia, homework y resúmenes por alumno.
            </p>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reportCards.map((card) => (
              <Link key={card.title} href={card.href}>
                <Card className="h-full border-border/70 bg-card/95 transition-all hover:-translate-y-[1px] hover:border-primary/30 hover:shadow-[0_18px_40px_-22px_rgba(30,42,68,0.20)]">
                  <CardHeader className="pb-3">
                    <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <card.icon className="size-5" />
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
            ))}
          </div>
        </div>
      </div>
    </>
  )
}