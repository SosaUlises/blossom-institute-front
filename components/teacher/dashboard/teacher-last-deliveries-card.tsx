import { ClipboardList, GraduationCap, CalendarClock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ProfesorDashboardUltimaEntregaItem } from '@/lib/teacher/dashboard/types'

function formatDateTime(value: string) {
  return format(new Date(value), "dd/MM/yyyy · HH:mm", { locale: es })
}

export function TeacherLastDeliveriesCard({
  items,
}: {
  items: ProfesorDashboardUltimaEntregaItem[]
}) {
  return (
    <Card className="rounded-[28px] border border-border/70 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(30,42,68,0.16)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Últimas entregas
        </CardTitle>
        <CardDescription>
          Actividad reciente de entregas realizadas por tus alumnos.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
            No hay entregas recientes.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.entregaId}
              className="rounded-2xl border border-border/70 bg-background/70 p-4 transition-all hover:border-primary/20 hover:bg-card hover:shadow-[0_14px_28px_-20px_rgba(30,42,68,0.20)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ClipboardList className="size-5" />
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {item.tituloTarea}
                    </p>

                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                      {item.cursoNombre}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    <GraduationCap className="size-3.5" />
                    {item.alumnoNombre} {item.alumnoApellido}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5" />
                    {formatDateTime(item.fechaEntregaUtc)}
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