import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  EstadoEntrega,
  type ProfesorDashboardUltimaEntregaItem,
} from '@/lib/teacher/dashboard/types'

function formatRelative(value: string): string {
  return formatDistanceToNow(new Date(value), {
    addSuffix: true,
    locale: es,
  })
}

function sortByUrgency(
  items: ProfesorDashboardUltimaEntregaItem[],
): ProfesorDashboardUltimaEntregaItem[] {
  return [...items].sort((a, b) => {
    const aFuera = a.estadoEntrega === EstadoEntrega.FueraDeTermino ? 0 : 1
    const bFuera = b.estadoEntrega === EstadoEntrega.FueraDeTermino ? 0 : 1

    if (aFuera !== bFuera) return aFuera - bFuera

    return (
      new Date(a.fechaEntregaUtc).getTime() -
      new Date(b.fechaEntregaUtc).getTime()
    )
  })
}

function getInitial(item: ProfesorDashboardUltimaEntregaItem): string {
  const apellido = item.alumnoApellido?.trim()
  const nombre = item.alumnoNombre?.trim()

  if (apellido?.length) return apellido.charAt(0).toUpperCase()
  if (nombre?.length) return nombre.charAt(0).toUpperCase()

  return '?'
}

function DeliveryRow({ item }: { item: ProfesorDashboardUltimaEntregaItem }) {
  const esFuera = item.estadoEntrega === EstadoEntrega.FueraDeTermino

  return (
    <li>
      <div
        className={cn(
          'flex items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-all duration-200 ease-out',
          esFuera
            ? 'bg-rose-500/[0.04] hover:bg-rose-500/[0.07]'
            : 'hover:bg-muted/60',
        )}
      >
        <div className="min-w-0 flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
              esFuera
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-muted/60 text-foreground/70',
            )}
          >
            {getInitial(item)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {item.alumnoApellido}, {item.alumnoNombre}
            </p>

            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {item.tituloTarea}
              <span className="mx-1.5 opacity-40">·</span>
              {item.cursoNombre}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {formatRelative(item.fechaEntregaUtc)}
          </span>

          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
              esFuera
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
            )}
          >
            {esFuera ? 'Fuera de término' : 'En término'}
          </span>
        </div>
      </div>
    </li>
  )
}

export function TeacherLastDeliveriesCard({
  items,
}: {
  items: ProfesorDashboardUltimaEntregaItem[]
}) {
  const sorted = sortByUrgency(items)

  return (
    <Card className="rounded-[28px] border border-border/60 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Entregas recientes
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
            No hay entregas recientes.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {sorted.map((item) => (
              <DeliveryRow key={item.entregaId} item={item} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}