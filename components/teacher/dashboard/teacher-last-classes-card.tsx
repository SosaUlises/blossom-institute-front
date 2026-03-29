import { BookOpen, CalendarDays, ArrowUpRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
              className="group rounded-[26px] border border-border/70 bg-background/70 p-5 transition-all hover:-translate-y-[1px] hover:border-primary/20 hover:bg-card hover:shadow-[0_18px_34px_-22px_rgba(30,42,68,0.22)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BookOpen className="size-5" />
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Clase reciente
                      </p>

                      <h4 className="mt-1 text-base font-semibold tracking-tight text-foreground">
                        {item.cursoNombre}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getEstadoClaseBadgeClass(item.estadoClase)}`}
                      >
                        {getEstadoClaseLabel(item.estadoClase)}
                      </span>

                 
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-1">
                    <ClassMeta
                      label="Fecha"
                      value={formatDate(item.fecha)}
                      icon={CalendarDays}
                      accent="blue"
                    />
                  </div>

                  {item.descripcion && (
                    <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Descripción
                      </p>
                      <p className="mt-1 text-sm leading-6 text-foreground/90">
                        {item.descripcion}
                      </p>
                    </div>
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