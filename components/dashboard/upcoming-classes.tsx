import { CalendarDays, Clock3, GraduationCap, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardUpcomingClass } from '@/lib/dashboard/types'

interface UpcomingClassesCardProps {
  items: DashboardUpcomingClass[]
}

export function UpcomingClassesCard({ items }: UpcomingClassesCardProps) {
  return (
    <Card className="border-border/70 bg-card/95 text-card-foreground shadow-[0_10px_30px_-10px_rgba(30,42,68,0.10)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-tight">
          Próximas clases
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
            No hay clases próximas registradas.
          </div>
        ) : (
          items.map((item, index) => {
            const nextClassDate = new Date(item.proximaClase)

            return (
              <div
                key={`${item.cursoId}-${index}`}
                className="group rounded-2xl border border-border/70 bg-background/60 p-4 shadow-sm transition hover:border-primary/20 hover:bg-card"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <GraduationCap className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {item.cursoNombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.profesorNombre}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        {item.diaSemana}
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                        <Clock3 className="size-3.5" />
                        {item.horaInicio.slice(0, 5)}
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/8 px-3 py-2 text-xs font-medium text-primary">
                      <ArrowRight className="size-3.5" />
                      Próxima clase: {format(nextClassDate, "EEE d 'de' MMM, HH:mm", { locale: es })}
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