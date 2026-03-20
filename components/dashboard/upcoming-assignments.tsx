import { CalendarClock, ClipboardList, Clock3 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardUpcomingAssignment } from '@/lib/dashboard/types'

interface UpcomingAssignmentsCardProps {
  items: DashboardUpcomingAssignment[]
}

export function UpcomingAssignmentsCard({ items }: UpcomingAssignmentsCardProps) {
  return (
    <Card className="border-border/70 bg-card/95 text-card-foreground shadow-[0_10px_30px_-10px_rgba(30,42,68,0.10)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-tight">
          Próximas tareas
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
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
                className="group rounded-2xl border border-border/70 bg-background/60 p-4 shadow-sm transition hover:border-primary/20 hover:bg-card"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ClipboardList className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {item.titulo}
                        </p>

                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                          {item.cursoNombre}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                        <CalendarClock className="size-3.5" />
                        {format(dueDate, "EEE d 'de' MMM", { locale: es })}
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
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