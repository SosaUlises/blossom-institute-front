import { CalendarDays, Clock3, GraduationCap } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardUpcomingClass } from '@/lib/dashboard/types'

interface UpcomingClassesCardProps {
  items: DashboardUpcomingClass[]
}

export function UpcomingClassesCard({ items }: UpcomingClassesCardProps) {
  return (
    <Card className="border-border/60 bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold tracking-tight">
          Próximas clases
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
            No hay clases próximas registradas.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.cursoId}-${index}`}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/70 p-4"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{item.cursoNombre}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.profesorNombre}</p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {item.diaSemana}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" />
                    {item.horaInicio.slice(0, 5)}
                  </span>
                </div>

                <p className="mt-2 text-xs font-medium text-primary">
                  Próxima: {format(new Date(item.proximaClase), "EEE d 'de' MMM, HH:mm", { locale: es })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}