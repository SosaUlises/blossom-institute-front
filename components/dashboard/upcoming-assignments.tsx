import { CalendarClock, ClipboardList } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardUpcomingAssignment } from '@/lib/dashboard/types'

interface UpcomingAssignmentsCardProps {
  items: DashboardUpcomingAssignment[]
}

export function UpcomingAssignmentsCard({ items }: UpcomingAssignmentsCardProps) {
  return (
    <Card className="border-border/60 bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold tracking-tight">
          Próximas tareas
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
            No hay tareas próximas a vencer.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.tareaId}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/70 p-4"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ClipboardList className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{item.titulo}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.cursoNombre}</p>

                <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarClock className="size-3.5" />
                  {format(new Date(item.fechaEntregaUtc), "EEE d 'de' MMM, HH:mm", {
                    locale: es,
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}