import { CalendarDays, Clock3, GraduationCap, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ProfesorDashboardProximaClaseItem } from '@/lib/teacher/dashboard/types'

interface TeacherUpcomingClassesCardProps {
  items: ProfesorDashboardProximaClaseItem[]
}

function formatDate(value: string) {
  return format(new Date(value), 'dd/MM/yyyy', { locale: es })
}

function ClassMeta({
  label,
  value,
  icon: Icon,
  accent = 'blue',
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  accent?: 'blue' | 'violet'
}) {
  const accentClasses =
    accent === 'violet'
      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
      : 'bg-primary/10 text-primary'

  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${accentClasses}`}>
          <Icon className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

export function TeacherUpcomingClassesCard({ items }: TeacherUpcomingClassesCardProps) {
  return (
    <Card className="rounded-[28px] border border-border/70 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(30,42,68,0.16)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Próximas clases
        </CardTitle>
        <CardDescription>
          Agenda inmediata de cursado y horarios programados.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
            No hay clases próximas registradas.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.cursoId}-${item.fecha}-${index}`}
              className="group rounded-[26px] border border-border/70 bg-background/70 p-5 transition-all hover:-translate-y-[1px] hover:border-primary/20 hover:bg-card hover:shadow-[0_18px_34px_-22px_rgba(30,42,68,0.22)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <GraduationCap className="size-5" />
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Clase programada
                      </p>

                      <h4 className="mt-1 text-base font-semibold tracking-tight text-foreground">
                        {item.cursoNombre}
                      </h4>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1.5 text-[11px] font-medium text-primary">
                      <ArrowRight className="size-3.5" />
                      Próxima clase
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <ClassMeta
                      label="Fecha"
                      value={formatDate(item.fecha)}
                      icon={CalendarDays}
                      accent="blue"
                    />

                    <ClassMeta
                      label="Horario"
                      value={`${item.horaInicio.slice(0, 5)} - ${item.horaFin.slice(0, 5)}`}
                      icon={Clock3}
                      accent="violet"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}