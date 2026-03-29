import { BookOpen, CalendarDays } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { EstadoClase, type ProfesorDashboardUltimaClaseItem } from '@/lib/teacher/dashboard/types'

function getEstadoClaseLabel(estado: EstadoClase) {
  switch (estado) {
    case EstadoClase.Programada:
      return 'Programada'
    case EstadoClase.Cancelada:
      return 'Cancelada'
    default:
      return `Estado ${estado}`
  }
}

function getEstadoClaseBadgeClass(estado: EstadoClase) {
  switch (estado) {
    case EstadoClase.Programada:
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    case EstadoClase.Cancelada:
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
  }
}

export function TeacherLastClassesCard({
  items,
}: {
  items: ProfesorDashboardUltimaClaseItem[]
}) {
  return (
    <Card className="rounded-[28px] border border-border/70 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(30,42,68,0.16)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Últimas clases
        </CardTitle>
        <CardDescription>
          Historial reciente de clases vinculadas a tus cursos.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
            No hay clases recientes.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.claseId}
              className="rounded-2xl border border-border/70 bg-background/70 p-4 transition-all hover:border-primary/20 hover:bg-card hover:shadow-[0_14px_28px_-20px_rgba(30,42,68,0.20)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BookOpen className="size-5" />
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{item.cursoNombre}</p>

                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getEstadoClaseBadgeClass(item.estadoClase)}`}
                    >
                      {getEstadoClaseLabel(item.estadoClase)}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    {item.fecha}
                  </div>

                  {item.descripcion && (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.descripcion}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}