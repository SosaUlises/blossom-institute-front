import { CalendarClock, ClipboardList, Clock3 } from 'lucide-react'
import { format, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { DashboardUpcomingAssignment } from '@/lib/dashboard/types'

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
                className="rounded-2xl border border-border/70 bg-background/70 p-4 transition-all hover:border-primary/20 hover:bg-card hover:shadow-[0_14px_28px_-20px_rgba(30,42,68,0.20)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ClipboardList className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {item.titulo}
                        </p>

                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                          {item.cursoNombre}
                        </span>

                        <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          {getDueBadgeLabel(dueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        <CalendarClock className="size-3.5" />
                        {format(dueDate, "EEE d 'de' MMM", { locale: es })}
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        <Clock3 className="size-3.5" />
                        {format(dueDate, 'HH:mm')}
                      </div>
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