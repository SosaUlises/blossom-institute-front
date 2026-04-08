import { BookOpen, CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  EstadoClase,
  type ProfesorDashboardUltimaClaseItem,
} from '@/lib/teacher/dashboard/types'

// ─── Badge de estado ──────────────────────────────────────────────────────────

const ESTADO_CLASE_CONFIG: Record<
  EstadoClase,
  { label: string; className: string }
> = {
  [EstadoClase.Programada]: {
    label: 'Programada',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  [EstadoClase.Cancelada]: {
    label: 'Cancelada',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
}

function EstadoClaseBadge({ estado }: { estado: EstadoClase }) {
  const config = ESTADO_CLASE_CONFIG[estado] ?? {
    label: String(estado),
    className: 'bg-muted/50 text-muted-foreground',
  }
  return (
    <span
      className={`rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value: string) {
  return format(new Date(value), "EEE d MMM", { locale: es })
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function TeacherLastClassesCard({
  items,
}: {
  items: ProfesorDashboardUltimaClaseItem[]
}) {
  const visibleItems = items.slice(0, 5)

  return (
    <Card className="rounded-[28px] border border-border/60 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Últimas clases
        </CardTitle>
        <CardDescription className="text-sm leading-6">
          Historial reciente de clases vinculadas a tus cursos.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-1">
        {visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
            No hay clases recientes.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {visibleItems.map((item) => (
              <li
                key={item.claseId}
                className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/70 px-3.5 py-3 transition-all duration-200 hover:border-primary/20 hover:bg-card hover:shadow-[0_4px_14px_-6px_rgba(15,23,42,0.10)]"
              >
                {/* Ícono */}
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="size-4" />
                </div>

                {/* Contenido principal */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.cursoNombre}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs capitalize text-muted-foreground">
                    <CalendarDays className="size-3 shrink-0" />
                    {formatDate(item.fecha)}
                  </p>
                </div>

                {/* Estado */}
                <EstadoClaseBadge estado={item.estadoClase} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}