import { CalendarClock, ClipboardList, Clock3, ArrowUpRight } from 'lucide-react'
import { format, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { DashboardUpcomingAssignment } from '@/lib/admin/dashboard/types'

interface UpcomingAssignmentsCardProps {
  items: DashboardUpcomingAssignment[]
}

function getDueBadgeLabel(date: Date) {
  const today = new Date()
  const diff = differenceInCalendarDays(date, today)

  if (diff <= 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  return `En ${diff} días`
}

function AssignmentMeta({
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

export function UpcomingAssignmentsCard({ items }: UpcomingAssignmentsCardProps) {
  return (
    <Card className="rounded-[28px] border border-border/70 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(30,42,68,0.16)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Próximas tareas
        </CardTitle>
        <CardDescription>
          Seguimiento inmediato de entregas con vencimiento cercano.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
            No hay tareas próximas a vencer.
          </div>
        ) : (
          items.map((item) => {
            const dueDate = new Date(item.fechaEntregaUtc)

            return (
              <div
                key={item.tareaId}
                className="group rounded-[26px] border border-border/70 bg-background/70 p-5 transition-all hover:-translate-y-[1px] hover:border-primary/20 hover:bg-card hover:shadow-[0_18px_34px_-22px_rgba(30,42,68,0.22)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ClipboardList className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Tarea próxima
                        </p>

                        <h4 className="mt-1 text-base font-semibold tracking-tight text-foreground">
                          {item.titulo}
                        </h4>

                        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                          {item.cursoNombre}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
                          {getDueBadgeLabel(dueDate)}
                        </span>

                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <AssignmentMeta
                        label="Fecha"
                        value={format(dueDate, 'dd/MM/yyyy', { locale: es })}
                        icon={CalendarClock}
                        accent="blue"
                      />

                      <AssignmentMeta
                        label="Horario"
                        value={format(dueDate, 'HH:mm')}
                        icon={Clock3}
                        accent="violet"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}